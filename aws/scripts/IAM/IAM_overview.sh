

# IAM account overview (table)
echo "Fetching IAM overview data..."

echo -e "\n=== IAM Users ==="
aws iam list-users --query 'Users[*].{UserName:UserName,CreateDate:CreateDate,PasswordLastUsed:PasswordLastUsed}' --output table

echo -e "\n=== IAM Roles ==="
aws iam list-roles --query 'Roles[*].{RoleName:RoleName,CreateDate:CreateDate,Path:Path}' --output table

echo -e "\n=== IAM Policies ==="
aws iam list-policies --scope Local --query 'Policies[*].{PolicyName:PolicyName,Arn:Arn,AttachmentCount:AttachmentCount,CreateDate:CreateDate}' --output table

echo -e "\n=== IAM Account Summary ==="
aws iam get-account-summary --query 'SummaryMap' --output table

echo -e "\n=== IAM Password Policy ==="
aws iam get-account-password-policy --query '{MinimumLength:MinimumPasswordLength,RequireSymbols:RequireSymbols,RequireNumbers:RequireNumbers,RequireUppercase:RequireUppercase,RequireLowercase:RequireLowercase,MaxAge:MaxPasswordAge,ReusePrevention:PasswordReusePrevention,AllowUsersToChange:AllowUsersToChangePassword}' --output table

echo -e "\n=== IAM Credential Report ==="
aws iam generate-credential-report > /dev/null 2>&1
aws iam get-credential-report --query 'Content' --output text | base64 --decode | column -t -s ',' | head -n 10

echo "Done."

# ---MOCK_RESPONSE---
# ============================================================
# IAM Users
# ------------------------------------------------------------
# | UserName | CreateDate           | PasswordLastUsed      |
# |-----------|----------------------|-----------------------|
# | admin     | 2023-07-11T12:45:00Z | 2025-10-20T07:32:10Z  |
# | auditor   | 2024-03-05T08:12:00Z | None                  |
# ------------------------------------------------------------
#
# IAM Roles
# ------------------------------------------------------------
# | RoleName          | CreateDate           | Path     |
# |--------------------|----------------------|----------|
# | LambdaExecution    | 2024-02-15T11:00:00Z | /service/|
# | CI_CD_DeployRole   | 2023-11-03T09:45:00Z | /deploy/ |
# ------------------------------------------------------------
#
# IAM Policies
# ------------------------------------------------------------
# | PolicyName        | Arn                                                | AttachmentCount | CreateDate           |
# |--------------------|----------------------------------------------------|-----------------|----------------------|
# | BasicAccessPolicy  | arn:aws:iam::123456789012:policy/BasicAccessPolicy | 2               | 2024-05-12T10:11:00Z |
# | S3AdminPolicy      | arn:aws:iam::123456789012:policy/S3AdminPolicy     | 1               | 2024-01-09T14:33:00Z |
# ------------------------------------------------------------
#
# IAM Account Summary
# ------------------------------------------------------------
# | Summary Key                     | Summary Value |
# |----------------------------------|----------------|
# | Users                            | 12             |
# | Roles                            | 8              |
# | Groups                           | 5              |
# | MFADevicesInUse                  | 10             |
# | AccountMFAEnabled                | 1              |
# ------------------------------------------------------------
#
# IAM Password Policy
# ------------------------------------------------------------
# | MinimumLength | RequireSymbols | RequireNumbers | RequireUppercase | RequireLowercase | MaxAge | ReusePrevention | AllowUsersToChange |
# |----------------|----------------|----------------|------------------|------------------|--------|------------------|--------------------|
# | 12             | True           | True           | True             | True             | 90     | 5                | True               |
# ------------------------------------------------------------
# ============================================================
# ---END_MOCK---