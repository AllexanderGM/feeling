#!/bin/bash

set -euo pipefail # Detener ejecución si ocurre un error

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

### VALIDACIONES INICIALES ###
echo -e "${BLUE}🚀 Iniciando proceso de despliegue...${NC}"

# Verificar si los comandos necesarios están instalados
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Error: Docker no está instalado.${NC}"; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo -e "${RED}❌ Error: Terraform no está instalado.${NC}"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo -e "${RED}❌ Error: AWS CLI no está instalado.${NC}"; exit 1; }

# Verificar si el archivo .env.prod base existe
if [[ ! -f .env.prod ]]; then
    echo -e "${RED}❌ Error: El archivo .env.prod no existe en la raíz del proyecto.${NC}"
    exit 1
fi

# Cargar variables de entorno del archivo .env.prod
set -a
source .env.prod
set +a

# Verificar si las credenciales de AWS están configuradas
if [[ -z "${AWS_PROFILE:-}" && ( -z "${AWS_ACCESS_KEY:-}" || -z "${AWS_SECRET_KEY:-}" ) ]]; then
    echo -e "${RED}❌ Error: configura AWS_PROFILE o define AWS_ACCESS_KEY y AWS_SECRET_KEY en .env.prod${NC}"
    exit 1
fi

# Verificar si el token de GitHub existe
if [[ -z "$GHCR_TOKEN" ]]; then
    echo -e "${RED}❌ Error: GHCR_TOKEN debe estar definido en .env.prod${NC}"
    exit 1
fi

# Verificar que los directorios necesarios existan
if [[ ! -d "./frontend" ]]; then
    echo -e "${RED}❌ Error: No se encontró el directorio 'frontend'${NC}"
    exit 1
fi

if [[ ! -d "./backend" ]]; then
    echo -e "${RED}❌ Error: No se encontró el directorio 'backend'${NC}"
    exit 1
fi

### CONFIGURACIÓN DE RUTAS Y VARIABLES ###
FRONTEND_ENV_PATH="./frontend/.env"
BACKEND_ENV_PATH="./backend/.env"
TERRAFORM_VARS_PATH="./infra/terraform.tfvars"
TERRAFORM_DIR="./infra"

# Nombre del repositorio GitHub (usuario/repo)
GITHUB_REPO=$(git config --get remote.origin.url | sed 's/.*github.com[:\/]\(.*\)\.git/\1/')
if [[ -z "$GITHUB_REPO" ]]; then
    echo -e "${YELLOW}⚠️ No se pudo detectar el repositorio de GitHub. Usando valor de .env.prod${NC}"
    GITHUB_REPO=$REPO_NAME
fi

if [[ -z "$GITHUB_REPO" ]]; then
    echo -e "${RED}❌ Error: configura REPO_NAME en .env.prod o asegura que el repo tenga remote a GitHub.${NC}"
    exit 1
fi

### FUNCIONES ###

normalize_bool() {
    local value="$(echo "${1:-false}" | tr '[:upper:]' '[:lower:]')"
    case "$value" in
        true|1|yes|y|on) echo "true" ;;
        *) echo "false" ;;
    esac
}

