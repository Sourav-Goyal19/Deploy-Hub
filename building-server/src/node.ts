import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { redis } from "./libs/redis";

const PROJECT_ID = process.env.PROJECT_ID;
const BUILD_COMMAND = process.env.BUILD_COMMAND;
const BUILD_FOLDER = process.env.BUILD_FOLDER;
const START_COMMAND = process.env.START_COMMAND;

const publishLog = async (message: string) => {
  await redis.publish(`logs-${PROJECT_ID}`, JSON.stringify({ message }));
};

async function init() {
  const outputDirPath = path.join("/", "home", "app", "output");

  const packageJsonPath = path.join(outputDirPath, "package.json");
  let hasBuildScript = false;
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    hasBuildScript = packageJson.scripts && packageJson.scripts.build;
  }

  const p = exec(`cd ${outputDirPath} && npm install`);
  publishLog("Installing Packages......");
  p.stdout?.on("data", (data) => {
    publishLog(data.toString());
  });

  p.stdout?.on("error", (error) => {
    console.error(error);
    publishLog(`Error:  ${error}`);
  });

  p.on("close", (code) => {
    if (code !== 0) {
      publishLog(`npm install failed with exit code ${code}`);
      return;
    }

    if (BUILD_COMMAND && hasBuildScript) {
      publishLog("Came here");
      const build = exec(`cd ${outputDirPath} && ${BUILD_COMMAND}`);

      build.stdout?.on("data", (data) => {
        publishLog(data.toString());
      });

      build.stdout?.on("error", (error) => {
        console.error(error);
        publishLog(`Error:  ${error}`);
      });

      build.on("close", (code) => {
        if (code !== 0) {
          publishLog(`Build failed with exit code ${code}`);
          return;
        }

        const start = exec(
          `cd ${outputDirPath}/${BUILD_FOLDER} && ${START_COMMAND}`
        );

        start.stdout?.on("data", (data) => {
          publishLog(data.toString());
        });

        start.stdout?.on("error", (error) => {
          console.error(error);
          publishLog(`Error:  ${error}`);
        });

        start.on("close", (code) => {
          if (code === 0) {
            publishLog("Your Service is live");
            publishLog("Deployment Successful 🚀");
          } else {
            publishLog(`Start command failed with exit code ${code}`);
          }
        });
      });
    } else {
      if (BUILD_COMMAND && !hasBuildScript) {
        publishLog("Came into another if block");
        publishLog(
          `Warning: BUILD_COMMAND (${BUILD_COMMAND}) specified, but no build script found in package.json. Skipping build step.`
        );
      }
      publishLog("Came into else block");
      const start = exec(`cd ${outputDirPath} && ${START_COMMAND}`);

      start.stdout?.on("data", (data) => {
        publishLog(data.toString());
      });

      start.stdout?.on("error", (error) => {
        console.error(error);
        publishLog(`Error:  ${error}`);
      });

      start.on("close", (code) => {
        if (code === 0) {
          publishLog("Your Service is live");
          publishLog("Deployment Successful 🚀");
        } else {
          publishLog(`Start command failed with exit code ${code}`);
        }
      });
    }
  });
}

init();
