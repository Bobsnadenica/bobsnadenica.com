#!/bin/bash
set -euo pipefail

echo "=== AWS EC2 Finder ==="
read -rp "Search for a specific keyword? (y/n): " yn

keyword=""
if [[ "$yn" =~ ^[Yy]$ || "$yn" =~ ^[Yy][Ee][Ss]$ ]]; then
  read -rp "Enter keyword: " keyword
fi

filters=()
if [[ -n "$keyword" ]]; then
  filters=(--filters "Name=tag:Name,Values=*${keyword}*")
fi

result=$(aws ec2 describe-instances "${filters[@]}" \
  --query "Reservations[].Instances[].InstanceId" \
  --output text || true)

if [[ -z "${result//[[:space:]]/}" ]]; then
  echo "No EC2 instances found."
  exit 0
fi

aws ec2 describe-instances "${filters[@]}" \
  --query "Reservations[].Instances[].{ID:InstanceId,Name:Tags[?Key=='Name']|[0].Value,State:State.Name,Type:InstanceType,AZ:Placement.AvailabilityZone}" \
  --output table

# ---MOCK_RESPONSE---
# === AWS EC2 Finder ===
# Search for a specific keyword? (y/n): y
# Enter keyword: web
# -----------------------------------------------
# |                    DescribeInstances           |
# +-------------+-----------+---------+-------------+
# | ID          | Name      | State   | Type        |
# +-------------+-----------+---------+-------------+
# | i-01234abcd | webserver | running | t3.micro    |
# | i-05678efgh | webtest   | stopped | t2.small    |
# +-------------+-----------+---------+-------------+
# ---END_MOCK---
