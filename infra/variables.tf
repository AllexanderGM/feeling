variable "project_name" {
  description = "Nombre del proyecto, se usa como prefijo de recursos."
  type        = string
  default     = "feeling"
}

variable "environment" {
  description = "Entorno desplegado (test, staging, prod)."
  type        = string
  default     = "test"
}

variable "region" {
  description = "Región principal de AWS."
  type        = string
  default     = "us-east-1"
}

variable "availability_zones" {
  description = "Zonas de disponibilidad a utilizar. Si se deja vacío se intentará usar dos zonas por defecto."
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "vpc_cidr" {
  description = "CIDR de la VPC principal."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDRs para subredes públicas."
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDRs para subredes privadas."
  type        = list(string)
  default     = ["10.0.2.0/24", "10.0.4.0/24"]
}

variable "aws_profile" {
  description = "Perfil de AWS CLI a utilizar. Opcional si se proveen claves directas."
  type        = string
  default     = null
}

variable "aws_access_key" {
  description = "Clave de acceso de AWS para Terraform (opcional si el perfil/rol está configurado)."
  type        = string
  default     = null
  nullable    = true
  sensitive   = true
}

variable "aws_secret_key" {
  description = "Clave secreta de AWS para Terraform (opcional si el perfil/rol está configurado)."
  type        = string
  default     = null
  nullable    = true
  sensitive   = true
}

variable "aws_session_token" {
  description = "Token de sesión de AWS (para credenciales temporales)."
  type        = string
  default     = null
  nullable    = true
  sensitive   = true
}

variable "extra_tags" {
  description = "Tags adicionales a agregar a todos los recursos."
  type        = map(string)
  default     = {}
}

variable "use_domain" {
  description = "Indica si se deben crear recursos asociados a un dominio personalizado."
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Nombre del dominio raíz (ej: midominio.com)."
  type        = string
  default     = ""
}

variable "hosted_zone_id" {
  description = "ID de la hosted zone existente en Route53. Si no se define, Terraform intentará encontrarla por nombre."
  type        = string
  default     = null
}

variable "create_hosted_zone" {
  description = "Si es true y no existe zona hospedada, se creará automáticamente."
  type        = bool
  default     = false
}

variable "api_subdomain" {
  description = "Subdominio para la API (ej: api)."
  type        = string
  default     = "api"
}

variable "app_subdomain" {
  description = "Subdominio para el frontend (ej: app)."
  type        = string
  default     = "app"
}

variable "wordpress_subdomain" {
  description = "Subdominio para el sitio WordPress/Lightsail (ej: www)."
  type        = string
  default     = "www"
}

variable "cdn_subdomain" {
  description = "Subdominio opcional para CDN (ej: cdn)."
  type        = string
  default     = "cdn"
}

variable "lightsail_wordpress_ip" {
  description = "IP pública actual del sitio WordPress en Lightsail. Se usará para el registro DNS."
  type        = string
  default     = null
}

variable "enable_cloudfront" {
  description = "Si es true se crea un CloudFront para el frontend (recomendado cuando use_domain = true)."
  type        = bool
  default     = true
}

variable "cloudfront_price_class" {
  description = "Clase de precio para CloudFront."
  type        = string
  default     = "PriceClass_100"
}

variable "allow_public_frontend_bucket" {
  description = "Permite exponer directamente el bucket del frontend cuando CloudFront está deshabilitado."
  type        = bool
  default     = false

  validation {
    condition     = var.allow_public_frontend_bucket ? !var.enable_cloudfront : true
    error_message = "allow_public_frontend_bucket solo puede ser true cuando CloudFront está deshabilitado."
  }
}

variable "backend_instance_type" {
  description = "Tipo de instancia EC2 para el backend (t4g.micro reduce costo si tus imágenes soportan ARM64)."
  type        = string
  default     = "t3.micro"
}

variable "backend_ami" {
  description = "AMI a utilizar para la instancia EC2 del backend. Si se deja vacío se usa Amazon Linux 2023 ARM64 más reciente."
  type        = string
  default     = ""
}

variable "backend_port" {
  description = "Puerto de exposición del backend."
  type        = number
  default     = 8080
}

variable "backend_root_volume_size" {
  description = "Tamaño (GB) del volumen raíz de la instancia EC2."
  type        = number
  default     = 16
}

variable "backend_root_volume_type" {
  description = "Tipo de volumen EBS para la instancia EC2."
  type        = string
  default     = "gp3"
}

variable "allowed_ssh_cidrs" {
  description = "CIDRs permitidos para acceder por SSH a la instancia."
  type        = list(string)
  default     = []
}

variable "backend_http_cidrs" {
  description = "CIDRs autorizados para consumir la API directamente."
  type        = list(string)
  default     = []
}

variable "enable_backend_eip" {
  description = "Si es true se asigna una Elastic IP para mantener IP fija en la instancia."
  type        = bool
  default     = false
}

variable "db_name" {
  description = "Nombre de la base de datos MySQL."
  type        = string
}

variable "db_username" {
  description = "Usuario administrador de la base de datos."
  type        = string
}

variable "db_password" {
  description = "Contraseña del usuario administrador de la base de datos."
  type        = string
  sensitive   = true
}

variable "db_port" {
  description = "Puerto de la base de datos."
  type        = number
  default     = 3306
}

variable "db_instance_class" {
  description = "Clase de instancia RDS."
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Espacio inicial (GB) para la base de datos."
  type        = number
  default     = 20
}

variable "db_storage_type" {
  description = "Tipo de volumen para la base de datos (gp3 recomendado por costo)."
  type        = string
  default     = "gp3"
}

variable "db_backup_retention" {
  description = "Número de días de retención de backups automáticos."
  type        = number
  default     = 7
}

variable "db_deletion_protection" {
  description = "Activa la protección contra eliminación de la instancia RDS."
  type        = bool
  default     = true
}

variable "db_skip_final_snapshot" {
  description = "Omite la snapshot final al destruir la instancia (no recomendado en producción)."
  type        = bool
  default     = false
}

variable "db_enable_performance_insights" {
  description = "Habilitar Performance Insights para la instancia RDS."
  type        = bool
  default     = true
}

variable "db_kms_key_arn" {
  description = "ARN de la KMS Key para cifrar RDS. Si se deja vacío se usa la clave administrada por AWS."
  type        = string
  default     = ""
}

variable "frontend_bucket_force_destroy" {
  description = "Permite eliminar el bucket aunque tenga objetos (útil en entornos de prueba)."
  type        = bool
  default     = true
}

variable "assets_bucket_force_destroy" {
  description = "Permite eliminar el bucket de assets aunque tenga objetos."
  type        = bool
  default     = true
}

variable "enable_access_logs_bucket" {
  description = "Crear bucket dedicado para logs de acceso (CloudFront / S3)."
  type        = bool
  default     = false
}
