locals {
  _trimmed_domain = trimspace(var.domain_name)
  route53_zone_id = local.domain_enabled ? (
    var.hosted_zone_id != null ? var.hosted_zone_id :
    var.create_hosted_zone ?
    aws_route53_zone.primary[0].zone_id :
    data.aws_route53_zone.primary[0].zone_id
  ) : null
}

resource "aws_route53_zone" "primary" {
  count = local.domain_enabled && var.create_hosted_zone ? 1 : 0
  name  = local._trimmed_domain

  tags = merge(local.default_tags, {
    Name = local._trimmed_domain
  })
}

data "aws_route53_zone" "primary" {
  count = local.domain_enabled && !var.create_hosted_zone && var.hosted_zone_id == null ? 1 : 0

  name         = "${local._trimmed_domain}."
  private_zone = false
}

resource "aws_route53_record" "api" {
  count = local.domain_enabled ? 1 : 0

  zone_id = local.route53_zone_id
  name    = "${var.api_subdomain}.${local._trimmed_domain}"
  type    = "A"
  ttl     = 60
  records = [
    length(aws_eip.backend) > 0 ? aws_eip.backend[0].public_ip : module.backend_instance.public_ip
  ]
}

resource "aws_route53_record" "frontend_cname" {
  count = local.domain_enabled && !var.enable_cloudfront && local.frontend_bucket_public_access ? 1 : 0

  zone_id = local.route53_zone_id
  name    = "${var.app_subdomain}.${local._trimmed_domain}"
  type    = "CNAME"
  ttl     = 300
  records = [module.frontend_bucket.s3_bucket_website_endpoint]
}

resource "aws_route53_record" "frontend_cloudfront" {
  count = local.domain_enabled && var.enable_cloudfront ? 1 : 0

  zone_id = local.route53_zone_id
  name    = "${var.app_subdomain}.${local._trimmed_domain}"

  type = "A"
  alias {
    name                   = aws_cloudfront_distribution.frontend[0].domain_name
    zone_id                = aws_cloudfront_distribution.frontend[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "wordpress" {
  count = local.domain_enabled && var.lightsail_wordpress_ip != null && trimspace(var.lightsail_wordpress_ip) != "" ? 1 : 0

  zone_id = local.route53_zone_id
  name    = "${var.wordpress_subdomain}.${local._trimmed_domain}"
  type    = "A"
  ttl     = 300
  records = [trimspace(var.lightsail_wordpress_ip)]
}
