#!/bin/bash
# =====================================================
# AWS IAM Comprehensive Report
# Description: Gathers all IAM-related information including users,
# groups, roles, policies, MFA devices, password policies,
# and recent CloudTrail events for auditing and security review.
# Output is displayed in AWS CLI table format.
# =====================================================

echo "=== AWS IAM Comprehensive Report ==="
echo "Enter AWS region (default: us-east-1): "
read REGION
REGION=${REGION:-us-east-1}

echo "Collecting IAM data from region: $REGION"
echo "------------------------------------------------------------"

# IAM Users
echo -e "\n=== IAM Users ==="
aws iam list-users --query 'Users[*].{UserName:UserName,CreateDate:CreateDate,PasswordLastUsed:PasswordLastUsed,Arn:Arn}' --output table

# IAM Groups
echo -e "\n=== IAM Groups ==="
aws iam list-groups --query 'Groups[*].{GroupName:GroupName,CreateDate:CreateDate,Arn:Arn,Path:Path}' --output table

# IAM Roles
echo -e "\n=== IAM Roles ==="
aws iam list-roles --query 'Roles[*].{RoleName:RoleName,CreateDate:CreateDate,Path:Path,Arn:Arn}' --output table

# IAM Policies
echo -e "\n=== IAM Policies ==="
aws iam list-policies --scope Local --query 'Policies[*].{PolicyName:PolicyName,Arn:Arn,AttachmentCount:AttachmentCount,CreateDate:CreateDate}' --output table

# IAM MFA Devices
echo -e "\n=== IAM MFA Devices ==="
aws iam list-mfa-devices --query 'MFADevices[*].{UserName:UserName,SerialNumber:SerialNumber,EnableDate:EnableDate}' --output table

# IAM Account Summary
echo -e "\n=== IAM Account Summary ==="
aws iam get-account-summary --query 'SummaryMap' --output table

# IAM Password Policy
echo -e "\n=== IAM Password Policy ==="
aws iam get-account-password-policy --query '{MinimumLength:MinimumPasswordLength,RequireSymbols:RequireSymbols,RequireNumbers:RequireNumbers,RequireUppercase:RequireUppercase,RequireLowercase:RequireLowercase,MaxAge:MaxPasswordAge,ReusePrevention:PasswordReusePrevention,AllowUsersToChange:AllowUsersToChangePassword}' --output table

# IAM Credential Report
echo -e "\n=== IAM Credential Report ==="
aws iam generate-credential-report > /dev/null 2>&1
aws iam get-credential-report --query 'Content' --output text | base64 --decode | column -t -s ',' | head -n 10

# Access Key Details
echo -e "\n=== IAM Access Keys ==="
for USER in $(aws iam list-users --query 'Users[*].UserName' --output text); do
  echo "Access Keys for user: $USER"
  aws iam list-access-keys --user-name "$USER" \
    --query 'AccessKeyMetadata[*].{AccessKeyId:AccessKeyId,Status:Status,CreateDate:CreateDate}' --output table
done

# Login Profiles
echo -e "\n=== IAM Login Profiles ==="
for USER in $(aws iam list-users --query 'Users[*].UserName' --output text); do
  aws iam get-login-profile --user-name "$USER" \
    --query '{UserName:UserName,CreateDate:CreateDate}' --output table 2>/dev/null || echo "No login profile for $USER"
done

# CloudTrail events related to IAM
echo -e "\n=== IAM CloudTrail Events (Recent) ==="
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventSource,AttributeValue=iam.amazonaws.com \
  --region "$REGION" --max-results 25 \
  --query 'Events[*].{Time:EventTime,User:Username,Action:EventName,Region:AwsRegion,SourceIP:Resources[0].ResourceName}' \
  --output table

echo ""
echo "=== AWS IAM Report Complete ==="
echo "============================================================"

