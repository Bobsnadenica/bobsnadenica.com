# AWS Inspector overview (table)
echo "Fetching AWS Inspector findings and resources..."

echo -e "\n=== Inspector2 Enabled Accounts ==="
aws inspector2 list-members \
  --query 'members[*].{AccountId:accountId,Status:relationshipStatus,InvitedAt:invitedAt,UpdatedAt:updatedAt}' \
  --output table 2>/dev/null || echo "No member accounts found."

echo -e "\n=== Inspector2 Findings ==="
aws inspector2 list-findings \
  --max-results 20 \
  --query 'findings[*].{FindingArn:findingArn,Title:title,Severity:severity,Status:status,Resource:resources[0].id,Type:type}' \
  --output table 2>/dev/null || echo "No findings available."

echo -e "\n=== Inspector2 Covered Resources ==="
aws inspector2 list-coverage \
  --max-results 20 \
  --query 'coveredResources[*].{ResourceId:resourceId,ResourceType:resourceType,ScanStatus:scanStatus,AccountId:accountId,LastScannedAt:lastScannedAt}' \
  --output table 2>/dev/null || echo "No covered resources found."

echo -e "\n=== Inspector CloudTrail Events (Recent) ==="
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventSource,AttributeValue=inspector2.amazonaws.com \
  --max-results 20 \
  --query 'Events[*].{Time:EventTime,User:Username,Action:EventName,Region:AwsRegion,SourceIP:Resources[0].ResourceName}' \
  --output table

echo "Done."

# ---MOCK_RESPONSE---
# ============================================================
# Inspector2 Enabled Accounts
# ------------------------------------------------------------
# | AccountId    | Status     | InvitedAt           | UpdatedAt           |
# |---------------|------------|---------------------|---------------------|
# | 123456789012  | ENABLED    | 2024-05-02T12:00:00Z| 2025-10-20T09:30:00Z|
# ------------------------------------------------------------
#
# Inspector2 Findings
# ------------------------------------------------------------
# | FindingArn                                        | Title                  | Severity | Status   | Resource           | Type            |
# |---------------------------------------------------|------------------------|-----------|----------|--------------------|-----------------|
# | arn:aws:inspector2:eu-central-1:123456789012:finding/abcd1234 | Outdated package found | HIGH      | ACTIVE  | i-0abcd1234ef56789 | PACKAGE_VULNERABILITY |
# | arn:aws:inspector2:eu-central-1:123456789012:finding/efgh5678 | SSH config insecure    | MEDIUM    | ACTIVE  | i-0efgh5678ij90123 | NETWORK_REACHABILITY |
# ------------------------------------------------------------
#
# Inspector2 Covered Resources
# ------------------------------------------------------------
# | ResourceId        | ResourceType | ScanStatus | AccountId    | LastScannedAt        |
# |--------------------|--------------|-------------|--------------|----------------------|
# | i-0abcd1234ef56789 | EC2_INSTANCE | COMPLETE    | 123456789012 | 2025-10-26T08:00:00Z |
# | i-0efgh5678ij90123 | EC2_INSTANCE | COMPLETE    | 123456789012 | 2025-10-26T08:00:00Z |
# ------------------------------------------------------------
#
# Inspector CloudTrail Events (Recent)
# ------------------------------------------------------------
# | Time                | User       | Action                 | Region         | SourceIP         |
# |---------------------|------------|------------------------|----------------|------------------|
# | 2025-10-26T09:10:22 | admin      | CreateFilter           | eu-central-1   | 198.51.100.23    |
# | 2025-10-26T08:45:51 | devops     | BatchGetFindings       | eu-central-1   | 203.0.113.7      |
# | 2025-10-26T08:32:18 | admin      | EnableDelegatedAdminAccount | eu-central-1 | 198.51.100.23    |
# ------------------------------------------------------------
# ============================================================
# ---END_MOCK---