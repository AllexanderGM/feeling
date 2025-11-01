#!/bin/bash

set -euo pipefail # Detener ejecución si ocurre un error

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

die() {
    local message="$1"
    echo -e "${RED}❌ Error: ${message}${NC}"
    exit 1
}

require_command() {
    local cmd="$1"
    local hint="${2:-Instala la dependencia y vuelve a intentarlo.}"
    if ! command -v "$cmd" >/dev/null 2>&1; then
        die "No se encontró el comando '${cmd}'. ${hint}"
    fi
}

### VALIDACIONES INICIALES ###
VERIFY_ONLY=false
if [[ "${1:-}" == "--verify" || "${1:-}" == "verify" ]]; then
    VERIFY_ONLY=true
    echo -e "${BLUE}🔍 Ejecutando verificación (modo read-only).${NC}"
else
    echo -e "${BLUE}🚀 Iniciando proceso de despliegue...${NC}"
fi

# Verificar si los comandos necesarios están instalados
require_command terraform "Instala Terraform y configura el PATH."
require_command python3 "Instala Python 3 para procesar outputs de Terraform."
require_command curl "Instala curl para validar la API del backend."

detect_aws_cli() {
    if command -v aws >/dev/null 2>&1; then
        AWS_CLI_BIN=$(command -v aws)
        return
    fi

    if command -v aws.exe >/dev/null 2>&1; then
        AWS_CLI_BIN=$(command -v aws.exe)
        return
    fi

    local win_cli="/mnt/c/Program Files/Amazon/AWSCLI/bin/aws.exe"
    if [[ -x "$win_cli" ]]; then
        AWS_CLI_BIN="$win_cli"
        return
    fi

    die "AWS CLI no está instalado. Instala AWS CLI v2 o agrega aws.exe al PATH."
}

detect_aws_cli

run_aws() {
    if [[ -z "${AWS_PROFILE:-}" ]]; then
        AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY:-}" \
        AWS_SECRET_ACCESS_KEY="${AWS_SECRET_KEY:-}" \
        AWS_SESSION_TOKEN="${AWS_SESSION_TOKEN:-}" \
        AWS_REGION="${AWS_REGION:-us-east-1}" \
        AWS_DEFAULT_REGION="${AWS_REGION:-us-east-1}" \
        "$AWS_CLI_BIN" "$@"
    else
        "$AWS_CLI_BIN" --profile "$AWS_PROFILE" "$@"
    fi
}

if [[ "$VERIFY_ONLY" != true ]]; then
    require_command docker "Instala Docker, asegúrate de que el daemon esté ejecutándose y vuelve a intentar."
    require_command npm "Instala Node.js (incluye npm) para compilar el frontend."
fi

# Verificar si el archivo .env.prod base existe
if [[ ! -f .env.prod ]]; then
    die "El archivo .env.prod no existe en la raíz del proyecto."
fi

# Cargar variables de entorno del archivo .env.prod
set -a
source .env.prod
set +a

# Verificar si las credenciales de AWS están configuradas
if [[ -z "${AWS_PROFILE:-}" && ( -z "${AWS_ACCESS_KEY:-}" || -z "${AWS_SECRET_KEY:-}" ) ]]; then
    die "Configura AWS_PROFILE o define AWS_ACCESS_KEY y AWS_SECRET_KEY en .env.prod"
fi

if [[ -z "${AWS_PROFILE:-}" ]]; then
    unset AWS_PROFILE
fi

# Verificar si el token de GitHub existe
if [[ -z "$GHCR_TOKEN" && "$VERIFY_ONLY" != true ]]; then
    die "GHCR_TOKEN debe estar definido en .env.prod"
fi

# Verificar que los directorios necesarios existan
if [[ ! -d "./frontend" ]]; then
    die "No se encontró el directorio 'frontend'"
fi

if [[ ! -d "./backend" ]]; then
    die "No se encontró el directorio 'backend'"
fi

### CONFIGURACIÓN DE RUTAS Y VARIABLES ###
FRONTEND_ENV_PATH="./frontend/.env"
BACKEND_ENV_PATH="./backend/.env"
TERRAFORM_VARS_PATH="./infra/terraform.tfvars"
TERRAFORM_DIR="./infra"

