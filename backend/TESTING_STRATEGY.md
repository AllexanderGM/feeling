# Estrategia de Testing para Feeling Backend

## 📋 Índice
1. [Estructura de Testing Recomendada](#estructura)
2. [Tipos de Tests](#tipos-de-tests)
3. [Herramientas y Dependencias](#herramientas)
4. [Convenciones y Buenas Prácticas](#convenciones)
5. [Pirámide de Testing](#pirámide)
6. [Ejemplos de Implementación](#ejemplos)
7. [Roadmap de Testing](#roadmap)

---

## 🏗️ Estructura de Testing Recomendada {#estructura}

```
src/test/java/com/feeling/
├── unit/                                    # Tests unitarios
│   ├── packages/
│   │   ├── user/
│   │   │   ├── domain/
│   │   │   │   ├── dto/
│   │   │   │   │   └── UserDTOMapperTest.java
│   │   │   │   └── services/
│   │   │   │       ├── UserServiceTest.java
│   │   │   │       ├── UserTagServiceTest.java
│   │   │   │       └── UserAttributeServiceTest.java
│   │   │   └── infrastructure/
│   │   │       └── entities/
│   │   │           └── UserTest.java
│   │   ├── auth/
│   │   │   └── domain/
│   │   │       └── services/
│   │   │           ├── AuthServiceTest.java
│   │   │           └── JwtServiceTest.java
│   │   ├── event/
│   │   │   └── domain/
│   │   │       └── services/
│   │   │           ├── EventServiceTest.java
│   │   │           └── EventRegistrationServiceTest.java
│   │   ├── booking/
│   │   │   └── domain/
│   │   │       └── services/
│   │   │           └── BookingServiceTest.java
│   │   └── match/
│   │       └── domain/
│   │           └── services/
│   │               └── MatchServiceTest.java
│   └── config/
│       └── security/
│           └── JwtAuthenticationFilterTest.java
│
├── integration/                             # Tests de integración
│   ├── api/                                 # Tests de API REST
│   │   ├── auth/
│   │   │   ├── AuthControllerIntegrationTest.java
│   │   │   └── OAuthControllerIntegrationTest.java
│   │   ├── user/
│   │   │   ├── UserControllerIntegrationTest.java
│   │   │   └── UserProfileControllerIntegrationTest.java
│   │   ├── event/
│   │   │   ├── EventControllerIntegrationTest.java
│   │   │   └── EventRegistrationControllerIntegrationTest.java
│   │   └── booking/
│   │       └── BookingControllerIntegrationTest.java
│   ├── repository/                          # Tests de repositorios
│   │   ├── UserRepositoryIntegrationTest.java
│   │   ├── EventRepositoryIntegrationTest.java
│   │   └── BookingRepositoryIntegrationTest.java
│   └── database/
│       └── DatabaseMigrationTest.java
│
├── e2e/                                     # Tests end-to-end
│   ├── scenarios/
│   │   ├── UserRegistrationFlowTest.java
│   │   ├── EventBookingFlowTest.java
│   │   └── MatchingFlowTest.java
│   └── performance/
│       └── LoadTest.java
│
├── fixtures/                                # Datos de prueba
│   ├── UserFixtures.java
│   ├── EventFixtures.java
│   ├── BookingFixtures.java
│   └── builders/
│       ├── UserBuilder.java
│       ├── EventBuilder.java
│       └── BookingBuilder.java
│
└── helpers/                                 # Utilidades de testing
    ├── TestSecurityConfig.java
    ├── TestDataCleanup.java
    ├── MockAuthentication.java
    └── TestContainersConfig.java
```

---

## 🧪 Tipos de Tests {#tipos-de-tests}

### 1. **Tests Unitarios** (70% de cobertura)
**Objetivo**: Probar componentes individuales de manera aislada.

**Qué testear**:
- ✅ Servicios de dominio (lógica de negocio)
- ✅ DTOs y mappers
- ✅ Validaciones
- ✅ Métodos de entidades
- ✅ Utilidades y helpers

**Características**:
- Rápidos (< 1 segundo por test)
- No requieren BD ni contexto de Spring
- Usan mocks para dependencias
- Alta cobertura de casos edge

**Frameworks**: JUnit 5, Mockito, AssertJ

---

### 2. **Tests de Integración** (25% de cobertura)
**Objetivo**: Probar la integración entre componentes.

**Qué testear**:
- ✅ Controllers + Services + Repositories
- ✅ Queries de base de datos
- ✅ Transacciones
- ✅ Autenticación y autorización
- ✅ Serialización JSON

**Características**:
- Más lentos (1-5 segundos por test)
- Requieren contexto de Spring
- Usan BD en memoria o TestContainers
- Verifican integración real

**Frameworks**: Spring Boot Test, TestContainers, MockMvc

---

### 3. **Tests End-to-End** (5% de cobertura)
**Objetivo**: Probar flujos completos de usuario.

**Qué testear**:
- ✅ Registro + Verificación + Login
- ✅ Crear evento + Reservar + Pagar
- ✅ Match + Chat + Favoritos
- ✅ Flujos críticos de negocio

**Características**:
- Muy lentos (5-30 segundos por test)
- BD real o TestContainers
- Simula comportamiento de usuario real
- Foco en happy paths y critical paths

**Frameworks**: Spring Boot Test, RestAssured, TestContainers

---

## 🛠️ Herramientas y Dependencias {#herramientas}

### Agregar a `pom.xml`:

```xml
<dependencies>
    <!-- Ya tienes estas -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- AGREGAR ESTAS -->

    <!-- Mockito para mocking avanzado -->
    <dependency>
        <groupId>org.mockito</groupId>
        <artifactId>mockito-inline</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- AssertJ para assertions fluidas -->
    <dependency>
        <groupId>org.assertj</groupId>
        <artifactId>assertj-core</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- TestContainers para tests con BD real -->
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>testcontainers</artifactId>
        <version>1.19.3</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>mysql</artifactId>
        <version>1.19.3</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>1.19.3</version>
        <scope>test</scope>
    </dependency>

    <!-- RestAssured para tests de API -->
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>rest-assured</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- Faker para datos de prueba -->
    <dependency>
        <groupId>com.github.javafaker</groupId>
        <artifactId>javafaker</artifactId>
        <version>1.0.2</version>
        <scope>test</scope>
    </dependency>

    <!-- H2 para tests unitarios rápidos -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>

<build>
    <plugins>
        <!-- Plugin para cobertura de código -->
        <plugin>
            <groupId>org.jacoco</groupId>
            <artifactId>jacoco-maven-plugin</artifactId>
            <version>0.8.11</version>
            <executions>
                <execution>
                    <goals>
                        <goal>prepare-agent</goal>
                    </goals>
                </execution>
                <execution>
                    <id>report</id>
                    <phase>test</phase>
                    <goals>
                        <goal>report</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

---

## 📏 Convenciones y Buenas Prácticas {#convenciones}

### Nomenclatura de Tests

```java
// ✅ CORRECTO - Patrón: methodName_scenario_expectedBehavior
@Test
void createUser_withValidData_shouldCreateUserSuccessfully()

@Test
void createUser_withDuplicateEmail_shouldThrowException()

@Test
void getUserById_whenUserNotFound_shouldThrowNotFoundException()

// ❌ INCORRECTO
@Test
void test1()

@Test
void testCreateUser()
```

### Estructura AAA (Arrange-Act-Assert)

```java
@Test
void createEvent_withValidData_shouldReturnCreatedEvent() {
    // ARRANGE - Preparar datos y mocks
    EventCreateRequestDTO request = EventCreateRequestDTO.builder()
        .title("Test Event")
        .description("Test Description")
        .eventDate(LocalDateTime.now().plusDays(7))
        .price(new BigDecimal("50.00"))
        .maxCapacity(100)
        .category(EventCategory.CULTURAL)
        .build();

    when(userRepository.findByEmail("test@example.com"))
        .thenReturn(Optional.of(testUser));
    when(eventRepository.save(any(Event.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // ACT - Ejecutar el método a probar
    EventResponseDTO result = eventService.createEvent(request, "test@example.com");

    // ASSERT - Verificar resultados
    assertThat(result).isNotNull();
    assertThat(result.title()).isEqualTo("Test Event");
    assertThat(result.price()).isEqualTo(new BigDecimal("50.00"));
    verify(eventRepository, times(1)).save(any(Event.class));
}
```

### Uso de Builders para Fixtures

```java
// Crear TestBuilder para objetos complejos
public class UserBuilder {
    private Long id = 1L;
    private String name = "Test";
    private String lastName = "User";
    private String email = "test@example.com";
    private boolean verified = true;
    private ApprovalStatus approvalStatus = ApprovalStatus.APPROVED;

    public UserBuilder withId(Long id) {
        this.id = id;
        return this;
    }

    public UserBuilder withEmail(String email) {
        this.email = email;
        return this;
    }

    public UserBuilder notVerified() {
        this.verified = false;
        return this;
    }

    public User build() {
        return User.builder()
            .id(id)
            .name(name)
            .lastName(lastName)
            .email(email)
            .verified(verified)
            .approvalStatus(approvalStatus)
            .build();
    }
}

// Uso
User testUser = new UserBuilder()
    .withEmail("custom@example.com")
    .notVerified()
    .build();
```

---

## 🔺 Pirámide de Testing {#pirámide}

```
         ╱╲
        ╱  ╲     E2E Tests (5%)
       ╱────╲    - Flujos completos de usuario
      ╱      ╲   - Críticos de negocio
     ╱        ╲
    ╱──────────╲  Integration Tests (25%)
   ╱            ╲ - Controllers + Services + DB
  ╱              ╲- Autenticación/Autorización
 ╱────────────────╲
╱                  ╲ Unit Tests (70%)
────────────────────- Servicios, DTOs, Validaciones
```

### Objetivos de Cobertura

| Tipo de Componente | Cobertura Objetivo |
|--------------------|-------------------|
| Servicios de Dominio | 90%+ |
| DTOs y Mappers | 85%+ |
| Controllers | 80%+ |
| Repositorios | 70%+ |
| Entidades | 60%+ |
| Configuraciones | 40%+ |

---

## 💡 Ejemplos de Implementación {#ejemplos}

### Ejemplo 1: Test Unitario de Servicio

```java
package com.feeling.unit.packages.booking.domain.services;

import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.packages.booking.domain.dto.BookingRequestDTO;
import com.feeling.packages.booking.domain.dto.BookingResponseDTO;
import com.feeling.packages.booking.domain.services.BookingService;
import com.feeling.packages.booking.infrastructure.entities.Booking;
import com.feeling.packages.booking.infrastructure.repositories.IBookingRepository;
import com.feeling.packages.event.infrastructure.entities.Event;
import com.feeling.packages.event.infrastructure.repositories.IEventRepository;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookingService - Unit Tests")
class BookingServiceTest {

    @Mock
    private IBookingRepository bookingRepository;

    @Mock
    private IEventRepository eventRepository;

    @Mock
    private IUserRepository userRepository;

    @InjectMocks
    private BookingService bookingService;

    private User testUser;
    private Event testEvent;
    private BookingRequestDTO validRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
            .id(1L)
            .email("test@example.com")
            .name("Test")
            .lastName("User")
            .build();

        testEvent = Event.builder()
            .id(1L)
            .title("Test Event")
            .isActive(true)
            .maxCapacity(100)
            .currentAttendees(0)
            .eventDate(LocalDateTime.now().plusDays(7))
            .build();

        validRequest = BookingRequestDTO.builder()
            .eventId(1L)
            .bookingDate(LocalDateTime.now().plusDays(7))
            .attendees(2)
            .build();
    }

    @Test
    @DisplayName("Should create booking successfully with valid data")
    void createBooking_withValidData_shouldCreateBookingSuccessfully() {
        // Arrange
        when(userRepository.findByEmail("test@example.com"))
            .thenReturn(Optional.of(testUser));
        when(eventRepository.findById(1L))
            .thenReturn(Optional.of(testEvent));
        when(bookingRepository.save(any(Booking.class)))
            .thenAnswer(invocation -> {
                Booking booking = invocation.getArgument(0);
                booking.setId(1L);
                return booking;
            });

        // Act
        BookingResponseDTO result = bookingService.createBooking(validRequest, "test@example.com");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.userId()).isEqualTo(1L);
        assertThat(result.eventId()).isEqualTo(1L);
        assertThat(result.attendees()).isEqualTo(2);

        verify(userRepository).findByEmail("test@example.com");
        verify(eventRepository).findById(1L);
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when user not found")
    void createBooking_whenUserNotFound_shouldThrowUnauthorizedException() {
        // Arrange
        when(userRepository.findByEmail("test@example.com"))
            .thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() ->
            bookingService.createBooking(validRequest, "test@example.com")
        )
            .isInstanceOf(UnauthorizedException.class)
            .hasMessage("Usuario no encontrado");

        verify(userRepository).findByEmail("test@example.com");
        verify(eventRepository, never()).findById(any());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw NotFoundException when event not found")
    void createBooking_whenEventNotFound_shouldThrowNotFoundException() {
        // Arrange
        when(userRepository.findByEmail("test@example.com"))
            .thenReturn(Optional.of(testUser));
        when(eventRepository.findById(1L))
            .thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() ->
            bookingService.createBooking(validRequest, "test@example.com")
        )
            .isInstanceOf(NotFoundException.class)
            .hasMessage("Evento no encontrado");

        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw BadRequestException when event is not active")
    void createBooking_whenEventNotActive_shouldThrowBadRequestException() {
        // Arrange
        testEvent.setIsActive(false);

        when(userRepository.findByEmail("test@example.com"))
            .thenReturn(Optional.of(testUser));
        when(eventRepository.findById(1L))
            .thenReturn(Optional.of(testEvent));

        // Act & Assert
        assertThatThrownBy(() ->
            bookingService.createBooking(validRequest, "test@example.com")
        )
            .isInstanceOf(BadRequestException.class)
            .hasMessage("El evento no está activo");

        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw BadRequestException when event is full")
    void createBooking_whenEventIsFull_shouldThrowBadRequestException() {
        // Arrange
        testEvent.setCurrentAttendees(100);

        when(userRepository.findByEmail("test@example.com"))
            .thenReturn(Optional.of(testUser));
        when(eventRepository.findById(1L))
            .thenReturn(Optional.of(testEvent));
        when(bookingRepository.sumAttendeesByEventId(1L))
            .thenReturn(100);

        // Act & Assert
        assertThatThrownBy(() ->
            bookingService.createBooking(validRequest, "test@example.com")
        )
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("capacidad");

        verify(bookingRepository, never()).save(any());
    }
}
```

### Ejemplo 2: Test de Integración con MockMvc

```java
package com.feeling.integration.api.booking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.feeling.packages.booking.domain.dto.BookingRequestDTO;
import com.feeling.packages.event.infrastructure.entities.Event;
import com.feeling.packages.event.infrastructure.repositories.IEventRepository;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("BookingController - Integration Tests")
class BookingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private IEventRepository eventRepository;

    private User testUser;
    private Event testEvent;

    @BeforeEach
    void setUp() {
        // Crear usuario de prueba
        testUser = User.builder()
            .email("test@example.com")
            .name("Test")
            .lastName("User")
            .verified(true)
            .build();
        testUser = userRepository.save(testUser);

        // Crear evento de prueba
        testEvent = Event.builder()
            .title("Test Event")
            .description("Test Description")
            .isActive(true)
            .maxCapacity(100)
            .currentAttendees(0)
            .eventDate(LocalDateTime.now().plusDays(7))
            .createdBy(testUser)
            .build();
        testEvent = eventRepository.save(testEvent);
    }

    @Test
    @WithMockUser(username = "test@example.com")
    @DisplayName("POST /bookings should create booking and return 201")
    void createBooking_withValidData_shouldReturn201() throws Exception {
        // Arrange
        BookingRequestDTO request = BookingRequestDTO.builder()
            .eventId(testEvent.getId())
            .bookingDate(LocalDateTime.now().plusDays(7))
            .attendees(2)
            .specialRequests("Window seat please")
            .build();

        // Act & Assert
        mockMvc.perform(post("/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.eventId").value(testEvent.getId()))
            .andExpect(jsonPath("$.attendees").value(2))
            .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    @DisplayName("GET /bookings/my-bookings should return user bookings")
    void getMyBookings_shouldReturnUserBookings() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/bookings/my-bookings"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /bookings without authentication should return 401")
    void getMyBookings_withoutAuth_shouldReturn401() throws Exception {
        mockMvc.perform(get("/bookings/my-bookings"))
            .andExpect(status().isUnauthorized());
    }
}
```

### Ejemplo 3: Test E2E con TestContainers

```java
package com.feeling.e2e.scenarios;

import com.feeling.packages.auth.domain.dto.AuthRegisterRequestDTO;
import com.feeling.packages.event.domain.dto.EventCreateRequestDTO;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
@DisplayName("Event Booking Flow - E2E Test")
class EventBookingFlowTest {

    @LocalServerPort
    private int port;

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
        .withDatabaseName("feeling_test")
        .withUsername("test")
        .withPassword("test");

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";
    }

    @Test
    @DisplayName("Complete flow: Register → Create Event → Book Event")
    void completeEventBookingFlow() {
        // 1. Registrar usuario
        String accessToken = given()
            .contentType(ContentType.JSON)
            .body(new AuthRegisterRequestDTO(
                "test@example.com",
                "Password123!",
                "Test",
                "User"
            ))
        .when()
            .post("/auth/register")
        .then()
            .statusCode(201)
            .extract()
            .path("accessToken");

        // 2. Crear evento
        Long eventId = given()
            .header("Authorization", "Bearer " + accessToken)
            .contentType(ContentType.JSON)
            .body(new EventCreateRequestDTO(
                "Test Event",
                "Description",
                LocalDateTime.now().plusDays(7),
                new BigDecimal("50.00"),
                100,
                EventCategory.CULTURAL,
                null
            ))
        .when()
            .post("/events")
        .then()
            .statusCode(201)
            .body("title", equalTo("Test Event"))
            .extract()
            .path("id");

        // 3. Reservar evento
        given()
            .header("Authorization", "Bearer " + accessToken)
            .contentType(ContentType.JSON)
            .body(Map.of(
                "eventId", eventId,
                "bookingDate", LocalDateTime.now().plusDays(7).toString(),
                "attendees", 2
            ))
        .when()
            .post("/bookings")
        .then()
            .statusCode(201)
            .body("eventId", equalTo(eventId.intValue()))
            .body("status", equalTo("PENDING"));
    }
}
```

---

## 🗺️ Roadmap de Testing {#roadmap}

### Fase 1: Fundación (Semana 1-2)
- [ ] Configurar dependencias de testing en `pom.xml`
- [ ] Crear estructura de carpetas
- [ ] Configurar `application-test.properties`
- [ ] Crear clases base: `BaseTest`, `BaseIntegrationTest`
- [ ] Implementar fixtures y builders básicos
- [ ] Configurar JaCoCo para cobertura

### Fase 2: Tests Unitarios Críticos (Semana 3-4)
- [ ] Tests de `AuthService`
- [ ] Tests de `UserService`
- [ ] Tests de `EventService`
- [ ] Tests de `BookingService`
- [ ] Tests de `MatchService`
- [ ] Tests de DTOs y Mappers
- [ ] Meta: 70% cobertura en servicios

### Fase 3: Tests de Integración (Semana 5-6)
- [ ] Tests de `AuthController`
- [ ] Tests de `UserController`
- [ ] Tests de `EventController`
- [ ] Tests de repositorios custom queries
- [ ] Tests de seguridad y autorización
- [ ] Meta: 60% cobertura en controllers

### Fase 4: Tests E2E (Semana 7)
- [ ] Flujo de registro y verificación
- [ ] Flujo de creación y reserva de eventos
- [ ] Flujo de matching
- [ ] Flujo de pagos (si aplica)
- [ ] Meta: 5 escenarios críticos cubiertos

### Fase 5: Optimización (Semana 8)
- [ ] Revisión de tests lentos
- [ ] Optimización de fixtures
- [ ] Documentación de convenciones
- [ ] CI/CD integration
- [ ] Meta: Suite completa < 5 minutos

---

## 📊 Comandos Útiles

```bash
# Ejecutar todos los tests
mvn test

# Ejecutar solo tests unitarios
mvn test -Dtest=*Test

# Ejecutar solo tests de integración
mvn test -Dtest=*IntegrationTest

# Ejecutar con reporte de cobertura
mvn clean test jacoco:report

# Ver reporte de cobertura
open target/site/jacoco/index.html

# Ejecutar tests en paralelo (más rápido)
mvn test -T 4C

# Saltar tests en build
mvn clean install -DskipTests
```

---

## 🎯 KPIs de Calidad

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Cobertura Total | > 75% | _TBD_ |
| Cobertura Servicios | > 85% | _TBD_ |
| Tests que fallan | 0 | _TBD_ |
| Tiempo de ejecución | < 5 min | _TBD_ |
| Tests por clase | > 5 | _TBD_ |

---

## 📚 Recursos Recomendados

1. **Testing with Spring Boot** - Baeldung
2. **Effective Unit Testing** - Lasse Koskela
3. **Growing Object-Oriented Software, Guided by Tests** - Freeman & Pryce
4. **Mockito Documentation** - mockito.org
5. **TestContainers Guide** - testcontainers.org

---

**Última actualización**: 2025-10-03
**Versión**: 1.0
**Autor**: Equipo Feeling

