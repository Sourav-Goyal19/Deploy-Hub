import express, { Errback, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { generateSlug } from "random-word-slugs";
import {
  RunTaskCommand,
  ECSClient,
  RegisterTaskDefinitionCommand,
  CreateServiceCommand,
} from "@aws-sdk/client-ecs";
import { Server } from "socket.io";
import { redis } from "./services/redis";
import authRouter from "./routes/auth";
import { authMiddleware } from "./middlewares/auth";
import cors from "cors";
import {
  CreateListenerCommand,
  CreateLoadBalancerCommand,
  CreateTargetGroupCommand,
  DescribeLoadBalancersCommand,
  ElasticLoadBalancingV2Client,
} from "@aws-sdk/client-elastic-load-balancing-v2";
import {
  EC2Client,
  CreateSecurityGroupCommand,
  AuthorizeSecurityGroupIngressCommand,
  AuthorizeSecurityGroupEgressCommand,
} from "@aws-sdk/client-ec2";

const PORT = process.env.PORT || 9000;
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use((err: Errback, req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
});
app.use(express.json());
app.use(cookieParser());

const io = new Server({ cors: { origin: "*" } });

io.listen(9001);

io.on("connection", (socket) => {
  socket.on("subscribe", (room) => {
    socket.join(room);
    socket.emit("message", `Socket Subcribed to ${room}`);
  });
});

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const elbv2Client = new ElasticLoadBalancingV2Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const ec2Client = new EC2Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function createSecurityGroup(projectSlug: string) {
  const albSecurityGroup = await ec2Client.send(
    new CreateSecurityGroupCommand({
      GroupName: `alb-sg-${projectSlug}`,
      Description: `Security Group for ALB of ${projectSlug}`,
      VpcId: process.env.VPC_ID,
    })
  );
  return albSecurityGroup.GroupId;
}

async function authorizeSecurityGroupIngress(groupId: string, port: string) {
  await ec2Client.send(
    new AuthorizeSecurityGroupIngressCommand({
      GroupId: groupId,
      IpPermissions: [
        {
          IpProtocol: "tcp",
          FromPort: 80,
          ToPort: 80,
          IpRanges: [
            {
              CidrIp: "0.0.0.0/0",
              Description: "Allow HTTP from anywhere",
            },
          ],
        },
      ],
    })
  );

  await ec2Client.send(
    new AuthorizeSecurityGroupEgressCommand({
      GroupId: groupId,
      IpPermissions: [
        {
          IpProtocol: "tcp",
          FromPort: Number(port),
          ToPort: Number(port),
          UserIdGroupPairs: [
            {
              GroupId: process.env.ECS_SECURITY_GROUPS!.split(",")[0],
              Description: `Allow ALB to ECS on port ${Number(port)}`,
            },
          ],
        },
      ],
    })
  );

  await ec2Client.send(
    new AuthorizeSecurityGroupIngressCommand({
      GroupId: process.env.ECS_SECURITY_GROUPS!.split(",")[0],
      IpPermissions: [
        {
          IpProtocol: "tcp",
          FromPort: Number(port),
          ToPort: Number(port),
          UserIdGroupPairs: [
            {
              GroupId: groupId,
              Description: `Allow ALB to ECS on port ${Number(port)}`,
            },
          ],
        },
      ],
    })
  );
}

async function createTargetGroup(projectSlug: string, port: string) {
  const targetGroup = await elbv2Client.send(
    new CreateTargetGroupCommand({
      Name: `node-${projectSlug}-tg`,
      Protocol: "HTTP",
      Port: Number(port),
      VpcId: process.env.VPC_ID,
      HealthCheckProtocol: "HTTP",
      HealthCheckPath: "/",
      TargetType: "ip",
    })
  );
  return targetGroup.TargetGroups?.[0].TargetGroupArn;
}

async function createLoadBalancer(
  projectSlug: string,
  securityGroupId: string
) {
  const loadBalancer = await elbv2Client.send(
    new CreateLoadBalancerCommand({
      Name: `node-${projectSlug}-lb`,
      Subnets: process.env.ECS_SUBNETS!.split(","),
      SecurityGroups: [securityGroupId],
      Scheme: "internet-facing",
      Type: "application",
      IpAddressType: "ipv4",
    })
  );
  return loadBalancer.LoadBalancers?.[0].LoadBalancerArn;
}

async function createListener(loadBalancerArn: string, targetGroupArn: string) {
  await elbv2Client.send(
    new CreateListenerCommand({
      LoadBalancerArn: loadBalancerArn,
      Protocol: "HTTP",
      Port: 80,
      DefaultActions: [
        {
          Type: "forward",
          TargetGroupArn: targetGroupArn,
        },
      ],
    })
  );
}

async function registerTaskDefinition(
  projectSlug: string,
  github_url: string,
  build_cmd: string,
  start_cmd: string,
  port: string
) {
  const taskDefinition = await ecsClient.send(
    new RegisterTaskDefinitionCommand({
      family: `node-app-${projectSlug}-td`,
      networkMode: "awsvpc",
      requiresCompatibilities: ["FARGATE"],
      cpu: "256",
      memory: "512",
      executionRoleArn: process.env.ECS_EXECUTION_ROLE_ARN,
      containerDefinitions: [
        {
          name: `node-container-${projectSlug}`,
          image: process.env.ECS_CONTAINER_IMAGE_URI,
          essential: true,
          portMappings: [
            {
              containerPort: Number(port),
              hostPort: Number(port),
              protocol: "tcp",
            },
          ],
          environment: [
            { name: "PROJECT_ID", value: projectSlug },
            { name: "GIT_REPO_URL", value: github_url },
            { name: "BUILD_COMMAND", value: build_cmd },
            { name: "START_COMMAND", value: start_cmd },
            { name: "AWS_REGION", value: process.env.AWS_REGION },
            {
              name: "AWS_ACCESS_KEY_ID",
              value: process.env.AWS_ACCESS_KEY_ID,
            },
            {
              name: "AWS_SECRET_ACCESS_KEY",
              value: process.env.AWS_SECRET_ACCESS_KEY,
            },
            { name: "REDIS_URL", value: process.env.REDIS_URL },
            { name: "PORT", value: port },
            { name: "FRAMEWORK", value: "NodeJS" },
          ],
        },
      ],
    })
  );
  return taskDefinition.taskDefinition?.taskDefinitionArn;
}

async function createEcsService(
  projectSlug: string,
  taskDefinitionArn: string,
  targetGroupArn: string,
  port: string
) {
  const service = await ecsClient.send(
    new CreateServiceCommand({
      cluster: process.env.ECS_CLUSTER_NAME,
      serviceName: `node-service-${projectSlug}`,
      taskDefinition: taskDefinitionArn,
      desiredCount: 1,
      launchType: "FARGATE",
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: process.env.ECS_SUBNETS!.split(","),
          securityGroups: process.env.ECS_SECURITY_GROUPS!.split(","),
          assignPublicIp: "ENABLED",
        },
      },
      loadBalancers: [
        {
          targetGroupArn: targetGroupArn,
          containerName: `node-container-${projectSlug}`,
          containerPort: Number(port),
        },
      ],
    })
  );
  return service;
}

