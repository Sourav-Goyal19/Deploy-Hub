import {
  RunTaskCommand,
  ECSClient,
  RegisterTaskDefinitionCommand,
  CreateServiceCommand,
  DescribeTaskDefinitionCommand,
} from "@aws-sdk/client-ecs";
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length: 10 });

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function registerTaskDefinition(
  projectSlug: string,
  github_url: string,
  build_cmd: string,
  start_cmd: string,
  port: string,
  env: [{ name: string; value: string }] | []
) {
  // const existing = await ecsClient.send(
  //   new DescribeTaskDefinitionCommand({
  //     taskDefinition: `node-app-${projectSlug}-td`,
  //   })
  // );
  // if (existing.taskDefinition) return existing.taskDefinition.taskDefinitionArn;

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
            ...env,
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
      serviceName: `node-service-${projectSlug}-${uid.rnd(7)}`,
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

async function runTaskCommand(
  github_url: string,
  projectSlug: string,
  env: { name: string; value: string }[] = []
) {
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
            { name: "GIT_REPO_URL", value: github_url },
            { name: "PROJECT_ID", value: projectSlug },
            { name: "AWS_REGION", value: process.env.AWS_REGION },
            { name: "AWS_ACCESS_KEY_ID", value: process.env.AWS_ACCESS_KEY_ID },
            {
              name: "AWS_SECRET_ACCESS_KEY",
              value: process.env.AWS_SECRET_ACCESS_KEY,
            },
            { name: "S3_BUCKET", value: process.env.S3_BUCKET },
            { name: "REDIS_URL", value: process.env.REDIS_URL },
            { name: "FRAMEWORK", value: "ReactJS" },
            ...env,
          ],
        },
      ],
    },
  });

  return ecsClient.send(command);
}

export { registerTaskDefinition, createEcsService, runTaskCommand };
