# Documentación de Infraestructura - DH G2 Final

## Contenido

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Requisitos Previos](#requisitos-previos)
4. [Configuración Inicial](#configuración-inicial)
5. [Despliegue en AWS](#despliegue-en-aws)
6. [Ejecución Local](#ejecución-local)
7. [Estructura de Archivos](#estructura-de-archivos)
8. [Mantenimiento](#mantenimiento)
9. [Solución de Problemas](#solución-de-problemas)

## Descripción General

Este proyecto implementa una arquitectura moderna de tres capas (frontend, backend y base de datos) con almacenamiento de recursos estáticos. La infraestructura se puede desplegar tanto en entornos locales usando Docker como en AWS utilizando Terraform.

## Arquitectura

### Componentes en AWS

- **Frontend**: Alojado en S3 como sitio web estático
- **Backend**: API REST desplegada en una instancia EC2
- **Base de Datos**: MySQL en Amazon RDS
- **Almacenamiento**: Bucket S3 para imágenes y recursos estáticos
- **Redes**: VPC con subredes públicas y privadas

### Componentes en Local

- **Frontend**: Contenedor Docker con Nginx
- **Backend**: Contenedor Docker con Spring Boot
- **Base de Datos**: Contenedor Docker con MySQL
- **Almacenamiento**: Contenedor Docker con MinIO (compatible con S3)

## Requisitos Previos

### Para Despliegue en AWS

- Cuenta de AWS con permisos para crear recursos
- AWS CLI instalado y configurado
- Terraform v1.0.0+ instalado
- Docker instalado
- Git instalado
- Node.js y npm instalados

### Para Ejecución Local

- Docker y Docker Compose instalados
- Git instalado
- Node.js y npm instalados (para desarrollo)

## Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/dh-g2-final.git
cd dh-g2-final
```

### 2. Configurar Variables de Entorno

#### Para Despliegue en AWS

Crea un archivo `.env.prod` en la raíz del proyecto con la siguiente estructura:

```bash
# Variables de entorno Generales
NAME="dh-g2-final"
ENV="production"

# Credenciales AWS
AWS_ACCESS_KEY="tu-access-key-aqui"
AWS_SECRET_KEY="tu-secret-key-aqui"
AWS_REGION="us-east-1"

# GitHub
GITHUB_TOKEN="tu-token-de-github"
REPO_NAME="tu-usuario/tu-repo"

# Configuración de URLs
URL="https://tu-dominio.com"
PORT_FRONT=80
PORT_BACK=8080

# Configuración de Base de Datos
DB_PORT=3306
DB_USER="admin"
DB_PASSWORD="tu-password-segura"
DB_ROOT_PASSWORD="tu-root-password-segura"
DB_NAME="tu-nombre_base_de_datos"

# Variables para archivos estáticos
STATIC_FILE_PATH="/static"

# Variables de encriptación y seguridad
ALGORITHM="aes-256-cbc"
KEY="tu-clave-de-encriptacion-de-32-caracteres"
IV="tu-vector-de-16-caracteres"
SESSION_SECRET="tu-session-secret"
JWT_SECRET="tu-jwt-secret"
JWT_EXPIRATION="4200000"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin-password"
```

#### Para Ejecución Local

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Variables de entorno Generales
NAME="dh-g2-final"
ENV="development"

# Configuración de URLs
URL="http://localhost"
PORT_FRONT=3000
PORT_BACK=8080

# Configuración de Base de Datos
DB_PORT=3306
DB_HOST="mysql"
DB_USER="root"
DB_PASSWORD="password"
DB_ROOT_PASSWORD="password"
DB_NAME="dh_g2_db"

# Configuración de almacenamiento (MinIO)
MINIO_HOST="minio"
MINIO_PORT=9000
MINIO_PORT_WEB=9001
MINIO_ROOT_USER="minioadmin"
MINIO_ROOT_PASSWORD="minioadmin"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="images"

# Variables de encriptación y seguridad
ALGORITHM="aes-256-cbc"
KEY="tu-clave-de-encriptacion-local-de-32-caracteres"
IV="tu-vector-local-de-16-caracteres"
SESSION_SECRET="tu-session-secret-local"
JWT_SECRET="tu-jwt-secret-local"
JWT_EXPIRATION="24h"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin"
```

## Despliegue en AWS

### 1. Preparar el Despliegue

Asegúrate de tener AWS CLI configurado y haber creado el archivo `.env.prod`.

### 2. Ejecutar Script de Despliegue

```bash
chmod +x deploy.sh
./deploy.sh
```

Este script realizará las siguientes acciones:

1. Creará el archivo de configuración para Terraform
2. Desplegará la infraestructura en AWS
3. Generará archivos `.env` para el frontend y backend con los endpoints reales
4. Construirá y subirá las imágenes Docker a GitHub Container Registry
5. Configurará la instancia EC2 y desplegará el backend
6. Desplegará el frontend en S3
7. Verificará la conectividad entre componentes

### 3. Acceder a la Aplicación

Una vez completado el despliegue, podrás acceder:

- Frontend: URL proporcionada en la salida del script (dominio de S3)
- Backend: http://[IP-EC2]:8080

## Ejecución Local

### 1. Preparar el Entorno Local

Asegúrate de tener Docker y Docker Compose instalados y haber creado el archivo `.env`.

### 2. Generar Archivos de Configuración

```bash
chmod +x setup.sh
./setup.sh
```

### 3. Iniciar los Contenedores

Puedes elegir qué componentes ejecutar:

**Entorno Completo (Frontend + Backend + DB + MinIO)**

```bash
./setup.sh local
```

**Solo Backend (Backend + DB + MinIO)**

```bash
./setup.sh back
```

**Solo Frontend (Frontend + DB + MinIO)**

```bash
./setup.sh front
```

### 4. Acceder a la Aplicación Local

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- MinIO Console: http://localhost:9001 (usuario: minioadmin, contraseña: minioadmin)

### 5. Detener los Contenedores

```bash
./stop.sh
```

## Estructura de Archivos

```
dh-g2-final/
├── .env                # Variables de entorno para desarrollo local
├── .env.prod           # Variables de entorno para producción
├── infra/              # Archivos de Terraform para infraestructura AWS
│   ├── compute.tf      # Recursos de cómputo (EC2)
│   ├── database.tf     # RDS y grupos de parámetros
│   ├── main.tf         # Configuración principal de Terraform
│   ├── networking.tf   # VPC, subredes, security groups
│   ├── outputs.tf      # Valores de salida
│   ├── provider.tf     # Proveedor AWS
│   ├── storage.tf      # S3 buckets
│   └── variables.tf    # Variables de entrada
├── frontend/           # Código fuente del frontend
│   ├── Dockerfile      # Instrucciones para construir la imagen de frontend
│   └── ...
├── backend/            # Código fuente del backend
│   ├── Dockerfile      # Instrucciones para construir la imagen de backend
│   └── ...
├── docker-compose.yml  # Configuración para despliegue local
├── setup.sh            # Script para configurar entorno local
├── deploy.sh           # Script para desplegar en AWS
├── stop.sh             # Script para detener contenedores locales
└── clear.sh            # Script para limpiar recursos Docker
```

## Mantenimiento

### Actualización de Componentes

Para actualizar algún componente:

1. **Frontend o Backend**:

   - Actualiza el código en su directorio correspondiente
   - Ejecuta nuevamente `deploy.sh` (AWS) o `setup.sh` (local)

2. **Infraestructura**:
   - Modifica los archivos Terraform en `/infra`
   - Ejecuta nuevamente `deploy.sh`

### Respaldo de la Base de Datos

En AWS, RDS tiene configurados snapshots automáticos. Para respaldos manuales:

```bash
# Obtener endpoint de la base de datos
cd infra
DB_ENDPOINT=$(terraform output -raw db_endpoint)
cd ..

# Usar mysqldump (necesitarás MySQL Client instalado)
mysqldump -h $(echo $DB_ENDPOINT | cut -d':' -f1) -u admin -p dh_g2_db > backup.sql
```

## Solución de Problemas

### Problemas de Conexión

**Frontend no puede conectarse al Backend**

- Verifica que la URL del backend en `.env` del frontend sea correcta
- Comprueba que el security group permita tráfico al puerto del backend
- Verifica que el backend esté funcionando con `curl http://[IP-BACKEND]:8080`

**Backend no puede conectarse a la Base de Datos**

- Verifica que el endpoint de la base de datos sea correcto en `.env` del backend
- Comprueba que el security group de RDS permita conexiones desde el servidor del backend
- Verifica las credenciales de la base de datos

### Problemas de Despliegue

**Error en Terraform**

- Verifica las credenciales AWS
- Revisa los logs de error de Terraform
- Intenta `terraform destroy` para limpiar recursos y vuelve a intentar

**Error en Docker**

- Verifica que Docker esté funcionando
- Comprueba si hay imágenes o contenedores con conflictos de nombres
- Intenta `./clear.sh` para limpiar recursos Docker

### Verificación de Componentes

**Comprobar Backend**

```bash
# AWS
curl http://[IP-EC2]:8080

# Local
curl http://localhost:8080
```

**Comprobar Base de Datos**

```bash
# AWS
mysql -h [ENDPOINT-RDS] -u admin -p dh_g2_db

# Local
docker exec -it dh-g2-final-mysql_db mysql -u root -ppassword dh_g2_db
```

**Logs de Backend**

```bash
# AWS
ssh -i ./.ec2-key.pem ubuntu@[IP-EC2] "sudo docker logs backend"

# Local
docker logs dh-g2-final-backend_spring_boot
```
