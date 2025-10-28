locals {
  frontend_bucket_is_public = var.allow_public_frontend_bucket && !var.enable_cloudfront
}

module "frontend_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "4.6.0"

  bucket = local.frontend_bucket_name

  force_destroy = var.frontend_bucket_force_destroy

  acl = local.frontend_bucket_is_public ? "public-read" : "private"

  block_public_acls       = !local.frontend_bucket_is_public
  block_public_policy     = !local.frontend_bucket_is_public
  ignore_public_acls      = !local.frontend_bucket_is_public
  restrict_public_buckets = !local.frontend_bucket_is_public

  control_object_ownership = true
  object_ownership         = "BucketOwnerPreferred"

  website = local.frontend_bucket_is_public ? {
    index_document = "index.html"
    error_document = "index.html"
  } : null

  attach_policy = local.frontend_bucket_is_public
  policy = local.frontend_bucket_is_public ? jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = ["s3:GetObject"]
        Resource  = "arn:aws:s3:::${local.frontend_bucket_name}/*"
      }
    ]
  }) : null

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  versioning = {
    enabled = false
  }

  tags = merge(local.default_tags, {
    Name      = local.frontend_bucket_name
    Component = "frontend"
  })
}

module "assets_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "4.6.0"

  bucket = local.assets_bucket_name

  force_destroy = var.assets_bucket_force_destroy

  acl = "private"

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  control_object_ownership = true
  object_ownership         = "BucketOwnerPreferred"

  attach_policy = false

  lifecycle_rule = [
    {
      id      = "cleanup-incomplete-uploads"
      enabled = true
      abort_incomplete_multipart_upload = {
        days_after_initiation = 7
      }
    }
  ]

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  versioning = {
    enabled = false
  }

  tags = merge(local.default_tags, {
    Name      = local.assets_bucket_name
    Component = "assets"
  })
}

module "logs_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "4.6.0"

  count = var.enable_access_logs_bucket ? 1 : 0

  bucket = local.logs_bucket_name

  force_destroy = true

  acl = "private"

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  control_object_ownership = true
  object_ownership         = "BucketOwnerPreferred"

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  versioning = {
    enabled = true
  }

  tags = merge(local.default_tags, {
    Name      = local.logs_bucket_name
    Component = "logs"
  })
}

data "aws_iam_policy_document" "frontend_cloudfront" {
  count = var.enable_cloudfront ? 1 : 0

  statement {
    sid    = "AllowCloudFrontServicePrincipalRead"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
      "s3:GetObject",
      "s3:ListBucket"
    ]

    resources = [
      module.frontend_bucket.s3_bucket_arn,
      "${module.frontend_bucket.s3_bucket_arn}/*"
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.frontend[0].arn]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  count  = var.enable_cloudfront ? 1 : 0
  bucket = module.frontend_bucket.s3_bucket_id
  policy = data.aws_iam_policy_document.frontend_cloudfront[0].json

  depends_on = [aws_cloudfront_distribution.frontend]
}
