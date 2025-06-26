# Feeling - Plataforma de Conexiones Significativas

[![React](https://img.shields.io/badge/Frontend-React-blue)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring_Boot-green)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/Database-MySQL-blue)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://www.docker.com/)

## 📝 Descripción

**Feeling** es una plataforma web diseñada para disminuir la soledad y fomentar relaciones significativas a través de un sistema de matching inteligente. Conecta personas según intereses, gustos, valores y estilos de vida.

### 🎯 Objetivo Principal

Combatir la soledad desde una perspectiva emocional y social, conectando personas que comparten intereses similares en áreas como hobbies, viajes, deportes, religión y más.

## 🚀 Quick Start

```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd feeling

# Configurar entorno
cp .env.example .env
# Editar .env con tus valores

# Levantar todo el proyecto
chmod +x setup.sh
./setup.sh local

# Acceder a:
# Frontend: http://localhost:5173
# Backend API: http://localhost:8081
```

## 📋 Requisitos

- Docker y Docker Compose
- Node.js v16+ (para desarrollo)
- Java 21 (para desarrollo)
- Git

## 🏗️ Arquitectura

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Spring Boot 3.4.2 + Java 21
- **Base de Datos**: MySQL 8.0
- **Almacenamiento**: MinIO (S3 compatible)
- **Infraestructura**: AWS + Terraform

## 📚 Documentación

### Documentación Técnica

- [Frontend](./frontend/README.md) - Guía completa del frontend React
- [Backend](./backend/README.md) - Documentación del API Spring Boot
- [Infraestructura](./infra/README.md) - Configuración AWS y Terraform
- [Scripts](./scripts/README.md) - Documentación de scripts de automatización

### Documentación Adicional

- [Arquitectura](./docs/ARCHITECTURE.md) - Diseño y decisiones arquitectónicas
- [API](./docs/API.md) - Documentación completa de endpoints
- [Base de Datos](./docs/DATABASE.md) - Esquema y modelos de datos
- [Despliegue](./docs/DEPLOYMENT.md) - Guía de despliegue en producción
- [Contribución](./docs/CONTRIBUTING.md) - Cómo contribuir al proyecto
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Solución de problemas comunes

## 📂 Estructura del Proyecto

```
feeling/
├── backend/          # API Spring Boot
├── frontend/         # Aplicación React
├── infra/           # Infraestructura Terraform
├── scripts/         # Scripts de automatización
├── docs/            # Documentación adicional
├── docker-compose.yml
└── README.md
```

## 🐳 Desarrollo con Docker

```bash
# Levantar servicios
./setup.sh local    # Todo el proyecto
./setup.sh back     # Solo backend
./setup.sh front    # Solo frontend

# Detener servicios
./stop.sh

# Limpiar contenedores
./clear.sh
```

## 🌟 Características Principales

- ✅ Sistema de matching inteligente
- ✅ Perfiles detallados con intereses
- ✅ Planes de pago con intentos
- ✅ Eventos y actividades
- ✅ Notificaciones por WhatsApp
- ✅ Panel administrativo
- ✅ Sistema de reportes y moderación

## 📧 Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.

## 📄 Licencia

Propiedad privada - Todos los derechos reservados

---

**Feeling** - Conectando personas, creando vínculos significativos 💕
