#!/bin/bash

# Script de backup para la base de datos - optimizado para capa gratuita de AWS
# Se recomienda ejecutar periódicamente con cron
# Ejemplo: 0 2 * * 0 /path/to/backup.sh > /path/to/backup.log 2>&1

set -e

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Función para manejar errores
handle_error() {
    echo -e "${RED}❌ Error en la línea $1${NC}"
    exit 1
}

trap 'handle_error $LINENO' ERR

# Cargar variables de entorno
if [[ -f .env.prod ]]; then
    echo -e "${BLUE}📂 Cargando variables de entorno de .env.prod${NC}"
    source .env.prod
elif [[ -f .env ]]; then
    echo -e "${BLUE}📂 Cargando variables de entorno de .env${NC}"
    source .env
else
    echo -e "${RED}❌ No se encontró archivo de variables de entorno (.env.prod o .env)${NC}"
    exit 1
fi

# Configurar variables
DATE=$(date +%Y-%m-%d-%H-%M)
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/backup-$DATE.sql"
KEEP_DAYS=7 # Retención para mantenerse dentro de límites de capa gratuita

# Obtener endpoint de base de datos desde Terraform (si estamos en AWS)
if command -v terraform &>/dev/null && [[ -d ./infra ]]; then
    echo -e "${BLUE}🔍 Obteniendo información de la infraestructura...${NC}"
    (cd ./infra && terraform refresh >/dev/null)
    DB_HOST=$(cd ./infra && terraform output -raw db_endpoint | cut -d':' -f1)
    echo -e "${BLUE}📊 Base de datos detectada: $DB_HOST${NC}"
else
    # Si no hay Terraform, usar variables del .env
    echo -e "${YELLOW}⚠️ No se detectó Terraform, usando variables de entorno${NC}"
    DB_HOST="${DB_HOST:-localhost}"
fi

# Crear directorio de backup si no existe
mkdir -p $BACKUP_DIR

# Realizar backup dependiendo del entorno
echo -e "${BLUE}🚀 Iniciando backup de la base de datos $DB_NAME en $DB_HOST...${NC}"

if [[ "$DB_HOST" == "localhost" || "$DB_HOST" == "mysql" ]]; then
    # Entorno local con Docker
    echo -e "${BLUE}🐳 Detectado entorno local con Docker${NC}"
    docker exec -i ${NAME}-mysql_db mysqldump -u$DB_USER -p$DB_PASSWORD $DB_NAME >$BACKUP_FILE
else
    # Entorno AWS
    echo -e "${BLUE}☁️ Detectado entorno AWS${NC}"
    if command -v mysqldump &>/dev/null; then
        mysqldump -h$DB_HOST -u$DB_USER -p$DB_PASSWORD $DB_NAME >$BACKUP_FILE
    else
        echo -e "${YELLOW}⚠️ mysqldump no encontrado, usando Docker para crear el backup${NC}"
        docker run --rm mysql:8.0 mysqldump -h$DB_HOST -u$DB_USER -p$DB_PASSWORD $DB_NAME >$BACKUP_FILE
    fi
fi

# Comprimir el backup
echo -e "${BLUE}📦 Comprimiendo backup...${NC}"
gzip -f $BACKUP_FILE
COMPRESSED_FILE="$BACKUP_FILE.gz"

# Calcular tamaño del backup
BACKUP_SIZE=$(du -h $COMPRESSED_FILE | awk '{print $1}')

echo -e "${GREEN}✅ Backup completado: $COMPRESSED_FILE (Tamaño: $BACKUP_SIZE)${NC}"

# Subir a S3 si estamos en AWS y el bucket existe
if [[ -n "$AWS_ACCESS_KEY" && -n "$AWS_SECRET_KEY" && -n "$AWS_REGION" ]]; then
    # Determinar el bucket para los backups
    if [[ -d ./infra ]]; then
        IMAGES_BUCKET=$(cd ./infra && terraform output -raw images_bucket_name 2>/dev/null || echo "")

        if [[ -n "$IMAGES_BUCKET" ]]; then
            echo -e "${BLUE}☁️ Subiendo backup a S3...${NC}"

            # Configurar AWS CLI con las credenciales
            export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY
            export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_KEY
            export AWS_DEFAULT_REGION=$AWS_REGION

            # Subir el backup
            aws s3 cp $COMPRESSED_FILE s3://$IMAGES_BUCKET/backups/

            echo -e "${GREEN}✅ Backup subido a S3: s3://$IMAGES_BUCKET/backups/$(basename $COMPRESSED_FILE)${NC}"

            # Eliminar backups antiguos en S3 (mantener solo los últimos KEEP_DAYS días)
            echo -e "${BLUE}🧹 Eliminando backups antiguos de S3...${NC}"

            OLD_BACKUPS=$(aws s3 ls s3://$IMAGES_BUCKET/backups/ | awk '{print $4}' | grep -E 'backup-[0-9]{4}-[0-9]{2}-[0-9]{2}')
            CURRENT_DATE=$(date +%s)

            for backup in $OLD_BACKUPS; do
                # Extraer la fecha del nombre del archivo (formato: backup-YYYY-MM-DD-HH-MM.sql.gz)
                BACKUP_DATE_STR=$(echo $backup | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}')
                BACKUP_DATE=$(date -d "$BACKUP_DATE_STR" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$BACKUP_DATE_STR" +%s 2>/dev/null)

                # Calcular diferencia en días
                DAYS_DIFF=$(((CURRENT_DATE - BACKUP_DATE) / 86400))

                if [[ $DAYS_DIFF -gt $KEEP_DAYS ]]; then
                    echo -e "${YELLOW}🗑️ Eliminando backup antiguo: $backup (${DAYS_DIFF} días)${NC}"
                    aws s3 rm s3://$IMAGES_BUCKET/backups/$backup
                fi
            done
        else
            echo -e "${YELLOW}⚠️ No se encontró bucket para subir backups${NC}"
        fi
    fi
else
    echo -e "${BLUE}ℹ️ No se detectaron credenciales AWS, omitiendo subida a S3${NC}"
fi

# Eliminar backups locales antiguos
echo -e "${BLUE}🧹 Eliminando backups locales antiguos...${NC}"
find $BACKUP_DIR -name "backup-*.gz" -type f -mtime +$KEEP_DAYS -delete

echo -e "${GREEN}🎉 Proceso de backup completado exitosamente${NC}"
