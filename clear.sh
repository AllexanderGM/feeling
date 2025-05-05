#!/bin/bash

set -e # Detener ejecución si ocurre un error

# Verificar si docker y docker-compose están instalados
if ! command -v docker-compose &>/dev/null; then
    echo "❌ Error: docker-compose no está instalado. Instálalo y vuelve a intentarlo."
    exit 1
fi

echo "🧹🧼 Deteniendo y eliminando contenedores, imágenes y redes sin afectar los volúmenes..."

docker-compose down --rmi all --remove-orphans || true
docker ps -aq | xargs docker rm -f || true
docker images -q | xargs docker rmi -f || true
docker network prune -f || true

echo "✅ Proceso completado. Los volúmenes permanecen intactos."