async function getLoadBalancerDnsName(loadBalancerArn: string) {
  const lbDetails = await elbv2Client.send(
    new DescribeLoadBalancersCommand({
      LoadBalancerArns: [loadBalancerArn],
    })
  );
  return lbDetails.LoadBalancers?.[0].DNSName;
}

async function createService(
  projectSlug: string,
  github_url: string,
  build_cmd: string = "",
  start_cmd: string,
  port: string = "8000"
) {
  try {
    const securityGroupId = await createSecurityGroup(projectSlug);
    await authorizeSecurityGroupIngress(securityGroupId!, port);
    const targetGroupArn = await createTargetGroup(projectSlug, port);
    const loadBalancerArn = await createLoadBalancer(
      projectSlug,
      securityGroupId!
    );
    await createListener(loadBalancerArn!, targetGroupArn!);
    const taskDefinitionArn = await registerTaskDefinition(
      projectSlug,
      github_url,
      build_cmd,
      start_cmd,
      port
    );
    const service = await createEcsService(
      projectSlug,
      taskDefinitionArn!,
      targetGroupArn!,
      port
    );
    const dnsName = await getLoadBalancerDnsName(loadBalancerArn!);
    return { service, dnsName };
  } catch (error) {
    console.error("Error creating ECS service:", error);
    throw error;
  }
}

app
  .post("/project", async (req, res) => {
    const { github_url, slug } = req.body;
    const projectSlug = slug ? slug : generateSlug();

    const command = new RunTaskCommand({
      cluster: process.env.ECS_CLUSTER_ARN,
      taskDefinition: process.env.ECS_TASK_DEFINITION_ARN,
      launchType: "FARGATE",
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: "ENABLED",
          subnets: process.env.ECS_SUBNETS!.split(","),
          securityGroups: process.env.ECS_SECURITY_GROUPS!.split(","),
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: process.env.ECS_CONTAINER_NAME,
            environment: [
              {
                name: "GIT_REPO_URL",
                value: github_url,
              },
              {
                name: "PROJECT_ID",
                value: projectSlug,
              },
              {
                name: "AWS_REGION",
                value: process.env.AWS_REGION,
              },
              {
                name: "AWS_ACCESS_KEY_ID",
                value: process.env.AWS_ACCESS_KEY_ID,
              },
              {
                name: "AWS_SECRET_ACCESS_KEY",
                value: process.env.AWS_SECRET_ACCESS_KEY,
              },
              {
                name: "S3_BUCKET",
                value: process.env.S3_BUCKET,
              },
              {
                name: "REDIS_URL",
                value: process.env.REDIS_URL,
              },
              {
                name: "FRAMEWORK",
                value: "ReactJS",
              },
            ],
          },
        ],
      },
    });

    await ecsClient.send(command);

    res.json({
      status: "queued",
      data: {
        deployed_url: `http://${projectSlug}.localhost:8000`,
        slug: `logs-${projectSlug}`,
      },
    });
  })
  .post("/node-project", async (req, res) => {
    const { github_url, slug, build_cmd, start_cmd, port } = req.body as {
      github_url: string;
      slug?: string;
      build_cmd?: string;
      start_cmd: string;
      port?: string;
    };
    const projectSlug = slug || generateSlug();

    try {
      const result = await createService(
        projectSlug,
        github_url,
        build_cmd,
        start_cmd,
        port
      );
      res.json({
        status: "queued",
        data: {
          deployed_url: `http://${result.dnsName}`,
          slug: `logs-${projectSlug}`,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ status: "error", message: (error as Error).message });
    }
  });

app.use("/api/auth", authRouter);

app.get("/api/user", authMiddleware, (req, res) => {
  // @ts-ignore
  res.status(200).json({ user: req.user, message: "User got successfully" });
});

async function subscribeToRedis() {
  redis.psubscribe("logs-*");
  redis.on("pmessage", (pattern, room, message) => {
    io.to(room).emit("message", message);
  });
}

subscribeToRedis();

app.listen(PORT, () => console.log(`Api server started at ${PORT}`));
