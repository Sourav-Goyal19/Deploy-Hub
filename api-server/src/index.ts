import express from "express";
import cookieParser from "cookie-parser";
import { generateSlug } from "random-word-slugs";
import { RunTaskCommand, ECSClient } from "@aws-sdk/client-ecs";
import { Server } from "socket.io";
import { redis } from "./services/redis";
import authRouter from "./routes/auth";
import { authMiddleware } from "./middlewares/auth";

const PORT = process.env.PORT || 9000;
const app = express();

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

app.post("/project", async (req, res) => {
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
});

app.use("/api/auth", authRouter);

app.get("/api/user", authMiddleware, (req, res) => {
  // @ts-ignore
  res.status(200).json({ user: req.user, message: "User got successfully" });
});

async function subscribeToRedis() {
  redis.psubscribe("logs-*");
  redis.on("pmessage", (pattern, channel, message) => {
    io.to(channel).emit("message", message);
  });
}

subscribeToRedis();

app.listen(PORT, () => console.log(`Api server started at ${PORT}`));
