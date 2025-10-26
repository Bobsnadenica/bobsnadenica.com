

# AWS KMS overview (table)
echo "Fetching AWS KMS details..."

echo -e "\n=== KMS Keys ==="
aws kms list-keys \
  --query 'Keys[*].{KeyId:KeyId,ARN:KeyArn}' \
  --output table

echo -e "\n=== KMS Key Metadata ==="
for key in $(aws kms list-keys --query 'Keys[*].KeyId' --output text); do
  echo -e "\nKey: $key"
  aws kms describe-key --key-id $key \
    --query 'KeyMetadata.{KeyId:KeyId,Description:Description,KeyState:KeyState,CreationDate:CreationDate,Enabled:Enabled,KeyManager:KeyManager,Origin:Origin,EncryptionAlgorithms:EncryptionAlgorithms}' \
    --output table
done

echo -e "\n=== KMS Grants ==="
aws kms list-grants --key-id $(aws kms list-keys --query 'Keys[0].KeyId' --output text) \
  --query 'Grants[*].{GrantId:GrantId,GranteePrincipal:GranteePrincipal,CreationDate:CreationDate,Operations:Operations}' \
  --output table 2>/dev/null || echo "No active grants found."

echo -e "\n=== KMS CloudTrail Events (Recent) ==="
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventSource,AttributeValue=kms.amazonaws.com \
  --max-results 20 \
  --query 'Events[*].{Time:EventTime,User:Username,Action:EventName,Region:AwsRegion,SourceIP:Resources[0].ResourceName}' \
  --output table

echo "Done."

# ---MOCK_RESPONSE---
# ============================================================
# KMS Keys
# ------------------------------------------------------------
# | KeyId                                 | ARN                                               |
# |---------------------------------------|---------------------------------------------------|
# | 1234abcd-12ab-34cd-56ef-1234567890ab  | arn:aws:kms:eu-central-1:123456789012:key/1234abcd-12ab-34cd-56ef-1234567890ab |
# | 5678efgh-12ab-34cd-56ef-1234567890cd  | arn:aws:kms:eu-central-1:123456789012:key/5678efgh-12ab-34cd-56ef-1234567890cd |
# ------------------------------------------------------------
#
# KMS Key Metadata
# ------------------------------------------------------------
# | KeyId                                 | Description     | KeyState | CreationDate        | Enabled | KeyManager | Origin | EncryptionAlgorithms |
# |---------------------------------------|-----------------|----------|---------------------|---------|-------------|--------|----------------------|
# | 1234abcd-12ab-34cd-56ef-1234567890ab  | Main Prod Key   | Enabled  | 2023-09-15T10:00:00Z| True    | CUSTOMER    | AWS_KMS| AES_256              |
# | 5678efgh-12ab-34cd-56ef-1234567890cd  | Backup Key      | Enabled  | 2024-01-03T12:11:00Z| True    | CUSTOMER    | AWS_KMS| RSAES_OAEP_SHA_256   |
# ------------------------------------------------------------
#
# KMS Grants
# ------------------------------------------------------------
# | GrantId                              | GranteePrincipal              | CreationDate         | Operations          |
# |--------------------------------------|--------------------------------|----------------------|---------------------|
# | 8a7b6c5d4e3f2a1b0c9d                 | arn:aws:iam::123456789012:role/LambdaExecRole | 2025-08-12T09:00:00Z | Encrypt,Decrypt     |
# ------------------------------------------------------------
#
# KMS CloudTrail Events (Recent)
# ------------------------------------------------------------
# | Time                | User       | Action               | Region         | SourceIP          |
# |---------------------|------------|----------------------|----------------|-------------------|
# | 2025-10-26T08:55:33 | admin      | Encrypt              | eu-central-1   | 198.51.100.23     |
# | 2025-10-26T08:47:12 | app-lambda | Decrypt              | eu-central-1   | 10.0.0.85         |
# | 2025-10-26T08:32:41 | devops     | CreateKey            | eu-central-1   | 203.0.113.7       |
# | 2025-10-26T08:25:10 | admin      | ScheduleKeyDeletion  | eu-central-1   | 198.51.100.23     |
# ------------------------------------------------------------
# ============================================================
# ---END_MOCK---