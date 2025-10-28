#!/bin/bash

# Script de verificación de salud para servicios
# Alternativa gratuita a CloudWatch para monitoreo básico
# Recomendado ejecutar con cron cada 5 minutos
# Ejemplo: */5 * * * * /path/to/healthcheck.sh > /dev/null 2>&1

set -e

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Cargar variables de entorno
if [[ -f .env.prod ]]; then
    source .env.prod
elif [[ -f .env ]]; then
    source .env
else
    echo -e "${RED}❌ No se encontró archivo de variables de entorno (.env.prod o .env)${NC}"
    exit 1
fi

# Función para verificar servicio HTTP
check_http_service() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}

    echo -e "${BLUE}🔍 Verificando $name en $url (esperando $expected_status)${NC}"

    # Intentar hasta 3 veces en caso de errores temporales
    for i in {1..3}; do
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" $url || echo "Error")

        if [[ "$STATUS" == "$expected_status" ]]; then
            echo -e "${GREEN}✅ $name está funcionando correctamente${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️ $name devolvió estado $STATUS (intento $i/3)${NC}"
            sleep 2
        fi
    done

    echo -e "${RED}❌ $name no está respondiendo correctamente después de 3 intentos${NC}"
    return 1
}

# Función para verificar Docker
check_docker_container() {
    local container_name=$1
    local restart=${2:-true}

    echo -e "${BLUE}🔍 Verificando contenedor Docker $container_name${NC}"

    if ! docker ps | grep -q $container_name; then
        echo -e "${RED}❌ Contenedor $container_name no está en ejecución${NC}"

        if [[ "$restart" == "true" ]]; then
            echo -e "${YELLOW}🔄 Intentando reiniciar $container_name...${NC}"

            # Intentar iniciar si existe pero está detenido
            if docker ps -a | grep -q $container_name; then
                docker start $container_name
            else
                echo -e "${RED}❌ El contenedor $container_name no existe y no se puede reiniciar${NC}"
                return 1
            fi

            # Verificar si el inicio fue exitoso
            sleep 5
            if docker ps | grep -q $container_name; then
                echo -e "${GREEN}✅ Contenedor $container_name reiniciado exitosamente${NC}"
                return 0
            else
                echo -e "${RED}❌ No se pudo reiniciar el contenedor $container_name${NC}"
                return 1
            fi
        fi

        return 1
    else
        echo -e "${GREEN}✅ Contenedor $container_name está en ejecución${NC}"
        return 0
    fi
}

# Función para verificar uso de disco
check_disk_usage() {
    local threshold=${1:-90} # Porcentaje de uso por defecto: 90%

    echo -e "${BLUE}🔍 Verificando uso de disco (umbral: $threshold%)${NC}"

    local usage=$(df / | grep -v Filesystem | awk '{print $5}' | sed 's/%//')

    if [[ $usage -gt $threshold ]]; then
        echo -e "${RED}❌ Uso de disco crítico: $usage% (supera el umbral de $threshold%)${NC}"

        # Intentar limpiar espacio
        echo -e "${YELLOW}🧹 Ejecutando limpieza de emergencia...${NC}"
        docker system prune -af --volumes

        return 1
    else
        echo -e "${GREEN}✅ Uso de disco aceptable: $usage%${NC}"
        return 0
    fi
}

# Verificar backend
if [[ "$ENV" == "production" ]]; then
    # Entorno de producción (AWS)
    if ! check_http_service "Backend API" "http://localhost:$PORT_BACK/health"; then
        echo -e "${YELLOW}🔄 Intentando reiniciar el servicio de backend...${NC}"
        check_docker_container "feeling-backend" true
    fi

    # Verificar espacio en disco
    check_disk_usage 85

    # Verificar logs que ocupan mucho espacio
    echo -e "${BLUE}🔍 Verificando logs que ocupan mucho espacio...${NC}"
    large_logs=$(find /var/log -type f -size +100M 2>/dev/null || true)
    if [[ -n "$large_logs" ]]; then
        echo -e "${YELLOW}⚠️ Logs que ocupan mucho espacio:${NC}"
        echo "$large_logs"

        echo -e "${YELLOW}🧹 Limpiando logs más grandes...${NC}"
        echo "$large_logs" | xargs -I{} truncate -s 0 {} 2>/dev/null || true
    else
        echo -e "${GREEN}✅ No se encontraron logs que ocupen demasiado espacio${NC}"
    fi
else
    # Entorno local
    for service in "backend" "mysql" "minio"; do
        check_docker_container "${NAME}-${service}_" true
    done

    # Verificar API del backend
    check_http_service "Backend API" "http://localhost:$PORT_BACK"

    # Verificar MinIO
    check_http_service "MinIO API" "http://localhost:$MINIO_PORT" "403"

    # Verificar Frontend si está en perfil local o front
    if [[ "$PROFILE" == "local" || "$PROFILE" == "front" ]]; then
        check_http_service "Frontend" "http://localhost:$PORT_FRONT"
    fi
fi

echo -e "${GREEN}🎉 Verificación de salud completada exitosamente${NC}"
