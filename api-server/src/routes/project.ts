import express from "express";

import {
  createEcsService,
  registerTaskDefinition,
  runTaskCommand,
} from "../services/aws-ecs";
import {
  createListener,
  createLoadBalancer,
  createTargetGroup,
  getLoadBalancerDnsName,
} from "../services/aws-elb";
import {
  authorizeSecurityGroupIngress,
  createSecurityGroup,
} from "../services/aws-ec2";

import { redis2 } from "../libs/redis";
import { generateSlug } from "random-word-slugs";

const router = express.Router();

async function createService(
  projectSlug: string,
  github_url: string,
  build_cmd: string = "",
  start_cmd: string,
  port: string = "8000",
  env: [{ name: string; value: string }] | []
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
      port,
      env
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

router
  .post("/react", async (req, res) => {
    let { github_url, slug, env } = req.body as {
      github_url: string;
      slug?: string;
      env?: [{ name: string; value: string }] | [];
    };
    let projectSlug: string = slug ? slug : generateSlug(2);

    if (!env) {
      env = [];
    }

    while (projectSlug.length >= 32) {
      projectSlug = generateSlug();
    }

    projectSlug = projectSlug.substring(0, projectSlug.length - 3) + "-rt";

    await runTaskCommand(github_url, projectSlug, env);

    const basepath = `${process.env.S3_BUCKET_URL}/__outputs`;
    const reverseTo = `${basepath}/${projectSlug}`;
    await redis2.set(projectSlug, reverseTo);

    res.json({
      status: "queued",
      data: {
        deployed_url: `http://${projectSlug}.localhost:8000`,
        slug: `logs-${projectSlug}`,
      },
    });
  })
  .post("/node", async (req, res) => {
    let { github_url, slug, build_cmd, start_cmd, port, env } = req.body as {
      github_url: string;
      slug?: string;
      build_cmd?: string;
      start_cmd: string;
      port?: string;
      env?: [{ name: string; value: string }] | [];
    };
    let projectSlug = slug || generateSlug(2);

    while (projectSlug.length >= 30) {
      projectSlug = generateSlug();
    }
    projectSlug = projectSlug.substring(0, projectSlug.length - 3) + "-nd";

    if (!env) {
      env = [];
    }

    port = env.find((pair) => pair.name.toLowerCase() == "port")?.value;

    try {
      const result = await createService(
        projectSlug,
        github_url,
        build_cmd,
        start_cmd,
        port,
        env
      );

      await redis2.set(projectSlug, `http://${result.dnsName}`);

      res.json({
        status: "queued",
        data: {
          deployed_url: `http://${projectSlug}.localhost:8000`,
          slug: `logs-${projectSlug}`,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ status: "error", message: (error as Error).message });
    }
  });

export default router;
