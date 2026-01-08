#!/bin/bash
rm -f lambda.zip
terraform destroy -auto-approve
rm -f terraform.tfstate
rm -f terraform.tfstate.backup
rm -f .terraform.lock.hcl
rm -rf .terraform
echo "Done."