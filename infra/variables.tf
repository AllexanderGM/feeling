# 🔹 Variable global para prefijo

variable "prefix" {
  description = "Prefijo para los recursos de AWS"
  type        = string
  default     = "DH_G2_final"
}

# 🔹 Variables para la conexión con AWS
variable "aws_access_key" {
  description = "Clave de acceso de AWS"
  type        = string
  sensitive   = true
}

variable "aws_secret_key" {
  description = "Clave secreta de AWS"
  type        = string
  sensitive   = true
}

# 🔹 Variables para la región y zona de disponibilidad
variable "region" {
  description = "Región de AWS"
  type        = string
  default     = "us-east-1"
}

variable "availability_zone" {
  description = "Zones de disponibilidad de AWS"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"] # Ahora con dos zonas de disponibilidad
}

variable "public_subnet_cidrs" {
  description = "CIDR Blocks para las subredes públicas"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.3.0/24"] # Subredes públicas en dos zonas
}

variable "private_subnet_cidrs" {
  description = "CIDR Blocks para las subredes privadas"
  type        = list(string)
  default     = ["10.0.2.0/24", "10.0.4.0/24"] # Subredes privadas en dos zonas
}

# 🔹 Variables para la base de datos
variable "db_name" {
  type        = string
  description = "Nombre de la base de datos"
}

variable "db_user" {
  description = "Usuario para la base de datos"
  type        = string
}

variable "db_password" {
  description = "Contraseña segura para la base de datos"
  type        = string
  sensitive   = true
}

variable "db_port" {
  description = "Puerto para la base de datos"
  type        = number
  default     = 3306
}

# 🔹 Variables para las llaves privadas y publicas
variable "key_name" {
  description = "Nombre del key pair para la instancia EC2"
  type        = string
}

resource "tls_private_key" "ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "generated" {
  key_name   = "${var.prefix}-ec2-key"
  public_key = tls_private_key.ssh_key.public_key_openssh
}
