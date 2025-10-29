#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")/infra"

if [ -d .terraform ]; then
    echo "📂 Inicializando Terraform por si acaso..."
    terraform init -input=false >/dev/null
fi

echo "🧨 Ejecutando terraform destroy"
terraform destroy "$@"
