#!/bin/bash

set -e # Detener ejecución si ocurre un error

# Verificar si docker y docker-compose están instalados
if ! command -v docker-compose &>/dev/null; then
    echo "❌ Error: docker-compose no está instalado. Instálalo y vuelve a intentarlo."
    exit 1
fi

# Verificar parámetro 'all' para eliminar volúmenes
if [[ "$1" == "all" ]]; then
    echo "🧹🧼 Deteniendo y eliminando contenedores, imágenes, redes Y VOLÚMENES..."
    
    # Detener todos los contenedores primero
    docker-compose down --remove-orphans || true
    
    # Forzar eliminación de contenedores restantes
    if [ "$(docker ps -aq)" ]; then
        docker ps -aq | xargs docker rm -f || true
    fi
    
    # Eliminar volúmenes específicos del proyecto
    docker volume rm feeling_mysql_data feeling_minio_data 2>/dev/null || true
    
    # Eliminar imágenes
    if [ "$(docker images -q)" ]; then
        docker images -q | xargs docker rmi -f || true
    fi
    
    # Limpiar redes y volúmenes huérfanos
    docker network prune -f || true
    docker volume prune -f || true
    
    echo "✅ Proceso completado. TODO ha sido eliminado incluyendo volúmenes."
else
    echo "🧹🧼 Deteniendo y eliminando contenedores, imágenes y redes sin afectar los volúmenes..."
    
    docker-compose down --rmi all --remove-orphans || true
    docker ps -aq | xargs docker rm -f || true
    docker images -q | xargs docker rmi -f || true
    docker network prune -f || true
    
    echo "✅ Proceso completado. Los volúmenes permanecen intactos."
    echo "💡 Usa './clear.sh all' para eliminar también los volúmenes."
fi
