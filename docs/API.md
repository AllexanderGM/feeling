# API Documentation - Feeling

## 📋 Índice

- [Información General](#información-general)
- [Autenticación](#autenticación)
- [Endpoints](#endpoints)
  - [Auth](#auth-endpoints)
  - [Users](#users-endpoints)
  - [Search & Matching](#search--matching-endpoints)
  - [Events](#events-endpoints)
  - [Payments](#payments-endpoints)
  - [Admin](#admin-endpoints)
- [Modelos de Datos](#modelos-de-datos)
- [Códigos de Error](#códigos-de-error)
- [Rate Limiting](#rate-limiting)
- [Ejemplos](#ejemplos)

## 📌 Información General

### Base URL

```
Development: http://localhost:8081/api
Production: https://api.feeling.com/api
```

### Headers Requeridos

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token} # Para endpoints protegidos
```

### Formato de Respuesta

Todas las respuestas siguen este formato:

```json
{
  "success": true,
  "data": {},
  "message": "Operación exitosa",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Respuesta de error:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error",
    "field": "campo_con_error" // opcional
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación.

### Obtener Token

```http
POST /api/auth/login
```

**Request:**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "user": {
      "id": "123",
      "email": "usuario@ejemplo.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "profileComplete": true
    }
  }
}
```

### Usar Token

Incluir en headers:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 📡 Endpoints

### Auth Endpoints

#### Login

```http
POST /api/auth/login
```

**Body:**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

#### Register

```http
POST /api/auth/register
```

**Body:**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "birthDate": "1990-01-15",
  "gender": "MALE",
  "city": "Bogotá",
  "phoneNumber": "+573001234567",
  "acceptTerms": true
}
```

#### Refresh Token

```http
POST /api/auth/refresh
```

**Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

#### Forgot Password

```http
POST /api/auth/forgot-password
```

**Body:**

```json
{
  "email": "usuario@ejemplo.com"
}
```

#### Reset Password

```http
POST /api/auth/reset-password
```

**Body:**

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

#### Verify Email

```http
GET /api/auth/verify-email?token={verification-token}
```

### Users Endpoints

#### Get Profile

```http
GET /api/users/profile
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123",
    "email": "usuario@ejemplo.com",
    "profile": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "bio": "Descripción personal...",
      "birthDate": "1990-01-15",
      "gender": "MALE",
      "city": "Bogotá",
      "occupation": "Ingeniero",
      "education": "Universitaria",
      "height": 175,
      "religion": "Católico",
      "sexualOrientation": "Heterosexual",
      "relationshipGoal": "SERIOUS_RELATIONSHIP",
      "hobbies": ["Lectura", "Cine", "Viajes"],
      "interests": ["Tecnología", "Música"],
      "photos": [
        {
          "id": "photo1",
          "url": "https://s3.../photo1.jpg",
          "isMain": true
        }
      ],
      "audioUrl": "https://s3.../audio.mp3"
    },
    "subscription": {
      "plan": "BASIC",
      "attemptsRemaining": 2,
      "expiresAt": "2024-12-31"
    }
  }
}
```

#### Update Profile

```http
PUT /api/users/profile
Authorization: Bearer {token}
```

**Body:**

```json
{
  "bio": "Nueva descripción...",
  "occupation": "Nuevo trabajo",
  "hobbies": ["Hobby1", "Hobby2"],
  "interests": ["Interés1", "Interés2"],
  "relationshipGoal": "SERIOUS_RELATIONSHIP"
}
```

#### Upload Photo

```http
POST /api/users/upload-photo
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**

- `photo`: archivo de imagen (max 5MB)
- `isMain`: boolean (opcional)

#### Delete Photo

```http
DELETE /api/users/photo/{photoId}
Authorization: Bearer {token}
```

#### Update Preferences

```http
PUT /api/users/preferences
Authorization: Bearer {token}
```

**Body:**

```json
{
  "ageMin": 25,
  "ageMax": 35,
  "maxDistance": 50,
  "genderPreference": ["FEMALE"],
  "showMe": true,
  "notifications": {
    "matches": true,
    "messages": true,
    "events": false
  }
}
```

#### Delete Account

```http
DELETE /api/users/account
Authorization: Bearer {token}
```

**Body:**

```json
{
  "password": "current-password",
  "reason": "No longer interested"
}
```

### Search & Matching Endpoints

#### Search Users

```http
POST /api/search
Authorization: Bearer {token}
```

**Body:**

```json
{
  "filters": {
    "ageMin": 25,
    "ageMax": 35,
    "gender": ["FEMALE"],
    "city": "Bogotá",
    "maxDistance": 20,
    "hobbies": ["Viajes", "Lectura"],
    "religion": "Cualquiera",
    "hasPhoto": true
  },
  "page": 0,
  "size": 20,
  "sort": "DISTANCE"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "456",
        "firstName": "María",
        "age": 28,
        "city": "Bogotá",
        "distance": 5.2,
        "bio": "Primeras 100 palabras...",
        "photos": [
          {
            "url": "https://s3.../photo.jpg",
            "isMain": true
          }
        ],
        "matchPercentage": 85,
        "commonInterests": ["Viajes", "Lectura"]
      }
    ],
    "totalElements": 150,
    "totalPages": 8,
    "currentPage": 0
  }
}
```

#### Get Search Filters

```http
GET /api/search/filters
Authorization: Bearer {token}
```

#### Send Match Request

```http
POST /api/matches/send
Authorization: Bearer {token}
```

**Body:**

```json
{
  "receiverId": "456",
  "message": "¡Hola! Me gustó tu perfil..."
}
```

#### Get Received Matches

```http
GET /api/matches/received?status=PENDING
Authorization: Bearer {token}
```

#### Get Sent Matches

```http
GET /api/matches/sent?status=ALL
Authorization: Bearer {token}
```

#### Accept Match

```http
POST /api/matches/{matchId}/accept
Authorization: Bearer {token}
```

#### Reject Match

```http
POST /api/matches/{matchId}/reject
Authorization: Bearer {token}
```

#### Get Active Matches

```http
GET /api/matches/active
Authorization: Bearer {token}
```

### Events Endpoints

#### List Events

```http
GET /api/events?city=Bogotá&upcoming=true
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "event1",
      "title": "Speed Dating Feeling",
      "description": "Evento de citas rápidas...",
      "date": "2024-02-14T19:00:00",
      "location": {
        "name": "Café Central",
        "address": "Calle 85 #15-20",
        "city": "Bogotá"
      },
      "capacity": 40,
      "spotsAvailable": 15,
      "price": 50000,
      "imageUrl": "https://s3.../event.jpg",
      "tags": ["speed-dating", "25-35-años"]
    }
  ]
}
```

#### Get Event Details

```http
GET /api/events/{eventId}
Authorization: Bearer {token}
```

#### Reserve Event

```http
POST /api/events/{eventId}/reserve
Authorization: Bearer {token}
```

**Body:**

```json
{
  "attendees": 1,
  "specialRequirements": "Vegetariano"
}
```

#### My Events

```http
GET /api/events/my-events
Authorization: Bearer {token}
```

#### Cancel Reservation

```http
DELETE /api/events/{eventId}/cancel
Authorization: Bearer {token}
```

### Payments Endpoints

#### Get Plans

```http
GET /api/plans
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "basic",
      "name": "Plan Básico",
      "description": "1 intento de conexión",
      "price": 200000,
      "attempts": 1,
      "features": ["1 intento de match", "Vigencia de 1 año", "Soporte por email"]
    },
    {
      "id": "extended",
      "name": "Plan Extendido",
      "description": "3 intentos de conexión",
      "price": 400000,
      "attempts": 3,
      "features": [
        "3 intentos de match",
        "Vigencia de 1 año",
        "Soporte prioritario",
        "Acceso a eventos exclusivos"
      ],
      "popular": true
    }
  ]
}
```

#### Purchase Plan

```http
POST /api/payments/purchase
Authorization: Bearer {token}
```

**Body:**

```json
{
  "planId": "extended",
  "paymentMethod": "CREDIT_CARD",
  "paymentDetails": {
    "cardNumber": "4111111111111111",
    "cardHolder": "Juan Pérez",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123"
  }
}
```

#### Payment History

```http
GET /api/payments/history
Authorization: Bearer {token}
```

#### Get Attempts

```http
GET /api/payments/attempts
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalAttempts": 3,
    "usedAttempts": 1,
    "remainingAttempts": 2,
    "expiresAt": "2024-12-31",
    "history": [
      {
        "usedAt": "2024-01-10T15:30:00",
        "usedWith": "María García"
      }
    ]
  }
}
```

### Admin Endpoints

#### Dashboard Stats

```http
GET /api/admin/stats
Authorization: Bearer {token}
X-Admin-Key: {admin-key}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 5420,
      "active": 3200,
      "newThisMonth": 450,
      "premium": 1200
    },
    "matches": {
      "total": 15000,
      "successful": 8500,
      "thisMonth": 1200,
      "successRate": 56.7
    },
    "revenue": {
      "thisMonth": 240000000,
      "lastMonth": 220000000,
      "growth": 9.1
    },
    "events": {
      "upcoming": 5,
      "totalAttendees": 320
    }
  }
}
```

#### Manage Users

```http
GET /api/admin/users?page=0&size=50&search=juan
Authorization: Bearer {token}
X-Admin-Key: {admin-key}
```

#### Update User Status

```http
PUT /api/admin/users/{userId}/status
Authorization: Bearer {token}
X-Admin-Key: {admin-key}
```

**Body:**

```json
{
  "active": false,
  "reason": "Violación de términos de servicio"
}
```

#### View Reports

```http
GET /api/admin/reports?status=PENDING
Authorization: Bearer {token}
X-Admin-Key: {admin-key}
```

#### Resolve Report

```http
POST /api/admin/reports/{reportId}/resolve
Authorization: Bearer {token}
X-Admin-Key: {admin-key}
```

**Body:**

```json
{
  "action": "WARNING",
  "notes": "Se envió advertencia al usuario"
}
```

## 📊 Modelos de Datos

### User Model

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  city: string;
  phoneNumber: string;
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
  lastLogin: string;
}
```

