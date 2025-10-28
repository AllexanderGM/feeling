#!/bin/bash

set -e # Detener ejecución si ocurre un error

### VARIABLES Y VALIDACIONES ###

PROFILE=${1:-local}                     # Si no se pasa parámetro, usar "local" por defecto
VALID_PROFILES=("local" "back" "front" "db") # Perfiles permitidos
# Explicación de perfiles:
# - local: Levanta todo (frontend, backend, base de datos y MinIO)
# - back: Levanta solo el backend, la base de datos y MinIO
# - front: Levanta solo el frontend, la base de datos y MinIO
# - db: Levanta solo la base de datos y MinIO

# Verificar si docker y docker-compose están instalados
if ! command -v docker-compose &>/dev/null; then
  echo "❌ Error: docker-compose no está instalado. Instálalo y vuelve a intentarlo."
  exit 1
fi

# Validar que el perfil sea uno de los permitidos
if [[ ! " ${VALID_PROFILES[@]} " =~ " $PROFILE " ]]; then
  echo "❌ Error: Perfil inválido. Usa: ./setup.sh [local|back|front]"
  exit 1
fi

# Verificar si el archivo .env base existe
if [[ ! -f .env ]]; then
  echo "❌ Error: El archivo .env no existe en la raíz del proyecto."
  exit 1
fi

# Cargar variables de entorno del archivo .env
set -a
source .env
set +a

### CONFIGURACIÓN DE RUTAS ###
FRONTEND_ENV_PATH="./frontend/.env"
BACKEND_ENV_PATH="./backend/.env"

# Concatenar las variables de entorno para las URLs
if [[ $URL == "http://localhost" ]]; then
  URL_FRONT="$URL:$PORT_FRONT"
  URL_BACK="$URL:$PORT_BACK"
else
  URL_FRONT="$URL"
  URL_BACK="$URL"
fi

### FUNCIONES ###

# Función para crear el .env del frontend
create_frontend_env() {
  echo "📂 Creando archivo .env para el frontend en $FRONTEND_ENV_PATH..."
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
VITE_URL_FRONT=$URL_FRONT
VITE_URL_BACK=$URL_BACK

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
}

# Función para crear el .env del backend
create_backend_env() {
  # Definir DB_HOST para los perfiles "front" y "db"
  [[ "$PROFILE" == "front" || "$PROFILE" == "db" ]] && DB_HOST="localhost"

  echo "📂 Creando archivo .env para el backend en $BACKEND_ENV_PATH..."
  cat <<EOL >"$BACKEND_ENV_PATH"
# Variables de entorno Generales
NAME=$NAME
ENV=$ENV

# Configuración de URLs
PORT_FRONT=$PORT_FRONT
PORT_BACK=$PORT_BACK
URL_FRONT=$URL_FRONT
URL_BACK=$URL_BACK

# Configuración de Base de Datos
DB_PORT=$DB_PORT
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_ROOT_PASSWORD=$DB_ROOT_PASSWORD
DB_NAME=$DB_NAME

# Configuración de almacenamiento (MinIO)
MINIO_PORT=$MINIO_PORT
MINIO_PORT_WEB=$MINIO_PORT_WEB
MINIO_ROOT_USER=$MINIO_ROOT_USER
MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD
MINIO_BUCKET=$MINIO_BUCKET

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

# Configuración de Google OAuth
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

# Variables de correo electrónico
MAIL=$MAIL
MAILPASS=$MAILPASS

# Pasarela de pagos
PAYMENTS_GATEWAY=$PAYMENTS_GATEWAY
PAYMENTS_CURRENCY=$PAYMENTS_CURRENCY
PAYMENTS_REDIRECT_URL=$PAYMENTS_REDIRECT_URL

# Configuración Wompi
WOMPI_PUBLIC_KEY=$WOMPI_PUBLIC_KEY
WOMPI_PRIVATE_KEY=$WOMPI_PRIVATE_KEY
WOMPI_INTEGRITY_SECRET=$WOMPI_INTEGRITY_SECRET
WOMPI_API_BASE=$WOMPI_API_BASE
WOMPI_REDIRECT_URL=$WOMPI_REDIRECT_URL
EOL
}

