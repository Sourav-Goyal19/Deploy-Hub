import express from "express";
import { generateSlug } from "random-word-slugs";
import { RunTaskCommand, ECSClient } from "@aws-sdk/client-ecs";

const PORT = process.env.PORT || 9000;
const app = express();

app.use(express.json());

const ecsClient = new ECSClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIAU6GD3HLV2XSCCUJ6",
    secretAccessKey: "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",
  },
});

app.post("/project", async (req, res) => {
  const { github_url } = req.body;
  const slug = generateSlug();

  const command = new RunTaskCommand({
    cluster: "arn:aws:ecs:ap-south-1:339713145579:cluster/building-vercel-cl",
    taskDefinition:
      "arn:aws:ecs:ap-south-1:339713145579:task-definition/building-vercel-td",
    launchType: "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: [
          "subnet-01e9b544e793737d5",
          "subnet-0fd2f9446a437b3e8",
          "subnet-0faac19fe3debf582",
        ],
        securityGroups: ["sg-0b0c94af6eb6a3b1c"],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "building-vercel-image",
          environment: [
            {
              name: "GIT_REPO_URL",
              value: github_url,
            },
            {
              name: "PROJECT_ID",
              value: slug,
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
      deployed_url: `http://${slug}.localhost:8000`,
    },
  });
});

app.listen(PORT, () => console.log(`Api server started at ${PORT}`));
