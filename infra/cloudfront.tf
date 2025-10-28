locals {
  cloudfront_aliases      = local.domain_enabled ? ["${var.app_subdomain}.${local._trimmed_domain}"] : []
  logs_bucket_domain_name = var.enable_access_logs_bucket ? module.logs_bucket[0].s3_bucket_bucket_domain_name : null
}

resource "aws_cloudfront_origin_access_control" "frontend" {
  count = var.enable_cloudfront ? 1 : 0

  name                              = "${local.name_prefix}-frontend-oac"
  description                       = "Origin access control for ${local.name_prefix} frontend bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "frontend" {
  count = var.enable_cloudfront ? 1 : 0

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${local.name_prefix} frontend distribution"
  price_class         = var.cloudfront_price_class
  default_root_object = "index.html"

  aliases = local.domain_enabled ? local.cloudfront_aliases : []

  origin {
    domain_name              = module.frontend_bucket.s3_bucket_regional_domain_name
    origin_id                = "frontend-s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend[0].id

    s3_origin_config {
      origin_access_identity = ""
    }
  }

  default_cache_behavior {
    target_origin_id       = "frontend-s3-origin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]

    compress = true

    forwarded_values {
      query_string = true

      cookies {
        forward = "all"
      }
    }

    default_ttl = 3600
    max_ttl     = 86400
    min_ttl     = 0
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = local.domain_enabled ? false : true
    acm_certificate_arn            = local.domain_enabled ? aws_acm_certificate_validation.wildcard[0].certificate_arn : null
    ssl_support_method             = local.domain_enabled ? "sni-only" : null
    minimum_protocol_version       = local.domain_enabled ? "TLSv1.2_2021" : "TLSv1"
  }

  dynamic "logging_config" {
    for_each = local.logs_bucket_domain_name != null ? [local.logs_bucket_domain_name] : []

    content {
      bucket          = logging_config.value
      include_cookies = true
      prefix          = "cloudfront/"
    }
  }

  depends_on = [aws_acm_certificate_validation.wildcard]
  tags       = merge(local.default_tags, { Name = "${local.name_prefix}-frontend-cdn" })
}
