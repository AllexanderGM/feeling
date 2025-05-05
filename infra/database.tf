module "rds" {
  source     = "terraform-aws-modules/rds/aws"
  version    = "6.11.0"
  identifier = replace(lower("${var.prefix}-db"), "_", "-")

  engine                      = "mysql"
  engine_version              = "8.0" # Versión compatible con capa gratuita
  family                      = "mysql8.0"
  major_engine_version        = "8.0"
  instance_class              = "db.t3.micro" # Instancia elegible para capa gratuita
  manage_master_user_password = false         # Gestión manual de contraseñas
  db_name                     = var.db_name
  username                    = var.db_user
  password                    = var.db_password
  port                        = var.db_port
  allocated_storage           = 20 # 20GB es el límite para capa gratuita
  max_allocated_storage       = 20 # Limita el crecimiento automático para evitar cargos
  storage_type                = "gp2"
  publicly_accessible         = false # Mantener en subred privada por seguridad, pero asegurar acceso desde EC2
  storage_encrypted           = false # La encriptación no está disponible en la capa gratuita
  create_db_subnet_group      = true
  db_subnet_group_name        = replace(lower("${var.prefix}-subnet-group"), "_", "-")

  subnet_ids = [
    module.vpc.private_subnets[0],
    module.vpc.private_subnets[1]
  ]

  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  # Configuraciones para mantenerse dentro de la capa gratuita
  multi_az                = false # Multi-AZ genera costos adicionales
  backup_retention_period = 1     # Mínimo backup para tener punto de recuperación sin exceder la capa gratuita
  backup_window           = "03:00-06:00"
  maintenance_window      = "Mon:00:00-Mon:03:00"

  skip_final_snapshot = true
  deletion_protection = false # Facilita eliminación durante pruebas

  create_db_option_group    = true
  create_db_parameter_group = true

  option_group_name    = replace(lower("${var.prefix}-option-group"), "_", "-")
  parameter_group_name = replace(lower("${var.prefix}-parameter-group"), "_", "-")

  # Parámetros optimizados para t3.micro
  parameters = [
    {
      name  = "max_connections"
      value = "100"
    },
    {
      name  = "innodb_buffer_pool_size"
      value = "134217728" # 128MB - valor conservador para t3.micro
    },
    {
      name  = "performance_schema"
      value = "0" # Desactivar para ahorrar memoria
    }
  ]

  tags = {
    Name         = replace(lower("${var.prefix}-rds"), "_", "-")
    Project      = replace(lower(var.prefix), "_", "-")
    Environment  = "Production"
    ManagedBy    = "Terraform"
    ResourceType = "Database"
  }
}