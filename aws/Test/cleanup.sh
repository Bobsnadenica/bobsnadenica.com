#!/bin/bash
set -e

STACK_NAME=aws-test-root

echo "Deleting stack: $STACK_NAME"
aws cloudformation delete-stack --stack-name $STACK_NAME

echo "Waiting for deletion..."
aws cloudformation wait stack-delete-complete --stack-name $STACK_NAME

echo "✅ Cleanup complete"
