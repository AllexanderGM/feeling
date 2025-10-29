output "backend_public_ip" {
  description = "IP pública (Elastic IP si se habilitó)."
  value       = length(aws_eip.backend) > 0 ? aws_eip.backend[0].public_ip : module.backend_instance.public_ip
}

output "backend_private_ip" {
  description = "IP privada dentro de la VPC para consumo interno."
  value       = module.backend_instance.private_ip
}

output "backend_instance_id" {
  description = "ID de la instancia EC2 que ejecuta el backend."
  value       = module.backend_instance.id
}

output "backend_security_group_id" {
  description = "Security Group asociado al backend."
  value       = aws_security_group.backend.id
}

output "db_endpoint" {
  description = "Endpoint del clúster RDS MySQL."
  value       = module.rds.db_instance_endpoint
}

output "db_instance_id" {
  description = "Identificador de la instancia RDS."
  value       = module.rds.db_instance_identifier
}

output "db_username" {
  description = "Usuario administrador configurado en RDS."
  value       = module.rds.db_instance_username
  sensitive   = true
}

output "frontend_bucket_name" {
  description = "Nombre del bucket S3 que hospeda el frontend."
  value       = module.frontend_bucket.s3_bucket_id
}

output "frontend_website_endpoint" {
  description = "Endpoint público del sitio estático en S3."
  value       = module.frontend_bucket.s3_bucket_website_endpoint
}

output "assets_bucket_name" {
  description = "Nombre del bucket S3 para archivos de usuarios."
  value       = module.assets_bucket.s3_bucket_id
}

output "assets_bucket_url" {
  description = "URL base del bucket de assets."
  value       = "https://${module.assets_bucket.s3_bucket_bucket_domain_name}"
}

output "cloudfront_domain_name" {
  description = "Dominio asignado al CloudFront del frontend."
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.frontend[0].domain_name : null
}

output "api_fqdn" {
  description = "FQDN de la API cuando se usa dominio personalizado."
  value       = local.domain_enabled ? aws_route53_record.api[0].fqdn : null
}

output "app_fqdn" {
  description = "FQDN del frontend cuando se usa dominio personalizado."
  value = local.domain_enabled ? (
    var.enable_cloudfront ? aws_route53_record.frontend_cloudfront[0].fqdn :
    aws_route53_record.frontend_cname[0].fqdn
  ) : null
}

output "wordpress_fqdn" {
  description = "FQDN del sitio WordPress en Lightsail (si se definió)."
  value       = local.domain_enabled && length(aws_route53_record.wordpress) > 0 ? aws_route53_record.wordpress[0].fqdn : null
}

output "route53_zone_id" {
  description = "ID de la zona hospedada usada para el dominio."
  value       = local.domain_enabled ? local.route53_zone_id : null
}

output "backend_private_key_path" {
  description = "Ruta del archivo PEM generado para acceder a la instancia."
  value       = local_file.backend_private_key.filename
  sensitive   = true
}
