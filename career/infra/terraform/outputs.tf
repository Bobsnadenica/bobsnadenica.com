output "api_base_url" {
  value = aws_apigatewayv2_api.http.api_endpoint
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.frontend.id
}

output "cv_bucket_name" {
  value = aws_s3_bucket.cv_documents.bucket
}

output "frontend_env_snippet" {
  value = <<-EOT
VITE_APP_NAME=CareerDoc
VITE_AWS_REGION=${var.aws_region}
VITE_API_BASE_URL=${aws_apigatewayv2_api.http.api_endpoint}
VITE_COGNITO_USER_POOL_ID=${aws_cognito_user_pool.main.id}
VITE_COGNITO_USER_POOL_CLIENT_ID=${aws_cognito_user_pool_client.frontend.id}
VITE_BASE_PATH=/career/
EOT
}
