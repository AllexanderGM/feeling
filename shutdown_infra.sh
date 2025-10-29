#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")/infra"

if [ ! -f terraform.tfstate ]; then
    echo "No se encontró terraform.tfstate. Asegúrate de haber desplegado antes de apagar." >&2
    exit 1
fi

if terraform state show module.backend_instance.aws_instance.this[0] >/dev/null 2>&1; then
    echo "📴 Deteniendo instancia EC2..."
    INSTANCE_ID=$(terraform output -raw backend_instance_id 2>/dev/null || true)
    if [ -n "$INSTANCE_ID" ]; then
        aws ec2 stop-instances --instance-ids "$INSTANCE_ID"
    else
        echo "No se pudo obtener el ID de la instancia; ejecuta manualmente 'aws ec2 stop-instances'." >&2
    fi
else
    echo "La instancia EC2 no existe en el state." >&2
fi

if terraform state show module.rds.module.db_instance.aws_db_instance.this[0] >/dev/null 2>&1; then
    echo "📴 Deteniendo instancia RDS..."
    DB_ID=$(terraform output -raw db_instance_id 2>/dev/null || true)
    if [ -n "$DB_ID" ]; then
        aws rds stop-db-instance --db-instance-identifier "$DB_ID"
    else
        echo "No se pudo obtener el identificador de RDS; ejecuta manualmente 'aws rds stop-db-instance'." >&2
    fi
else
    echo "La instancia RDS no existe en el state." >&2
fi

echo "✅ Recursos principales enviados a detener"
