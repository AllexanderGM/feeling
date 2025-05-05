# 🔹 SSH Private Key para Instancia EC2
resource "local_file" "private_key" {
  content         = tls_private_key.ssh_key.private_key_pem
  filename        = "${path.module}/.ec2-key.pem"
  file_permission = "0600"
}

# 🔹 Elastic IP para instancia EC2 (dirección IP estática)
resource "aws_eip" "backend_eip" {
  instance = module.ec2.id
  domain   = "vpc"

  tags = {
    Name         = replace(lower("${var.prefix}-backend-eip"), "_", "-")
    Project      = replace(lower(var.prefix), "_", "-")
    Environment  = "Production"
    ManagedBy    = "Terraform"
    ResourceType = "Elastic IP"
  }

  # Importante: solo aplica la asignación cuando la instancia esté lista
  depends_on = [module.ec2]
}

# 🔹 EC2 para backend
module "ec2" {
  source                      = "terraform-aws-modules/ec2-instance/aws"
  version                     = "5.7.1"
  name                        = replace(lower("${var.prefix}-backend"), "_", "-")
  instance_type               = "t2.micro"              # Dentro de la capa gratuita
  ami                         = "ami-0cff7528ff583bf9a" # Amazon Linux 2 en us-east-1
  key_name                    = aws_key_pair.generated.key_name
  vpc_security_group_ids      = [aws_security_group.ec2_sg.id]
  subnet_id                   = module.vpc.public_subnets[0] # Mantener en subnet pública para acceso a Internet
  associate_public_ip_address = true                         # Asegurar que tenga IP pública
  monitoring                  = false                        # No habilitar monitoreo detallado que genera costos

  # Optimizar para capa gratuita - usar EBS mínimo necesario
  root_block_device = [
    {
      volume_type = "gp2"
      volume_size = 8     # El mínimo recomendado para SO
      encrypted   = false # La encriptación genera costos
      # No usar tags aquí, usar volume_tags en su lugar
    }
  ]

  # Usar volume_tags en lugar de tags en root_block_device
  volume_tags = {
    Name         = "${replace(lower("${var.prefix}-backend"), "_", "-")}-volume"
    Project      = replace(lower(var.prefix), "_", "-")
    Environment  = "Production"
    ManagedBy    = "Terraform"
    ResourceType = "EBS Volume"
  }

  tags = {
    Name         = replace(lower("${var.prefix}-backend"), "_", "-")
    Project      = replace(lower(var.prefix), "_", "-")
    Environment  = "Production"
    ManagedBy    = "Terraform"
    ResourceType = "Backend"
  }

  user_data = <<-EOF
#!/bin/bash
# Actualizar sistema (Amazon Linux 2 usa yum, no apt)
sudo yum update -y
sudo amazon-linux-extras install docker -y
sudo yum install -y curl jq unzip mysql

# Habilitar y iniciar Docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user

# Crear directorios necesarios
mkdir -p /home/ec2-user/logs

# Configurar scripts de salud básicos (alternativa gratuita a CloudWatch)
cat <<'HEALTH_CHECK' > /home/ec2-user/healthcheck.sh
#!/bin/bash
SERVICE_NAME="backend"
CONTAINER_NAME="backend"
PORT=8080

# Verificar si el contenedor está corriendo
RUNNING=$(docker ps --filter "name=$CONTAINER_NAME" --format '{{.Names}}')
if [ -z "$RUNNING" ]; then
  echo "Container $CONTAINER_NAME is not running. Restarting..."
  docker start $CONTAINER_NAME || \
  docker run -d --name $CONTAINER_NAME -p $PORT:$PORT --env-file /home/ec2-user/.env [IMAGE_NAME]
fi

# Verificar si el servicio está respondiendo
HEALTH=$(curl -s -o /dev/null -w "%%{http_code}" http://localhost:$PORT/health || echo "Error")
if [ "$HEALTH" != "200" ]; then
  echo "Service is not healthy. Restarting container..."
  docker restart $CONTAINER_NAME
fi
HEALTH_CHECK

chmod +x /home/ec2-user/healthcheck.sh

# Configurar cron para ejecutar cada 5 minutos
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/ec2-user/healthcheck.sh >> /home/ec2-user/logs/healthcheck.log 2>&1") | crontab -

# Script para limpieza de logs y mantenimiento
cat <<'MAINTENANCE' > /home/ec2-user/maintenance.sh
#!/bin/bash
# Limpiar logs antiguos
find /home/ec2-user/logs/*.log -type f -mtime +7 -delete

# Limpiar imágenes Docker no utilizadas
docker image prune -af --filter "until=168h"
MAINTENANCE

chmod +x /home/ec2-user/maintenance.sh
(crontab -l 2>/dev/null; echo "0 3 * * * /home/ec2-user/maintenance.sh") | crontab -

# Mensaje de finalización
echo "Setup completed successfully" > /home/ec2-user/setup_complete.txt
EOF
}