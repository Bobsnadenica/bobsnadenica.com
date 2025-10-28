#!/bin/bash
# =====================================================
# AWS Secrets Manager Comprehensive Report
# Description: Collects detailed information on all secrets,
# including metadata, versions, rotation settings, policies,
# tags, replication status, and CloudTrail activity.
# Output is displayed in AWS CLI table format.
# =====================================================

echo "=== AWS Secrets Manager Comprehensive Report ==="
echo "Enter AWS region (default: us-east-1): "
read REGION
REGION=${REGION:-us-east-1}

echo "Collecting AWS Secrets Manager data from region: $REGION"
echo "------------------------------------------------------------"

# Secrets list
echo -e "\n=== Secrets List ==="
aws secretsmanager list-secrets --region "$REGION" \
  --query 'SecretList[*].{Name:Name,ARN:ARN,CreatedDate:CreatedDate,LastAccessed:LastAccessedDate,LastChanged:LastChangedDate,RotationEnabled:RotationEnabled,Description:Description}' \
  --output table

# Secrets rotation configuration
echo -e "\n=== Rotation Configuration ==="
aws secretsmanager list-secrets --region "$REGION" \
  --query 'SecretList[*].{Name:Name,RotationEnabled:RotationEnabled,NextRotation:NextRotationDate,LastRotated:LastRotatedDate,OwningService:OwningService}' \
  --output table

# Secret versions
echo -e "\n=== Secret Versions ==="
for SECRET_ARN in $(aws secretsmanager list-secrets --region "$REGION" --query "SecretList[].ARN" --output text); do
  echo "Secret: $SECRET_ARN"
  aws secretsmanager list-secret-version-ids --secret-id "$SECRET_ARN" --region "$REGION" \
    --query "Versions[].{VersionId:VersionId,CreatedDate:CreatedDate,LastAccessed:LastAccessedDate,VersionStages:VersionStages}" \
    --output table
done

# Tags for secrets
echo -e "\n=== Secret Tags ==="
for SECRET_ARN in $(aws secretsmanager list-secrets --region "$REGION" --query "SecretList[].ARN" --output text); do
  SECRET_NAME=$(basename "$SECRET_ARN")
  echo "Secret: $SECRET_NAME"
  aws secretsmanager list-tags-for-resource --secret-id "$SECRET_ARN" --region "$REGION" \
    --query 'Tags[].{Key:Key,Value:Value}' \
    --output table
done

# Resource-based policies
echo -e "\n=== Secret Resource Policies ==="
SECRETS=$(aws secretsmanager list-secrets --region "$REGION" --query "SecretList[].ARN" --output text)
for SECRET_ARN in $SECRETS; do
  SECRET_NAME=$(basename "$SECRET_ARN")
  echo "Secret: $SECRET_NAME"
  aws secretsmanager get-resource-policy --secret-id "$SECRET_ARN" --region "$REGION" \
    --query 'ResourcePolicy' --output text || echo "No resource policy attached."
done

# Replication status
echo -e "\n=== Secret Replication Status ==="
aws secretsmanager list-secrets --region "$REGION" \
  --query 'SecretList[].ReplicationStatus[] | [] | {Region: Region, Status: Status, StatusMessage: StatusMessage, LastAccessed: LastAccessedDate}' \
  --output table

# Recent CloudTrail events
echo -e "\n=== CloudTrail Events (Recent Secrets Activity) ==="
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventSource,AttributeValue=secretsmanager.amazonaws.com \
  --region "$REGION" --max-results 25 \
  --query 'Events[*].{Time:EventTime,User:Username,Action:EventName,Region:AwsRegion,SourceIP:Resources[0].ResourceName}' \
  --output table

echo ""
echo "=== AWS Secrets Manager Report Complete ==="
echo "============================================================"

