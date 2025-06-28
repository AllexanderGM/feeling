#!/bin/bash

set -e # Detener ejecución si ocurre un error

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
if [[ -z "$AWS_ACCESS_KEY" || -z "$AWS_SECRET_KEY" ]]; then
    echo -e "${RED}❌ Error: AWS_ACCESS_KEY y AWS_SECRET_KEY deben estar definidas en .env.prod${NC}"
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

### FUNCIONES ###

# Función para crear el archivo terraform.tfvars
create_terraform_vars() {
    echo -e "${BLUE}📂 Creando archivo terraform.tfvars...${NC}"

    # Escape cualquier carácter especial en las contraseñas
    ESCAPED_DB_PASSWORD=$(echo "$DB_PASSWORD" | sed 's/\\/\\\\/g; s/"/\\"/g')
    ESCAPED_DB_ROOT_PASSWORD=$(echo "$DB_ROOT_PASSWORD" | sed 's/\\/\\\\/g; s/"/\\"/g')
    
    # Terraform variables
    cat <<EOL >"$TERRAFORM_VARS_PATH"
# AWS Credentials
aws_access_key = "$AWS_ACCESS_KEY"
aws_secret_key = "$AWS_SECRET_KEY"

# Prefijo para recursos
prefix         = "$NAME"

# Database
db_name        = "$DB_NAME"
db_user        = "$DB_USER"
db_password    = "$ESCAPED_DB_PASSWORD"
db_port        = $DB_PORT

# EC2 Key
key_name       = "${NAME}-key"
EOL

    echo -e "${GREEN}✅ Archivo terraform.tfvars creado exitosamente${NC}"
}


# Función para aplicar la infraestructura con Terraform
deploy_with_terraform() {
    echo -e "${BLUE}🏗️ Desplegando infraestructura con Terraform...${NC}"
    
    # Exportar variables de AWS para Terraform
    export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY
    export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_KEY
    
    # Cambiar al directorio de Terraform
    cd $TERRAFORM_DIR
    
    # Inicializar Terraform
    echo -e "${BLUE}🔧 Inicializando Terraform...${NC}"
    terraform init
    
    # Aplicar la configuración
    echo -e "${BLUE}🚀 Aplicando configuración de Terraform...${NC}"
    terraform apply -auto-approve
    
    # Obtener outputs importantes (las variables se mantienen en este scope)
    backend_instance_ip=$(terraform output -raw backend_instance_ip)
    db_endpoint=$(terraform output -raw db_endpoint)
    frontend_url=$(terraform output -raw frontend_url)
    images_bucket_name=$(terraform output -raw images_bucket_name)
    
    # Copiar el archivo de clave privada a la raíz para acceso más fácil
    # y asegurarnos de que sea accesible solo por el usuario actual
    echo -e "${BLUE}📂 Copiando archivo de clave privada SSH...${NC}"
    cp -f ./.ec2-key.pem ../.ec2-key.pem
    chmod 600 ../.ec2-key.pem
    
    # Volver al directorio raíz
    cd ..
    
    # Definir la ruta de la clave SSH para uso posterior
    export KEY_PATH="./.ec2-key.pem"
    
    # Exportar variables para uso posterior
    export BACKEND_IP=$backend_instance_ip
    export DB_ENDPOINT=$db_endpoint
    export FRONTEND_URL=$frontend_url 
    export IMAGES_BUCKET=$images_bucket_name
    
    echo -e "${GREEN}✅ Infraestructura desplegada exitosamente${NC}"
    echo -e "${BLUE}📋 Información de despliegue:${NC}"
    echo -e "  - IP Backend: ${YELLOW}$BACKEND_IP${NC}"
    echo -e "  - Endpoint DB: ${YELLOW}$DB_ENDPOINT${NC}"
    echo -e "  - URL Frontend: ${YELLOW}$FRONTEND_URL${NC}"
    echo -e "  - Bucket imágenes: ${YELLOW}$IMAGES_BUCKET${NC}"
    echo -e "  - Clave SSH: ${YELLOW}$KEY_PATH${NC}"
}

