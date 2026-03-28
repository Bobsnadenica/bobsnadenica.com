locals {
  name_prefix = "${var.project_name}-${var.environment}"
  common_tags = merge(var.tags, {
    Project     = var.project_name
    Environment = var.environment
  })
  normalized_frontend_origins = [
    for origin in var.frontend_origins : trimsuffix(origin, "/")
  ]
  default_oauth_urls = distinct(flatten([
    for origin in local.normalized_frontend_origins : [
      origin,
      "${origin}/career/index.html"
    ]
  ]))
  oauth_callback_urls   = length(var.frontend_oauth_callback_urls) > 0 ? var.frontend_oauth_callback_urls : local.default_oauth_urls
  oauth_logout_urls     = length(var.frontend_oauth_logout_urls) > 0 ? var.frontend_oauth_logout_urls : local.default_oauth_urls
  google_enabled        = nonsensitive(var.google_client_id != "" && var.google_client_secret != "")
  apple_enabled         = nonsensitive(var.apple_client_id != "" && var.apple_team_id != "" && var.apple_key_id != "" && var.apple_private_key != "")
  linkedin_provider_name = "LinkedInOIDC"
  linkedin_enabled      = nonsensitive(var.linkedin_client_id != "" && var.linkedin_client_secret != "")
  hosted_ui_enabled     = local.google_enabled || local.apple_enabled || local.linkedin_enabled
  cognito_domain_prefix = var.cognito_domain_prefix != "" ? var.cognito_domain_prefix : "${local.name_prefix}-${random_string.suffix.result}"
  supported_identity_providers = concat(
    ["COGNITO"],
    local.google_enabled ? ["Google"] : [],
    local.apple_enabled ? ["SignInWithApple"] : [],
    local.linkedin_enabled ? [local.linkedin_provider_name] : []
  )
  social_provider_labels = concat(
    local.google_enabled ? ["Google"] : [],
    local.apple_enabled ? ["Apple"] : [],
    local.linkedin_enabled ? ["LinkedIn"] : []
  )
}

resource "random_string" "suffix" {
  length  = 6
  lower   = true
  upper   = false
  numeric = true
  special = false
}

resource "aws_cognito_user_pool" "main" {
  name = "${local.name_prefix}-users"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true
  }

  schema {
    attribute_data_type = "String"
    name                = "name"
    required            = false
    mutable             = true
  }

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
  }

  lifecycle {
    # Cognito does not allow schema mutations after pool creation.
    # Ignore provider drift here so later applies can update the rest
    # of the stack without forcing an invalid schema update attempt.
    ignore_changes = [schema]
  }

  tags = local.common_tags
}

resource "aws_cognito_user_pool_client" "frontend" {
  name         = "${local.name_prefix}-frontend"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret                      = false
  prevent_user_existence_errors        = "ENABLED"
  allowed_oauth_flows_user_pool_client = local.hosted_ui_enabled
  allowed_oauth_flows                  = local.hosted_ui_enabled ? ["code"] : []
  allowed_oauth_scopes                 = local.hosted_ui_enabled ? ["email", "openid", "profile"] : []
  callback_urls                        = local.hosted_ui_enabled ? local.oauth_callback_urls : []
  logout_urls                          = local.hosted_ui_enabled ? local.oauth_logout_urls : []
  supported_identity_providers         = local.supported_identity_providers

  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  depends_on = [
    aws_cognito_identity_provider.google,
    aws_cognito_identity_provider.apple,
    aws_cognito_identity_provider.linkedin
  ]
}

resource "aws_cognito_user_pool_domain" "frontend" {
  count = local.hosted_ui_enabled ? 1 : 0

  domain       = local.cognito_domain_prefix
  user_pool_id = aws_cognito_user_pool.main.id
}

resource "aws_cognito_identity_provider" "google" {
  count = local.google_enabled ? 1 : 0

  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "email openid profile"
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
  }

  attribute_mapping = {
    email   = "email"
    name    = "name"
    picture = "picture"
  }
}

resource "aws_cognito_identity_provider" "apple" {
  count = local.apple_enabled ? 1 : 0

  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "SignInWithApple"
  provider_type = "SignInWithApple"

  provider_details = {
    authorize_scopes = "email name"
    client_id        = var.apple_client_id
    team_id          = var.apple_team_id
    key_id           = var.apple_key_id
    private_key      = var.apple_private_key
  }

  attribute_mapping = {
    email = "email"
    name  = "name"
  }
}

resource "aws_cognito_identity_provider" "linkedin" {
  count = local.linkedin_enabled ? 1 : 0

  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = local.linkedin_provider_name
  provider_type = "OIDC"

  provider_details = {
    attributes_request_method = "GET"
    attributes_url            = "https://api.linkedin.com/v2/userinfo"
    authorize_scopes          = "openid profile email"
    authorize_url             = "https://www.linkedin.com/oauth/v2/authorization"
    client_id                 = var.linkedin_client_id
    client_secret             = var.linkedin_client_secret
    jwks_uri                  = "https://www.linkedin.com/oauth/openid/jwks"
    oidc_issuer               = "https://www.linkedin.com"
    token_url                 = "https://www.linkedin.com/oauth/v2/accessToken"
  }

  attribute_mapping = {
    email   = "email"
    name    = "name"
    picture = "picture"
  }
}

