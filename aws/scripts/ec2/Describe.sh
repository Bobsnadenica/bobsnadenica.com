# AWS EC2 instances overview (table)
echo "Fetching EC2 instance details..."

aws ec2 describe-instances \
  --query 'Reservations[*].Instances[*].{InstanceId:InstanceId,State:State.Name,Type:InstanceType,AZ:Placement.AvailabilityZone,PublicIP:PublicIpAddress,PrivateIP:PrivateIpAddress,LaunchTime:LaunchTime,KeyName:KeyName,Name:Tags[?Key==`Name`].Value | [0]}' \
  --output table

echo "Done."

# ---MOCK_RESPONSE---
# ============================================================
# EC2 Instances
# ------------------------------------------------------------
# | InstanceId          | State   | Type      | AZ            | PublicIP       | PrivateIP   | LaunchTime           | KeyName      | Name             |
# |----------------------|---------|-----------|----------------|----------------|-------------|----------------------|--------------|------------------|
# | i-0abcd1234ef56789  | running | t3.micro  | us-east-1a     | 198.51.100.23  | 10.0.0.45   | 2025-10-20T08:12:00Z | prod-keypair | WebServer-Prod   |
# | i-0efgh5678ij90123  | stopped | t3.medium | us-east-1b     | None           | 10.0.1.23   | 2025-10-15T14:55:00Z | dev-keypair  | AppServer-Dev    |
# ------------------------------------------------------------
# ============================================================
# ---END_MOCK---