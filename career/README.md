# CareerDoc

CareerDoc is a full-stack marketplace inspired by `superdoc.bg`, adapted for career consultants.

## What is included

- repository root
  - React + Vite static app suitable for GitHub Pages or any static host
  - public consultant discovery
  - consultant detail pages and booking flow
  - auth screens
  - dashboard for user profile, plan tier, CV upload, bookings, and consultant profile editing
  - mock mode when AWS env vars are missing, so the product remains usable locally

- `backend/api/`
  - Node.js Lambda API
  - Cognito-protected routes for profiles, consultant editing, bookings, and CV upload URLs
  - DynamoDB-backed users, consultants, and bookings
  - S3 presigned uploads for CV documents

- `infra/terraform/`
  - Cognito user pool + app client
  - HTTP API Gateway + Lambda
  - DynamoDB tables
  - S3 bucket for CV files

## Assumption for phase one

The product model supports `free` and `pro` users, but live card payments are not implemented in this first pass. The clean next step is Stripe integration on top of the existing plan model.

## Frontend setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` if you want the frontend to use AWS resources instead of mock mode.
For your target URL `https://www.bobsnadenica.com/career/index.html`, use:

```bash
VITE_BASE_PATH=/career/
VITE_AWS_REGION=eu-west-1
```

## Backend package setup

```bash
cd backend/api
npm install
```

The Lambda package is zipped by Terraform from this folder, including `node_modules`.

## Terraform setup

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
mkdir -p .terraform-build
terraform init
terraform apply
```

After apply, copy the `frontend_env_snippet` output into `.env` or `.env.production`.

## Suggested deploy flow

1. Deploy AWS infra with Terraform.
2. Add the Terraform output values to `.env.production`.
3. Add the same values as GitHub repository variables for the Pages workflow.
4. Build the frontend with `npm run build` or let GitHub Actions build it on push.
5. Publish `dist` to GitHub Pages or upload the built `dist` contents into the `/career/` folder of your existing website host.
