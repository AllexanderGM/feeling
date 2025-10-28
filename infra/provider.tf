provider "aws" {
  region     = var.region
  profile    = length(trimspace(coalesce(var.aws_profile, ""))) > 0 ? var.aws_profile : null
  access_key = length(trimspace(coalesce(var.aws_access_key, ""))) > 0 ? var.aws_access_key : null
  secret_key = length(trimspace(coalesce(var.aws_secret_key, ""))) > 0 ? var.aws_secret_key : null
  token      = length(trimspace(coalesce(var.aws_session_token, ""))) > 0 ? var.aws_session_token : null

  default_tags {
    tags = merge(local.default_tags, var.extra_tags)
  }
}

# ACM para CloudFront debe residir en us-east-1
provider "aws" {
  alias      = "us_east_1"
  region     = "us-east-1"
  profile    = length(trimspace(coalesce(var.aws_profile, ""))) > 0 ? var.aws_profile : null
  access_key = length(trimspace(coalesce(var.aws_access_key, ""))) > 0 ? var.aws_access_key : null
  secret_key = length(trimspace(coalesce(var.aws_secret_key, ""))) > 0 ? var.aws_secret_key : null
  token      = length(trimspace(coalesce(var.aws_session_token, ""))) > 0 ? var.aws_session_token : null

  default_tags {
    tags = merge(local.default_tags, var.extra_tags)
  }
}
