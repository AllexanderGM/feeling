# Feeling Backend API

## 📖 Descripción

**Feeling** es una plataforma social de matching y eventos que conecta personas con intereses compartidos a través de experiencias en común. El backend proporciona un sistema completo de gestión de usuarios, sistema de compatibilidad basado en algoritmos, gestión de eventos/tours, y un sistema de reservas.

La plataforma permite a los usuarios crear perfiles detallados con atributos, intereses y tags personalizados, recibir sugerencias de conexiones basadas en compatibilidad, explorar y reservar eventos, y gestionar sus interacciones sociales en un entorno moderado y seguro.

**Autor:** J. Alexander Gavilán M.

## 🏗️ Arquitectura

```
src/main/java/com/feeling/
├── packages/               # Arquitectura modular por dominios
│   ├── auth/              # Autenticación y autorización
│   │   ├── application/   # Controladores
│   │   ├── domain/        # Servicios y DTOs
│   │   └── infrastructure/# Repositorios y entidades
│   ├── user/              # Gestión de usuarios
│   ├── event/             # Eventos y tours
│   ├── match/             # Sistema de matching
│   ├── location/          # Datos geográficos
│   ├── booking/           # Sistema de reservas
│   ├── info/              # Información general
│   ├── support/           # Sistema de soporte
│   ├── configuration/     # Configuraciones del cliente
│   └── common/            # Componentes transversales
├── config/                # Configuración Spring
├── exception/             # Manejo de excepciones
├── handlers/              # Handlers específicos
├── utils/                 # Utilidades estáticas
└── FeelingApplication.java
```

## 📋 Stack Tecnológico

- **Spring Boot 3.x**: Framework principal
- **Java 21**: Lenguaje de programación
- **Spring Data JPA**: Persistencia de datos
- **MySQL**: Base de datos
- **Spring Security**: Autenticación/autorización
- **Maven**: Gestión de dependencias
- **JWT**: Tokens de sesión

## 💻 Configuración de Desarrollo

```bash
# Instalar dependencias
./mvnw clean install

# Ejecutar aplicación
./mvnw spring-boot:run

# Ejecutar tests
./mvnw test
```

## 📦 Módulos Disponibles

### **Módulos de Negocio:**
- **auth/** - Login, registro, JWT tokens
- **user/** - Perfiles y gestión de usuarios
- **event/** - Tours y eventos
- **match/** - Sistema de matching entre usuarios
- **location/** - Datos geográficos y ubicaciones
- **booking/** - Reservas de eventos
- **support/** - Sistema de soporte al cliente
- **info/** - Información general

### **Módulos de Infraestructura:**
- **common/** - Servicios compartidos (email, storage, cache)
- **configuration/** - Configuraciones del cliente
- **utils/** - Utilidades estáticas

## ⚙️ Configuración

### Archivos principales:
- `application.properties` - Configuración principal
- `application-development.properties` - Configuración de desarrollo

### Variables de entorno requeridas:
- Conexión a base de datos MySQL
- Configuración SMTP para emails
- Configuración JWT (secret, expiration)

## 🗄️ Base de Datos

- **MySQL 8.x** recomendado
- **JPA/Hibernate** para ORM
- Migraciones automáticas con `ddl-auto=update`

## 📡 API Endpoints

La API está organizada por módulos:
- `/api/auth/**` - Autenticación
- `/api/users/**` - Usuarios
- `/api/events/**` - Eventos
- `/api/matches/**` - Matching
- `/api/bookings/**` - Reservas

## 🔒 Seguridad

- **Spring Security** con JWT
- Autenticación basada en tokens
- Validación de roles y permisos
- CORS configurado para frontend

## 🧪 Testing

```bash
# Ejecutar todos los tests
./mvnw test

# Ejecutar tests específicos
./mvnw test -Dtest=ClassName
```

## 📝 Desarrollo

### Convenciones:
- Cada módulo mantiene sus 3 capas: application, domain, infrastructure
- DTOs específicos por módulo
- Servicios con `@Service` y `@Transactional`
- Repositorios JPA con queries personalizadas

### Documentación:
- JavaDoc completo en entidades y servicios
- Comentarios claros en métodos complejos
- README específicos por módulo cuando sea necesario

## 🚀 Deployment

```bash
# Generar JAR para producción
./mvnw clean package -Pprod

# Ejecutar JAR
java -jar target/feeling-backend.jar
```

## 📞 Contacto

Para preguntas sobre el desarrollo, contactar al equipo de desarrollo.

---
**Feeling Platform** - Conectando personas a través de experiencias compartidas.