# ---MOCK_RESPONSE---
# ============================================================
#                   AWS SECRETS MANAGER REPORT                
# ============================================================
# Region: eu-central-1 | Generated: 2025-10-28T18:30Z
# ------------------------------------------------------------
#
# 🔐 SECRETS LIST
# ------------------------------------------------------------
# | Name                | ARN                                                | CreatedDate          | LastAccessed         | LastChanged         | RotationEnabled | Description                  |
# +---------------------+----------------------------------------------------+----------------------+----------------------+---------------------+-----------------+------------------------------+
# | db-prod-password    | arn:aws:secretsmanager:eu-central-1:123456789012:secret:db-prod-password | 2023-11-02T10:45:00Z | 2025-10-25T08:00:00Z | 2025-10-20T09:15:00Z | True            | Production RDS credentials   |
# | api-key-serviceA    | arn:aws:secretsmanager:eu-central-1:123456789012:secret:api-key-serviceA | 2024-02-10T12:33:00Z | None                 | 2024-09-15T13:00:00Z | False           | API Key for Service A        |
# | oauth-token-service | arn:aws:secretsmanager:eu-central-1:123456789012:secret:oauth-token-service | 2025-05-01T08:10:00Z | 2025-10-28T11:00:00Z | 2025-09-30T10:30:00Z | True            | OAuth refresh token          |
# ------------------------------------------------------------
#
# 🔁 ROTATION CONFIGURATION
# ------------------------------------------------------------
# | Name                | RotationEnabled | NextRotation        | LastRotated        | OwningService         |
# +---------------------+-----------------+---------------------+--------------------+-----------------------+
# | db-prod-password    | True            | 2025-11-01T00:00:00Z| 2025-10-01T00:00Z  | rds.amazonaws.com     |
# | api-key-serviceA    | False           | None                | None               | lambda.amazonaws.com  |
# | oauth-token-service | True            | 2025-11-15T00:00:00Z| 2025-10-15T00:00Z  | ecs.amazonaws.com     |
# ------------------------------------------------------------
#
# 📦 SECRET VERSIONS
# ------------------------------------------------------------
# Secret: arn:aws:secretsmanager:eu-central-1:123456789012:secret:db-prod-password
# | VersionId                            | CreatedDate          | LastAccessed         | VersionStages        |
# +--------------------------------------+----------------------+----------------------+----------------------+
# | a1b2c3d4-5678-90ab-cdef-1234567890ab | 2025-09-01T09:00:00Z | 2025-10-25T08:00:00Z | AWSCURRENT           |
# | z9y8x7w6-5432-10ab-cdef-abcdef123456 | 2025-08-01T09:00:00Z | 2025-09-15T07:00:00Z | AWSPREVIOUS          |
#
# Secret: arn:aws:secretsmanager:eu-central-1:123456789012:secret:oauth-token-service
# | VersionId                            | CreatedDate          | LastAccessed         | VersionStages        |
# +--------------------------------------+----------------------+----------------------+----------------------+
# | 9abc8def-1234-5678-90ab-cdef4567abcd | 2025-10-15T10:00:00Z | 2025-10-28T11:00:00Z | AWSCURRENT           |
# ------------------------------------------------------------
#
# 🏷️  SECRET TAGS
# ------------------------------------------------------------
# | Key           | Value                     |
# +---------------+----------------------------+
# | environment   | production                 |
# | owner         | db-team                    |
# ------------------------------------------------------------
# | Key           | Value                     |
# +---------------+----------------------------+
# | environment   | staging                    |
# ------------------------------------------------------------
# | Key           | Value                     |
# +---------------+----------------------------+
# | owner         | backend-team               |
# ------------------------------------------------------------
#
# 🧩  RESOURCE POLICIES
# ------------------------------------------------------------
# Secret: db-prod-password
# {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Effect": "Allow",
#       "Principal": {
#         "Service": "rds.amazonaws.com"
#       },
#       "Action": "secretsmanager:GetSecretValue",
#       "Resource": "*"
#     }
#   ]
# }
#
# Secret: api-key-serviceA
# No resource policy attached.
#
# Secret: oauth-token-service
# No resource policy attached.
# ------------------------------------------------------------
#
# 🌍  REPLICATION STATUS
# ------------------------------------------------------------
# | Region        | Status     | StatusMessage           | LastAccessed         |
# +---------------+------------+-------------------------+----------------------+
# | eu-west-1     | InSync     | Replicated successfully | 2025-10-28T10:55:00Z |
# | us-east-1     | InSync     | Replicated successfully | 2025-10-28T11:00:00Z |
# ------------------------------------------------------------
#
# 🧾  CLOUDTRAIL EVENTS (RECENT)
# ------------------------------------------------------------
# | Time                | User          | Action               | Region         | SourceIP          |
# +---------------------+---------------+----------------------+----------------+-------------------+
# | 2025-10-28T08:55:33 | admin         | GetSecretValue       | eu-central-1   | 198.51.100.23     |
# | 2025-10-28T08:47:12 | app-lambda    | RotateSecret         | eu-central-1   | 10.0.0.85         |
# | 2025-10-28T08:32:41 | devops        | CreateSecret         | eu-central-1   | 203.0.113.7       |
# | 2025-10-28T08:25:10 | admin         | TagResource          | eu-central-1   | 198.51.100.23     |
# ------------------------------------------------------------
#
# ✅  REPORT COMPLETED SUCCESSFULLY
# Region: eu-central-1 | Time: 2025-10-28T18:30Z
# ============================================================
# ---END_MOCK---