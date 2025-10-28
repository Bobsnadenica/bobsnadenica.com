#!/bin/bash
# =====================================================
# AWS KMS Comprehensive Report
# Description: Collects all possible details related to AWS Key Management Service (KMS).
# Includes keys, metadata, grants, aliases, policies, rotation status, tags, and recent CloudTrail events.
# Output is displayed in AWS CLI table format.
# =====================================================

echo "=== AWS KMS Comprehensive Report ==="
echo "Enter AWS region (default: us-east-1): "
read REGION
REGION=${REGION:-us-east-1}

echo "Collecting AWS KMS data from region: $REGION"
echo "------------------------------------------------------------"

# KMS Keys
echo -e "\n=== KMS Keys ==="
aws kms list-keys --region "$REGION" \
  --query 'Keys[*].{KeyId:KeyId,ARN:KeyArn}' \
  --output table

# KMS Key Metadata
echo -e "\n=== KMS Key Metadata ==="
for key in $(aws kms list-keys --region "$REGION" --query 'Keys[*].KeyId' --output text); do
  echo -e "\nKey: $key"
  aws kms describe-key --key-id "$key" --region "$REGION" \
    --query 'KeyMetadata.{KeyId:KeyId,Description:Description,KeyState:KeyState,CreationDate:CreationDate,Enabled:Enabled,KeyManager:KeyManager,Origin:Origin,KeyUsage:KeyUsage,EncryptionAlgorithms:EncryptionAlgorithms,CustomerMasterKeySpec:CustomerMasterKeySpec,MultiRegion:MultiRegion,Arn:Arn}' \
    --output table
done

# KMS Aliases
echo -e "\n=== KMS Aliases ==="
aws kms list-aliases --region "$REGION" \
  --query 'Aliases[*].{AliasName:AliasName,TargetKeyId:TargetKeyId,CreationDate:CreationDate,LastUpdated:LastUpdatedDate}' \
  --output table

# KMS Grants
echo -e "\n=== KMS Grants ==="
for key in $(aws kms list-keys --region "$REGION" --query 'Keys[*].KeyId' --output text); do
  echo "Grants for Key: $key"
  aws kms list-grants --key-id "$key" --region "$REGION" \
    --query 'Grants[*].{GrantId:GrantId,GranteePrincipal:GranteePrincipal,CreationDate:CreationDate,Operations:Operations}' \
    --output table 2>/dev/null || echo "No active grants found."
done

# KMS Rotation Status
echo -e "\n=== KMS Key Rotation Status ==="
for key in $(aws kms list-keys --region "$REGION" --query 'Keys[*].KeyId' --output text); do
  echo "Key: $key"
  aws kms get-key-rotation-status --key-id "$key" --region "$REGION" \
    --query '{KeyId:KeyId,RotationEnabled:KeyRotationEnabled}' --output table 2>/dev/null || echo "Rotation info unavailable."
done

# KMS Key Policies
echo -e "\n=== KMS Key Policies ==="
for key in $(aws kms list-keys --region "$REGION" --query 'Keys[*].KeyId' --output text); do
  echo "Key: $key"
  aws kms get-key-policy --key-id "$key" --policy-name default --region "$REGION" \
    --query 'Policy' --output text || echo "No policy found."
done

# KMS Tags
echo -e "\n=== KMS Key Tags ==="
for key in $(aws kms list-keys --region "$REGION" --query 'Keys[*].KeyId' --output text); do
  echo "Key: $key"
  aws kms list-resource-tags --key-id "$key" --region "$REGION" \
    --query 'Tags[].{TagKey:TagKey,TagValue:TagValue}' \
    --output table 2>/dev/null || echo "No tags found."
done

# Pending Deletion Keys
echo -e "\n=== Pending Key Deletions ==="
aws kms list-keys --region "$REGION" \
  --query "Keys[?KeyState=='PendingDeletion'].{KeyId:KeyId,ARN:KeyArn}" \
  --output table || echo "No keys pending deletion."

# CloudTrail events related to KMS
echo -e "\n=== KMS CloudTrail Events (Recent) ==="
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventSource,AttributeValue=kms.amazonaws.com \
  --region "$REGION" --max-results 25 \
  --query 'Events[*].{Time:EventTime,User:Username,Action:EventName,Region:AwsRegion,SourceIP:Resources[0].ResourceName}' \
  --output table

echo ""
echo "=== AWS KMS Report Complete ==="
echo "============================================================"