[[ -d "$TERRAFORM_DIR" ]] || die "No se encontró el directorio de infraestructura en ${TERRAFORM_DIR}"

terraform_cmd() {
    terraform -chdir="$TERRAFORM_DIR" "$@"
}

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

get_tf_output() {
    local output_name="${1:-}"
    [[ -n "$output_name" ]] || return

    local raw_value
    if raw_value=$(terraform_cmd output -raw "$output_name" 2>/dev/null); then
        echo "$raw_value"
        return
    fi

    local json_value
    json_value=$(terraform_cmd output -json "$output_name" 2>/dev/null || echo "")

    if [[ -z ${json_value//[$'\n\r\t ']/} ]]; then
        echo ""
        return
    fi

    printf '%s' "$json_value" | python3 - <<'PY'
import json
import sys

try:
    data = json.load(sys.stdin)
except Exception:
    print("")
    sys.exit(0)

if isinstance(data, dict):
    data = data.get("value", "")

if data is None:
    print("")
elif isinstance(data, (list, tuple)):
    print(",".join(str(item) for item in data))
elif isinstance(data, (str, int, float, bool)):
    print(data)
else:
    print("")
PY
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
    local DEFAULT_DB_DELETION_PROTECTION="true"
    if [[ "${ENV,,}" != "production" ]]; then
        DEFAULT_DB_DELETION_PROTECTION="false"
    fi
    DB_DELETION_PROTECTION_VALUE=$(normalize_bool "${DB_DELETION_PROTECTION:-$DEFAULT_DB_DELETION_PROTECTION}")
    DB_ENABLE_PI_VALUE=$(normalize_bool "${DB_ENABLE_PERFORMANCE_INSIGHTS:-true}")

    SSH_CIDRS_VALUE=$(format_json_list "${SSH_ALLOWED_CIDRS:-}" '[]')

    BACKEND_HTTP_RAW="${BACKEND_HTTP_CIDRS:-}"
    if [[ -z "$BACKEND_HTTP_RAW" && -n "${LIGHTSAIL_WORDPRESS_IP:-}" ]]; then
        BACKEND_HTTP_RAW="${LIGHTSAIL_WORDPRESS_IP}/32"
    fi
    BACKEND_HTTP_CIDRS_VALUE=$(format_json_list "$BACKEND_HTTP_RAW" '[]')

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

    if [[ $SSH_CIDRS_VALUE == '[]' ]]; then
        echo -e "${YELLOW}⚠️ Advertencia: SSH_ALLOWED_CIDRS está vacío. Se usará 0.0.0.0/0 para evitar bloquear el deploy; define tu IP para endurecer el acceso.${NC}"
    elif [[ $SSH_CIDRS_VALUE == '[\"0.0.0.0/0\"]' ]]; then
        echo -e "${YELLOW}⚠️ Advertencia: SSH_ALLOWED_CIDRS permite acceso SSH desde cualquier IP. Restringe este valor para producción.${NC}"
    fi
    if [[ $BACKEND_HTTP_CIDRS_VALUE == '[]' ]]; then
        echo -e "${YELLOW}⚠️ Advertencia: BACKEND_HTTP_CIDRS está vacío. La API solo será accesible desde la VPC; agrega rangos externos si lo necesitas.${NC}"
    elif [[ $BACKEND_HTTP_CIDRS_VALUE == '[\"0.0.0.0/0\"]' ]]; then
        echo -e "${YELLOW}⚠️ Advertencia: BACKEND_HTTP_CIDRS permite consumir la API desde cualquier IP. Limita este valor para producción.${NC}"
    fi
}


# Función para aplicar la infraestructura con Terraform
deploy_with_terraform() {
    if [[ "$VERIFY_ONLY" == true ]]; then
        echo -e "${BLUE}🧪 Verificando infraestructura con Terraform (plan)...${NC}"
    else
        echo -e "${BLUE}🏗️ Desplegando infraestructura con Terraform...${NC}"
    fi
    
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
    
    # Inicializar Terraform
    echo -e "${BLUE}🔧 Inicializando Terraform...${NC}"
    terraform_cmd init -input=false
    
    if [[ "$VERIFY_ONLY" == true ]]; then
        terraform_cmd plan -input=false
        CLOUD_FRONT_ENABLED=$(get_tf_output cloudfront_domain_name)
        FRONTEND_SITE=$(get_tf_output frontend_website_endpoint)
        if [[ -n ${FRONTEND_SITE//[$'\n\r\t ']/} ]]; then
            echo -e "${BLUE}ℹ️ Website S3 detectado: ${YELLOW}$FRONTEND_SITE${NC}"
        elif [[ -n ${CLOUD_FRONT_ENABLED//[$'\n\r\t ']/} ]]; then
            echo -e "${BLUE}ℹ️ CloudFront activo: ${YELLOW}$CLOUD_FRONT_ENABLED${NC}"
        elif [[ "${ALLOW_PUBLIC_FRONTEND_BUCKET,,}" == "true" ]]; then
            echo -e "${YELLOW}⚠️ No se detecta website S3 ni CloudFront; recuerda habilitar al menos uno para el modo prueba.${NC}"
        fi
        return 0
    fi

    # Aplicar la configuración
    echo -e "${BLUE}🚀 Aplicando configuración de Terraform...${NC}"
    terraform_cmd apply -auto-approve -input=false
    
    # Procesar outputs de Terraform en formato JSON
    backend_instance_ip=$(get_tf_output backend_public_ip)
    db_endpoint=$(get_tf_output db_endpoint)
    frontend_endpoint=$(get_tf_output frontend_website_endpoint)
    assets_bucket_name=$(get_tf_output assets_bucket_name)
    assets_bucket_url=$(get_tf_output assets_bucket_url)
    cloudfront_domain=$(get_tf_output cloudfront_domain_name)
    backend_key_path=$(get_tf_output backend_private_key_path)
    app_fqdn=$(get_tf_output app_fqdn)
    api_fqdn=$(get_tf_output api_fqdn)
    db_instance_id=$(get_tf_output db_instance_id)
    wordpress_fqdn=$(get_tf_output wordpress_fqdn)

    if [[ -z ${backend_instance_ip// /} ]]; then
        die "Terraform no devolvió backend_public_ip. Verifica el módulo de EC2."
    fi

    if [[ -z ${db_endpoint// /} ]]; then
        die "Terraform no devolvió db_endpoint. Revisa el despliegue de RDS."
    fi

    local frontend_url=""

    if [[ -n "$cloudfront_domain" ]]; then
        frontend_url="https://$cloudfront_domain"
    elif [[ -n "$frontend_endpoint" ]]; then
        frontend_url="http://$frontend_endpoint"
    elif [[ -n "$assets_bucket_url" ]]; then
        frontend_url="$assets_bucket_url"
        echo -e "${YELLOW}⚠️ Advertencia: se usará la URL del bucket de assets como referencia. Asegúrate de habilitar CloudFront o el modo website para el frontend.${NC}"
    else
        die "No se pudo determinar un endpoint para el frontend."
    fi

    if [[ -z "$assets_bucket_url" && -n "$assets_bucket_name" ]]; then
        assets_bucket_url="https://${assets_bucket_name}.s3.${AWS_REGION:-us-east-1}.amazonaws.com"
    fi

    if [[ -n "$wordpress_fqdn" ]]; then
        wordpress_fqdn="${wordpress_fqdn%.}"
    fi

    local wordpress_url=""
    if [[ -n "$wordpress_fqdn" ]]; then
        wordpress_url="https://$wordpress_fqdn"
    elif [[ -n "${WORDPRESS_SUBDOMAIN:-}" && -n "${DOMAIN_NAME:-}" ]]; then
        local combined_domain="${WORDPRESS_SUBDOMAIN}.${DOMAIN_NAME}"
        wordpress_url="https://${combined_domain%.}"
    elif [[ -n "${LIGHTSAIL_WORDPRESS_IP:-}" ]]; then
        wordpress_url="http://${LIGHTSAIL_WORDPRESS_IP}"
    fi

    # Resolver ruta real del archivo PEM
    local resolved_key_path="$backend_key_path"
    if [[ -n "$resolved_key_path" && ! -f "$resolved_key_path" ]]; then
        if [[ "$resolved_key_path" == ./* ]]; then
            local candidate="$TERRAFORM_DIR/${resolved_key_path#./}"
            [[ -f "$candidate" ]] && resolved_key_path="$candidate"
        elif [[ "$resolved_key_path" != /* ]]; then
            local candidate="$TERRAFORM_DIR/$resolved_key_path"
            [[ -f "$candidate" ]] && resolved_key_path="$candidate"
        fi
    fi

    # Copiar el archivo de clave privada a la raíz para acceso más fácil
    if [[ -n "$resolved_key_path" && -f "$resolved_key_path" ]]; then
        echo -e "${BLUE}📂 Copiando archivo de clave privada SSH...${NC}"
        cp -f "$resolved_key_path" ./.ec2-key.pem
        chmod 600 ./.ec2-key.pem
    else
        echo -e "${YELLOW}⚠️ No se encontró el archivo PEM generado por Terraform (${backend_key_path}).${NC}"
        echo -e "${YELLOW}⚠️ Si se creó previamente, verifica manualmente su ubicación en infra/.${NC}"
    fi

    # Definir la ruta de la clave SSH para uso posterior
    export KEY_PATH="./.ec2-key.pem"
    export DB_INSTANCE_ID="$db_instance_id"

    # Exportar variables para uso posterior
    export BACKEND_IP=$backend_instance_ip
    export DB_ENDPOINT=$db_endpoint
    export FRONTEND_URL=$frontend_url
    export ASSETS_BUCKET=$assets_bucket_name
    export ASSETS_BUCKET_URL=$assets_bucket_url
    export CLOUDFRONT_DOMAIN=$cloudfront_domain
    export APP_FQDN=$app_fqdn
    export API_FQDN=$api_fqdn
    export WORDPRESS_URL=$wordpress_url
    export WORDPRESS_FQDN=$wordpress_fqdn

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
    if [[ -n "$WORDPRESS_URL" ]]; then
        echo -e "  - WordPress: ${YELLOW}$WORDPRESS_URL${NC}"
    elif [[ -n "${LIGHTSAIL_WORDPRESS_IP:-}" ]]; then
        echo -e "  - WordPress: ${YELLOW}http://${LIGHTSAIL_WORDPRESS_IP}${NC}"
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

    DEFAULT_STATIC_PATH=$REAL_URL_FRONT

    local NORMALIZED_FRONT="${REAL_URL_FRONT%/}"
    local NORMALIZED_BACK="${REAL_URL_BACK%/}"

    local FRONTEND_BASE_URL_VALUE="$NORMALIZED_FRONT"

    local DEFAULT_PAYMENT_REDIRECT="${FRONTEND_BASE_URL_VALUE}/events/payment-status"

    local PAYMENTS_REDIRECT_URL_VALUE="${PAYMENTS_REDIRECT_URL:-$DEFAULT_PAYMENT_REDIRECT}"
    local WOMPI_REDIRECT_URL_VALUE="${WOMPI_REDIRECT_URL:-$DEFAULT_PAYMENT_REDIRECT}"

    # URLs derivadas automáticamente (se exportan solo si la aplicación las requiere en el futuro)
    S3_REGION=${AWS_REGION:-us-east-1}
    
    # Frontend .env
    cat <<EOL >"$FRONTEND_ENV_PATH"
# Variables de entorno Generales
VITE_NAME=$NAME
VITE_ENV=$ENV

# Variables de archivos estáticos
VITE_STATIC_FILE_PATH=$DEFAULT_STATIC_PATH

# Configuración de URLs
VITE_URL=$FRONTEND_BASE_URL_VALUE
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
AWS_DEFAULT_REGION=$S3_REGION
S3_REGION=$S3_REGION
S3_BUCKET=$ASSETS_BUCKET
ASSETS_BUCKET_URL=$ASSETS_BUCKET_URL
AWS_ACCESS_KEY=$AWS_ACCESS_KEY
AWS_SECRET_KEY=$AWS_SECRET_KEY
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_KEY
AWS_SESSION_TOKEN=$AWS_SESSION_TOKEN

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
    local repo_lowercase
    repo_lowercase=$(echo "$GITHUB_REPO" | tr '[:upper:]' '[:lower:]')
    local repo_owner
    repo_owner=$(echo "$GITHUB_REPO" | cut -d'/' -f1)
    
    # Login a GitHub Container Registry
    echo -e "${YELLOW}🔑 Iniciando sesión en GitHub Container Registry...${NC}"
    echo "$GHCR_TOKEN" | docker login ghcr.io -u "$repo_owner" --password-stdin
    
    # Construir y subir imagen del backend
    echo -e "${BLUE}🏗️ Construyendo imagen de backend...${NC}"
    docker build -t "ghcr.io/$repo_lowercase/backend:latest" ./backend
    echo -e "${BLUE}📤 Subiendo imagen de backend a GHCR...${NC}"
    docker push "ghcr.io/$repo_lowercase/backend:latest"
    
    # Construir y subir imagen del frontend
    echo -e "${BLUE}🏗️ Construyendo imagen de frontend...${NC}"
    docker build -t "ghcr.io/$repo_lowercase/frontend:latest" ./frontend
    echo -e "${BLUE}📤 Subiendo imagen de frontend a GHCR...${NC}"
    docker push "ghcr.io/$repo_lowercase/frontend:latest"
    
    echo -e "${GREEN}✅ Imágenes construidas y subidas exitosamente${NC}"
}

# Función para configurar la instancia EC2 con la imagen de backend
configure_ec2() {
    echo -e "${BLUE}🔧 Configurando instancia EC2...${NC}"

    if [[ -z "$GHCR_TOKEN" ]]; then
        die "GHCR_TOKEN debe estar definido para configurar el backend."
    fi

    # Verificar si la clave SSH existe
    if [[ ! -f $KEY_PATH ]]; then
        echo -e "${YELLOW}⚠️ Archivo de clave SSH no encontrado en $KEY_PATH${NC}"
        local possible_key
        possible_key=$(find "$TERRAFORM_DIR" -maxdepth 1 -name ".*-ec2-key.pem" | head -n1)
        if [[ -n "$possible_key" && -f "$possible_key" ]]; then
            echo -e "${BLUE}🔑 Usando clave SSH encontrada en $possible_key${NC}"
            cp -f "$possible_key" ./.ec2-key.pem
            chmod 600 ./.ec2-key.pem
            KEY_PATH="./.ec2-key.pem"
        else
            die "No se encontró ninguna clave SSH válida"
        fi
    fi

    if [[ -z "$BACKEND_IP" || "$BACKEND_IP" == "null" ]]; then
        die "No se obtuvo una IP válida para la instancia EC2."
    fi

    local backend_domain_value="${API_FQDN:-}"
    local proxy_tls_email="${TLS_CONTACT_EMAIL:-}"
    if [[ -z "$proxy_tls_email" ]]; then
        if [[ -n "${LETSENCRYPT_EMAIL:-}" ]]; then
            proxy_tls_email="${LETSENCRYPT_EMAIL}"
        elif [[ -n "${MAIL:-}" ]]; then
            proxy_tls_email="${MAIL}"
        elif [[ -n "${ADMIN_EMAIL:-}" ]]; then
            proxy_tls_email="${ADMIN_EMAIL}"
        fi
    fi

    # Crear script de configuración que se ejecutará en la instancia
    local setup_script="${TERRAFORM_DIR}/ec2-setup.sh"
    cat <<'EOL' >"$setup_script"
#!/bin/bash
set -euo pipefail

if [[ -z "${GHCR_TOKEN:-}" || -z "${GITHUB_REPO:-}" || -z "${PORT_BACK:-}" ]]; then
    echo "Variables requeridas no definidas (GHCR_TOKEN, GITHUB_REPO, PORT_BACK)" >&2
    exit 1
fi

if command -v dnf >/dev/null 2>&1; then
    sudo dnf update -y
    sudo dnf install -y docker
else
    sudo yum update -y
    sudo amazon-linux-extras install docker -y
fi

sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user

sudo install -d -o root -g root -m 750 /opt/feeling
sudo mv /home/ec2-user/backend.env /opt/feeling/backend.env
sudo chown root:root /opt/feeling/backend.env
sudo chmod 600 /opt/feeling/backend.env

REPO_OWNER="$(echo "$GITHUB_REPO" | cut -d'/' -f1)"
REPO_SLUG_LOWER="$(echo "$GITHUB_REPO" | tr '[:upper:]' '[:lower:]')"

echo "$GHCR_TOKEN" | sudo docker login ghcr.io -u "$REPO_OWNER" --password-stdin
sudo docker pull ghcr.io/$REPO_SLUG_LOWER/backend:latest

sudo docker network create feeling-net >/dev/null 2>&1 || true

sudo docker stop feeling-backend 2>/dev/null || true
sudo docker rm feeling-backend 2>/dev/null || true

sudo docker run -d \
  --name feeling-backend \
  --network feeling-net \
  --restart unless-stopped \
  -p "$PORT_BACK":"$PORT_BACK" \
  --env-file /opt/feeling/backend.env \
  --log-driver json-file \
  --log-opt max-size=25m \
  --log-opt max-file=3 \
  ghcr.io/$REPO_SLUG_LOWER/backend:latest

if [[ -n "${BACKEND_DOMAIN:-}" ]]; then
  TLS_EMAIL_VALUE="${TLS_EMAIL:-}"

  sudo install -d -o root -g root -m 755 /opt/feeling/caddy
  sudo install -d -o root -g root -m 755 /opt/feeling/caddy-data

  sudo tee /opt/feeling/caddy/Caddyfile >/dev/null <<EOF
${TLS_EMAIL_VALUE:+{
    email ${TLS_EMAIL_VALUE}
}}
${BACKEND_DOMAIN} {
    encode gzip
    reverse_proxy http://feeling-backend:${PORT_BACK}
}
EOF

  sudo docker pull caddy:2
  sudo docker stop feeling-proxy 2>/dev/null || true
  sudo docker rm feeling-proxy 2>/dev/null || true

  sudo docker run -d \
    --name feeling-proxy \
    --network feeling-net \
    --restart unless-stopped \
    -p 80:80 \
    -p 443:443 \
    -v /opt/feeling/caddy/Caddyfile:/etc/caddy/Caddyfile \
    -v /opt/feeling/caddy-data:/data \
    caddy:2
fi
EOL

    chmod +x "$setup_script"

    echo -e "${YELLOW}⏳ Esperando a que la instancia EC2 esté lista (60 segundos)...${NC}"
    sleep 60

    echo -e "${BLUE}🔍 Verificando conectividad SSH...${NC}"
    local max_attempts=10
    local attempt=1
    while [[ $attempt -le $max_attempts ]]; do
        echo -e "${YELLOW}⏳ Intento $attempt de $max_attempts${NC}"
        if ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no -o ConnectTimeout=5 -o BatchMode=yes ec2-user@"$BACKEND_IP" "echo SSH OK" &>/dev/null; then
            echo -e "${GREEN}✅ Conexión SSH establecida${NC}"
            break
        fi
        echo -e "${YELLOW}⚠️ No se pudo establecer conexión. Reintentando...${NC}"
        sleep 15
        attempt=$((attempt+1))
    done

    if [[ $attempt -gt $max_attempts ]]; then
        rm -f "$setup_script"
        die "No se pudo establecer conexión SSH después de $max_attempts intentos."
    fi

    echo -e "${BLUE}📤 Copiando archivos de configuración a la instancia EC2...${NC}"
    scp -i "$KEY_PATH" -o StrictHostKeyChecking=no "$setup_script" ec2-user@"$BACKEND_IP":/home/ec2-user/ec2-setup.sh
    scp -i "$KEY_PATH" -o StrictHostKeyChecking=no "$BACKEND_ENV_PATH" ec2-user@"$BACKEND_IP":/home/ec2-user/backend.env

    echo -e "${BLUE}🔄 Ejecutando script de configuración en la instancia EC2...${NC}"
    ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ec2-user@"$BACKEND_IP" \
        "chmod +x /home/ec2-user/ec2-setup.sh && GHCR_TOKEN='${GHCR_TOKEN}' GITHUB_REPO='${GITHUB_REPO}' PORT_BACK='${PORT_BACK}' BACKEND_DOMAIN='${backend_domain_value}' TLS_EMAIL='${proxy_tls_email}' /home/ec2-user/ec2-setup.sh"

    rm -f "$setup_script"

    echo -e "${GREEN}✅ Instancia EC2 configurada exitosamente${NC}"
}

build_frontend_assets() {
    echo -e "${BLUE}🔨 Compilando frontend...${NC}"

    local npm_bin
    npm_bin=$(command -v npm || true)

    echo -e "${BLUE}🧹 Limpiando dependencias previas del frontend...${NC}"
    rm -rf ./frontend/node_modules ./frontend/.npm

    if [[ -n "$npm_bin" && "$npm_bin" != *".exe" ]]; then
        local npm_install_cmd=("npm" "install")
        if [[ -f "./frontend/package-lock.json" ]]; then
            npm_install_cmd=("npm" "ci")
        fi
        (cd ./frontend && "${npm_install_cmd[@]}" && npm run build)
        return
    fi

    echo -e "${YELLOW}⚠️ Detectado npm.exe (entorno Windows). Usando contenedor Node para compilar.${NC}"

    local frontend_abs
    frontend_abs=$(realpath ./frontend)
    local node_image="${NODE_BUILD_IMAGE:-node:20-alpine}"

    docker run --rm \
      -v "$frontend_abs:/app" \
      -w /app \
      "$node_image" \
      sh -c 'rm -rf node_modules .npm && if [ -f package-lock.json ]; then npm ci; else npm install; fi && npm run build'
}

# Función para desplegar el frontend en S3
deploy_frontend_to_s3() {
    echo -e "${BLUE}🚀 Desplegando frontend en S3...${NC}"
    
    # Extraer el nombre del bucket frontend desde Terraform
    local FRONTEND_BUCKET
    FRONTEND_BUCKET=$(terraform_cmd output -raw frontend_bucket_name 2>/dev/null || echo "")
    
    # Si no se pudo obtener, construir manualmente el nombre basado en el prefijo
    if [[ -z "$FRONTEND_BUCKET" ]]; then
        local PROJECT_SLUG=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')
        local ENV_SLUG=$(echo "$ENV" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')
        FRONTEND_BUCKET="${PROJECT_SLUG}-${ENV_SLUG}-frontend"
        echo -e "${YELLOW}⚠️ No se pudo obtener el nombre del bucket desde Terraform, usando valor calculado: $FRONTEND_BUCKET${NC}"
    fi

    # Verificar que el bucket existe
    if ! run_aws s3 ls "s3://$FRONTEND_BUCKET" >/dev/null 2>&1; then
        echo -e "${RED}❌ Error: El bucket $FRONTEND_BUCKET no existe o no tienes permiso para acceder${NC}"
        echo -e "${YELLOW}⚠️ Verificando buckets disponibles...${NC}"
        run_aws s3 ls
        exit 1
    fi
    
    # Compilar el frontend
    build_frontend_assets
    
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
    run_aws s3 sync ./frontend/dist "s3://$FRONTEND_BUCKET" --delete
    
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

if [[ "$VERIFY_ONLY" == true ]]; then
    echo -e "${GREEN}✅ Verificación completada. No se realizaron cambios permanentes.${NC}"
    exit 0
fi

# PASO 3: Crear archivos .env con valores de la infraestructura
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
[[ -n "$DB_INSTANCE_ID" ]] && echo -e "  - ID RDS: ${YELLOW}$DB_INSTANCE_ID${NC}"
echo -e "  - Bucket de assets: ${YELLOW}$ASSETS_BUCKET${NC}"
[[ -n "$ASSETS_BUCKET_URL" ]] && echo -e "  - URL interno de assets: ${YELLOW}$ASSETS_BUCKET_URL${NC}"
[[ -n "$WORDPRESS_URL" ]] && echo -e "  - WordPress: ${YELLOW}$WORDPRESS_URL${NC}"
[[ -n "$CLOUDFRONT_DOMAIN" ]] && echo -e "  - CloudFront: ${YELLOW}https://$CLOUDFRONT_DOMAIN${NC}"
[[ -n "$APP_FQDN" ]] && echo -e "  - Dominio frontend: ${YELLOW}$APP_FQDN${NC}"
[[ -n "$API_FQDN" ]] && echo -e "  - Dominio API: ${YELLOW}$API_FQDN${NC}"
