import {
  EC2Client,
  CreateSecurityGroupCommand,
  AuthorizeSecurityGroupIngressCommand,
  AuthorizeSecurityGroupEgressCommand,
  DescribeSecurityGroupsCommand,
  IpPermission,
} from "@aws-sdk/client-ec2";

const ec2Client = new EC2Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function createSecurityGroup(projectSlug: string) {
  try {
    const results = await ec2Client.send(
      new DescribeSecurityGroupsCommand({
        Filters: [{ Name: "group-name", Values: [`alb-sg-${projectSlug}`] }],
      })
    );
    const existingGroupId = results.SecurityGroups?.[0].GroupId;
    if (existingGroupId) {
      return existingGroupId;
    }
  } catch (error: any) {}

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
  let ingressRules: IpPermission[] = [];
  let egressRules: IpPermission[] = [];
  let ecsIngressRules: IpPermission[] = [];

  try {
    const describeResults = await ec2Client.send(
      new DescribeSecurityGroupsCommand({
        GroupIds: [groupId],
      })
    );
    ingressRules = describeResults.SecurityGroups?.[0].IpPermissions || [];
    egressRules = describeResults.SecurityGroups?.[0].IpPermissionsEgress || [];
  } catch (error: any) {}

  try {
    const ecsDescribeResults = await ec2Client.send(
      new DescribeSecurityGroupsCommand({
        GroupIds: [process.env.ECS_SECURITY_GROUPS!.split(",")[0]],
      })
    );
    ecsIngressRules =
      ecsDescribeResults.SecurityGroups?.[0].IpPermissions || [];
  } catch (error: any) {}

  const ingressRuleExists = ingressRules.some(
    (rule) =>
      rule.IpProtocol === "tcp" &&
      rule.FromPort === 80 &&
      rule.ToPort === 80 &&
      rule.IpRanges?.some((range) => range.CidrIp === "0.0.0.0/0")
  );

  if (!ingressRuleExists) {
    try {
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
    } catch (error: any) {}
  }

  const egressRuleExists = egressRules.some(
    (rule) =>
      rule.IpProtocol === "tcp" &&
      rule.FromPort === Number(port) &&
      rule.ToPort === Number(port) &&
      rule.UserIdGroupPairs?.some(
        (pair) =>
          pair.GroupId === process.env.ECS_SECURITY_GROUPS!.split(",")[0]
      )
  );

  if (!egressRuleExists) {
    try {
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
    } catch (error: any) {}
  }

  const ecsIngressRuleExists = ecsIngressRules.some(
    (rule) =>
      rule.IpProtocol === "tcp" &&
      rule.FromPort === Number(port) &&
      rule.ToPort === Number(port) &&
      rule.UserIdGroupPairs?.some((pair) => pair.GroupId === groupId)
  );

  if (!ecsIngressRuleExists) {
    try {
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
    } catch (error: any) {}
  }
}

export { createSecurityGroup, authorizeSecurityGroupIngress };
