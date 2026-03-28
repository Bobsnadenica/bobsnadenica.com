# CareerLane

CareerLane is a full-stack career network for professionals and consultants, with a static GitHub Pages frontend and AWS-backed API, auth, storage, and infrastructure.

## What is included

- repository root
  - React + Vite static app suitable for GitHub Pages or any static host
  - public consultant discovery
  - consultant detail pages and booking flow
  - auth screens
  - dashboard for user profile, CV upload, bookings, and consultant profile editing

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

## Frontend setup

```bash
npm install
npm run dev
```

The frontend source lives in `src/`, and `npm run build` always regenerates the deployable `/career/index.html` plus the `/career/assets/` bundle for GitHub Pages.

`.env.production` is checked in with the current Terraform outputs you shared, so the production build already points at your live AWS resources.

If you want local AWS-backed development, copy `.env.example` to `.env` and fill in your values.
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
mkdir -p .terraform-build
terraform init
terraform apply
```

`terraform.tfvars` is now set for the current live site origin `https://www.bobsnadenica.com`, which updates API Gateway, Lambda CORS headers, and the S3 bucket CORS away from `http://localhost:5173`.

If Terraform returns a new API URL or Cognito IDs later, update `.env.production` with the new `frontend_env_snippet`.

## Suggested deploy flow

1. Run `cd infra/terraform && terraform apply` so the live frontend origin is allowed by the backend.
2. Run `npm run build` from `career/` to refresh the static files in this folder.
3. Commit and push the updated `career/` files to `main`.
4. GitHub Pages will then serve the built app at `/career/` from the main `bobsnadenica.com` repo.
