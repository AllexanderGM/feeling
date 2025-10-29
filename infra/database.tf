module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.11.0"

  identifier = "${local.name_prefix}-db"

  engine               = "mysql"
  engine_version       = "8.0"
  family               = "mysql8.0"
  major_engine_version = "8.0"

  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_allocated_storage

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = var.db_port

  manage_master_user_password = false

  multi_az                   = false
  publicly_accessible        = false
  storage_encrypted          = true
  kms_key_id                 = length(trimspace(var.db_kms_key_arn)) > 0 ? var.db_kms_key_arn : null
  storage_type               = var.db_storage_type
  auto_minor_version_upgrade = true

  backup_retention_period = var.db_backup_retention
  backup_window           = "03:00-05:00"
  maintenance_window      = "Mon:00:00-Mon:03:00"

  deletion_protection   = var.db_deletion_protection
  skip_final_snapshot   = var.db_skip_final_snapshot
  copy_tags_to_snapshot = true

  create_db_subnet_group = true
  subnet_ids             = module.vpc.private_subnets

  vpc_security_group_ids = [aws_security_group.database.id]

  tags = merge(local.default_tags, {
    Name      = "${local.name_prefix}-db"
    Component = "database"
  })

  performance_insights_enabled          = var.db_enable_performance_insights
  performance_insights_retention_period = var.db_enable_performance_insights ? 7 : null
}
