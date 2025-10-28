terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
}

locals {
  project_slug = replace(lower(var.project_name), "/[^a-z0-9]+/", "-")
  env_slug     = replace(lower(var.environment), "/[^a-z0-9]+/", "-")

  name_prefix = join("-", compact([local.project_slug, local.env_slug]))

  default_tags = {
    Project     = var.project_name
    Environment = lower(var.environment)
    ManagedBy   = "Terraform"
    Repository  = "feeling-platform"
  }

  domain_enabled = var.use_domain && length(trimspace(var.domain_name)) > 0

  frontend_bucket_name = "${local.name_prefix}-frontend"
  assets_bucket_name   = "${local.name_prefix}-assets"
  logs_bucket_name     = "${local.name_prefix}-logs"

  backend_instance_name         = "${local.name_prefix}-backend"
  backend_port                  = var.backend_port
  frontend_bucket_public_access = var.allow_public_frontend_bucket && !var.enable_cloudfront
}
