import fs from "fs";
import path from "path";
import mime from "mime-types";
import { exec } from "child_process";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { redis } from "./libs/redis";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const projectId = process.env.PROJECT_ID || "";

const publishLog = async (message: string) => {
  await redis.publish(`logs-${projectId}`, JSON.stringify({ message }));
};

async function init() {
  publishLog("Building......");
  const outputDirPath = path.join("/", "home", "app", "output");
  await publishLog("Build Started");
  const p = exec(`cd ${outputDirPath} && npm install && npm run build`);

  p.stdout?.on("data", (data) => {
    console.log(data.toString());
    publishLog("Installing packages");
  });

  p.stdout?.on("error", (err) => {
    console.error(err);
    publishLog(`Error:  ${err}`);
  });

  p.on("close", async () => {
    console.log("Copying to s3......");
    const codePath = path.join(outputDirPath, "dist");
    const codeFiles = fs.readdirSync(codePath, { recursive: true });
    publishLog("Build Completed");
    for (const file of codeFiles) {
      const filePath = path.join(codePath, file as string);

      if (fs.lstatSync(filePath).isDirectory()) continue;
      console.log("Cloning: ", filePath, "+ ", file);
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: `__outputs/${projectId}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath) as string,
      });

      publishLog(`Deploying  ${typeof file == "string" ? file : ""}`);
      await s3.send(command);
    }
    console.log("Upload completed");
    publishLog("Deployment Successfull");
  });
}

init();
