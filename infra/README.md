# Infraestructura - Feeling AWS + Terraform

## 📋 Índice

- [Arquitectura AWS](#arquitectura-aws)
- [Componentes](#componentes)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Despliegue](#despliegue)
- [Recursos Terraform](#recursos-terraform)
- [Seguridad](#seguridad)
- [Monitoreo](#monitoreo)
- [Costos](#costos)
- [Troubleshooting](#troubleshooting)

## 🏗️ Arquitectura AWS

La infraestructura está diseñada para ser escalable, segura y optimizada para la capa gratuita de AWS:

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└─────────────────┬───────────────────┬───────────────────────┘
                  │                   │
            ┌─────▼─────┐       ┌─────▼─────┐
            │CloudFront │       │    ALB    │
            │    CDN    │       │           │
            └─────┬─────┘       └─────┬─────┘
                  │                   │
            ┌─────▼─────┐       ┌─────▼─────┐
            │ S3 Bucket │       │    EC2    │
            │ Frontend  │       │  Backend  │
            └───────────┘       └─────┬─────┘
                                      │
                          ┌───────────┴───────────┐
                          │                       │
                    ┌─────▼─────┐           ┌─────▼─────┐
                    │    RDS    │           │ S3 Bucket │
                    │   MySQL   │           │  Images   │
                    └───────────┘           └───────────┘
```

## 🔧 Componentes

### Networking

- **VPC**: Red privada virtual aislada (10.0.0.0/16)
- **Subredes Públicas**: 2 subredes en diferentes AZs para alta disponibilidad
- **Subredes Privadas**: 2 subredes para RDS y servicios internos
- **Internet Gateway**: Conectividad a internet
- **Security Groups**: Firewalls a nivel de instancia

### Compute

- **EC2 t2.micro**: Instancia para backend Spring Boot
- **Auto Scaling Group**: Escalado automático (futuro)
- **Application Load Balancer**: Distribución de carga (futuro)

### Storage

- **S3 Frontend**: Hosting estático para React
- **S3 Images**: Almacenamiento de imágenes de usuarios
- **S3 Backups**: Respaldos automáticos

### Database

- **RDS MySQL 8.0**: Base de datos principal (db.t3.micro)
- **Multi-AZ**: Alta disponibilidad (producción)
- **Automated Backups**: Respaldos diarios

### CDN y Distribución

- **CloudFront**: CDN para frontend (opcional)
- **Route 53**: DNS y dominio personalizado (opcional)

## 📋 Requisitos

- **Terraform** >= 1.0
- **AWS CLI** configurado
- **Cuenta AWS** con permisos adecuados
- **Docker** (para builds)
- **Git**

## 💻 Instalación

### 1. Instalar Terraform

```bash
# macOS
brew install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.5.0/terraform_1.5.0_linux_amd64.zip
unzip terraform_1.5.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Verificar instalación
terraform version
```

### 2. Configurar AWS CLI

```bash
# Instalar AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configurar credenciales
aws configure
# AWS Access Key ID: [tu-access-key]
# AWS Secret Access Key: [tu-secret-key]
# Default region name: us-east-1
# Default output format: json
```

## ⚙️ Configuración

### Variables de Terraform

Crear archivo `terraform.tfvars`:

```hcl
# Configuración del proyecto
project_name = "feeling"
environment  = "production"
region       = "us-east-1"

# Configuración de red
vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]

# Configuración de instancias
instance_type = "t2.micro"
key_pair_name = "feeling-key"

# Configuración de base de datos
db_instance_class = "db.t3.micro"
db_name          = "feelingdb"
db_username      = "admin"
db_password      = "SuperSecurePassword123!"

# Configuración de dominio (opcional)
domain_name = "feeling.com"
```

### Estructura de archivos

```
infra/
├── main.tf              # Configuración principal
├── variables.tf         # Definición de variables
├── outputs.tf           # Outputs del stack
├── networking.tf        # VPC, subnets, security groups
├── compute.tf           # EC2, Auto Scaling
├── database.tf          # RDS MySQL
├── storage.tf           # S3 buckets
├── cdn.tf              # CloudFront (opcional)
├── monitoring.tf        # CloudWatch
└── terraform.tfvars     # Valores de variables
```

## 🚀 Despliegue

### Despliegue automático

```bash
# Usar script de despliegue
cd feeling
chmod +x deploy.sh
./deploy.sh
```

### Despliegue manual

```bash
# Inicializar Terraform
cd infra
terraform init

# Planificar cambios
terraform plan

# Aplicar cambios
terraform apply

# Ver outputs
terraform output
```

### Comandos útiles

```bash
# Validar configuración
terraform validate

# Formatear archivos
terraform fmt

# Ver estado actual
terraform show

# Destruir infraestructura
terraform destroy
```

## 📦 Recursos Terraform

### networking.tf

```hcl
# VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# Subnets públicas
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
}

# Security Groups
resource "aws_security_group" "backend" {
  name   = "${var.project_name}-backend-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 8081
    to_port     = 8081
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

### compute.tf

```hcl
# EC2 Instance
resource "aws_instance" "backend" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public[0].id

  vpc_security_group_ids = [aws_security_group.backend.id]
  key_name              = aws_key_pair.main.key_name

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    db_host     = aws_db_instance.main.endpoint
    db_name     = var.db_name
    db_username = var.db_username
    db_password = var.db_password
  }))

  tags = {
    Name = "${var.project_name}-backend"
  }
}

# Elastic IP
resource "aws_eip" "backend" {
  instance = aws_instance.backend.id
  domain   = "vpc"
}
```

### database.tf

```hcl
# RDS MySQL
resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-db"
  engine         = "mysql"
  engine_version = "8.0"

  instance_class        = var.db_instance_class
  allocated_storage     = 20
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.database.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true
  deletion_protection = false

  tags = {
    Name = "${var.project_name}-db"
  }
}
```

### storage.tf

```hcl
# S3 Bucket para Frontend
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_name}-frontend-${random_id.bucket_suffix.hex}"
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 Bucket para Imágenes
resource "aws_s3_bucket" "images" {
  bucket = "${var.project_name}-images-${random_id.bucket_suffix.hex}"
}

resource "aws_s3_bucket_cors_configuration" "images" {
  bucket = aws_s3_bucket.images.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
```

## 🔒 Seguridad

### Mejores prácticas implementadas

1. **VPC Aislada**: Red privada completamente separada
2. **Security Groups**: Principio de menor privilegio
3. **Subredes privadas**: Base de datos sin acceso directo
4. **Encriptación**: En tránsito (HTTPS) y en reposo (RDS, S3)
5. **IAM Roles**: Permisos específicos por servicio
6. **Secrets Manager**: Gestión segura de credenciales
7. **MFA**: Multi-factor authentication en cuenta AWS

### Security Groups

- **Backend SG**: Puerto 8081 (API) y 22 (SSH)
- **Database SG**: Puerto 3306 solo desde backend
- **Frontend SG**: Puerto 80/443 público

## 📊 Monitoreo

### CloudWatch

- **Métricas EC2**: CPU, memoria, disco
- **Métricas RDS**: Conexiones, IOPS, latencia
- **Logs**: Application logs centralizados
- **Alarmas**: Notificaciones por email/SMS

### Configuración de alertas

```hcl
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${var.project_name}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ec2 cpu utilization"
}
```

## 💰 Costos

### Estimación mensual (Free Tier)

- **EC2 t2.micro**: $0 (750 horas/mes gratis)
- **RDS db.t3.micro**: $0 (750 horas/mes gratis)
- **S3**: $0 (5GB gratis)
- **Data Transfer**: $0 (15GB gratis)
- **Total**: $0 (primer año)

### Optimización de costos

1. **Auto-stop**: Apagar instancias fuera de horario
2. **Reserved Instances**: Descuentos a largo plazo
3. **Spot Instances**: Para ambientes de desarrollo
4. **S3 Lifecycle**: Archivar objetos antiguos

## 🔧 Troubleshooting

### Problemas comunes

#### Error: "UnauthorizedOperation"

```bash
# Verificar permisos IAM
aws iam get-user
aws iam list-attached-user-policies --user-name tu-usuario
```

#### Error: "InvalidSubnetID.NotFound"

```bash
# Verificar VPC y subnets
aws ec2 describe-vpcs
aws ec2 describe-subnets
```

#### Base de datos no accesible

```bash
# Verificar security groups
aws ec2 describe-security-groups --group-ids sg-xxx

# Test de conexión
mysql -h endpoint-rds -u admin -p
```

### Logs y debugging

```bash
# Ver logs de EC2
ssh ec2-user@ip-publica
sudo journalctl -u docker -f

# Ver logs de RDS
aws rds describe-db-log-files --db-instance-identifier feeling-db
aws rds download-db-log-file-portion --db-instance-identifier feeling-db --log-file-name error/mysql-error.log
```

## 🚀 CI/CD

### GitHub Actions

```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Deploy with Terraform
        run: |
          cd infra
          terraform init
          terraform apply -auto-approve
```

---

Para más información, consulta la [documentación principal](../README.md)