format_json_list() {
    local raw="${1:-}"
    local fallback="${2:-[]}" 
    local trimmed="${raw#"${raw%%[![:space:]]*}"}"
    trimmed="${trimmed%"${trimmed##*[![:space:]]}"}"

    if [[ -z "$trimmed" ]]; then
        echo "$fallback"
        return
    fi

    if [[ "$trimmed" == \[* ]]; then
        echo "$trimmed"
        return
    fi

    IFS=',' read -ra parts <<<"$trimmed"
    local items=()
    for part in "${parts[@]}"; do
        local cleaned="${part#"${part%%[![:space:]]*}"}"
        cleaned="${cleaned%"${cleaned##*[![:space:]]}"}"
        if [[ -n "$cleaned" ]]; then
            items+=("\"$cleaned\"")
        fi
    done

    if [[ ${#items[@]} -eq 0 ]]; then
        echo "$fallback"
    else
        local joined
        printf -v joined '%s,' "${items[@]}"
        echo "[${joined%,}]"
    fi
}

# Función para crear el archivo terraform.tfvars
create_terraform_vars() {
    echo -e "${BLUE}📂 Creando archivo terraform.tfvars...${NC}"

    # Escape cualquier carácter especial en las contraseñas
    ESCAPED_DB_PASSWORD=$(echo "$DB_PASSWORD" | sed 's/\\/\\\\/g; s/"/\\"/g')

    AWS_REGION_VALUE=${AWS_REGION:-us-east-1}
    USE_DOMAIN_VALUE=$(normalize_bool "${USE_DOMAIN:-false}")
    ENABLE_CLOUDFRONT_VALUE=$(normalize_bool "${ENABLE_CLOUDFRONT:-true}")
    ENABLE_LOGS_BUCKET_VALUE=$(normalize_bool "${ENABLE_LOGS_BUCKET:-false}")
    CREATE_HOSTED_ZONE_VALUE=$(normalize_bool "${CREATE_HOSTED_ZONE:-false}")
    FRONTEND_FORCE_DESTROY=$(normalize_bool "${FRONTEND_BUCKET_FORCE_DESTROY:-true}")
    ASSETS_FORCE_DESTROY=$(normalize_bool "${ASSETS_BUCKET_FORCE_DESTROY:-true}")
    ALLOW_PUBLIC_FRONTEND=$(normalize_bool "${ALLOW_PUBLIC_FRONTEND_BUCKET:-false}")
    ENABLE_BACKEND_EIP_VALUE=$(normalize_bool "${ENABLE_BACKEND_EIP:-true}")
    DB_SKIP_FINAL_SNAPSHOT_VALUE=$(normalize_bool "${DB_SKIP_FINAL_SNAPSHOT:-false}")
    DB_DELETION_PROTECTION_VALUE=$(normalize_bool "${DB_DELETION_PROTECTION:-true}")
    DB_ENABLE_PI_VALUE=$(normalize_bool "${DB_ENABLE_PERFORMANCE_INSIGHTS:-true}")

    SSH_CIDRS_VALUE=$(format_json_list "${SSH_ALLOWED_CIDRS:-}" '["0.0.0.0/0"]')

    BACKEND_HTTP_RAW="${BACKEND_HTTP_CIDRS:-}"
    if [[ -z "$BACKEND_HTTP_RAW" && -n "${LIGHTSAIL_WORDPRESS_IP:-}" ]]; then
        BACKEND_HTTP_RAW="${LIGHTSAIL_WORDPRESS_IP}/32"
    fi
    BACKEND_HTTP_CIDRS_VALUE=$(format_json_list "$BACKEND_HTTP_RAW" '["0.0.0.0/0"]')

    cat <<EOL >"$TERRAFORM_VARS_PATH"
project_name  = "$NAME"
environment   = "$ENV"
region        = "$AWS_REGION_VALUE"
db_name       = "$DB_NAME"
db_username   = "$DB_USER"
db_password   = "$ESCAPED_DB_PASSWORD"
db_port       = $DB_PORT
use_domain    = $USE_DOMAIN_VALUE
enable_cloudfront = $ENABLE_CLOUDFRONT_VALUE
enable_access_logs_bucket = $ENABLE_LOGS_BUCKET_VALUE
create_hosted_zone = $CREATE_HOSTED_ZONE_VALUE
frontend_bucket_force_destroy = $FRONTEND_FORCE_DESTROY
assets_bucket_force_destroy   = $ASSETS_FORCE_DESTROY
allowed_ssh_cidrs  = $SSH_CIDRS_VALUE
backend_http_cidrs = $BACKEND_HTTP_CIDRS_VALUE
allow_public_frontend_bucket = $ALLOW_PUBLIC_FRONTEND
enable_backend_eip = $ENABLE_BACKEND_EIP_VALUE
db_skip_final_snapshot = $DB_SKIP_FINAL_SNAPSHOT_VALUE
db_deletion_protection = $DB_DELETION_PROTECTION_VALUE
db_enable_performance_insights = $DB_ENABLE_PI_VALUE
EOL

    [[ -n "${AWS_PROFILE:-}" ]] && echo "aws_profile = \"$AWS_PROFILE\"" >>"$TERRAFORM_VARS_PATH"
    [[ -n "${AWS_ACCESS_KEY:-}" ]] && echo "aws_access_key = \"$AWS_ACCESS_KEY\"" >>"$TERRAFORM_VARS_PATH"
    [[ -n "${AWS_SECRET_KEY:-}" ]] && echo "aws_secret_key = \"$AWS_SECRET_KEY\"" >>"$TERRAFORM_VARS_PATH"
    [[ -n "${AWS_SESSION_TOKEN:-}" ]] && echo "aws_session_token = \"$AWS_SESSION_TOKEN\"" >>"$TERRAFORM_VARS_PATH"
    [[ -n "${DB_FINAL_SNAPSHOT_IDENTIFIER:-}" ]] && echo "db_final_snapshot_identifier = \"$DB_FINAL_SNAPSHOT_IDENTIFIER\"" >>"$TERRAFORM_VARS_PATH"
    [[ -n "${DB_STORAGE_TYPE:-}" ]] && echo "db_storage_type = \"$DB_STORAGE_TYPE\"" >>"$TERRAFORM_VARS_PATH"
    [[ -n "${DB_INSTANCE_CLASS:-}" ]] && echo "db_instance_class = \"$DB_INSTANCE_CLASS\"" >>"$TERRAFORM_VARS_PATH"
    [[ -n "${DB_ALLOCATED_STORAGE:-}" ]] && echo "db_allocated_storage = $DB_ALLOCATED_STORAGE" >>"$TERRAFORM_VARS_PATH"
    [[ -n "${DB_BACKUP_RETENTION:-}" ]] && echo "db_backup_retention = $DB_BACKUP_RETENTION" >>"$TERRAFORM_VARS_PATH"
    [[ -n "${DB_KMS_KEY_ARN:-}" ]] && echo "db_kms_key_arn = \"$DB_KMS_KEY_ARN\"" >>"$TERRAFORM_VARS_PATH"
    [[ -n "${BACKEND_INSTANCE_TYPE:-}" ]] && echo "backend_instance_type = \"$BACKEND_INSTANCE_TYPE\"" >>"$TERRAFORM_VARS_PATH"
    [[ -n "${BACKEND_AMI:-}" ]] && echo "backend_ami = \"$BACKEND_AMI\"" >>"$TERRAFORM_VARS_PATH"
    [[ -n "${BACKEND_ROOT_VOLUME_SIZE:-}" ]] && echo "backend_root_volume_size = $BACKEND_ROOT_VOLUME_SIZE" >>"$TERRAFORM_VARS_PATH"
    [[ -n "${BACKEND_ROOT_VOLUME_TYPE:-}" ]] && echo "backend_root_volume_type = \"$BACKEND_ROOT_VOLUME_TYPE\"" >>"$TERRAFORM_VARS_PATH"
    [[ -n "$DOMAIN_NAME" ]] && echo "domain_name = \"$DOMAIN_NAME\"" >>"$TERRAFORM_VARS_PATH"
    [[ -n "$HOSTED_ZONE_ID" ]] && echo "hosted_zone_id = \"$HOSTED_ZONE_ID\"" >>"$TERRAFORM_VARS_PATH"
    [[ -n "$LIGHTSAIL_WORDPRESS_IP" ]] && echo "lightsail_wordpress_ip = \"$LIGHTSAIL_WORDPRESS_IP\"" >>"$TERRAFORM_VARS_PATH"
    [[ -n "$API_SUBDOMAIN" ]] && echo "api_subdomain = \"$API_SUBDOMAIN\"" >>"$TERRAFORM_VARS_PATH"
    [[ -n "$APP_SUBDOMAIN" ]] && echo "app_subdomain = \"$APP_SUBDOMAIN\"" >>"$TERRAFORM_VARS_PATH"
    local WP_SUBDOMAIN_VALUE="${WORDPRESS_SUBDOMAIN:-}"
    [[ -n "$WP_SUBDOMAIN_VALUE" ]] && echo "wordpress_subdomain = \"$WP_SUBDOMAIN_VALUE\"" >>"$TERRAFORM_VARS_PATH"
    [[ -n "$CDN_SUBDOMAIN" ]] && echo "cdn_subdomain = \"$CDN_SUBDOMAIN\"" >>"$TERRAFORM_VARS_PATH"

    echo -e "${GREEN}✅ Archivo terraform.tfvars creado exitosamente${NC}"

    if [[ $SSH_CIDRS_VALUE == '["0.0.0.0/0"]' ]]; then
        echo -e "${YELLOW}⚠️ Advertencia: SSH_ALLOWED_CIDRS permite acceso desde cualquier IP. Actualízalo para mayor seguridad.${NC}"
    fi
    if [[ $BACKEND_HTTP_CIDRS_VALUE == '["0.0.0.0/0"]' ]]; then
        echo -e "${YELLOW}⚠️ Advertencia: BACKEND_HTTP_CIDRS permite consumir la API desde cualquier IP. Limita este valor para producción.${NC}"
    fi
}


# Función para aplicar la infraestructura con Terraform
deploy_with_terraform() {
    echo -e "${BLUE}🏗️ Desplegando infraestructura con Terraform...${NC}"
    
    # Exportar variables de AWS para Terraform
    export AWS_DEFAULT_REGION=${AWS_REGION:-us-east-1}
    if [[ -n "${AWS_PROFILE:-}" ]]; then
        export AWS_PROFILE
    fi
    if [[ -n "${AWS_ACCESS_KEY:-}" && -n "${AWS_SECRET_KEY:-}" ]]; then
        export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY"
        export AWS_SECRET_ACCESS_KEY="$AWS_SECRET_KEY"
        [[ -n "${AWS_SESSION_TOKEN:-}" ]] && export AWS_SESSION_TOKEN
    fi
    
    # Cambiar al directorio de Terraform
    cd $TERRAFORM_DIR
    
    # Inicializar Terraform
    echo -e "${BLUE}🔧 Inicializando Terraform...${NC}"
    terraform init
    
    # Aplicar la configuración
    echo -e "${BLUE}🚀 Aplicando configuración de Terraform...${NC}"
    terraform apply -auto-approve
    
    # Procesar outputs de Terraform en formato JSON
    TF_OUTPUT_JSON=$(terraform output -json)

    if ! command -v python3 >/dev/null 2>&1; then
        echo -e "${RED}❌ Error: python3 es requerido para procesar los outputs de Terraform.${NC}"
        exit 1
    fi

    mapfile -t TF_VALUES < <(printf '%s' "$TF_OUTPUT_JSON" | python3 - <<'PY'
import json, sys
data = json.load(sys.stdin)
keys = [
    "backend_public_ip",
    "db_endpoint",
    "frontend_website_endpoint",
    "assets_bucket_name",
    "assets_bucket_url",
    "cloudfront_domain_name",
    "backend_private_key_path",
    "app_fqdn",
    "api_fqdn"
]
for key in keys:
    value = data.get(key, {}).get("value")
    if value is None:
        print("")
    elif isinstance(value, list):
        print(",".join(str(v) for v in value))
    else:
        print(str(value))
PY
)

    backend_instance_ip=${TF_VALUES[0]}
    db_endpoint=${TF_VALUES[1]}
    frontend_endpoint=${TF_VALUES[2]}
    assets_bucket_name=${TF_VALUES[3]}
    assets_bucket_url=${TF_VALUES[4]}
    cloudfront_domain=${TF_VALUES[5]}
    backend_key_path=${TF_VALUES[6]}
    app_fqdn=${TF_VALUES[7]}
    api_fqdn=${TF_VALUES[8]}

    if [[ -z "$frontend_endpoint" && -z "$cloudfront_domain" ]]; then
        echo -e "${RED}❌ No se recibió un endpoint válido para el frontend desde Terraform.${NC}"
        exit 1
    fi

    frontend_url="http://$frontend_endpoint"
    if [[ -n "$cloudfront_domain" ]]; then
        frontend_url="https://$cloudfront_domain"
    fi

    if [[ -z "$assets_bucket_url" && -n "$assets_bucket_name" ]]; then
        assets_bucket_url="https://${assets_bucket_name}.s3.${AWS_REGION:-us-east-1}.amazonaws.com"
    fi

    # Copiar el archivo de clave privada a la raíz para acceso más fácil
    if [[ -n "$backend_key_path" && -f "$backend_key_path" ]]; then
        echo -e "${BLUE}📂 Copiando archivo de clave privada SSH...${NC}"
        cp -f "$backend_key_path" ../.ec2-key.pem
        chmod 600 ../.ec2-key.pem
    else
        echo -e "${YELLOW}⚠️ No se encontró el archivo PEM generado por Terraform (${backend_key_path}).${NC}"
        echo -e "${YELLOW}⚠️ Si se creó previamente, verifica manualmente su ubicación en infra/.${NC}"
    fi

    # Volver al directorio raíz
    cd ..

    # Definir la ruta de la clave SSH para uso posterior
    export KEY_PATH="./.ec2-key.pem"

    # Exportar variables para uso posterior
    export BACKEND_IP=$backend_instance_ip
    export DB_ENDPOINT=$db_endpoint
    export FRONTEND_URL=$frontend_url
    export ASSETS_BUCKET=$assets_bucket_name
    export ASSETS_BUCKET_URL=$assets_bucket_url
    export CLOUDFRONT_DOMAIN=$cloudfront_domain
    export APP_FQDN=$app_fqdn
    export API_FQDN=$api_fqdn

    echo -e "${GREEN}✅ Infraestructura desplegada exitosamente${NC}"
    echo -e "${BLUE}📋 Información de despliegue:${NC}"
    echo -e "  - IP Backend: ${YELLOW}$BACKEND_IP${NC}"
    echo -e "  - Endpoint DB: ${YELLOW}$DB_ENDPOINT${NC}"
    echo -e "  - URL Frontend: ${YELLOW}$FRONTEND_URL${NC}"
    echo -e "  - Bucket assets: ${YELLOW}$ASSETS_BUCKET${NC}"
    echo -e "  - Clave SSH: ${YELLOW}$KEY_PATH${NC}"
    if [[ -n "$CLOUDFRONT_DOMAIN" ]]; then
        echo -e "  - CloudFront: ${YELLOW}https://$CLOUDFRONT_DOMAIN${NC}"
    fi
    if [[ -n "$APP_FQDN" ]]; then
        echo -e "  - Dominio frontend: ${YELLOW}$APP_FQDN${NC}"
    fi
    if [[ -n "$API_FQDN" ]]; then
        echo -e "  - Dominio API: ${YELLOW}$API_FQDN${NC}"
    fi
}

# Función para crear archivos .env con valores reales de la infraestructura
create_env_files() {
    echo -e "${BLUE}📂 Creando archivos .env con los valores reales de la infraestructura...${NC}"
    
    # Extraer solo el hostname del endpoint de la base de datos (sin el puerto)
    DB_HOST=$(echo $DB_ENDPOINT | cut -d':' -f1)
    
    # Definir URLs basadas en la infraestructura real
    if [[ -n "$API_FQDN" ]]; then
        REAL_URL_BACK="https://$API_FQDN"
    else
        REAL_URL_BACK="http://$BACKEND_IP:$PORT_BACK"
    fi

    if [[ -n "$APP_FQDN" ]]; then
        REAL_URL_FRONT="https://$APP_FQDN"
    else
        REAL_URL_FRONT="$FRONTEND_URL"
    fi

    DEFAULT_STATIC_PATH=${STATIC_FILE_PATH:-$REAL_URL_FRONT}

    local NORMALIZED_FRONT="${REAL_URL_FRONT%/}"
    local NORMALIZED_BACK="${REAL_URL_BACK%/}"

    local DEFAULT_PAYMENT_REDIRECT="${NORMALIZED_FRONT}/events/payment-status"

    local PAYMENTS_REDIRECT_URL_VALUE="${PAYMENTS_REDIRECT_URL_OVERRIDE:-${PAYMENTS_REDIRECT_URL:-$DEFAULT_PAYMENT_REDIRECT}}"
    local WOMPI_REDIRECT_URL_VALUE="${WOMPI_REDIRECT_URL_OVERRIDE:-${WOMPI_REDIRECT_URL:-$DEFAULT_PAYMENT_REDIRECT}}"

    local DEFAULT_MAIL_BASE="${NORMALIZED_FRONT%/}"
    local MAIL_BASE_URL_VALUE="${MAIL_BASE_URL_OVERRIDE:-${MAIL_BASE_URL:-$DEFAULT_MAIL_BASE}}"

    local WORDPRESS_FRONT_URL_VALUE="${WORDPRESS_FRONT_URL_OVERRIDE:-${WORDPRESS_FRONT_URL:-$DEFAULT_MAIL_BASE}}"

    local WORDPRESS_API_URL_VALUE="${WORDPRESS_API_URL_OVERRIDE:-${WORDPRESS_API_URL:-$NORMALIZED_BACK}}"

    S3_REGION=${AWS_REGION:-us-east-1}
    
    # Frontend .env
    cat <<EOL >"$FRONTEND_ENV_PATH"
# Variables de entorno Generales
VITE_NAME=$NAME
VITE_ENV=$ENV

# Variables de archivos estáticos
VITE_STATIC_FILE_PATH=$DEFAULT_STATIC_PATH

# Configuración de URLs
VITE_URL=$URL
VITE_PORT_FRONT=$PORT_FRONT
VITE_PORT_BACK=$PORT_BACK
VITE_URL_FRONT=$REAL_URL_FRONT
VITE_URL_BACK=$REAL_URL_BACK

# Variables de encriptación
VITE_ALGORITHM=$ALGORITHM
VITE_KEY=$KEY
VITE_IV=$IV

# Variables de sesión y autenticación
VITE_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
VITE_GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

# Pasarela de pagos
VITE_WOMPI_PUBLIC_KEY=$WOMPI_PUBLIC_KEY

# Logging
VITE_LOG_LEVEL=${VITE_LOG_LEVEL:-warn}

# Variables de JWT
VITE_JWT_EXPIRATION=$JWT_EXPIRATION
VITE_JWT_REFRESH_EXPIRATION=$JWT_REFRESH_EXPIRATION
EOL

    # Backend .env
    cat <<EOL >"$BACKEND_ENV_PATH"
# Variables de entorno Generales
NAME=$NAME
ENV=$ENV

# Configuración de URLs
PORT_FRONT=$PORT_FRONT
PORT_BACK=$PORT_BACK
URL_FRONT=$REAL_URL_FRONT
URL_BACK=$REAL_URL_BACK

# Configuración de Base de Datos
DB_PORT=$DB_PORT
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_ROOT_PASSWORD=$DB_ROOT_PASSWORD
DB_NAME=$DB_NAME

# Configuración de almacenamiento (S3)
STORAGE_TYPE=s3
AWS_REGION=$S3_REGION
S3_REGION=$S3_REGION
S3_BUCKET=$ASSETS_BUCKET
ASSETS_BUCKET_URL=$ASSETS_BUCKET_URL

# Variables de encriptación
ALGORITHM=$ALGORITHM
KEY=$KEY
IV=$IV

# Configuración de sesión y autenticación
SESSION_SECRET=$SESSION_SECRET
JWT_SECRET=$JWT_SECRET
JWT_EXPIRATION=$JWT_EXPIRATION
JWT_REFRESH_EXPIRATION=$JWT_REFRESH_EXPIRATION
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD

# Variables de Google OAuth
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

# Variables de correo electrónico
MAIL=$MAIL
MAILPASS=$MAILPASS

# Pasarela de pagos
PAYMENTS_GATEWAY=$PAYMENTS_GATEWAY
PAYMENTS_CURRENCY=$PAYMENTS_CURRENCY
PAYMENTS_REDIRECT_URL=$PAYMENTS_REDIRECT_URL_VALUE

# Configuración Wompi
WOMPI_PUBLIC_KEY=$WOMPI_PUBLIC_KEY
WOMPI_PRIVATE_KEY=$WOMPI_PRIVATE_KEY
WOMPI_INTEGRITY_SECRET=$WOMPI_INTEGRITY_SECRET
WOMPI_API_BASE=$WOMPI_API_BASE
WOMPI_REDIRECT_URL=$WOMPI_REDIRECT_URL_VALUE
EOL

    echo -e "${GREEN}✅ Archivos .env creados exitosamente con valores reales${NC}"
}

# Función para construir y subir imágenes Docker
build_and_push_images() {
    echo -e "${BLUE}🔨 Construyendo y subiendo imágenes Docker...${NC}"

    # Convertir el nombre del repositorio a minúsculas
    GITHUB_REPO_LOWERCASE=$(echo $GITHUB_REPO | tr '[:upper:]' '[:lower:]')
    
    # Login a GitHub Container Registry
    echo -e "${YELLOW}🔑 Iniciando sesión en GitHub Container Registry...${NC}"
    echo $GHCR_TOKEN | docker login ghcr.io -u $(echo $GITHUB_REPO | cut -d'/' -f1) --password-stdin
    
    # Construir y subir imagen del backend
    echo -e "${BLUE}🏗️ Construyendo imagen de backend...${NC}"
    docker build -t ghcr.io/$GITHUB_REPO_LOWERCASE/backend:latest ./backend
    echo -e "${BLUE}📤 Subiendo imagen de backend a GHCR...${NC}"
    docker push ghcr.io/$GITHUB_REPO_LOWERCASE/backend:latest
    
    # Construir y subir imagen del frontend
    echo -e "${BLUE}🏗️ Construyendo imagen de frontend...${NC}"
    docker build -t ghcr.io/$GITHUB_REPO_LOWERCASE/frontend:latest ./frontend
    echo -e "${BLUE}📤 Subiendo imagen de frontend a GHCR...${NC}"
    docker push ghcr.io/$GITHUB_REPO_LOWERCASE/frontend:latest
    
    echo -e "${GREEN}✅ Imágenes construidas y subidas exitosamente${NC}"
}

# Función para configurar la instancia EC2 con la imagen de backend
configure_ec2() {
    echo -e "${BLUE}🔧 Configurando instancia EC2...${NC}"
    
    # Verificar si la clave SSH existe
    if [[ ! -f $KEY_PATH ]]; then
        echo -e "${RED}❌ Error: Archivo de clave SSH no encontrado en $KEY_PATH${NC}"
        echo -e "${YELLOW}⚠️ Buscando claves disponibles en $TERRAFORM_DIR...${NC}"

        POSSIBLE_KEY=$(find "$TERRAFORM_DIR" -maxdepth 1 -name ".*-ec2-key.pem" | head -n1)

        if [[ -n "$POSSIBLE_KEY" && -f "$POSSIBLE_KEY" ]]; then
            echo -e "${BLUE}🔑 Usando clave SSH desde $POSSIBLE_KEY${NC}"
            cp -f "$POSSIBLE_KEY" ./.ec2-key.pem
            chmod 600 ./.ec2-key.pem
            KEY_PATH="./.ec2-key.pem"
        else
            echo -e "${RED}❌ Error: No se encontró ninguna clave SSH válida${NC}"
            exit 1
        fi
    fi
    
    # Convertir el nombre del repositorio a minúsculas
    GITHUB_REPO_LOWERCASE=$(echo $GITHUB_REPO | tr '[:upper:]' '[:lower:]')
    
    # Crear archivo de configuración para EC2
    cat <<EOL >"${TERRAFORM_DIR}/ec2-setup.sh"
#!/bin/bash
# Actualizar sistema usando yum (no apt)
sudo yum update -y
sudo amazon-linux-extras install docker -y
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user

# Crear archivo .env para el backend
sudo install -d -m 755 /opt/feeling
cat <<'EOF' | sudo tee /opt/feeling/backend.env >/dev/null
$(cat $BACKEND_ENV_PATH)
EOF
sudo chown root:root /opt/feeling/backend.env
sudo chmod 600 /opt/feeling/backend.env

# Login a GitHub Container Registry y descargar imagen
echo "$GHCR_TOKEN" | sudo docker login ghcr.io -u $(echo $GITHUB_REPO | cut -d'/' -f1) --password-stdin
sudo docker pull ghcr.io/$GITHUB_REPO_LOWERCASE/backend:latest

# Detener contenedor existente si existe
sudo docker stop feeling-backend 2>/dev/null || true
sudo docker rm feeling-backend 2>/dev/null || true

# Ejecutar nuevo contenedor
sudo docker run -d \
  --name feeling-backend \
  --restart unless-stopped \
  -p $PORT_BACK:$PORT_BACK \
  --env-file /opt/feeling/backend.env \
  --log-driver json-file \
  --log-opt max-size=25m \
  --log-opt max-file=3 \
  ghcr.io/$GITHUB_REPO_LOWERCASE/backend:latest
EOL

    # Dar permisos de ejecución al script
    chmod +x "${TERRAFORM_DIR}/ec2-setup.sh"
    
    # Verificar que la instancia EC2 tenga una IP
    if [[ -z "$BACKEND_IP" || "$BACKEND_IP" == "null" ]]; then
        echo -e "${RED}❌ Error: No se obtuvo una IP válida para la instancia EC2${NC}"
        echo -e "${YELLOW}⚠️ Verifica que tu instancia EC2 esté en una subred pública y tenga associate_public_ip_address=true${NC}"
        exit 1
    fi
    
    # Esperar a que la instancia EC2 esté lista
    echo -e "${YELLOW}⏳ Esperando a que la instancia EC2 esté lista (60 segundos)...${NC}"
    sleep 60
    
    # Verificar conectividad SSH antes de continuar
    echo -e "${BLUE}🔍 Verificando conectividad SSH...${NC}"
    MAX_ATTEMPTS=10
    ATTEMPT=1

    while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
        echo -e "${YELLOW}⏳ Intento $ATTEMPT de $MAX_ATTEMPTS${NC}"
        if ssh -i $KEY_PATH -o StrictHostKeyChecking=no -o ConnectTimeout=5 -o BatchMode=yes ec2-user@$BACKEND_IP "echo SSH Connection Successful" &>/dev/null; then
            echo -e "${GREEN}✅ Conexión SSH establecida${NC}"
            break
        else
            echo -e "${YELLOW}⚠️ No se pudo establecer conexión. Esperando...${NC}"
            sleep 15
            ATTEMPT=$((ATTEMPT+1))
        fi
    done

    if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
        echo -e "${RED}❌ No se pudo establecer conexión SSH después de $MAX_ATTEMPTS intentos.${NC}"
        echo -e "${YELLOW}⚠️ Verifica el grupo de seguridad y que la instancia esté en ejecución.${NC}"
        echo -e "${YELLOW}⚠️ Comando manual: ssh -i $KEY_PATH -v ubuntu@$BACKEND_IP${NC}"
        exit 1
    fi
    
    # Copiar script y clave SSH a la instancia EC2
    echo -e "${BLUE}📤 Copiando script de configuración a la instancia EC2...${NC}"
    scp -i $KEY_PATH -o StrictHostKeyChecking=no ./infra/ec2-setup.sh ec2-user@$BACKEND_IP:/home/ec2-user/
    
    # Ejecutar script en la instancia EC2
    echo -e "${BLUE}🔄 Ejecutando script de configuración en la instancia EC2...${NC}"
    ssh -i $KEY_PATH -o StrictHostKeyChecking=no ec2-user@$BACKEND_IP "chmod +x /home/ec2-user/ec2-setup.sh && /home/ec2-user/ec2-setup.sh"
    
    echo -e "${GREEN}✅ Instancia EC2 configurada exitosamente${NC}"
}

# Función para desplegar el frontend en S3
deploy_frontend_to_s3() {
    echo -e "${BLUE}🚀 Desplegando frontend en S3...${NC}"
    
    # Extraer el nombre del bucket frontend desde Terraform
    local FRONTEND_BUCKET=$(cd ./infra && terraform output -raw frontend_bucket_name || echo "")
    
    # Si no se pudo obtener, construir manualmente el nombre basado en el prefijo
    if [[ -z "$FRONTEND_BUCKET" ]]; then
        local PROJECT_SLUG=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')
        local ENV_SLUG=$(echo "$ENV" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')
        FRONTEND_BUCKET="${PROJECT_SLUG}-${ENV_SLUG}-frontend"
        echo -e "${YELLOW}⚠️ No se pudo obtener el nombre del bucket desde Terraform, usando valor calculado: $FRONTEND_BUCKET${NC}"
    fi

    # Verificar que el bucket existe
    if ! aws s3 ls "s3://$FRONTEND_BUCKET" >/dev/null 2>&1; then
        echo -e "${RED}❌ Error: El bucket $FRONTEND_BUCKET no existe o no tienes permiso para acceder${NC}"
        echo -e "${YELLOW}⚠️ Verificando buckets disponibles...${NC}"
        aws s3 ls
        exit 1
    fi
    
    # Compilar el frontend
    echo -e "${BLUE}🔨 Compilando frontend...${NC}"
    (cd ./frontend && npm install && npm run build)
    
    # Verificar que se generó el directorio dist
    if [[ ! -d "./frontend/dist" ]]; then
        echo -e "${RED}❌ Error: No se encontró el directorio ./frontend/dist después de la compilación${NC}"
        echo -e "${YELLOW}⚠️ Verifica los logs de compilación para encontrar errores${NC}"
        exit 1
    fi
    
    # Mostrar el contenido que se va a subir
    echo -e "${BLUE}📂 Contenido a subir:${NC}"
    ls -la ./frontend/dist
    
    # Subir archivos a S3 (corregido para usar FRONTEND_BUCKET)
    echo -e "${BLUE}📤 Subiendo archivos a S3 (bucket: $FRONTEND_BUCKET)...${NC}"
    aws s3 sync ./frontend/dist "s3://$FRONTEND_BUCKET" --delete
    
    echo -e "${GREEN}✅ Frontend desplegado exitosamente${NC}"
    echo -e "${BLUE}🌐 URL del frontend: ${YELLOW}$FRONTEND_URL${NC}"
}

# Función para verificar la conectividad después del despliegue
verify_deployment() {
    echo -e "${BLUE}🔍 Verificando conectividad de componentes...${NC}"
    
    # Verificar backend
    echo -e "${YELLOW}⏳ Verificando que el backend responda...${NC}"
    if [[ -n "$API_FQDN" ]]; then
        BACKEND_URL="https://$API_FQDN"
    else
        BACKEND_URL="http://$BACKEND_IP:$PORT_BACK"
    fi
    BACKEND_HEALTH="${BACKEND_URL%/}/health"
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_HEALTH" 2>/dev/null || echo "Error")
    
    if [[ "$BACKEND_STATUS" == "200" ]]; then
        echo -e "${GREEN}✅ Backend responde correctamente${NC}"
    else
        echo -e "${YELLOW}⚠️ Backend no responde con código 200 (recibido: $BACKEND_STATUS)${NC}"
        echo -e "${YELLOW}⚠️ Esto puede ser normal si la aplicación necesita tiempo para iniciar${NC}"
        echo -e "${YELLOW}⚠️ Intenta acceder manualmente a: ${BACKEND_HEALTH}${NC}"
    fi
    
    # Verificar frontend (solo mostramos info, no podemos verificar HTTPS fácilmente)
    echo -e "${BLUE}ℹ️ Frontend desplegado en: ${YELLOW}$FRONTEND_URL${NC}"
    echo -e "${BLUE}ℹ️ Por favor, verifica manualmente que el frontend funcione correctamente${NC}"
    
    # Informar sobre la IP elástica
    echo -e "${BLUE}ℹ️ Estás usando una IP elástica para el backend: ${YELLOW}$BACKEND_IP${NC}"
    echo -e "${BLUE}ℹ️ Esta IP permanecerá constante incluso si destruyes y recreas la infraestructura${NC}"
    
    echo -e "${GREEN}✅ Verificación básica completada${NC}"
}

### EJECUCIÓN PRINCIPAL ###
echo -e "${YELLOW}🔍 Validando requisitos...${NC}"

# PASO 1: Crear terraform.tfvars
create_terraform_vars

# PASO 2: Desplegar infraestructura con Terraform (esto establece las variables BACKEND_IP, DB_ENDPOINT, etc.)
deploy_with_terraform

# PASO 3: Crear archivos .env con los valores reales de la infraestructura
create_env_files

# PASO 4: Construir y subir imágenes Docker
build_and_push_images

# PASO 5: Configurar EC2 y desplegar backend
configure_ec2

# PASO 6: Desplegar frontend en S3
deploy_frontend_to_s3

# PASO 7: Verificar el despliegue
verify_deployment

echo -e "${GREEN}🎉 Proceso de despliegue completado exitosamente!${NC}"
echo -e "${BLUE}📋 Resumen:${NC}"
if [[ -n "$API_FQDN" ]]; then
    echo -e "  - Backend desplegado en: ${YELLOW}https://$API_FQDN${NC}"
else
    echo -e "  - Backend desplegado en: ${YELLOW}http://$BACKEND_IP:$PORT_BACK${NC}"
fi
echo -e "  - Frontend desplegado en: ${YELLOW}$FRONTEND_URL${NC}"
echo -e "  - Base de datos: ${YELLOW}$DB_ENDPOINT${NC}"
echo -e "  - Bucket de assets: ${YELLOW}$ASSETS_BUCKET${NC}"
[[ -n "$ASSETS_BUCKET_URL" ]] && echo -e "  - URL interno de assets: ${YELLOW}$ASSETS_BUCKET_URL${NC}"
[[ -n "$CLOUDFRONT_DOMAIN" ]] && echo -e "  - CloudFront: ${YELLOW}https://$CLOUDFRONT_DOMAIN${NC}"
[[ -n "$APP_FQDN" ]] && echo -e "  - Dominio frontend: ${YELLOW}$APP_FQDN${NC}"
[[ -n "$API_FQDN" ]] && echo -e "  - Dominio API: ${YELLOW}$API_FQDN${NC}"
