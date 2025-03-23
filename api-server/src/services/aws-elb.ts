import {
  CreateListenerCommand,
  CreateLoadBalancerCommand,
  CreateTargetGroupCommand,
  DescribeListenersCommand,
  DescribeLoadBalancersCommand,
  DescribeTargetGroupsCommand,
  ElasticLoadBalancingV2Client,
} from "@aws-sdk/client-elastic-load-balancing-v2";

const elbv2Client = new ElasticLoadBalancingV2Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function createTargetGroup(projectSlug: string, port: string) {
  try {
    const results = await elbv2Client.send(
      new DescribeTargetGroupsCommand({
        Names: [`node-${projectSlug}-tg`],
      })
    );

    const existingTargetGroup = results.TargetGroups?.find(
      (tg) =>
        tg.TargetGroupName === `node-${projectSlug}-tg` &&
        tg.Protocol === "HTTP" &&
        tg.Port === Number(port) &&
        tg.VpcId === process.env.VPC_ID &&
        tg.TargetType === "ip"
    );

    if (existingTargetGroup) {
      return existingTargetGroup.TargetGroupArn;
    }
  } catch (error: any) {
    // if (error.name !== "TargetGroupNotFound") {
    //   throw error;
    // }
  }

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
  try {
    const results = await elbv2Client.send(
      new DescribeLoadBalancersCommand({
        Names: [`node-${projectSlug}-lb`],
      })
    );

    const existingLoadBalancer = results.LoadBalancers?.find(
      (lb) =>
        lb.LoadBalancerName === `node-${projectSlug}-lb` &&
        lb.Scheme === "internet-facing" &&
        lb.Type === "application" &&
        lb.IpAddressType === "ipv4"
    );

    if (existingLoadBalancer) {
      return existingLoadBalancer.LoadBalancerArn;
    }
  } catch (error: any) {
    // if (error.name !== "LoadBalancerNotFound") {
    //   throw error;
    // }
  }

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
  try {
    const results = await elbv2Client.send(
      new DescribeListenersCommand({
        LoadBalancerArn: loadBalancerArn,
      })
    );
    if (results.Listeners && results.Listeners.length > 0) return;
  } catch (error: any) {}

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

async function getLoadBalancerDnsName(loadBalancerArn: string) {
  const lbDetails = await elbv2Client.send(
    new DescribeLoadBalancersCommand({
      LoadBalancerArns: [loadBalancerArn],
    })
  );
  return lbDetails.LoadBalancers?.[0].DNSName;
}

export {
  createTargetGroup,
  createLoadBalancer,
  createListener,
  getLoadBalancerDnsName,
};
