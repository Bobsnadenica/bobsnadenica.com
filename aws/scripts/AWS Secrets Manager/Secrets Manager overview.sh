# Describe EC2 instances (mock)
test

# ---MOCK_RESPONSE---
hfdhdfhfdngfnfg
# ---END_MOCK---
# AWS Secrets Manager overview (table)
echo "Fetching AWS Secrets Manager details..."

echo -e "\n=== Secrets List ==="
aws secretsmanager list-secrets \
  --query 'SecretList[*].{Name:Name,ARN:ARN,CreatedDate:CreatedDate,LastAccessed:LastAccessedDate,LastChanged:LastChangedDate,RotationEnabled:RotationEnabled}' \
  --output table

echo -e "\n=== Secrets Rotation Status ==="
aws secretsmanager list-secrets \
  --query 'SecretList[*].{Name:Name,RotationEnabled:RotationEnabled,NextRotation:NextRotationDate}' \
  --output table

echo -e "\n=== Secrets Policies ==="
aws secretsmanager list-secrets \
  --query 'SecretList[*].{Name:Name,Policy:OwningService}' \
  --output table

echo -e "\n=== Secrets CloudTrail Events (Recent) ==="
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventSource,AttributeValue=secretsmanager.amazonaws.com \
  --max-results 20 \
  --query 'Events[*].{Time:EventTime,User:Username,Action:EventName,Region:AwsRegion,SourceIP:Resources[0].ResourceName}' \
  --output table

echo "Done."

# ---MOCK_RESPONSE---
# ============================================================
# Secrets List
# ------------------------------------------------------------
# | Name             | ARN                                              | CreatedDate          | LastAccessed         | LastChanged         | RotationEnabled |
# |------------------|---------------------------------------------------|----------------------|----------------------|---------------------|-----------------|
# | db-prod-password | arn:aws:secretsmanager:eu-central-1:123456789012:secret:db-prod-password | 2023-11-02T10:45:00Z | 2025-10-25T08:00:00Z | 2025-10-20T09:15:00Z | True            |
# | api-key-serviceA  | arn:aws:secretsmanager:eu-central-1:123456789012:secret:api-key-serviceA | 2024-02-10T12:33:00Z | None                 | 2024-09-15T13:00:00Z | False           |
# ------------------------------------------------------------
#
# Secrets Rotation Status
# ------------------------------------------------------------
# | Name             | RotationEnabled | NextRotation        |
# |------------------|-----------------|---------------------|
# | db-prod-password | True            | 2025-11-01T00:00:00Z|
# | api-key-serviceA  | False           | None                |
# ------------------------------------------------------------
#
# Secrets Policies
# ------------------------------------------------------------
# | Name             | Policy                 |
# |------------------|------------------------|
# | db-prod-password | rds.amazonaws.com      |
# | api-key-serviceA  | lambda.amazonaws.com  |
# ------------------------------------------------------------s
#
# Secrets CloudTrail Events (Recent)
# ------------------------------------------------------------
# | Time                | User       | Action               | Region         | SourceIP          |
# |---------------------|------------|----------------------|----------------|-------------------|
# | 2025-10-26T08:55:33 | admin      | GetSecretValue       | eu-central-1   | 198.51.100.23     |
# | 2025-10-26T08:47:12 | app-lambda | RotateSecret         | eu-central-1   | 10.0.0.85         |
# | 2025-10-26T08:32:41 | devops     | CreateSecret         | eu-central-1   | 203.0.113.7       |
# | 2025-10-26T08:25:10 | admin      | TagResource          | eu-central-1   | 198.51.100.23     |
# ------------------------------------------------------------
# ============================================================
# ---END_MOCK---