terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = "eu-west-2"
}

# ==========================================
# 1. STORAGE & DATABASES
# ==========================================

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "grocery_csv_bucket" {
  bucket = "bg-price-compare-csv-ingest-${random_id.bucket_suffix.hex}"
}

resource "aws_dynamodb_table" "price_tracker" {
  name         = "PriceTracker"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }
  attribute {
    name = "SK"
    type = "S"
  }

  ttl {
    attribute_name = "ExpirationDate"
    enabled        = true
  }
}

resource "aws_dynamodb_table" "product_dictionary" {
  name         = "ProductDictionary"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "RawName"

  attribute {
    name = "RawName"
    type = "S"
  }
}

# ==========================================
# 2. QUEUES & DECOUPLING
# ==========================================

resource "aws_sqs_queue" "geocoding_queue" {
  name                       = "nominatim-geocoding-queue"
  visibility_timeout_seconds = 60 # Matches geocoder lambda timeout
}

# ==========================================
# 3. IAM ROLES & POLICIES
# ==========================================

# Base Assume Role Policy for all Lambdas
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# --- Role: Ingestion Lambda ---
resource "aws_iam_role" "ingest_role" {
  name               = "IngestLambdaRole"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "ingest_basic_execution" {
  role       = aws_iam_role.ingest_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "ingest_permissions" {
  name = "IngestLambdaPermissions"
  role = aws_iam_role.ingest_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["s3:GetObject"]
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.grocery_csv_bucket.arn}/*"
      },
      {
        Action   = ["dynamodb:PutItem", "dynamodb:BatchWriteItem", "dynamodb:GetItem"]
        Effect   = "Allow"
        Resource = [aws_dynamodb_table.price_tracker.arn, aws_dynamodb_table.product_dictionary.arn]
      },
      {
        Action   = ["sqs:SendMessage"]
        Effect   = "Allow"
        Resource = aws_sqs_queue.geocoding_queue.arn
      },
      {
        Action   = ["bedrock:InvokeModel"]
        Effect   = "Allow"
        Resource = "*" # Restrict to specific Claude/Nova ARN in production
      }
    ]
  })
}

# --- Role: Geocoding Lambda ---
resource "aws_iam_role" "geocode_role" {
  name               = "GeocodeLambdaRole"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "geocode_basic_execution" {
  role       = aws_iam_role.geocode_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "geocode_permissions" {
  name = "GeocodeLambdaPermissions"
  role = aws_iam_role.geocode_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
        Effect   = "Allow"
        Resource = aws_sqs_queue.geocoding_queue.arn
      },
      {
        Action   = ["dynamodb:UpdateItem", "dynamodb:PutItem"]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.price_tracker.arn
      }
    ]
  })
}

# --- Role: API Engine Lambda ---
resource "aws_iam_role" "api_role" {
  name               = "ApiLambdaRole"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "api_basic_execution" {
  role       = aws_iam_role.api_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "api_permissions" {
  name = "ApiLambdaPermissions"
  role = aws_iam_role.api_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["dynamodb:Query", "dynamodb:GetItem"]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.price_tracker.arn
      }
    ]
  })
}

# ==========================================
# 4. LAMBDA FUNCTIONS & PACKAGING
# ==========================================

# Zip files locally
data "archive_file" "ingest_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src/ingest"
  output_path = "${path.module}/dist/ingest.zip"
}

data "archive_file" "geocode_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src/geocode"
  output_path = "${path.module}/dist/geocode.zip"
}

data "archive_file" "api_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src/api"
  output_path = "${path.module}/dist/api.zip"
}

# Ingestion Lambda
resource "aws_lambda_function" "csv_ingestion" {
  function_name    = "IngestGroceryCSV"
  role             = aws_iam_role.ingest_role.arn
  handler          = "ingest.handler"
  runtime          = "python3.11"
  timeout          = 300
  filename         = data.archive_file.ingest_zip.output_path
  source_code_hash = data.archive_file.ingest_zip.output_base64sha256

  environment {
    variables = {
      PRICE_TABLE = aws_dynamodb_table.price_tracker.name
      DICT_TABLE  = aws_dynamodb_table.product_dictionary.name
      SQS_URL     = aws_sqs_queue.geocoding_queue.id
    }
  }
}

# Geocoding Lambda (Concurrency = 1 for Nominatim)
resource "aws_lambda_function" "geocoder" {
  function_name                  = "NominatimGeocoder"
  role                           = aws_iam_role.geocode_role.arn
  handler                        = "geocode.handler"
  runtime                        = "python3.11"
  timeout                        = 60
# reserved_concurrent_executions = 1
  filename                       = data.archive_file.geocode_zip.output_path
  source_code_hash               = data.archive_file.geocode_zip.output_base64sha256

  environment {
    variables = {
      PRICE_TABLE = aws_dynamodb_table.price_tracker.name
    }
  }
}

# API Engine Lambda
resource "aws_lambda_function" "price_engine_api" {
  function_name    = "PriceEngineAPI"
  role             = aws_iam_role.api_role.arn
  handler          = "engine.handler"
  runtime          = "nodejs20.x"
  timeout          = 29 # API Gateway limit is 29s
  filename         = data.archive_file.api_zip.output_path
  source_code_hash = data.archive_file.api_zip.output_base64sha256

  environment {
    variables = {
      PRICE_TABLE = aws_dynamodb_table.price_tracker.name
    }
  }
}

# ==========================================
# 5. TRIGGERS & EVENT MAPPINGS
# ==========================================

# S3 Trigger -> Ingestion Lambda
resource "aws_lambda_permission" "allow_s3" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.csv_ingestion.arn
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.grocery_csv_bucket.arn
}

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.grocery_csv_bucket.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.csv_ingestion.arn
    events              = ["s3:ObjectCreated:*"]
    filter_suffix       = ".csv"
  }
  depends_on = [aws_lambda_permission.allow_s3]
}

# SQS Trigger -> Geocoding Lambda
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = aws_sqs_queue.geocoding_queue.arn
  function_name    = aws_lambda_function.geocoder.arn
  batch_size       = 1 

  # ADD THIS BLOCK to throttle the SQS to Lambda invocations
  scaling_config {
    maximum_concurrency = 2 # 2 is the absolute minimum AWS allows here
  }
}

# ==========================================
# 6. API GATEWAY (HTTP API)
# ==========================================

resource "aws_apigatewayv2_api" "frontend_api" {
  name          = "PriceCompareHTTPAPI"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"] # Change to your GitHub Pages URL in production e.g., ["https://yourname.github.io"]
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["content-type"]
  }
}

resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.frontend_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "api_integration" {
  api_id                 = aws_apigatewayv2_api.frontend_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.price_engine_api.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "post_calculate" {
  api_id    = aws_apigatewayv2_api.frontend_api.id
  route_key = "POST /calculate"
  target    = "integrations/${aws_apigatewayv2_integration.api_integration.id}"
}

resource "aws_lambda_permission" "allow_apigateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.price_engine_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.frontend_api.execution_arn}/*/*"
}

# Output the URL for your Next.js Frontend
output "api_gateway_endpoint" {
  value       = "${aws_apigatewayv2_api.frontend_api.api_endpoint}/calculate"
  description = "The endpoint URL for your GitHub Pages Next.js frontend to call."
}