resource "aws_acm_certificate" "wildcard" {
  provider = aws.us_east_1
  count    = local.domain_enabled ? 1 : 0

  domain_name               = local._trimmed_domain
  subject_alternative_names = ["*.${local._trimmed_domain}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(local.default_tags, {
    Name = "${local._trimmed_domain}-wildcard"
  })
}

locals {
  acm_validation_domains = local.domain_enabled && length(local._trimmed_domain) > 0 ? [
    local._trimmed_domain,
    "*.${local._trimmed_domain}"
  ] : []
}

resource "aws_route53_record" "acm_validation" {
  count = length(local.acm_validation_domains)

  allow_overwrite = true
  zone_id = local.route53_zone_id
  name = element(
    concat(
      [for dvo in aws_acm_certificate.wildcard[0].domain_validation_options : dvo.resource_record_name if dvo.domain_name == local.acm_validation_domains[count.index]],
      [""]
    ),
    0
  )
  type = element(
    concat(
      [for dvo in aws_acm_certificate.wildcard[0].domain_validation_options : dvo.resource_record_type if dvo.domain_name == local.acm_validation_domains[count.index]],
      [""]
    ),
    0
  )
  ttl     = 60
  records = [
    element(
      concat(
        [for dvo in aws_acm_certificate.wildcard[0].domain_validation_options : dvo.resource_record_value if dvo.domain_name == local.acm_validation_domains[count.index]],
        [""]
      ),
      0
    )
  ]
}

resource "aws_acm_certificate_validation" "wildcard" {
  provider = aws.us_east_1
  count    = local.domain_enabled ? 1 : 0

  certificate_arn         = aws_acm_certificate.wildcard[0].arn
  validation_record_fqdns = [for record in aws_route53_record.acm_validation : record.fqdn]
}
