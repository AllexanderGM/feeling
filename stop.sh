#!/bin/bash

set -e # Detener ejecución si ocurre un error

# Verificar si docker y docker-compose están instalados
if ! command -v docker-compose &>/dev/null; then
    echo "❌ Error: docker-compose no está instalado. Instálalo y vuelve a intentarlo."
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

echo "🛑 Deteniendo contenedores..."

docker-compose -p $NAME down
docker ps -a --filter "name=$NAME"

echo "✅ Proceso completado."
