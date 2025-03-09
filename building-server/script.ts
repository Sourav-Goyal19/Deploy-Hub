import fs from "fs";
import path from "path";
import mime from "mime-types";
import { exec } from "child_process";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIAU6GD3HLV2XSCCUJ6",
    secretAccessKey: "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",
  },
});

const projectId = process.env.PROJECT_ID;

async function init() {
  console.log("Building......");
  const outputDirPath = path.join("/", "home", "app", "output");

  const p = exec(`cd ${outputDirPath} && npm install && npm run build`);

  p.stdout?.on("data", (data) => {
    console.log(data.toString());
  });

  p.stdout?.on("error", (err) => {
    console.error(err);
  });

  p.stdout?.on("close", async () => {
    console.log("Copying to s3......");
    const codePath = path.join(outputDirPath, "dist");
    const codeFiles = fs.readdirSync(codePath, { recursive: true });

    for (const file of codeFiles) {
      const filePath = path.join(codePath, file as string);

      if (fs.lstatSync(filePath).isDirectory()) continue;
      console.log("Cloning: ", filePath, "+ ", file);

      const command = new PutObjectCommand({
        Bucket: "building-bucket-deployment",
        Key: `__outputs/${projectId}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath) as string,
      });

      await s3.send(command);
    }
    console.log("Upload completed");
  });
}

init();
