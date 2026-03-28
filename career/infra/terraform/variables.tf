variable "project_name" {
  type    = string
  default = "careerdoc"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "aws_region" {
  type    = string
  default = "eu-west-1"
}

variable "frontend_origins" {
  type    = list(string)
  default = ["http://localhost:5173"]
}

variable "frontend_oauth_callback_urls" {
  type    = list(string)
  default = []
}

variable "frontend_oauth_logout_urls" {
  type    = list(string)
  default = []
}

variable "cognito_domain_prefix" {
  type    = string
  default = ""
}

variable "google_client_id" {
  type    = string
  default = ""
}

variable "google_client_secret" {
  type      = string
  default   = ""
  sensitive = true
}

variable "apple_client_id" {
  type    = string
  default = ""
}

variable "apple_team_id" {
  type    = string
  default = ""
}

variable "apple_key_id" {
  type    = string
  default = ""
}

variable "apple_private_key" {
  type      = string
  default   = ""
  sensitive = true
}

variable "linkedin_client_id" {
  type    = string
  default = ""
}

variable "linkedin_client_secret" {
  type      = string
  default   = ""
  sensitive = true
}

variable "tags" {
  type    = map(string)
  default = {}
}
