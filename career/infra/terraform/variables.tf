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

variable "tags" {
  type    = map(string)
  default = {}
}
