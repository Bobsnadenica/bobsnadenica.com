# IAM-related CloudTrail events (table)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventSource,AttributeValue=iam.amazonaws.com \
  --max-results 20 \
  --query 'Events[*].{Time:EventTime,User:Username,Action:EventName,SourceIP:Resources[0].ResourceName,Region:AwsRegion}' \
  --output table

# ---MOCK_RESPONSE---
# -------------------------------------------------------------
# |                        LookupEvents                       |
# +---------------------+---------------+---------------------+------------------+----------------+
# | Time                | User          | Action              | SourceIP         | Region         |
# +---------------------+---------------+---------------------+------------------+----------------+
# | 2025-10-26T08:45:33 | admin         | CreateUser          | 198.51.100.23    | eu-central-1   |
# | 2025-10-26T08:40:12 | root          | AttachUserPolicy    | 203.0.113.7      | eu-central-1   |
# | 2025-10-26T08:37:02 | audit-bot     | ListUsers           | 10.0.12.45       | eu-central-1   |
# | 2025-10-26T08:29:44 | ci-runner     | GetRole             | 10.0.5.90        | eu-central-1   |
# | 2025-10-26T08:22:11 | admin         | DeleteAccessKey     | 198.51.100.23    | eu-central-1   |
# -------------------------------------------------------------
# ---END_MOCK---