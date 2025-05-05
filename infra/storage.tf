module "frontend_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "4.6.0"
  bucket  = "${lower(replace(var.prefix, "_", "-"))}-frontend"

  force_destroy = true # Permite eliminar el bucket incluso si no está vacío

  # Configuraciones de acceso público
  acl                     = "public-read" # Establecer ACL a public-read
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false

  control_object_ownership = true
  object_ownership         = "BucketOwnerPreferred"

  # Configuración de sitio web estático para SPA
  website = {
    index_document = "index.html"
    error_document = "index.html" # Redirigir errores a index.html para SPA
    # Se eliminó la parte de routing_rules que causaba el error
  }

  # Política para permitir acceso público de lectura a todos los objetos del bucket
  attach_policy = true
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "arn:aws:s3:::${lower(replace(var.prefix, "_", "-"))}-frontend/*"
      }
    ]
  })

  # Configuración básica de seguridad
  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  # Configuración de capa gratuita - evitar opciones costosas
  versioning = {
    enabled = false # No habilitar versionado para permanecer en capa gratuita
  }

  tags = {
    Name         = "${lower(replace(var.prefix, "_", "-"))}-frontend"
    Project      = replace(lower(var.prefix), "_", "-")
    Environment  = "Production"
    ManagedBy    = "Terraform"
    ResourceType = "S3 Bucket"
  }
}

module "images_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "4.6.0"
  bucket  = "${lower(replace(var.prefix, "_", "-"))}-images"

  force_destroy = true

  # Misma configuración que frontend_bucket
  acl                     = "public-read" # Establecer ACL a public-read
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false

  control_object_ownership = true
  object_ownership         = "BucketOwnerPreferred"

  # Política para permitir acceso público de lectura a todos los objetos del bucket
  attach_policy = true
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "arn:aws:s3:::${lower(replace(var.prefix, "_", "-"))}-images/*"
      }
    ]
  })

  # Configuración básica de seguridad
  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  # Configuración de capa gratuita - evitar opciones costosas
  versioning = {
    enabled = false # No habilitar versionado para permanecer en capa gratuita
  }

  # Regla simple de ciclo de vida para optimizar costos - Corregida
  lifecycle_rule = [
    {
      id      = "delete-old-files"
      enabled = true

      # Añadir un filtro válido
      filter = {
        prefix = "backups/" # Aplicar solo a la carpeta de backups
      }

      expiration = {
        days = 365 # Borrar archivos después de 1 año para mantener el tamaño bajo control
      }
    }
  ]

  tags = {
    Name         = "${lower(replace(var.prefix, "_", "-"))}-images"
    Project      = replace(lower(var.prefix), "_", "-")
    Environment  = "Production"
    ManagedBy    = "Terraform"
    ResourceType = "S3 Bucket"
  }
}