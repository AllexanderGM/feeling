module "vpc" {
  source             = "terraform-aws-modules/vpc/aws"
  version            = "5.19.0"
  name               = replace(lower("${var.prefix}-vpc"), "_", "-")
  cidr               = "10.0.0.0/16"
  azs                = var.availability_zone
  public_subnets     = var.public_subnet_cidrs
  private_subnets    = var.private_subnet_cidrs
  enable_nat_gateway = false # Mantenemos NAT Gateway desactivado

  # Configuración adicional para permitir que instancias en subredes públicas accedan a internet
  enable_dns_hostnames = true
  enable_dns_support   = true

  # Tags para las subredes públicas para auto-asignar IPs públicas
  public_subnet_tags = {
    Name = "${replace(lower(var.prefix), "_", "-")}-public-subnet"
  }

  tags = {
    Name         = replace(lower("${var.prefix}-vpc"), "_", "-")
    Project      = replace(lower(var.prefix), "_", "-")
    Environment  = "Production"
    ManagedBy    = "Terraform"
    ResourceType = "VPC"
  }
}

module "security_groups" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "5.3.0"
  name    = replace(lower("${var.prefix}-sg"), "_", "-")
  vpc_id  = module.vpc.vpc_id

  tags = {
    Name         = replace(lower("${var.prefix}-sg"), "_", "-")
    Project      = replace(lower(var.prefix), "_", "-")
    Environment  = "Production"
    ManagedBy    = "Terraform"
    ResourceType = "Security Group"
  }

  # Reglas de ingreso más seguras
  ingress_with_cidr_blocks = [
    {
      from_port   = 8080
      to_port     = 8080
      protocol    = "tcp"
      description = "Backend port"
      cidr_blocks = "0.0.0.0/0" # Acceso público a la API
    },
    {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      description = "SSH access"
      cidr_blocks = "0.0.0.0/0" # Considera restringir esto a tu IP en producción
    },
    {
      from_port   = 3306
      to_port     = 3306
      protocol    = "tcp"
      description = "MySQL access from backend"
      cidr_blocks = join(",", concat(var.public_subnet_cidrs, var.private_subnet_cidrs)) # Permitir acceso desde subredes públicas y privadas
    }
  ]

  egress_with_cidr_blocks = [
    {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      description = "Allow all outbound traffic"
      cidr_blocks = "0.0.0.0/0"
    }
  ]
}

# Security group para la instancia EC2
resource "aws_security_group" "ec2_sg" {
  name        = "${replace(lower(var.prefix), "_", "-")}-ec2-sg"
  description = "Security group for EC2 instance"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Backend port"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "${replace(lower(var.prefix), "_", "-")}-ec2-sg"
    Project     = replace(lower(var.prefix), "_", "-")
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

# Security group para MySQL
resource "aws_security_group" "rds_sg" {
  name        = "${replace(lower(var.prefix), "_", "-")}-rds-sg"
  description = "Security group for RDS instance"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = var.public_subnet_cidrs # Permite tráfico desde tus subredes públicas
    description = "MySQL access from backend"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "${replace(lower(var.prefix), "_", "-")}-rds-sg"
    Project     = replace(lower(var.prefix), "_", "-")
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}