### Profile Model

```typescript
interface Profile {
  bio: string;
  occupation: string;
  education: string;
  height: number;
  religion: string;
  sexualOrientation: string;
  relationshipGoal: "FRIENDSHIP" | "CASUAL" | "SERIOUS_RELATIONSHIP";
  hobbies: string[];
  interests: string[];
  photos: Photo[];
  audioUrl?: string;
}
```

### Match Model

```typescript
interface Match {
  id: string;
  sender: User;
  receiver: User;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  message: string;
  createdAt: string;
  respondedAt?: string;
}
```

## ❌ Códigos de Error

| Código         | Descripción                         | HTTP Status |
| -------------- | ----------------------------------- | ----------- |
| AUTH_001       | Credenciales inválidas              | 401         |
| AUTH_002       | Token expirado                      | 401         |
| AUTH_003       | Token inválido                      | 401         |
| AUTH_004       | No autorizado                       | 403         |
| USER_001       | Usuario no encontrado               | 404         |
| USER_002       | Email ya registrado                 | 409         |
| USER_003       | Perfil incompleto                   | 400         |
| MATCH_001      | Sin intentos disponibles            | 402         |
| MATCH_002      | Match ya enviado                    | 409         |
| MATCH_003      | No puedes hacer match contigo mismo | 400         |
| PAYMENT_001    | Pago rechazado                      | 402         |
| PAYMENT_002    | Plan no encontrado                  | 404         |
| VALIDATION_001 | Datos inválidos                     | 400         |
| SERVER_001     | Error interno del servidor          | 500         |

