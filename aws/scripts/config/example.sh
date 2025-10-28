
#!/bin/bash
# Description: AWS Config — example reports with a single displayed command per section and a mock table output.

AWS_REGION="${AWS_REGION:-us-east-1}"

############################################
# 1) Configuration Recorder Status
############################################
echo "aws configservice describe-configuration-recorder-status --region ${AWS_REGION} --output table"

# ---MOCK_RESPONSE---
# aws configservice describe-configuration-recorder-status --region us-east-1 --output table
+-------------------+----------------------+----------------------------+----------------------------+---------------------------+
|   name            |   recording          | lastStatus                 | lastStartTime              | lastSuccessfulTime        |
+-------------------+----------------------+----------------------------+----------------------------+---------------------------+
| default-recorder  | True                 | SUCCESS                    | 2025-10-26T12:00:05+00:00  | 2025-10-26T12:05:14+00:00 |
+-------------------+----------------------+----------------------------+----------------------------+---------------------------+
# ---END_MOCK---

############################################
# 2) Configuration Recorders (definition)
############################################
echo "aws configservice describe-configuration-recorders --region ${AWS_REGION} --query 'ConfigurationRecorders[].{name: name, roleARN: roleARN, allSupported: recordingGroup.allSupported, includeGlobal: recordingGroup.includeGlobalResourceTypes}' --output table"

# ---MOCK_RESPONSE---
# aws configservice describe-configuration-recorders --region us-east-1 --query 'ConfigurationRecorders[].{name: name, roleARN: roleARN, allSupported: recordingGroup.allSupported, includeGlobal: recordingGroup.includeGlobalResourceTypes}' --output table
+-------------------+--------------------------------------------------------------+---------------+----------------+
|      name         |                          roleARN                             | allSupported  | includeGlobal  |
+-------------------+--------------------------------------------------------------+---------------+----------------+
| default-recorder  | arn:aws:iam::123456789012:role/AWSConfigRole                 | True          | True           |
+-------------------+--------------------------------------------------------------+---------------+----------------+
# ---END_MOCK---

############################################
# 3) Delivery Channels (S3/SNS destinations)
############################################
echo "aws configservice describe-delivery-channels --region ${AWS_REGION} --query 'DeliveryChannels[].{name: name, s3BucketName: s3BucketName, s3KeyPrefix: s3KeyPrefix, snsTopicARN: snsTopicARN}' --output table"

# ---MOCK_RESPONSE---
# aws configservice describe-delivery-channels --region us-east-1 --query 'DeliveryChannels[].{name: name, s3BucketName: s3BucketName, s3KeyPrefix: s3KeyPrefix, snsTopicARN: snsTopicARN}' --output table
+---------------------------+------------------------+--------------+--------------------------------------------------------------+
|           name            |     s3BucketName       | s3KeyPrefix  |                         snsTopicARN                          |
+---------------------------+------------------------+--------------+--------------------------------------------------------------+
| default-delivery-channel  | org-logs-config-12345  | config       | arn:aws:sns:us-east-1:123456789012:config-notifications      |
+---------------------------+------------------------+--------------+--------------------------------------------------------------+
# ---END_MOCK---

############################################
# 4) Delivery Channel Status
############################################
echo "aws configservice describe-delivery-channel-status --region ${AWS_REGION} --output table"

# ---MOCK_RESPONSE---
# aws configservice describe-delivery-channel-status --region us-east-1 --output table
+---------------------------+----------------------------+----------------------------+---------------------------+
|           name            | lastStatus                 | lastStatusChangeTime       | configHistoryDeliveryInfo |
+---------------------------+----------------------------+----------------------------+---------------------------+
| default-delivery-channel  | SUCCESS                    | 2025-10-26T12:05:22+00:00  | SUCCESS                   |
+---------------------------+----------------------------+----------------------------+---------------------------+
# ---END_MOCK---

############################################
# 5) Config Rules (list)
############################################
echo "aws configservice describe-config-rules --region ${AWS_REGION} --query 'ConfigRules[].{name:ConfigRuleName, owner:Owner, state:ConfigRuleState, createdBy:CreatedBy}' --output table"

# ---MOCK_RESPONSE---
# aws configservice describe-config-rules --region us-east-1 --query 'ConfigRules[].{name:ConfigRuleName, owner:Owner, state:ConfigRuleState, createdBy:CreatedBy}' --output table
+-----------------------------+-----------+-----------+-------------------------+
|            name             |  owner    |  state    |        createdBy        |
+-----------------------------+-----------+-----------+-------------------------+
| restricted-ssh-access       | CUSTOM_LAMBDA | ACTIVE | arn:aws:lambda:...     |
| s3-bucket-versioning        | AWS        | ACTIVE    | aws-config-managed      |
| ec2-instance-managed        | AWS        | ACTIVE    | aws-config-managed      |
| iam-role-noinlinepolicies   | AWS        | ACTIVE    | aws-config-managed      |
+-----------------------------+-----------+-----------+-------------------------+
# ---END_MOCK---

############################################
# 6) Compliance Summary by Rule
############################################
echo "aws configservice get-compliance-summary-by-config-rule --region ${AWS_REGION} --output table"

# ---MOCK_RESPONSE---
# aws configservice get-compliance-summary-by-config-rule --region us-east-1 --output table
+----------------------+----------------+-------------------+
| COMPLIANT_RULE_COUNT | NON_COMPLIANT  | TOTAL_RULE_COUNT  |
+----------------------+----------------+-------------------+
| 3                    | 1              | 4                 |
+----------------------+----------------+-------------------+
# ---END_MOCK---

############################################
# 7) Compliance Details for a Specific Rule
############################################
RULE_NAME="${RULE_NAME:-restricted-ssh-access}"
echo "aws configservice get-compliance-details-by-config-rule --config-rule-name ${RULE_NAME} --compliance-types NON_COMPLIANT COMPLIANT --region ${AWS_REGION} --query 'EvaluationResults[].{resourceId:EvaluationResultIdentifier.EvaluationResultQualifier.ResourceId, resourceType:EvaluationResultIdentifier.EvaluationResultQualifier.ResourceType, compliance:ComplianceType, recordedAt:ResultRecordedTime}' --output table"

# ---MOCK_RESPONSE---
# aws configservice get-compliance-details-by-config-rule --config-rule-name restricted-ssh-access --compliance-types NON_COMPLIANT COMPLIANT --region us-east-1 --query 'EvaluationResults[].{resourceId:EvaluationResultIdentifier.EvaluationResultQualifier.ResourceId, resourceType:EvaluationResultIdentifier.EvaluationResultQualifier.ResourceType, compliance:ComplianceType, recordedAt:ResultRecordedTime}' --output table
+---------------------------+------------------------+----------------+----------------------------+
|        resourceId         |      resourceType      |   compliance   |         recordedAt         |
+---------------------------+------------------------+----------------+----------------------------+
| sg-083a12ef91d9b0cdd      | AWS::EC2::SecurityGroup| NON_COMPLIANT  | 2025-10-26T11:58:07+00:00  |
| sg-0a1b2c3d4e5f67890      | AWS::EC2::SecurityGroup| COMPLIANT      | 2025-10-26T11:58:07+00:00  |
+---------------------------+------------------------+----------------+----------------------------+
# ---END_MOCK---

############################################
# Notes
# - Each section prints ONE command line, followed by a MOCK_RESPONSE table.
# - Replace us-east-1 with your region or export AWS_REGION.
# - Outputs are tables only (no JSON) to match your project convention.
############################################