# ---MOCK_RESPONSE---
# ============================================================
#                   AWS KMS COMPREHENSIVE REPORT              
# ============================================================
# Region: eu-central-1 | Generated: 2025-10-28T18:40Z
# ------------------------------------------------------------
#
# 🔑 KMS KEYS
# ------------------------------------------------------------
# | KeyId                                 | ARN                                               |
# +---------------------------------------+---------------------------------------------------+
# | 1234abcd-12ab-34cd-56ef-1234567890ab  | arn:aws:kms:eu-central-1:123456789012:key/1234abcd-12ab-34cd-56ef-1234567890ab |
# | 5678efgh-12ab-34cd-56ef-1234567890cd  | arn:aws:kms:eu-central-1:123456789012:key/5678efgh-12ab-34cd-56ef-1234567890cd |
# ------------------------------------------------------------
#
# 🧩 KEY METADATA
# ------------------------------------------------------------
# | KeyId                                 | Description     | KeyState | CreationDate        | Enabled | KeyManager | Origin | KeyUsage | MultiRegion | EncryptionAlgorithms | Arn |
# +---------------------------------------+-----------------+----------+---------------------+---------+-------------+--------+-----------+--------------+----------------------+-----+
# | 1234abcd-12ab-34cd-56ef-1234567890ab  | Main Prod Key   | Enabled  | 2023-09-15T10:00:00Z| True    | CUSTOMER    | AWS_KMS| ENCRYPT_DECRYPT | True | AES_256 | arn:aws:kms:eu-central-1:123456789012:key/1234abcd |
# | 5678efgh-12ab-34cd-56ef-1234567890cd  | Backup Key      | Enabled  | 2024-01-03T12:11:00Z| True    | CUSTOMER    | AWS_KMS| SIGN_VERIFY | False | RSAES_OAEP_SHA_256 | arn:aws:kms:eu-central-1:123456789012:key/5678efgh |
# ------------------------------------------------------------
#
# 🏷️  ALIASES
# ------------------------------------------------------------
# | AliasName         | TargetKeyId                         | CreationDate        | LastUpdated        |
# +-------------------+-------------------------------------+---------------------+--------------------+
# | alias/prod-key    | 1234abcd-12ab-34cd-56ef-1234567890ab| 2023-09-15T10:00:00Z| 2025-01-10T08:20Z  |
# | alias/backup-key  | 5678efgh-12ab-34cd-56ef-1234567890cd| 2024-01-03T12:11:00Z| 2025-04-25T11:00Z  |
# ------------------------------------------------------------
#
# 🎟️  GRANTS
# ------------------------------------------------------------
# | GrantId                              | GranteePrincipal              | CreationDate         | Operations          |
# +--------------------------------------+--------------------------------+----------------------+---------------------+
# | 8a7b6c5d4e3f2a1b0c9d                 | arn:aws:iam::123456789012:role/LambdaExecRole | 2025-08-12T09:00:00Z | Encrypt,Decrypt     |
# | 9c8d7e6f5a4b3c2d1e0f                 | arn:aws:iam::123456789012:user/AdminUser      | 2025-08-13T11:00:00Z | ReEncrypt,Describe  |
# ------------------------------------------------------------
#
# 🔁  ROTATION STATUS
# ------------------------------------------------------------
# | KeyId                                 | RotationEnabled |
# +---------------------------------------+-----------------+
# | 1234abcd-12ab-34cd-56ef-1234567890ab  | True            |
# | 5678efgh-12ab-34cd-56ef-1234567890cd  | False           |
# ------------------------------------------------------------
#
# 📜  POLICIES
# ------------------------------------------------------------
# {
#   "Version": "2012-10-17",
#   "Id": "key-default-1",
#   "Statement": [
#     {
#       "Sid": "Enable IAM User Permissions",
#       "Effect": "Allow",
#       "Principal": {"AWS": "arn:aws:iam::123456789012:root"},
#       "Action": "kms:*",
#       "Resource": "*"
#     }
#   ]
# }
# ------------------------------------------------------------
#
# 🏷️  TAGS
# ------------------------------------------------------------
# | TagKey        | TagValue      |
# +---------------+---------------+
# | environment   | production    |
# | owner         | devops-team   |
# ------------------------------------------------------------
#
# ⏳  PENDING DELETIONS
# ------------------------------------------------------------
# | KeyId                                 | ARN                                               |
# +---------------------------------------+---------------------------------------------------+
# | 9012ijkl-34mn-56op-78qr-9012345678st  | arn:aws:kms:eu-central-1:123456789012:key/9012ijkl-34mn-56op-78qr-9012345678st |
# ------------------------------------------------------------
#
# 🧾  CLOUDTRAIL EVENTS (RECENT)
# ------------------------------------------------------------
# | Time                | User       | Action               | Region         | SourceIP          |
# +---------------------+------------+----------------------|----------------|-------------------+
# | 2025-10-26T08:55:33 | admin      | Encrypt              | eu-central-1   | 198.51.100.23     |
# | 2025-10-26T08:47:12 | app-lambda | Decrypt              | eu-central-1   | 10.0.0.85         |
# | 2025-10-26T08:32:41 | devops     | CreateKey            | eu-central-1   | 203.0.113.7       |
# | 2025-10-26T08:25:10 | admin      | ScheduleKeyDeletion  | eu-central-1   | 198.51.100.23     |
# ------------------------------------------------------------
#
# ✅  REPORT COMPLETED SUCCESSFULLY
# Region: eu-central-1 | Time: 2025-10-28T18:40Z
# ============================================================
# ---END_MOCK---