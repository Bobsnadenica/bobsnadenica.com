

# AWS Security Groups and Network ACLs overview (table)
echo "Fetching AWS Security Groups and Network ACLs..."

echo -e "\n=== Security Groups ==="
aws ec2 describe-security-groups \
  --query 'SecurityGroups[*].{GroupId:GroupId,GroupName:GroupName,Description:Description,VpcId:VpcId,OwnerId:OwnerId}' \
  --output table

echo -e "\n=== Security Group Rules (Ingress) ==="
aws ec2 describe-security-groups \
  --query 'SecurityGroups[*].{GroupId:GroupId,IpPermissions:IpPermissions[*].{FromPort:FromPort,ToPort:ToPort,Protocol:IpProtocol,Source:IpRanges[0].CidrIp}}' \
  --output table

echo -e "\n=== Security Group Rules (Egress) ==="
aws ec2 describe-security-groups \
  --query 'SecurityGroups[*].{GroupId:GroupId,IpPermissionsEgress:IpPermissionsEgress[*].{FromPort:FromPort,ToPort:ToPort,Protocol:IpProtocol,Destination:IpRanges[0].CidrIp}}' \
  --output table

echo -e "\n=== Network ACLs ==="
aws ec2 describe-network-acls \
  --query 'NetworkAcls[*].{NetworkAclId:NetworkAclId,VpcId:VpcId,IsDefault:IsDefault,Entries:Entries[*].{RuleNumber:RuleNumber,Protocol:Protocol,RuleAction:RuleAction,Egress:Egress,CidrBlock:CidrBlock}}' \
  --output table

echo -e "\n=== Security Group CloudTrail Events (Recent) ==="
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventSource,AttributeValue=ec2.amazonaws.com \
  --max-results 20 \
  --query 'Events[?contains(EventName, `SecurityGroup`) || contains(EventName, `NetworkAcl`)].{Time:EventTime,User:Username,Action:EventName,Region:AwsRegion,SourceIP:Resources[0].ResourceName}' \
  --output table

echo "Done."

# ---MOCK_RESPONSE---
# ============================================================
# Security Groups
# ------------------------------------------------------------
# | GroupId        | GroupName        | Description                | VpcId           | OwnerId       |
# |----------------|------------------|-----------------------------|-----------------|----------------|
# | sg-0a1b2c3d4e5 | web-server-sg    | Allow HTTP/HTTPS inbound    | vpc-123abc456   | 123456789012   |
# | sg-0f9e8d7c6b5 | db-server-sg     | MySQL only from web tier    | vpc-123abc456   | 123456789012   |
# ------------------------------------------------------------
#
# Security Group Rules (Ingress)
# ------------------------------------------------------------
# | GroupId        | FromPort | ToPort | Protocol | Source          |
# |----------------|----------|--------|----------|-----------------|
# | sg-0a1b2c3d4e5 | 80       | 80     | tcp      | 0.0.0.0/0       |
# | sg-0a1b2c3d4e5 | 443      | 443    | tcp      | 0.0.0.0/0       |
# | sg-0f9e8d7c6b5 | 3306     | 3306   | tcp      | 10.0.1.0/24     |
# ------------------------------------------------------------
#
# Security Group Rules (Egress)
# ------------------------------------------------------------
# | GroupId        | FromPort | ToPort | Protocol | Destination     |
# |----------------|----------|--------|----------|-----------------|
# | sg-0a1b2c3d4e5 | 0        | 65535  | tcp      | 0.0.0.0/0       |
# | sg-0f9e8d7c6b5 | 0        | 65535  | tcp      | 10.0.0.0/8      |
# ------------------------------------------------------------
#
# Network ACLs
# ------------------------------------------------------------
# | NetworkAclId   | VpcId         | IsDefault | RuleNumber | Protocol | RuleAction | Egress | CidrBlock    |
# |----------------|---------------|------------|-------------|-----------|-------------|---------|--------------|
# | acl-123abc456  | vpc-123abc456 | True       | 100         | tcp       | allow       | False   | 0.0.0.0/0    |
# | acl-123abc456  | vpc-123abc456 | True       | 101         | tcp       | allow       | True    | 0.0.0.0/0    |
# ------------------------------------------------------------
#
# Security Group CloudTrail Events (Recent)
# ------------------------------------------------------------
# | Time                | User       | Action                     | Region         | SourceIP         |
# |---------------------|------------|-----------------------------|----------------|------------------|
# | 2025-10-26T09:10:22 | admin      | AuthorizeSecurityGroupIngress | eu-central-1   | 198.51.100.23    |
# | 2025-10-26T08:45:51 | devops     | CreateNetworkAclEntry       | eu-central-1   | 203.0.113.7      |
# | 2025-10-26T08:32:18 | admin      | DeleteSecurityGroup         | eu-central-1   | 198.51.100.23    |
# ------------------------------------------------------------
# ============================================================
# ---END_MOCK---