resource "aws_s3_bucket" "cv_documents" {
  bucket = "${local.name_prefix}-cv-${random_string.suffix.result}"
  tags   = local.common_tags
}

resource "aws_s3_bucket_public_access_block" "cv_documents" {
  bucket                  = aws_s3_bucket.cv_documents.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cv_documents" {
  bucket = aws_s3_bucket.cv_documents.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "cv_documents" {
  bucket = aws_s3_bucket.cv_documents.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET", "HEAD"]
    allowed_origins = var.frontend_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_dynamodb_table" "users" {
  name         = "${local.name_prefix}-users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  tags = local.common_tags
}

resource "aws_dynamodb_table" "consultants" {
  name         = "${local.name_prefix}-consultants"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "consultantId"

  attribute {
    name = "consultantId"
    type = "S"
  }

  attribute {
    name = "slug"
    type = "S"
  }

  attribute {
    name = "ownerUserId"
    type = "S"
  }

  global_secondary_index {
    name            = "slug-index"
    hash_key        = "slug"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "owner-index"
    hash_key        = "ownerUserId"
    projection_type = "ALL"
  }

  tags = local.common_tags
}

resource "aws_dynamodb_table" "bookings" {
  name         = "${local.name_prefix}-bookings"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "bookingId"

  attribute {
    name = "bookingId"
    type = "S"
  }

  attribute {
    name = "clientId"
    type = "S"
  }

  attribute {
    name = "consultantId"
    type = "S"
  }

  global_secondary_index {
    name            = "client-index"
    hash_key        = "clientId"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "consultant-index"
    hash_key        = "consultantId"
    projection_type = "ALL"
  }

  tags = local.common_tags
}

resource "aws_iam_role" "lambda" {
  name = "${local.name_prefix}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "lambda" {
  name = "${local.name_prefix}-lambda-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          aws_dynamodb_table.consultants.arn,
          aws_dynamodb_table.bookings.arn,
          "${aws_dynamodb_table.consultants.arn}/index/*",
          "${aws_dynamodb_table.bookings.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.cv_documents.arn}/*"
      }
    ]
  })
}

data "archive_file" "api" {
  type        = "zip"
  source_dir  = "${path.module}/../../backend/api"
  output_path = "${path.module}/.terraform-build/careerdoc-api.zip"
}

resource "aws_lambda_function" "api" {
  function_name    = "${local.name_prefix}-api"
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = data.archive_file.api.output_path
  source_code_hash = data.archive_file.api.output_base64sha256
  architectures    = ["arm64"]
  timeout          = 15
  reserved_concurrent_executions = var.lambda_reserved_concurrency

  environment {
    variables = {
      USERS_TABLE     = aws_dynamodb_table.users.name
      CONSULTANTS_TABLE = aws_dynamodb_table.consultants.name
      BOOKINGS_TABLE  = aws_dynamodb_table.bookings.name
      CV_BUCKET       = aws_s3_bucket.cv_documents.bucket
      ALLOWED_ORIGIN  = element(var.frontend_origins, 0)
    }
  }

  tags = local.common_tags
}

resource "aws_apigatewayv2_api" "http" {
  name          = "${local.name_prefix}-http-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_credentials = false
    allow_headers     = ["authorization", "content-type"]
    allow_methods     = ["GET", "POST", "PUT", "OPTIONS"]
    allow_origins     = var.frontend_origins
    max_age           = 3600
  }

  tags = local.common_tags
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id          = aws_apigatewayv2_api.http.id
  name            = "${local.name_prefix}-jwt"
  authorizer_type = "JWT"
  identity_sources = [
    "$request.header.Authorization"
  ]

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.frontend.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
  }
}

resource "aws_apigatewayv2_route" "health" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /health"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "consultants_list" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /consultants"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "consultants_slug" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /consultants/{slug}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "consultants_me_get" {
  api_id             = aws_apigatewayv2_api.http.id
  route_key          = "GET /consultants/me"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "consultants_me_put" {
  api_id             = aws_apigatewayv2_api.http.id
  route_key          = "PUT /consultants/me"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "bootstrap" {
  api_id             = aws_apigatewayv2_api.http.id
  route_key          = "POST /auth/bootstrap"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "me_profile_get" {
  api_id             = aws_apigatewayv2_api.http.id
  route_key          = "GET /me/profile"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "me_profile_put" {
  api_id             = aws_apigatewayv2_api.http.id
  route_key          = "PUT /me/profile"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "upload_url" {
  api_id             = aws_apigatewayv2_api.http.id
  route_key          = "POST /me/cv/upload-url"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "bookings_get" {
  api_id             = aws_apigatewayv2_api.http.id
  route_key          = "GET /bookings"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "bookings_post" {
  api_id             = aws_apigatewayv2_api.http.id
  route_key          = "POST /bookings"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  authorization_type = "JWT"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = var.api_throttle_burst_limit
    throttling_rate_limit  = var.api_throttle_rate_limit
  }

  tags = local.common_tags
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}
