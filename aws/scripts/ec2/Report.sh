se
#!/bin/bash
# =====================================================
# EC2 Comprehensive Report Script
# Description: Collects all possible EC2 resource details for auditing and reporting.
# Output is displayed in AWS CLI table format.
# =====================================================

echo "=== AWS EC2 Comprehensive Report ==="
echo "Enter AWS region (default: us-east-1): "
read REGION
REGION=${REGION:-us-east-1}

echo "Fetching EC2 reports from region: $REGION"
echo "------------------------------------------------------------"

# Instances
echo ""
echo "=== EC2 Instances Report ==="
aws ec2 describe-instances --region "$REGION" \
  --query "Reservations[].Instances[].{InstanceId:InstanceId,Name:Tags[?Key=='Name']|[0].Value,State:State.Name,Type:InstanceType,AZ:Placement.AvailabilityZone,PrivateIP:PrivateIpAddress,PublicIP:PublicIpAddress,LaunchTime:LaunchTime}" \
  --output table

# Volumes
echo ""
echo "=== EBS Volumes Report ==="
aws ec2 describe-volumes --region "$REGION" \
  --query "Volumes[].{VolumeId:VolumeId,Size:Size,State:State,Type:VolumeType,AZ:AvailabilityZone,CreateTime:CreateTime,Attachments:Attachments[0].InstanceId}" \
  --output table

# Snapshots
echo ""
echo "=== EBS Snapshots Report ==="
aws ec2 describe-snapshots --owner-ids self --region "$REGION" \
  --query "Snapshots[].{SnapshotId:SnapshotId,VolumeId:VolumeId,State:State,StartTime:StartTime,Progress:Progress,VolumeSize:VolumeSize,Description:Description}" \
  --output table

# AMIs
echo ""
echo "=== AMIs (Owned by You) Report ==="
aws ec2 describe-images --owners self --region "$REGION" \
  --query "Images[].{ImageId:ImageId,Name:Name,State:State,CreationDate:CreationDate,Description:Description}" \
  --output table

# Elastic IPs
echo ""
echo "=== Elastic IPs Report ==="
aws ec2 describe-addresses --region "$REGION" \
  --query "Addresses[].{PublicIP:PublicIp,InstanceId:InstanceId,AllocationId:AllocationId,Domain:Domain,NetworkInterfaceId:NetworkInterfaceId}" \
  --output table

# Security Groups
echo ""
echo "=== Security Groups Report ==="
aws ec2 describe-security-groups --region "$REGION" \
  --query "SecurityGroups[].{GroupName:GroupName,GroupId:GroupId,Description:Description,VpcId:VpcId}" \
  --output table

# Key Pairs
echo ""
echo "=== Key Pairs Report ==="
aws ec2 describe-key-pairs --region "$REGION" \
  --query "KeyPairs[].{KeyName:KeyName,KeyType:KeyType,CreateTime:CreateTime,KeyPairId:KeyPairId}" \
  --output table

# Placement Groups
echo ""
echo "=== Placement Groups Report ==="
aws ec2 describe-placement-groups --region "$REGION" \
  --query "PlacementGroups[].{GroupName:GroupName,Strategy:Strategy,State:State}" \
  --output table

# Instance Status
echo ""
echo "=== EC2 Instance Status Report ==="
aws ec2 describe-instance-status --region "$REGION" \
  --query "InstanceStatuses[].{InstanceId:InstanceId,SystemStatus:SystemStatus.Status,InstanceStatus:InstanceStatus.Status,AvailabilityZone:AvailabilityZone}" \
  --output table

# Elastic Load Balancers (Classic)
echo ""
echo "=== Elastic Load Balancers (Classic) Report ==="
aws elb describe-load-balancers --region "$REGION" \
  --query "LoadBalancerDescriptions[].{Name:LoadBalancerName,DNSName:DNSName,Instances:Instances[].InstanceId,CreatedTime:CreatedTime}" \
  --output table 2>/dev/null || echo "No Classic Load Balancers found."

echo ""
echo "=== Report Completed for Region: $REGION ==="
echo "============================================================"

