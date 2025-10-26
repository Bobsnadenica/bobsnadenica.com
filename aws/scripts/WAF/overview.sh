

# AWS WAF overview (table)
echo "Fetching AWS WAF details..."

echo -e "\n=== WAF Web ACLs ==="
aws wafv2 list-web-acls \
  --scope REGIONAL \
  --query 'WebACLs[*].{Name:Name,ARN:ARN,Id:Id,Description:Description,Capacity:Capacity,LockToken:LockToken}' \
  --output table

echo -e "\n=== WAF Rules ==="
for acl_arn in $(aws wafv2 list-web-acls --scope REGIONAL --query 'WebACLs[*].ARN' --output text); do
  echo -e "\nRules for ACL: $acl_arn"
  aws wafv2 get-web-acl --name $(aws wafv2 list-web-acls --scope REGIONAL --query 'WebACLs[0].Name' --output text) \
    --scope REGIONAL \
    --id $(aws wafv2 list-web-acls --scope REGIONAL --query 'WebACLs[0].Id' --output text) \
    --query 'WebACL.Rules[*].{Name:Name,Priority:Priority,Action:Action.Block,StatementType:Statement.RateBasedStatement.Limit}' \
    --output table
done

echo -e "\n=== WAF IP Sets ==="
aws wafv2 list-ip-sets \
  --scope REGIONAL \
  --query 'IPSets[*].{Name:Name,ARN:ARN,Id:Id,Description:Description}' \
  --output table

echo -e "\n=== WAF CloudTrail Events (Recent) ==="
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventSource,AttributeValue=wafv2.amazonaws.com \
  --max-results 20 \
  --query 'Events[*].{Time:EventTime,User:Username,Action:EventName,Region:AwsRegion,SourceIP:Resources[0].ResourceName}' \
  --output table

echo "Done."

# ---MOCK_RESPONSE---
# ============================================================
# WAF Web ACLs
# ------------------------------------------------------------
# | Name          | ARN                                               | Id                | Description          | Capacity | LockToken |
# |----------------|---------------------------------------------------|-------------------|----------------------|-----------|------------|
# | WebACL-Prod    | arn:aws:wafv2:eu-central-1:123456789012:regional/webacl/WebACL-Prod/1a2b3c4d | 1a2b3c4d | Protects app layer | 50 | a1b2c3d4 |
# | WebACL-API     | arn:aws:wafv2:eu-central-1:123456789012:regional/webacl/WebACL-API/2b3c4d5e | 2b3c4d5e | API endpoint shield | 80 | b2c3d4e5 |
# ------------------------------------------------------------
#
# WAF Rules
# ------------------------------------------------------------
# | Name               | Priority | Action | StatementType |
# |--------------------|----------|--------|----------------|
# | BlockSQLInjection  | 1        | BLOCK  | 100            |
# | RateLimitIP        | 2        | COUNT  | 5000           |
# ------------------------------------------------------------
#
# WAF IP Sets
# ------------------------------------------------------------
# | Name             | ARN                                               | Id        | Description           |
# |------------------|---------------------------------------------------|-----------|-----------------------|
# | BlockedIPs       | arn:aws:wafv2:eu-central-1:123456789012:regional/ipset/BlockedIPs/9f8e7d6c | 9f8e7d6c | Contains bad IPs      |
# | TrustedIPs       | arn:aws:wafv2:eu-central-1:123456789012:regional/ipset/TrustedIPs/8e7d6c5b | 8e7d6c5b | Whitelisted IPs       |
# ------------------------------------------------------------
#
# WAF CloudTrail Events (Recent)
# ------------------------------------------------------------
# | Time                | User       | Action            | Region         | SourceIP          |
# |---------------------|------------|-------------------|----------------|-------------------|
# | 2025-10-26T09:12:55 | admin      | CreateWebACL      | eu-central-1   | 198.51.100.23     |
# | 2025-10-26T08:57:13 | devops     | UpdateIPSet       | eu-central-1   | 203.0.113.7       |
# | 2025-10-26T08:44:11 | waf-admin  | PutLoggingConfiguration | eu-central-1 | 10.0.0.15         |
# | 2025-10-26T08:33:01 | admin      | DeleteRuleGroup   | eu-central-1   | 198.51.100.23     |
# ------------------------------------------------------------
# ============================================================
# ---END_MOCK---