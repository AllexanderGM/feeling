<div align="center">
    <img src="./frontend/src/assets/Logo/isotipo_sm.svg" alt="Logo de Romeliny" width="100">
</div>

# Glocal Tours - Plataforma de Gestión de Tours

[![AWS](https://img.shields.io/badge/AWS-Terraform-orange)](https://aws.amazon.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://www.docker.com/)
[![React](https://img.shields.io/badge/Frontend-React-blue)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring_Boot-green)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/Database-MySQL-blue)](https://www.mysql.com/)

## 📋 Índice

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Frontend](#frontend)
- [Backend](#backend)
- [Base de Datos](#base-de-datos)
- [Infraestructura Cloud](#infraestructura-cloud)
- [CI/CD](#cicd)
- [Pruebas](#pruebas)
- [Scripts Disponibles](#scripts-disponibles)
- [Despliegue](#despliegue)
- [Mantenimiento](#mantenimiento)
- [Contribución](#contribución)
- [Licencia](#licencia)

## 📝 Descripción del Proyecto

Glocal Tours es una plataforma completa para la gestión de tours y paquetes turísticos. Permite a los usuarios buscar, explorar y reservar paquetes turísticos a diferentes destinos. La plataforma cuenta con una interfaz amigable para los usuarios finales y un completo sistema de administración para gestionar los paquetes, reservas y usuarios.

### Características Principales

- **Catálogo de Tours**: Visualización de paquetes turísticos con imágenes, descripciones, precios y características
- **Sistema de Reservas**: Gestión completa del proceso de reserva
- **Autenticación y Perfiles**: Sistema de registro y login de usuarios
- **Panel Administrativo**: Gestión de paquetes, usuarios y reservas
- **Almacenamiento de Imágenes**: Sistema de almacenamiento para imágenes de los paquetes turísticos
- **Infraestructura en la Nube**: Despliegue completo en AWS

## 🏗️ Arquitectura

El proyecto sigue una arquitectura de microservicios, con los siguientes componentes principales:

- **Frontend**: Aplicación React con Vite
- **Backend**: API REST desarrollada con Spring Boot
- **Base de Datos**: MySQL para almacenamiento de datos
- **Almacenamiento de Objetos**: MinIO (desarrollo local) / S3 (producción) para imágenes
- **Infraestructura**: Definida como código con Terraform para AWS
- **Contenedores**: Docker y Docker Compose para desarrollo local y construcción de imágenes

## 📋 Requisitos

Para ejecutar este proyecto localmente, necesitas:

- Docker y Docker Compose
- Node.js (v16+) y npm
- Java 21 y Maven
- AWS CLI (para despliegue en producción)
- Terraform (para despliegue en producción)

## 🚀 Instalación y Configuración

### Instalación Local

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/dh-g2-final.git
   cd dh-g2-final
   ```

2. Crear archivo `.env` en la raíz del proyecto (ver sección de Variables de Entorno)

3. Ejecutar el script de configuración:
   ```bash
   chmod +x setup.sh
   ./setup.sh local
   ```

El script creará los archivos `.env` necesarios y levantará los servicios con Docker Compose.

### Acceso

- **Frontend**: http://localhost:5173 (desarrollo) o http://localhost:80 (producción)
- **Backend**: http://localhost:8080
- **Swagger**: http://localhost:8080/swagger-ui.html
- **MinIO**: http://localhost:9001 (consola web)

## 🔐 Variables de Entorno

### Desarrollo (.env)

```properties
# Variables de entorno Generales
NAME=dh_g2_final
ENV=development

# Variables del sitio web
URL=http://localhost
PORT_FRONT=5173
PORT_BACK=8080

# Variables de conexión a la base de datos
DB_PORT=3307
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=root
DB_ROOT_PASSWORD=root
DB_NAME=dh_g2_final_db

# Variables de archivos estáticos
MINIO_PORT=9000
MINIO_PORT_WEB=9001
MINIO_ENDPOINT=http://minio:9000
MINIO_ROOT_USER=root
MINIO_ROOT_PASSWORD=supersecurepassword
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=admin123
MINIO_BUCKET=dh_g2_final-bucket

# Variables de encriptación
ALGORITHM=aes-256-gcm
KEY=12345678901234567890123456789012
IV=1234567890abcdef1234567890abcdef

# Variables de sesión de usuarios
SESSION_SECRET=12345678901234567890123456789012
JWT_SECRET=EstaEsUnaClaveSuperSecretaParaJWTQueDebeSerLarga
JWT_EXPIRATION=7200000
ADMIN_USERNAME=admin@admin.com
ADMIN_PASSWORD=Admin123456789

# Variables de correo electrónico
MAIL=preguntepues.glocal@gmail.com
MAILPASS=wfjslfewupgrzhkd
```

### Producción (.env.prod)

```properties
# Generales
NAME=DH_G2_Final
ENV=production

# AWS
AWS_ACCESS_KEY=
AWS_SECRET_KEY=

# GitHub
GHCR_TOKEN=
REPO_NAME=

# Configuración de URLs
URL=http://localhost
PORT_FRONT=80
PORT_BACK=8080

# Configuración de Base de Datos
DB_PORT=3306
DB_HOST="aws-rds-endpoint" # Se actualizará automáticamente con terraform output
DB_USER=admin_dh_g2
DB_PASSWORD=""
DB_ROOT_PASSWORD=""
DB_NAME="dh_g2_final_db"

# Variables de archivos estáticos
MINIO_HOST=http://localhost
MINIO_PORT=9000
MINIO_PORT_WEB=9001
MINIO_ROOT_USER=root
MINIO_ROOT_PASSWORD=supersecurepassword
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=admin123
MINIO_BUCKET=dh_g2_final-bucket

# Variables de encriptación
ALGORITHM=aes-256-gcm
KEY=12345678901234567890123456789012
IV=1234567890abcdef1234567890abcdef

# Variables de sesión de usuarios
SESSION_SECRET=12345678901234567890123456789012
JWT_SECRET=EstaEsUnaClaveSuperSecretaParaJWTQueDebeSerLarga
JWT_EXPIRATION=7200000
ADMIN_USERNAME=admin@admin.com
ADMIN_PASSWORD=Admin123456789

# Variables de correo electrónico
MAIL=preguntepues.glocal@gmail.com
MAILPASS=wfjslfewupgrzhkd
```

## 📂 Estructura del Proyecto

```
dh-g2-final/
├── backend/             # Aplicación Spring Boot
├── frontend/            # Aplicación React
├── infra/               # Código Terraform para AWS
│   ├── compute.tf       # Configuración de EC2
│   ├── database.tf      # Configuración de RDS
│   ├── networking.tf    # Configuración de VPC y redes
│   ├── storage.tf       # Configuración de S3 buckets
│   ├── variables.tf     # Variables de Terraform
│   └── outputs.tf       # Outputs de Terraform
├── .github/workflows/   # Workflows de GitHub Actions
├── docker-compose.yml   # Configuración de Docker Compose
├── setup.sh             # Script de configuración
├── deploy.sh            # Script de despliegue para producción
├── stop.sh              # Script para detener servicios
└── README.md            # Este archivo
```

## 🖥️ Frontend

### Tecnologías

- React 18
- Vite como bundler
- TailwindCSS para estilos
- React Router para enrutamiento
- Axios para peticiones HTTP
- Context API para gestión de estado

### Estructura

La aplicación frontend está construida con React y utiliza una arquitectura moderna basada en componentes:

```
frontend/
├── public/          # Archivos estáticos y recursos públicos
├── src/
│   ├── assets/      # Imágenes, iconos y recursos estáticos
│   ├── components/  # Componentes reutilizables de UI
│   ├── context/     # Contextos de React para estado global
│   ├── hooks/       # Custom hooks para lógica reutilizable
│   ├── pages/       # Componentes de página completa
│   ├── services/    # Servicios para conexión con API RESTful
│   ├── utils/       # Funciones utilitarias y helpers
│   ├── App.jsx      # Componente principal y rutas
│   └── index.jsx    # Punto de entrada de la aplicación
├── .env             # Variables de entorno (generado por setup.sh)
├── Dockerfile       # Configuración para Docker
├── nginx.conf       # Configuración de Nginx para producción
├── package.json     # Dependencias y scripts
└── vite.config.js   # Configuración de Vite (bundler)
```

#### Despliegue en Producción

Para el despliegue en producción, la aplicación frontend:

- Es compilada con `npm run build` para generar archivos estáticos optimizados
- Se sirve a través de Nginx configurado con optimizaciones para SPA
- Incluye configuración de caché, compresión gzip y manejo de rutas para React Router

### Características Principales

- Diseño responsive para todas las pantallas
- Autenticación y gestión de sesiones
- Catálogo de tours con filtros y búsqueda
- Proceso de reserva con selección de fechas y pasajeros
- Panel de usuario para ver reservas
- Panel administrativo (para usuarios con rol admin)

## 🔧 Backend

### Tecnologías

- Spring Boot 3.4.2
- Java 21
- Spring Data JPA y Hibernate para persistencia
- Spring Security con JWT para autenticación
- Spring Web para API REST
- MySQL 3.8 para base de datos
- Maven para gestión de dependencias
- MinIO Client para almacenamiento de objetos

### Estructura

El backend sigue una estructura estándar de aplicación Spring Boot con el patrón de capas MVC:

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/dh/g2/tours/
│   │   │   ├── config/       # Configuraciones generales y beans
│   │   │   ├── controller/   # Controladores REST (endpoints de la API)
│   │   │   ├── dto/          # Objetos de transferencia de datos
│   │   │   ├── exception/    # Manejo de excepciones personalizado
│   │   │   ├── model/        # Entidades JPA (mapeo ORM a tablas de BD)
│   │   │   ├── repository/   # Repositorios JPA para acceso a datos
│   │   │   ├── security/     # Configuración de JWT y seguridad
│   │   │   ├── service/      # Servicios con lógica de negocio
│   │   │   └── TourApplication.java  # Punto de entrada
│   │   └── resources/
│   │       ├── application.properties  # Configuraciones de la aplicación
│   │       └── data.sql      # Script SQL inicial para datos semilla
│   └── test/                # Tests unitarios e integración
├── .env                     # Variables de entorno (generado por setup.sh)
├── Dockerfile               # Configuración para Docker
└── pom.xml                  # Dependencias y configuración Maven
```

#### ORM (Object-Relational Mapping)

El backend utiliza Hibernate como proveedor de JPA (Java Persistence API) para el mapeo objeto-relacional:

- Las entidades en el paquete `model` están anotadas con `@Entity` para mapeo a tablas
- Relaciones entre entidades definidas con anotaciones como `@OneToMany`, `@ManyToOne`, etc.
- Spring Data JPA simplifica el acceso a datos mediante interfaces `Repository`
- Configuración de JPA en `application.properties` para gestión de conexiones y comportamiento

### Endpoints Principales

- **Autenticación**:

  - `POST /auth/register` - Registro de usuarios
  - `POST /auth/login` - Inicio de sesión
  - `POST /auth/refresh` - Refrescar token
  - `POST /auth/logout` - Cerrar sesión

- **Tours**:

  - `GET /tours` - Listar todos los tours
  - `GET /tours/paginated` - Listar tours con paginación
  - `GET /tours/{id}` - Obtener un tour por ID
  - `PUT /tours/{id}` - Actualizar un tour por ID
  - `DELETE /tours/{id}` - Eliminar un tour por ID
  - `PUT /tours/{id}/tags` - Actualizar etiquetas de un tour
  - `GET /tours/random` - Obtener tours aleatorios
  - `POST /tours` - Crear un nuevo tour (requiere autenticación)
  - `GET /tours/filter/name` - Filtrar tours por nombre
  - `GET /tours/filter/category` - Filtrar tours por categoría
  - `GET /tours/filter/advanced` - Filtro avanzado de tours

- **Reservas (Bookings)**:

  - `GET /bookings` - Obtener todas las reservas
  - `POST /bookings` - Crear una nueva reserva
  - `GET /bookings/{id}` - Obtener reserva por ID
  - `DELETE /bookings/{id}` - Eliminar reserva por ID
  - `GET /bookings/tour/{tourId}` - Obtener reservas de un tour específico
  - `GET /bookings/historic` - Obtener historial de reservas

- **Disponibilidad (Availabilities)**:

  - `GET /api/availabilities/tour/{tourId}` - Obtener disponibilidad de un tour específico
  - `POST /api/availabilities/tour/{tourId}` - Crear disponibilidad para un tour
  - `GET /api/availabilities` - Obtener todas las disponibilidades

- **Usuarios**:

  - `GET /usuarios` - Listar usuarios

- **Información General**:
  - `GET /` - Información de la API
  - `GET /system` - Información del sistema

## 📊 Base de Datos

### Estructura

La base de datos MySQL 3.8 está gestionada mediante un ORM (Object-Relational Mapping) a través de Hibernate y JPA. El sistema contiene las siguientes entidades principales:

- **Users**: Usuarios registrados en el sistema con credenciales e información personal
- **Tours**: Paquetes turísticos disponibles con precios, descripción y características
- **Destinations**: Destinos turísticos organizados por país y ciudad
- **Hotels**: Hoteles asociados a los paquetes con categoría y servicios
- **Bookings**: Reservas realizadas por los usuarios para tours específicos
- **Images**: Referencias a imágenes almacenadas para los paquetes turísticos
- **Availabilities**: Fechas disponibles para cada tour con capacidad y estado

## ☁️ Infraestructura Cloud

### AWS (Terraform)

La infraestructura en AWS se define como código utilizando Terraform:

- **Networking**: VPC, subredes, NAT Gateway, y grupos de seguridad
- **Compute**: Instancia EC2 para el backend
- **Database**: RDS MySQL para la base de datos
- **Storage**: Buckets S3 para frontend y almacenamiento de imágenes
- **Security**: Gestión de claves SSH y permisos

### Componentes Principales

- **VPC**: Red aislada con subredes públicas y privadas
- **EC2**: Instancia t2.micro para ejecutar el backend
- **RDS**: Instancia db.t3.micro para MySQL 8.0
- **S3 Buckets**: Alojamiento del frontend como sitio estático y almacenamiento de imágenes
- **Security Groups**: Control de acceso a los servicios

## 🔄 CI/CD

### GitHub Actions

El proyecto utiliza GitHub Actions para la integración y despliegue continuos:

1. **deploy-backend.yml**: Construye y despliega el backend

   - Construye la imagen Docker del backend
   - La sube a GitHub Container Registry (ghcr.io)
   - Aplica la configuración de Terraform
   - Actualiza la instancia EC2 con la nueva imagen via SSH

2. **deploy-frontend.yml**: Construye y despliega el frontend
   - Construye la aplicación React
   - Aplica la configuración de Terraform
   - Sube los archivos estáticos al bucket S3

### Flujo de Trabajo

1. Los desarrolladores realizan cambios en sus ramas locales
2. Al hacer merge a la rama main, se desencadenan los workflows
3. Los cambios se despliegan automáticamente en la infraestructura de AWS

## 🧪 Pruebas

### Pruebas de API con Postman

Se incluye una colección de Postman (`DH-G2-Final.postman_collection.json`) con todas las rutas de la API para facilitar las pruebas:

- Autenticación (registro, login, refresh token)
- Gestión de tours
- Reservas
- Endpoints de información

### Pruebas Unitarias e Integración

El backend incluye pruebas unitarias y de integración utilizando:

- JUnit 5
- Mockito
- Spring Boot Test

Para ejecutar las pruebas del backend:

```bash
cd backend
./mvnw test
```

### Repositorio GitHub

El proyecto está alojado en GitHub: [https://github.com/AllexanderGM/DH-G2-Final](https://github.com/AllexanderGM/DH-G2-Final)

## 📜 Scripts Disponibles

### `setup.sh`

Configura el entorno de desarrollo local:

```bash
./setup.sh [local|back|front]
```

- `local`: Levanta todos los servicios (frontend, backend, base de datos, MinIO)
- `back`: Levanta solo el backend y servicios relacionados
- `front`: Levanta solo el frontend y servicios relacionados

### `stop.sh`

Detiene todos los servicios:

```bash
./stop.sh
```

### `clear.sh`

Limpia contenedores, imágenes y redes de Docker:

```bash
./clear.sh
```

### `deploy.sh`

Prepara los archivos para despliegue en producción:

```bash
./deploy.sh
```

## 🚀 Despliegue

### Despliegue en Producción

1. Configurar variables de entorno de producción en `.env.prod`

2. Ejecutar el script de despliegue:

   ```bash
   ./deploy.sh
   ```

3. Para despliegue manual en AWS:

   ```bash
   cd infra
   terraform init
   terraform apply -var-file=terraform.tfvars
   ```

4. Los workflows de GitHub Actions se encargarán del despliegue continuo cuando se haga push a la rama main.

## 🛠️ Mantenimiento

### Logs

- **Backend**: Los logs se generan en la instancia EC2 y se pueden ver mediante SSH
- **Frontend**: Los logs se pueden ver en la consola del navegador
- **Docker**: Para ver logs en desarrollo local:
  ```bash
  docker-compose logs -f [servicio]
  ```

### Backups

- La base de datos RDS se configura con backups automáticos
- Los buckets S3 tienen versionado habilitado

## 👥 Contribución

1. Crear una rama a partir de `develop`
2. Implementar cambios y tests
3. Crear un Pull Request a `develop`
4. Después de revisión, se fusionará a `main` para despliegue

## 📄 Licencia

Este proyecto está licenciado bajo la licencia MIT - ver el archivo LICENSE para más detalles.