# ---MOCK_RESPONSE---
# ============================================================
#                  AWS IAM COMPREHENSIVE REPORT               
# ============================================================
# Region: eu-central-1 | Generated: 2025-10-28T18:55Z
# ------------------------------------------------------------
#
# 👤 IAM USERS
# ------------------------------------------------------------
# | UserName | CreateDate           | PasswordLastUsed      | Arn                                                |
# +-----------+----------------------+-----------------------+----------------------------------------------------+
# | admin     | 2023-07-11T12:45:00Z | 2025-10-20T07:32:10Z  | arn:aws:iam::123456789012:user/admin              |
# | auditor   | 2024-03-05T08:12:00Z | None                  | arn:aws:iam::123456789012:user/auditor            |
# | devops    | 2025-02-15T11:00:00Z | 2025-10-25T09:30:00Z  | arn:aws:iam::123456789012:user/devops             |
# ------------------------------------------------------------
#
# 👥 IAM GROUPS
# ------------------------------------------------------------
# | GroupName | CreateDate           | Arn                                               | Path   |
# +-----------+----------------------+---------------------------------------------------+--------+
# | Admins    | 2023-09-10T10:20:00Z | arn:aws:iam::123456789012:group/Admins           | /admin/|
# | Auditors  | 2024-04-01T12:00:00Z | arn:aws:iam::123456789012:group/Auditors         | /audit/|
# ------------------------------------------------------------
#
# 🧩 IAM ROLES
# ------------------------------------------------------------
# | RoleName         | CreateDate           | Path       | Arn                                               |
# +------------------+----------------------+-------------+----------------------------------------------------+
# | LambdaExecution  | 2024-02-15T11:00:00Z | /service/  | arn:aws:iam::123456789012:role/LambdaExecution    |
# | CI_CD_DeployRole | 2023-11-03T09:45:00Z | /deploy/   | arn:aws:iam::123456789012:role/CI_CD_DeployRole   |
# ------------------------------------------------------------
#
# 🧾 IAM POLICIES
# ------------------------------------------------------------
# | PolicyName        | Arn                                                | AttachmentCount | CreateDate           |
# +--------------------+----------------------------------------------------+-----------------|----------------------+
# | BasicAccessPolicy  | arn:aws:iam::123456789012:policy/BasicAccessPolicy | 2               | 2024-05-12T10:11:00Z |
# | S3AdminPolicy      | arn:aws:iam::123456789012:policy/S3AdminPolicy     | 1               | 2024-01-09T14:33:00Z |
# ------------------------------------------------------------
#
# 🔐 MFA DEVICES
# ------------------------------------------------------------
# | UserName | SerialNumber                     | EnableDate           |
# +-----------+----------------------------------+----------------------+
# | admin     | arn:aws:iam::123456789012:mfa/admin | 2023-07-12T13:00:00Z |
# | auditor   | arn:aws:iam::123456789012:mfa/auditor | 2024-03-06T09:00:00Z |
# ------------------------------------------------------------
#
# 📊 ACCOUNT SUMMARY
# ------------------------------------------------------------
# | Summary Key           | Summary Value |
# +------------------------+---------------+
# | Users                  | 12            |
# | Roles                  | 8             |
# | Groups                 | 5             |
# | MFADevicesInUse        | 10            |
# | AccountMFAEnabled      | 1             |
# ------------------------------------------------------------
#
# 🔑 PASSWORD POLICY
# ------------------------------------------------------------
# | MinimumLength | RequireSymbols | RequireNumbers | RequireUppercase | RequireLowercase | MaxAge | ReusePrevention | AllowUsersToChange |
# +----------------+----------------+----------------+------------------+------------------+--------+-----------------+--------------------+
# | 12             | True           | True           | True             | True             | 90     | 5               | True               |
# ------------------------------------------------------------
#
# 🪪 CREDENTIAL REPORT (First 10 Entries)
# ------------------------------------------------------------
# user,arn,user_creation_time,password_enabled,password_last_used,mfa_active,access_key_1_active,access_key_1_last_used
# admin,arn:aws:iam::123456789012:user/admin,2023-07-11T12:45:00Z,TRUE,2025-10-20T07:32:10Z,TRUE,TRUE,2025-10-25T08:20:00Z
# auditor,arn:aws:iam::123456789012:user/auditor,2024-03-05T08:12:00Z,FALSE,None,FALSE,FALSE,None
# ------------------------------------------------------------
#
# 🧰 ACCESS KEYS
# ------------------------------------------------------------
# | AccessKeyId     | Status   | CreateDate           |
# +-----------------+----------+----------------------+
# | AKIA123EXAMPLE1 | Active   | 2024-05-12T09:00:00Z |
# | AKIA123EXAMPLE2 | Inactive | 2024-01-09T15:00:00Z |
# ------------------------------------------------------------
#
# 🔓 LOGIN PROFILES
# ------------------------------------------------------------
# | UserName | CreateDate           |
# +-----------+----------------------+
# | admin     | 2023-07-11T12:45:00Z |
# | devops    | 2025-02-15T11:00:00Z |
# ------------------------------------------------------------
#
# 🧾 CLOUDTRAIL EVENTS (RECENT)
# ------------------------------------------------------------
# | Time                | User       | Action               | Region         | SourceIP          |
# +---------------------+------------+----------------------|----------------|-------------------+
# | 2025-10-27T09:55:22 | admin      | CreateUser           | eu-central-1   | 198.51.100.23     |
# | 2025-10-27T09:47:12 | auditor    | ListUsers            | eu-central-1   | 203.0.113.7       |
# | 2025-10-27T09:42:01 | admin      | AttachRolePolicy     | eu-central-1   | 198.51.100.23     |
# | 2025-10-27T09:39:44 | devops     | UpdateAccessKey      | eu-central-1   | 10.0.0.45         |
# ------------------------------------------------------------
#
# ✅ REPORT COMPLETED SUCCESSFULLY
# Region: eu-central-1 | Time: 2025-10-28T18:55Z
# ============================================================
# ---END_MOCK---