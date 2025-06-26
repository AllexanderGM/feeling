# Backend - Feeling API

## 📋 Índice

- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Modelos de Datos](#modelos-de-datos)
- [Seguridad](#seguridad)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentación API](#documentación-api)

## 🚀 Stack Tecnológico

- **Spring Boot 3.4.2**: Framework principal
- **Java 21**: Lenguaje de programación
- **Spring Data JPA**: ORM y persistencia
- **Hibernate**: Implementación JPA
- **MySQL 8.0**: Base de datos relacional
- **Spring Security**: Autenticación y autorización
- **JWT**: JSON Web Tokens para sesiones
- **Spring Mail**: Envío de emails
- **Thymeleaf**: Templates de email HTML
- **Swagger/OpenAPI**: Documentación automática
- **Maven**: Gestión de dependencias
- **Lombok**: Reducción de boilerplate
- **ModelMapper**: Mapeo de objetos

## 🏗️ Arquitectura

El backend sigue una arquitectura en capas (Layered Architecture):

```
src/main/java/com/feeling/
├── config/                 # Configuraciones
│   ├── SecurityConfig.java      # Configuración de Spring Security
│   ├── JwtConfig.java          # Configuración JWT
│   ├── CorsConfig.java         # Configuración CORS
│   ├── SwaggerConfig.java      # Configuración Swagger
│   └── EmailConfig.java        # Configuración de email
├── controller/             # Controladores REST
│   ├── AuthController.java     # Autenticación
│   ├── UserController.java     # Gestión de usuarios
│   ├── ProfileController.java  # Perfiles de usuario
│   ├── MatchController.java    # Sistema de matching
│   ├── EventController.java    # Eventos y actividades
│   ├── PaymentController.java  # Pagos y planes
│   └── AdminController.java    # Panel administrativo
├── dto/                    # Data Transfer Objects
│   ├── request/               # DTOs de entrada
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── ProfileUpdateRequest.java
│   │   └── MatchRequest.java
│   ├── response/              # DTOs de salida
│   │   ├── AuthResponse.java
│   │   ├── UserResponse.java
│   │   ├── MatchResponse.java
│   │   └── ApiResponse.java
│   └── mapper/                # Mappers DTO-Entity
├── entity/                 # Entidades JPA
│   ├── User.java              # Usuario base
│   ├── Profile.java           # Perfil completo
│   ├── Match.java             # Matches entre usuarios
│   ├── Event.java             # Eventos
│   ├── Payment.java           # Pagos
│   ├── Plan.java              # Planes de suscripción
│   └── BaseEntity.java        # Entidad base con auditoría
├── repository/             # Repositorios JPA
│   ├── UserRepository.java
│   ├── ProfileRepository.java
│   ├── MatchRepository.java
│   ├── EventRepository.java
│   └── PaymentRepository.java
├── service/                # Lógica de negocio
│   ├── impl/                  # Implementaciones
│   │   ├── AuthServiceImpl.java
│   │   ├── UserServiceImpl.java
│   │   └── MatchServiceImpl.java
│   ├── AuthService.java       # Interface de autenticación
│   ├── UserService.java       # Interface de usuarios
│   ├── MatchService.java      # Interface de matching
│   ├── EmailService.java      # Servicio de emails
│   ├── PaymentService.java    # Servicio de pagos
│   └── FileStorageService.java # Servicio de archivos
├── security/               # Componentes de seguridad
│   ├── jwt/
│   │   ├── JwtTokenProvider.java  # Generador de tokens
│   │   ├── JwtAuthFilter.java     # Filtro de autenticación
│   │   └── JwtProperties.java     # Propiedades JWT
│   ├── CustomUserDetails.java     # Detalles de usuario
│   └── SecurityUtils.java         # Utilidades de seguridad
├── exception/              # Manejo de excepciones
│   ├── GlobalExceptionHandler.java # Handler global
│   ├── BusinessException.java      # Excepciones de negocio
│   ├── ResourceNotFoundException.java
│   └── ValidationException.java
├── util/                   # Utilidades
│   ├── EmailTemplates.java        # Templates de email
│   ├── Constants.java             # Constantes
│   └── ValidationUtils.java       # Validaciones
└── FeelingApplication.java # Clase principal
```

## 💻 Instalación

### Requisitos previos

- Java 21
- Maven 3.8+
- MySQL 8.0
- Docker (opcional)

### Pasos de instalación

```bash
# Clonar repositorio
git clone [URL_REPOSITORIO]
cd feeling/backend

# Instalar dependencias
./mvnw clean install

# Configurar base de datos
mysql -u root -p
CREATE DATABASE feeling_db;

# Configurar variables de entorno
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Editar con tus valores

# Ejecutar aplicación
./mvnw spring-boot:run
```

## ⚙️ Configuración

### application.properties

```properties
# Server
server.port=8081
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/feeling_db
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# JWT
jwt.secret=SecretKeyMuyLarga
jwt.expiration=86400000

# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=tu-email@gmail.com
spring.mail.password=tu-app-password

# File Upload
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=20MB

# MinIO
minio.endpoint=http://localhost:9000
minio.access-key=minioadmin
minio.secret-key=minioadmin
minio.bucket-name=feeling-images
```

### Perfiles de Spring

- **dev**: Desarrollo local
- **test**: Testing
- **prod**: Producción

```bash
# Ejecutar con perfil específico
./mvnw spring-boot:run -Dspring.profiles.active=dev
```

## 📡 API Endpoints

### Autenticación

```
POST   /api/auth/login          # Login de usuario
POST   /api/auth/register       # Registro nuevo usuario
POST   /api/auth/refresh        # Renovar token
POST   /api/auth/logout         # Cerrar sesión
POST   /api/auth/forgot-password # Recuperar contraseña
POST   /api/auth/reset-password  # Resetear contraseña
GET    /api/auth/verify-email   # Verificar email
```

### Usuarios

```
GET    /api/users/profile       # Obtener perfil propio
PUT    /api/users/profile       # Actualizar perfil
POST   /api/users/upload-photo  # Subir foto
DELETE /api/users/photo/{id}    # Eliminar foto
PUT    /api/users/preferences   # Actualizar preferencias
DELETE /api/users/account       # Eliminar cuenta
```

### Búsqueda y Matching

```
POST   /api/search              # Buscar usuarios con filtros
GET    /api/search/filters      # Obtener filtros disponibles
POST   /api/matches/send        # Enviar solicitud de match
GET    /api/matches/received    # Matches recibidos
GET    /api/matches/sent        # Matches enviados
POST   /api/matches/{id}/accept # Aceptar match
POST   /api/matches/{id}/reject # Rechazar match
GET    /api/matches/active      # Matches activos
```

### Eventos

```
GET    /api/events              # Listar eventos
GET    /api/events/{id}         # Detalle de evento
POST   /api/events/{id}/reserve # Reservar evento
GET    /api/events/my-events    # Mis eventos
DELETE /api/events/{id}/cancel  # Cancelar reserva
```

### Pagos y Planes

```
GET    /api/plans               # Listar planes disponibles
POST   /api/payments/purchase   # Comprar plan
GET    /api/payments/history    # Historial de pagos
GET    /api/payments/attempts   # Intentos disponibles
POST   /api/payments/verify     # Verificar pago
```

### Administración

```
GET    /api/admin/stats         # Estadísticas generales
GET    /api/admin/users         # Gestión de usuarios
PUT    /api/admin/users/{id}    # Actualizar usuario
DELETE /api/admin/users/{id}    # Eliminar usuario
GET    /api/admin/reports       # Ver reportes
POST   /api/admin/reports/{id}/resolve # Resolver reporte
POST   /api/admin/events        # Crear evento
PUT    /api/admin/events/{id}   # Actualizar evento
```

## 🗄️ Modelos de Datos

### User Entity

```java
@Entity
@Table(name = "users")
public class User extends BaseEntity {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private String gender;
    private String city;
    private String phoneNumber;
    private Boolean emailVerified;
    private Boolean active;
    private Role role;
}
```

### Profile Entity

```java
@Entity
@Table(name = "profiles")
public class Profile extends BaseEntity {
    @OneToOne
    private User user;
    private String bio;
    private String occupation;
    private String education;
    private Integer height;
    private String religion;
    private String sexualOrientation;
    private String relationshipGoal;
    @ElementCollection
    private List<String> hobbies;
    @ElementCollection
    private List<String> interests;
    private String audioUrl;
    @OneToMany
    private List<Photo> photos;
}
```

### Match Entity

```java
@Entity
@Table(name = "matches")
public class Match extends BaseEntity {
    @ManyToOne
    private User sender;
    @ManyToOne
    private User receiver;
    private MatchStatus status;
    private String message;
    private LocalDateTime matchedAt;
    private LocalDateTime respondedAt;
}
```

## 🔒 Seguridad

### JWT Authentication

- Tokens con expiración configurable
- Refresh tokens para renovación
- Blacklist de tokens inválidos

### Spring Security

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // Configuración de filtros
    // Endpoints públicos vs protegidos
    // CORS configuration
    // CSRF protection
}
```

### Roles y Permisos

- **USER**: Usuario estándar
- **PREMIUM**: Usuario con plan activo
- **ADMIN**: Administrador del sistema

### Validaciones

- Validación de inputs con Bean Validation
- Sanitización de datos
- Rate limiting por IP

## 🧪 Testing

### Ejecutar tests

```bash
# Todos los tests
./mvnw test

# Tests específicos
./mvnw test -Dtest=UserServiceTest

# Tests con coverage
./mvnw test jacoco:report
```

### Tipos de tests

- **Unit Tests**: Servicios y componentes
- **Integration Tests**: Controladores y repositorios
- **E2E Tests**: Flujos completos

### Estructura de tests

```
src/test/java/com/feeling/
├── unit/
│   ├── service/
│   └── util/
├── integration/
│   ├── controller/
│   └── repository/
└── e2e/
```

## 📦 Deployment

### Build para producción

```bash
# Generar JAR
./mvnw clean package

# Ejecutar JAR
java -jar target/feeling-backend-1.0.0.jar

# Con perfil de producción
java -jar -Dspring.profiles.active=prod target/feeling-backend-1.0.0.jar
```

### Docker

```dockerfile
FROM openjdk:21-jdk-slim
COPY target/feeling-backend-1.0.0.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

```bash
# Build imagen
docker build -t feeling-backend .

# Ejecutar contenedor
docker run -p 8081:8081 feeling-backend
```

## 📚 Documentación API

### Swagger UI

Accesible en: http://localhost:8081/api/swagger-ui.html

### OpenAPI Spec

Disponible en: http://localhost:8081/api/v3/api-docs

### Postman Collection

Importar desde: `docs/postman/feeling-api.postman_collection.json`

## 🔧 Herramientas de desarrollo

### IntelliJ IDEA

- Lombok plugin
- Spring Boot plugin
- Database tools

### VS Code

- Extension Pack for Java
- Spring Boot Extension Pack
- MySQL extension

## 📊 Monitoreo

- Spring Boot Actuator endpoints
- Métricas con Micrometer
- Logs estructurados con Logback

## 🚀 Mejores Prácticas

1. **DTOs**: Siempre usar DTOs, nunca exponer entidades
2. **Validación**: Validar en controlador y servicio
3. **Excepciones**: Manejo centralizado y consistente
4. **Logs**: Loggear operaciones importantes
5. **Transacciones**: @Transactional en servicios
6. **Cache**: Usar @Cacheable para consultas frecuentes
7. **Async**: @Async para operaciones pesadas

---

Para más información, consulta la [documentación principal](../README.md)