# Función para crear archivos .env con valores reales de la infraestructura
create_env_files() {
    echo -e "${BLUE}📂 Creando archivos .env con los valores reales de la infraestructura...${NC}"
    
    # Extraer solo el hostname del endpoint de la base de datos (sin el puerto)
    DB_HOST=$(echo $DB_ENDPOINT | cut -d':' -f1)
    
    # Definir URLs basadas en la infraestructura real
    REAL_URL_BACK="http://$BACKEND_IP:$PORT_BACK"
    REAL_URL_FRONT="https://$FRONTEND_URL"
    
    # Frontend .env
    cat <<EOL >"$FRONTEND_ENV_PATH"
# Variables de entorno Generales
VITE_NAME=$NAME
VITE_ENV=$ENV

# Variables de archivos estáticos
VITE_STATIC_FILE_PATH=$STATIC_FILE_PATH

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

# Configuración de AWS S3
AWS_ACCESS_KEY=$AWS_ACCESS_KEY
AWS_SECRET_KEY=$AWS_SECRET_KEY
S3_BUCKET=$IMAGES_BUCKET

# Variables de encriptación
ALGORITHM=$ALGORITHM
KEY=$KEY
IV=$IV

# Configuración de sesión y autenticación
SESSION_SECRET=$SESSION_SECRET
JWT_SECRET=$JWT_SECRET
JWT_EXPIRATION=$JWT_EXPIRATION
JWT_REFRESH_EXPIRATION=$JWT_REFRESH_EXPIRATION
ADMIN_USERNAME=$ADMIN_USERNAME
ADMIN_PASSWORD=$ADMIN_PASSWORD

# Variables de correo electrónico
MAIL=$MAIL
MAILPASS=$MAILPASS
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
        echo -e "${YELLOW}⚠️ Intentando buscar la clave en $TERRAFORM_DIR/.ec2-key.pem${NC}"
        
        if [[ -f "$TERRAFORM_DIR/.ec2-key.pem" ]]; then
            echo -e "${BLUE}🔑 Usando clave SSH desde $TERRAFORM_DIR/.ec2-key.pem${NC}"
            cp -f "$TERRAFORM_DIR/.ec2-key.pem" ./.ec2-key.pem
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

# Crear archivo .env para el backend (usar el directorio ec2-user, no ubuntu)
cat <<'EOF' > /home/ec2-user/.env
$(cat $BACKEND_ENV_PATH)
EOF

# Login a GitHub Container Registry y descargar imagen
echo "$GHCR_TOKEN" | sudo docker login ghcr.io -u $(echo $GITHUB_REPO | cut -d'/' -f1) --password-stdin
sudo docker pull ghcr.io/$GITHUB_REPO_LOWERCASE/backend:latest

# Detener contenedor existente si existe
sudo docker stop backend 2>/dev/null || true
sudo docker rm backend 2>/dev/null || true

# Ejecutar nuevo contenedor
sudo docker run -d --name backend -p $PORT_BACK:$PORT_BACK --env-file /home/ec2-user/.env ghcr.io/$GITHUB_REPO_LOWERCASE/backend:latest
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
        FRONTEND_BUCKET="${lower(replace(NAME, "_", "-"))}-frontend"
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
    BACKEND_URL="http://$BACKEND_IP:$PORT_BACK"
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL 2>/dev/null || echo "Error")
    
    if [[ "$BACKEND_STATUS" == "200" ]]; then
        echo -e "${GREEN}✅ Backend responde correctamente${NC}"
    else
        echo -e "${YELLOW}⚠️ Backend no responde con código 200 (recibido: $BACKEND_STATUS)${NC}"
        echo -e "${YELLOW}⚠️ Esto puede ser normal si la aplicación necesita tiempo para iniciar${NC}"
        echo -e "${YELLOW}⚠️ Intenta acceder manualmente a: ${BACKEND_URL}/health${NC}"
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
echo -e "  - Backend desplegado en: ${YELLOW}http://$BACKEND_IP:$PORT_BACK${NC}"
echo -e "  - Frontend desplegado en: ${YELLOW}$FRONTEND_URL${NC}"
echo -e "  - Base de datos: ${YELLOW}$DB_ENDPOINT${NC}"
echo -e "  - Bucket de imágenes: ${YELLOW}$IMAGES_BUCKET${NC}"