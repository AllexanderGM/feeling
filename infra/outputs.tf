# 🔹 Output para ip de backend (usando IP elástica)
output "backend_instance_ip" {
  description = "IP pública de la instancia EC2"
  value       = aws_eip.backend_eip.public_ip
}

# 🔹 Output para obtener la URL de la base de datos
output "db_endpoint" {
  value = module.rds.db_instance_endpoint
}

# 🔹 Output para obtener la URL del frontend
output "frontend_url" {
  value = module.frontend_bucket.s3_bucket_website_endpoint
}

# 🔹 Output para obtener el nombre del bucket de imágenes
output "images_bucket_name" {
  value = module.images_bucket.s3_bucket_id
}

# 🔹 Output para obtener el nombre del bucket de frontend
output "frontend_bucket_name" {
  value = module.frontend_bucket.s3_bucket_id
}

# 🔹 Output para obtener la URL de las imágenes
output "frontend_bucket_arn" {
  value = module.frontend_bucket.s3_bucket_arn
}