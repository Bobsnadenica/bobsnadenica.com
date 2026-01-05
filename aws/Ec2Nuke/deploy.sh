#!/bin/bash
set -e

STACK_NAME=aws-test-root

aws cloudformation deploy \
  --stack-name $STACK_NAME \
  --template-file root.yaml \
  --capabilities CAPABILITY_NAMED_IAM
