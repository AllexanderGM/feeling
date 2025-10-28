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

resource "aws_route53_record" "acm_validation" {
  count = local.domain_enabled ? length(aws_acm_certificate.wildcard[0].domain_validation_options) : 0

  zone_id = local.route53_zone_id
  name    = aws_acm_certificate.wildcard[0].domain_validation_options[count.index].resource_record_name
  type    = aws_acm_certificate.wildcard[0].domain_validation_options[count.index].resource_record_type
  ttl     = 60
  records = [aws_acm_certificate.wildcard[0].domain_validation_options[count.index].resource_record_value]
}

resource "aws_acm_certificate_validation" "wildcard" {
  provider = aws.us_east_1
  count    = local.domain_enabled ? 1 : 0

  certificate_arn         = aws_acm_certificate.wildcard[0].arn
  validation_record_fqdns = [for record in aws_route53_record.acm_validation : record.fqdn]
}