## ⏱️ Rate Limiting

La API implementa rate limiting para prevenir abuso:

| Endpoint        | Límite | Ventana |
| --------------- | ------ | ------- |
| /auth/login     | 5      | 15 min  |
| /auth/register  | 3      | 1 hora  |
| /search         | 100    | 1 hora  |
| /matches/send   | 10     | 1 hora  |
| Otros endpoints | 1000   | 1 hora  |

Headers de respuesta:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642098130
```

## 💡 Ejemplos

### Flujo completo de registro y primer match

```javascript
// 1. Registrar usuario
const register = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "nuevo@usuario.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    firstName: "Juan",
    lastName: "Pérez",
    birthDate: "1990-01-15",
    gender: "MALE",
    city: "Bogotá",
    phoneNumber: "+573001234567",
    acceptTerms: true,
  }),
});

const {
  data: { token },
} = await register.json();

// 2. Completar perfil
await fetch("/api/users/profile", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    bio: "Soy una persona alegre...",
    occupation: "Ingeniero",
    hobbies: ["Lectura", "Cine"],
    relationshipGoal: "SERIOUS_RELATIONSHIP",
  }),
});

// 3. Buscar usuarios
const search = await fetch("/api/search", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    filters: {
      ageMin: 25,
      ageMax: 35,
      gender: ["FEMALE"],
      city: "Bogotá",
    },
  }),
});

const {
  data: { content },
} = await search.json();

// 4. Enviar match
await fetch("/api/matches/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    receiverId: content[0].id,
    message: "¡Hola! Me gustó tu perfil",
  }),
});
```

---

Para más información, consulta la [documentación principal](../README.md)
