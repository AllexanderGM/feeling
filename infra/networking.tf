module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.19.0"

  name = "${local.name_prefix}-vpc"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  public_subnets  = var.public_subnet_cidrs
  private_subnets = var.private_subnet_cidrs

  enable_nat_gateway = false
  single_nat_gateway = false

  map_public_ip_on_launch = true

  enable_dns_hostnames = true
  enable_dns_support   = true

  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
    Name                     = "${local.name_prefix}-public"
  }

  private_subnet_tags = {
    Name = "${local.name_prefix}-private"
  }

  tags = merge(local.default_tags, {
    Name        = "${local.name_prefix}-vpc"
    Environment = lower(var.environment)
  })
}

resource "aws_security_group" "backend" {
  name        = "${local.name_prefix}-backend-sg"
  description = "Acceso al backend Spring Boot"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Salida a Internet"
  }

  tags = merge(local.default_tags, {
    Name = "${local.name_prefix}-backend-sg"
  })
}

resource "aws_security_group_rule" "backend_ssh" {
  description = "SSH"
  type        = "ingress"
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"

  security_group_id = aws_security_group.backend.id
  cidr_blocks       = length(var.allowed_ssh_cidrs) > 0 ? var.allowed_ssh_cidrs : ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "backend_http" {
  description       = "API HTTP access"
  type              = "ingress"
  from_port         = local.backend_port
  to_port           = local.backend_port
  protocol          = "tcp"
  security_group_id = aws_security_group.backend.id
  cidr_blocks       = length(var.backend_http_cidrs) > 0 ? var.backend_http_cidrs : ["0.0.0.0/0"]
}

resource "aws_security_group" "database" {
  name        = "${local.name_prefix}-db-sg"
  description = "Acceso a MySQL desde backend"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Salida"
  }

  tags = merge(local.default_tags, {
    Name = "${local.name_prefix}-db-sg"
  })
}

resource "aws_security_group_rule" "db_from_backend" {
  type                     = "ingress"
  description              = "MySQL desde backend"
  from_port                = var.db_port
  to_port                  = var.db_port
  protocol                 = "tcp"
  security_group_id        = aws_security_group.database.id
  source_security_group_id = aws_security_group.backend.id
}
