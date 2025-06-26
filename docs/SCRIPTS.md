# Scripts - Feeling

## 📋 Índice

- [Descripción General](#descripción-general)
- [Scripts Disponibles](#scripts-disponibles)
- [setup.sh](#setupsh)
- [stop.sh](#stopsh)
- [clear.sh](#clearsh)
- [deploy.sh](#deploysh)
- [backup.sh](#backupsh)
- [restore.sh](#restoresh)
- [Uso Avanzado](#uso-avanzado)
- [Troubleshooting](#troubleshooting)

## 📝 Descripción General

Esta carpeta contiene scripts de automatización para facilitar el desarrollo, despliegue y mantenimiento del proyecto Feeling.

## 🔧 Scripts Disponibles

### setup.sh

Script principal para configurar y levantar el entorno de desarrollo.

**Uso:**

```bash
./setup.sh [perfil]
```

**Perfiles disponibles:**

- `local` - Levanta todos los servicios (frontend, backend, DB, MinIO)
- `back` - Solo backend con servicios necesarios
- `front` - Solo frontend con servicios necesarios
- `db` - Solo base de datos y MinIO

**Funcionalidades:**

- Verifica requisitos del sistema
- Crea archivos de configuración si no existen
- Construye imágenes Docker
- Levanta contenedores según el perfil
- Muestra URLs de acceso
- Verifica salud de servicios

**Ejemplo completo:**

```bash
# Dar permisos de ejecución
chmod +x setup.sh

# Levantar entorno completo
./setup.sh local

# Output esperado:
# ✅ Docker está instalado
# ✅ Docker Compose está instalado
# 📋 Usando perfil: local
# 🚀 Levantando servicios...
# ✅ Servicios levantados correctamente
#
# 🌐 URLs de acceso:
# Frontend: http://localhost:5173
# Backend API: http://localhost:8081
# MinIO Console: http://localhost:9001
```

### stop.sh

Detiene todos los servicios de Docker Compose.

**Uso:**

```bash
./stop.sh
```

**Funcionalidades:**

- Detiene todos los contenedores
- Preserva volúmenes y datos
- Muestra estado de servicios

**Ejemplo:**

```bash
chmod +x stop.sh
./stop.sh

# Output:
# 🛑 Deteniendo servicios...
# ✅ Servicios detenidos correctamente
```

### clear.sh

Limpia completamente el entorno Docker (útil para resolver problemas).

**Uso:**

```bash
./clear.sh [--all]
```

**Opciones:**

- Sin parámetros: Limpia solo contenedores del proyecto
- `--all`: Limpia TODO Docker (usar con precaución)

**Funcionalidades:**

- Detiene y elimina contenedores
- Elimina imágenes del proyecto
- Elimina redes no utilizadas
- Opcionalmente limpia volúmenes

**Ejemplo:**

```bash
chmod +x clear.sh

# Limpieza básica
./clear.sh

# Limpieza completa (¡CUIDADO! Borra todos los datos)
./clear.sh --all
```

### deploy.sh

Script de despliegue automático a AWS.

**Uso:**

```bash
./deploy.sh [environment]
```

**Ambientes:**

- `staging` - Ambiente de pruebas
- `production` - Ambiente productivo

**Funcionalidades:**

- Valida configuración AWS
- Construye aplicaciones
- Crea/actualiza infraestructura con Terraform
- Despliega frontend a S3
- Despliega backend a EC2
- Ejecuta migraciones de BD
- Verifica salud del despliegue

**Proceso de despliegue:**

```bash
chmod +x deploy.sh

# Configurar AWS CLI primero
aws configure

# Desplegar a producción
./deploy.sh production

# El script:
# 1. Valida credenciales AWS
# 2. Construye frontend (npm run build)
# 3. Construye backend (mvn package)
# 4. Ejecuta Terraform
# 5. Sube frontend a S3
# 6. Despliega backend en EC2
# 7. Muestra URLs de acceso
```

### backup.sh

Realiza respaldos de la base de datos y archivos.

**Uso:**

```bash
./backup.sh [--full|--db|--files]
```

**Opciones:**

- `--full` - Respaldo completo (BD + archivos)
- `--db` - Solo base de datos
- `--files` - Solo archivos

**Funcionalidades:**

- Respaldo de MySQL con mysqldump
- Respaldo de imágenes de MinIO/S3
- Compresión de respaldos
- Rotación automática (mantiene últimos 7)
- Upload a S3 (opcional)

**Ejemplo:**

```bash
chmod +x backup.sh

# Respaldo completo
./backup.sh --full

# Output:
# 📦 Iniciando respaldo...
# ✅ Base de datos respaldada: backup_2024_01_15_103045.sql
# ✅ Archivos respaldados: backup_files_2024_01_15_103045.tar.gz
# ✅ Respaldo completado exitosamente
```

### restore.sh

Restaura respaldos de base de datos y archivos.

**Uso:**

```bash
./restore.sh [archivo_respaldo]
```

**Funcionalidades:**

- Lista respaldos disponibles
- Restaura base de datos
- Restaura archivos
- Validación antes de restaurar
- Respaldo de seguridad previo

**Ejemplo:**

```bash
chmod +x restore.sh

# Listar respaldos disponibles
./restore.sh --list

# Restaurar respaldo específico
./restore.sh backup_2024_01_15_103045.tar.gz
```

## 🚀 Uso Avanzado

### Variables de entorno

Los scripts respetan las siguientes variables:

```bash
# Configuración de puertos
export FRONTEND_PORT=3000
export BACKEND_PORT=8080
export DB_PORT=3306

# Configuración de base de datos
export DB_NAME=feeling_custom
export DB_USER=custom_user
export DB_PASSWORD=custom_pass

# Ejecutar con configuración personalizada
./setup.sh local
```

### Modo debug

```bash
# Activar modo debug
export DEBUG=true
./setup.sh local

# Muestra comandos ejecutados y más información
```

### Perfiles personalizados

Crear archivo `.setup.profile`:

```bash
# .setup.profile
SERVICES="mysql backend"
BUILD_ARGS="--no-cache"
COMPOSE_FILE="docker-compose.custom.yml"
```

## 🔧 Troubleshooting

### Error: "Permission denied"

```bash
# Dar permisos de ejecución
chmod +x *.sh
```

### Error: "Docker daemon is not running"

```bash
# Iniciar Docker
sudo systemctl start docker  # Linux
open -a Docker              # macOS
```

### Error: "Port already in use"

```bash
# Verificar puertos en uso
lsof -i :5173  # Frontend
lsof -i :8081  # Backend
lsof -i :3307  # MySQL

# Cambiar puertos en .env
FRONTEND_PORT=3000
BACKEND_PORT=8080
```

### Base de datos no se conecta

```bash
# Verificar logs
docker logs feeling-mysql

# Conectar manualmente
docker exec -it feeling-mysql mysql -u root -p

# Recrear base de datos
./clear.sh
./setup.sh db
```

### Frontend no carga

```bash
# Verificar logs
docker logs feeling-frontend

# Reconstruir
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

## 📝 Estructura de logs

Los scripts generan logs en:

```
logs/
├── setup_2024_01_15.log
├── deploy_2024_01_15.log
├── backup_2024_01_15.log
└── error_2024_01_15.log
```

Ver logs en tiempo real:

```bash
tail -f logs/setup_*.log
```

## 🔐 Seguridad

- Los scripts no almacenan contraseñas
- Usar variables de entorno para credenciales
- Los respaldos se encriptan por defecto
- Logs excluyen información sensible

---

Para más información, consulta la [documentación principal](../README.md)
