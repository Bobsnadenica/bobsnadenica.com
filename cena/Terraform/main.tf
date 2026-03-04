terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-west-2" # Frankfurt is optimal for European edge routing
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# ==========================================
# 1. S3 BUCKET (STRICTLY PRIVATE)
# ==========================================

resource "aws_s3_bucket" "public_api_bucket" {
  bucket = "bg-price-json-api-${random_id.bucket_suffix.hex}"
}

# Block ALL public access to the bucket directly
resource "aws_s3_bucket_public_access_block" "api_bucket_access" {
  bucket                  = aws_s3_bucket.public_api_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CORS Configuration: Allows your website to fetch the JSON from CloudFront/S3
resource "aws_s3_bucket_cors_configuration" "api_cors" {
  bucket = aws_s3_bucket.public_api_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"] # In production, change to ["https://www.bobsnadenica.com"]
    max_age_seconds = 3600
  }
}

# ==========================================
# 2. CLOUDFRONT CDN
# ==========================================

# Modern Origin Access Control (OAC) to securely connect CF to S3
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "api-bucket-oac-${random_id.bucket_suffix.hex}"
  description                       = "OAC for Price Compare JSON API"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "api_cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  price_class         = "PriceClass_100" # Cheapest tier (Covers Europe/US)

  origin {
    domain_name              = aws_s3_bucket.public_api_bucket.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.public_api_bucket.bucket}"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${aws_s3_bucket.public_api_bucket.bucket}"

    # Use AWS Managed Policies for Caching and CORS
    cache_policy_id          = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf" # Managed-CORS-S3Origin

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# ==========================================
# 3. S3 BUCKET POLICY (Allow CloudFront)
# ==========================================

resource "aws_s3_bucket_policy" "api_bucket_policy" {
  bucket = aws_s3_bucket.public_api_bucket.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipalReadOnly"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.public_api_bucket.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.api_cdn.arn
          }
        }
      }
    ]
  })
}

# ==========================================
# 4. OUTPUTS
# ==========================================

output "s3_bucket_name" {
  value       = aws_s3_bucket.public_api_bucket.bucket
  description = "Upload your JSON files to this bucket."
}

output "cloudfront_api_url" {
  value       = "https://${aws_cloudfront_distribution.api_cdn.domain_name}"
  description = "Use this Base URL in your Next.js Frontend fetch calls!"
}