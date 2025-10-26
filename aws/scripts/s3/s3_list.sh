# Lists all S3 buckets (mock)
aws s3 ls

# ---MOCK_RESPONSE---
# 2025-10-26 00:00:00 bucket-a
# 2025-09-14 00:00:00 bucket-b
# 2025-08-02 00:00:00 bucket-c
# ---END_MOCK---
# AWS S3 buckets overview (table)
echo "Fetching S3 bucket details..."

echo -e "\n=== S3 Buckets ==="
aws s3api list-buckets \
  --query 'Buckets[*].{Name:Name,CreationDate:CreationDate}' \
  --output table

echo -e "\n=== S3 Bucket Locations ==="
for bucket in $(aws s3api list-buckets --query 'Buckets[*].Name' --output text); do
  region=$(aws s3api get-bucket-location --bucket $bucket --query 'LocationConstraint' --output text)
  echo -e "Bucket: $bucket | Region: ${region:-us-east-1}"
done

echo -e "\n=== S3 Bucket Encryption Status ==="
for bucket in $(aws s3api list-buckets --query 'Buckets[*].Name' --output text); do
  aws s3api get-bucket-encryption --bucket $bucket \
    --query 'ServerSideEncryptionConfiguration.Rules[*].ApplyServerSideEncryptionByDefault.SSEAlgorithm' \
    --output table 2>/dev/null || echo "Bucket: $bucket | Encryption: None"
done

echo -e "\n=== S3 CloudTrail Events (Recent) ==="
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventSource,AttributeValue=s3.amazonaws.com \
  --max-results 20 \
  --query 'Events[*].{Time:EventTime,User:Username,Action:EventName,Region:AwsRegion,SourceIP:Resources[0].ResourceName}' \
  --output table

echo "Done."

# ---MOCK_RESPONSE---
# ============================================================
# S3 Buckets
# ------------------------------------------------------------
# | Name        | CreationDate           |
# |-------------|------------------------|
# | bucket-a    | 2025-10-26T00:00:00Z   |
# | bucket-b    | 2025-09-14T00:00:00Z   |
# | bucket-c    | 2025-08-02T00:00:00Z   |
# ------------------------------------------------------------
#
# S3 Bucket Locations
# ------------------------------------------------------------
# Bucket: bucket-a | Region: eu-central-1
# Bucket: bucket-b | Region: us-east-1
# Bucket: bucket-c | Region: ap-southeast-1
# ------------------------------------------------------------
#
# S3 Bucket Encryption Status
# ------------------------------------------------------------
# | Bucket      | Encryption |
# |--------------|-------------|
# | bucket-a     | AES256      |
# | bucket-b     | aws:kms     |
# | bucket-c     | None        |
# ------------------------------------------------------------
#
# S3 CloudTrail Events (Recent)
# ------------------------------------------------------------
# | Time                | User       | Action              | Region         | SourceIP          |
# |---------------------|------------|---------------------|----------------|-------------------|
# | 2025-10-26T09:12:55 | admin      | CreateBucket        | eu-central-1   | 198.51.100.23     |
# | 2025-10-26T08:57:13 | devops     | DeleteBucket        | us-east-1      | 203.0.113.7       |
# | 2025-10-26T08:44:11 | ci-runner  | PutBucketPolicy     | ap-southeast-1 | 10.0.0.15         |
# | 2025-10-26T08:33:01 | admin      | GetBucketEncryption | eu-central-1   | 198.51.100.23     |
# ------------------------------------------------------------
# ============================================================
# ---END_MOCK---