provider "aws" {
  region = "eu-west-1"
}

variable "app_name" {
  default = "bobs-shortener"
}

# 1. Database
resource "aws_dynamodb_table" "db" {
  name           = "${var.app_name}-db"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "shortId"
  attribute {
    name = "shortId"
    type = "S"
  }
}

# 2. Permissions
resource "aws_iam_role" "lambda_role" {
  name = "${var.app_name}-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.app_name}-policy"
  role = aws_iam_role.lambda_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Action = ["dynamodb:GetItem", "dynamodb:PutItem"], Effect = "Allow", Resource = aws_dynamodb_table.db.arn },
      { Action = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"], Effect = "Allow", Resource = "*" }
    ]
  })
}

# 3. Function
data "archive_file" "zip" {
  type        = "zip"
  source_file = "index.mjs"
  output_path = "lambda.zip"
}

resource "aws_lambda_function" "fn" {
  filename         = "lambda.zip"
  function_name    = "${var.app_name}-fn"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  source_code_hash = data.archive_file.zip.output_base64sha256
  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.db.name
      DOMAIN_URL = aws_apigatewayv2_stage.default.invoke_url
    }
  }
}

# 4. API Gateway (The Interface)
resource "aws_apigatewayv2_api" "api" {
  name          = "${var.app_name}-api"
  protocol_type = "HTTP"
  
  # CRITICAL: Allow your website to talk to AWS
  cors_configuration {
    allow_origins = ["*"] 
    allow_methods = ["POST", "GET", "OPTIONS"]
    allow_headers = ["content-type"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.fn.invoke_arn
}

resource "aws_apigatewayv2_route" "any" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_lambda_permission" "apigw" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.fn.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

# 5. Output
output "api_url" {
  value = aws_apigatewayv2_stage.default.invoke_url
  description = "COPY THIS URL into your index.html file"
}