# Describe EC2 instances (mock)
aws ec2 describe-instances --region us-east-1

# ---MOCK_RESPONSE---
# {
#   "Reservations": [
#     {
#       "Instances": [
#         {
#           "InstanceId": "i-0abcd1234ef56789",
#           "State": { "Name": "running" },
#           "InstanceType": "t3.micro",
#           "Region": "us-east-1"
#         }
#       ]
#     }
#   ]
# }
# ---END_MOCK---