# ---MOCK_RESPONSE---
# Example mock output for testing
# ============================================================
#                   AWS EC2 COMPREHENSIVE REPORT              
# ============================================================
#
# Region Selected: us-east-1
# Timestamp: 2025-10-28T18:00Z
#
# ------------------------------------------------------------
# 🖥️  EC2 INSTANCES REPORT
# ------------------------------------------------------------
# | InstanceId          | Name         | State   | Type     | AZ         | PrivateIP   | PublicIP     | LaunchTime          |
# +---------------------+--------------+---------+----------+------------+-------------+--------------+--------------------+
# | i-0123456789abcdef0 | WebServer1   | running | t3.micro | us-east-1a | 172.31.0.5  | 3.95.100.45  | 2025-10-28T09:13Z  |
# | i-0abcde12345f67890 | DBServer     | stopped | t3.small | us-east-1b | 172.31.0.10 | -            | 2025-10-27T20:00Z  |
# | i-0fedcba98765abcd0 | TestMachine  | running | t2.nano  | us-east-1c | 172.31.0.15 | 18.111.24.90 | 2025-10-28T12:45Z  |
#
# ------------------------------------------------------------
# 💾  EBS VOLUMES REPORT
# ------------------------------------------------------------
# | VolumeId            | Size | State  | Type | AZ         | CreateTime           | AttachedTo         |
# +---------------------+------+--------+------+------------+----------------------+--------------------+
# | vol-0abcd1234efgh5678 | 8  | in-use | gp3  | us-east-1a | 2025-10-26T18:45Z    | i-0123456789abcdef0|
# | vol-0123abcd4567efgh8 | 16 | in-use | gp2  | us-east-1b | 2025-10-27T10:20Z    | i-0abcde12345f67890|
#
# ------------------------------------------------------------
# 🧩  SNAPSHOTS REPORT
# ------------------------------------------------------------
# | SnapshotId          | VolumeId          | State     | StartTime           | Progress | Size | Description         |
# +---------------------+-------------------+-----------+---------------------+-----------+------+---------------------+
# | snap-01a2b3c4d5e6f7g8 | vol-0abcd1234efgh5678 | completed | 2025-10-27T17:30Z | 100% | 8  | Daily backup         |
# | snap-0a1b2c3d4e5f6g7h | vol-0123abcd4567efgh8 | pending   | 2025-10-28T17:30Z | 45%  | 16 | DB volume snapshot   |
#
# ------------------------------------------------------------
# 🧱  AMIs OWNED BY YOU
# ------------------------------------------------------------
# | ImageId             | Name              | State      | CreationDate        | Description               |
# +---------------------+-------------------+-------------+---------------------+----------------------------+
# | ami-0a1b2c3d4e5f6g7h | WebServerImage    | available  | 2025-10-26T10:00Z   | Ubuntu base image          |
# | ami-0f1e2d3c4b5a6978 | DBServerImage     | available  | 2025-10-27T11:30Z   | Amazon Linux DB template   |
#
# ------------------------------------------------------------
# 🌐  ELASTIC IPS
# ------------------------------------------------------------
# | PublicIP    | InstanceId          | AllocationId     | Domain | NetworkInterfaceId  |
# +-------------+---------------------+------------------+--------+--------------------+
# | 3.95.100.45 | i-0123456789abcdef0 | eipalloc-0abc123 | vpc    | eni-0abcd5678efgh9  |
# | 18.111.24.90| i-0fedcba98765abcd0 | eipalloc-0123def | vpc    | eni-0123abcd4567efg |
#
# ------------------------------------------------------------
# 🔐  SECURITY GROUPS
# ------------------------------------------------------------
# | GroupName | GroupId       | Description          | VpcId            |
# +-----------+---------------+----------------------+------------------+
# | default   | sg-0123abcd45 | Default group        | vpc-0ab1c2d3e4   |
# | web-sg    | sg-0a1b2c3d4e | Web Server SG        | vpc-0ab1c2d3e4   |
# | db-sg     | sg-012abc345d | Database Restricted  | vpc-0ab1c2d3e4   |
#
# ------------------------------------------------------------
# 🗝️  KEY PAIRS
# ------------------------------------------------------------
# | KeyName | KeyType | CreateTime           | KeyPairId       |
# +---------+----------+---------------------+-----------------+
# | Linux   | rsa      | 2025-10-25T10:00Z   | key-0abcd1234ef |
# | WebKey  | ed25519  | 2025-10-26T09:12Z   | key-0efgh5678ij |
#
# ------------------------------------------------------------
# 🧩  PLACEMENT GROUPS
# ------------------------------------------------------------
# | GroupName  | Strategy | State     |
# +------------+-----------+-----------+
# | my-cluster | cluster   | available |
# | spread-one | spread    | available |
#
# ------------------------------------------------------------
# ⚙️  INSTANCE STATUS
# ------------------------------------------------------------
# | InstanceId          | SystemStatus | InstanceStatus | AvailabilityZone |
# +---------------------+--------------+----------------+------------------+
# | i-0123456789abcdef0 | ok           | ok             | us-east-1a       |
# | i-0abcde12345f67890 | impaired     | initializing   | us-east-1b       |
#
# ------------------------------------------------------------
# 🌀  CLASSIC LOAD BALANCERS
# ------------------------------------------------------------
# | Name        | DNSName                     | Instances                  | CreatedTime          |
# +-------------+-----------------------------+-----------------------------+----------------------+
# | classic-lb1 | classic-lb1-123.us-east-1.elb.amazonaws.com | i-0123456789abcdef0 | 2025-10-26T15:00Z |
#
# ============================================================
# ✅  REPORT COMPLETED SUCCESSFULLY
# Region: us-east-1 | Time: 2025-10-28T18:00Z
# ---END_MOCK---