# Función para configurar MinIO
configure_minio() {
  echo "🔧 Configurando MinIO..."
  
  # Esperar a que MinIO esté listo
  echo "⌛ Esperando a que MinIO esté listo..."
  MAX_WAIT=60
  WAIT_TIME=0
  
  while ! curl -s "$MINIO_HOST:$MINIO_PORT/minio/health/live" >/dev/null 2>&1; do
    sleep 2
    WAIT_TIME=$((WAIT_TIME + 2))
    echo "🛠️ MinIO aún iniciando... ($WAIT_TIME/$MAX_WAIT seg)"
    
    if [[ $WAIT_TIME -ge $MAX_WAIT ]]; then
      echo "❌ Error: MinIO no respondió en $MAX_WAIT segundos."
      return 1
    fi
  done
  
  echo "✅ MinIO está listo. Configurando bucket y políticas..."
  
  # Configurar MinIO usando docker exec
  docker exec "${NAME}-minio" mc alias set minio http://localhost:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"
  
  # Crear bucket si no existe
  if ! docker exec "${NAME}-minio" mc ls minio/"$MINIO_BUCKET" >/dev/null 2>&1; then
    echo "📁 Creando bucket: $MINIO_BUCKET"
    docker exec "${NAME}-minio" mc mb minio/"$MINIO_BUCKET"
  else
    echo "📁 Bucket $MINIO_BUCKET ya existe"
  fi
  
  # Configurar política pública
  echo "🔓 Configurando política pública para el bucket: $MINIO_BUCKET"
  docker exec "${NAME}-minio" mc anonymous set public minio/"$MINIO_BUCKET"
  
  echo "✅ MinIO configurado correctamente!"
}

### EJECUCIÓN ###

# Crear archivos .env para todos los perfiles
create_frontend_env
create_backend_env

echo "✅ Archivos .env creados exitosamente"

# Destruir y reconstruir solo contenedores de desarrollo (frontend/backend)
if [[ "$PROFILE" == "back" || "$PROFILE" == "local" ]]; then
  echo "🛑 Deteniendo y removiendo contenedor del backend..."
  docker-compose -p "$NAME" stop backend 2>/dev/null || true
  docker-compose -p "$NAME" rm -f backend 2>/dev/null || true
  echo "🔨 Eliminando imagen del backend para forzar reconstrucción..."
  docker rmi "${NAME}-backend" 2>/dev/null || true
fi

if [[ "$PROFILE" == "front" || "$PROFILE" == "local" ]]; then
  echo "🛑 Deteniendo y removiendo contenedor del frontend..."
  docker-compose -p "$NAME" stop frontend 2>/dev/null || true
  docker-compose -p "$NAME" rm -f frontend 2>/dev/null || true
  echo "🔨 Eliminando imagen del frontend para forzar reconstrucción..."
  docker rmi "${NAME}-frontend" 2>/dev/null || true
fi

echo "🚀 Iniciando Docker Compose con el perfil '$PROFILE'..."
docker-compose --profile "$PROFILE" up -d --build
docker-compose ps

# Esperar backend esté listo
if [[ "$PROFILE" == "back" || "$PROFILE" == "local" ]]; then
  echo "⌛ Esperando a que el backend esté listo..."
  MAX_WAIT=120 # Segundos
  WAIT_TIME=0

  while ! curl -s "$URL_BACK" >/dev/null; do
    sleep 5
    WAIT_TIME=$((WAIT_TIME + 5))
    echo "🛠️ Backend aún creando recursos 💪 ... ($WAIT_TIME/$MAX_WAIT seg)"

    if [[ $WAIT_TIME -ge $MAX_WAIT ]]; then
      echo "❌ Error: El backend no respondió en $MAX_WAIT segundos."
      exit 1
    fi
  done

  echo "✅ Backend disponible!"
fi

# Configurar MinIO para todos los perfiles que lo usan
if [[ "$PROFILE" == "back" || "$PROFILE" == "front" || "$PROFILE" == "local" || "$PROFILE" == "db" ]]; then
  configure_minio
fi

### MENSAJE FINAL ###

[[ "$PROFILE" == "front" || "$PROFILE" == "local" ]] && echo "🔗 Puedes acceder al frontend en: $URL_FRONT"
[[ "$PROFILE" == "back" || "$PROFILE" == "local" ]] && echo "🔗 Puedes acceder al backend en: $URL_BACK"
[[ "$PROFILE" == "db" || "$PROFILE" == "back" || "$PROFILE" == "local" || "$PROFILE" == "front" ]] && echo "🔗 Puedes acceder al MinIO WEB en: $MINIO_HOST:$MINIO_PORT_WEB"
[[ "$PROFILE" == "db" || "$PROFILE" == "back" || "$PROFILE" == "local" || "$PROFILE" == "front" ]] && echo "🔗 Puedes acceder al MinIO CLI en: $MINIO_HOST:$MINIO_PORT"

[[ "$PROFILE" == "front" ]] && echo "⚠️ Recuerda levantar el backend manualmente."
[[ "$PROFILE" == "back" ]] && echo "⚠️ Recuerda levantar el frontend manualmente."
[[ "$PROFILE" == "db" ]] && echo "⚠️ Solo se han levantado MySQL y MinIO. Recuerda levantar el backend y frontend manualmente."


echo "🎉 Proceso completado."
