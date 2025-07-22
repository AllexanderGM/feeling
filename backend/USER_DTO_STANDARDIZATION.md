# Estandarización de DTOs de Usuario

Este documento describe la estructura estandarizada para todos los DTOs que devuelven información del usuario en el
backend de Feeling.

## Estructura Base

Todos los DTOs que devuelven información del usuario siguen la estructura establecida en `AuthLoginResponseDTO`:

```json
{
  "status": {
    "verified": true,
    "profileComplete": false,
    "approved": false,
    "role": "CLIENT",
    "availableAttempts": 0,
    "createdAt": [
      2025,
      7,
      20,
      14,
      1,
      1,
      326690000
    ],
    "lastActive": [
      2025,
      7,
      20,
      17,
      34,
      58,
      994962791
    ]
  },
  "profile": {
    "name": "Jeisson Alexander",
    "lastName": "Gavilan Murcia",
    "email": "amarok.no.seishin.260@gmail.com",
    "dateOfBirth": null,
    "age": null,
    "document": null,
    "phone": null,
    "city": null,
    "department": null,
    "country": null,
    "description": null,
    "images": [],
    "mainImage": "https://lh3.googleusercontent.com/...",
    "categoryInterest": null,
    "tags": []
  }
}
```

## DTOs Disponibles

### 1. UserStandardResponseDTO

**Ruta de ejemplo**: `/users/{email}/standard`
**Descripción**: Estructura estándar con status y profile básicos
**Uso**: Respuestas generales de usuario

### 2. UserPublicResponseDTO

**Ruta de ejemplo**: `/users/{email}/public`
**Descripción**: Solo datos públicos del usuario (sin información sensible)
**Uso**: Perfiles públicos, búsquedas, matches

### 3. UserExtendedResponseDTO

**Ruta de ejemplo**: `/api/user/profile/me/extended`
**Descripción**: Información completa incluyendo:

- `status`: Estado básico del usuario
- `profile`: Información del perfil
- `privacy`: Configuración de privacidad
- `notifications`: Configuración de notificaciones
- `metrics`: Métricas del usuario (vistas, likes, matches)
- `accountStatus`: Estado de la cuenta

### 4. UserResponseDTO (Administración)

**Ruta de ejemplo**: `/api/admin/users/all`
**Descripción**: DTO completo para administración que incluye ID y toda la información

### 5. AuthLoginResponseDTO

**Ruta de ejemplo**: `/api/auth/login`
**Descripción**: Incluye tokens de autenticación además de status y profile

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "status": {
    ...
  },
  "profile": {
    ...
  }
}
```

## Componentes Principales

### UserStatusDTO

```json
{
  "verified": true,
  "profileComplete": false,
  "approved": false,
  "role": "CLIENT",
  "availableAttempts": 0,
  "createdAt": [
    2025,
    7,
    20,
    14,
    1,
    1,
    326690000
  ],
  "lastActive": [
    2025,
    7,
    20,
    17,
    34,
    58,
    994962791
  ]
}
```

### UserProfileDataDTO

```json
{
  "name": "Jeisson Alexander",
  "lastName": "Gavilan Murcia",
  "email": "amarok.no.seishin.260@gmail.com",
  "dateOfBirth": null,
  "age": null,
  "document": null,
  "phone": null,
  "phoneCode": null,
  "city": null,
  "department": null,
  "country": null,
  "description": null,
  "images": [],
  "mainImage": "https://...",
  "categoryInterest": null,
  "tags": []
}
```

### UserPrivacyDTO

```json
{
  "publicAccount": true,
  "searchVisibility": true,
  "locationPublic": true,
  "showAge": true,
  "showLocation": true,
  "showPhone": false,
  "showMeInSearch": true
}
```

### UserNotificationDTO

```json
{
  "emailEnabled": true,
  "phoneEnabled": false,
  "matchesEnabled": true,
  "eventsEnabled": true,
  "loginEnabled": true,
  "paymentsEnabled": true
}
```

### UserMetricsDTO

```json
{
  "profileViews": 150,
  "likesReceived": 25,
  "matchesCount": 8,
  "popularityScore": 75.5
}
```

## Utilidad UserDTOMapper

La clase `UserDTOMapper` proporciona métodos estáticos para convertir entidades `User` a los diferentes DTOs:

```java
// Conversiones básicas
UserStatusDTO status = UserDTOMapper.toUserStatusDTO(user);
UserProfileDataDTO profile = UserDTOMapper.toUserProfileDataDTO(user);

// Conversiones completas
UserStandardResponseDTO standard = UserDTOMapper.toUserStandardResponseDTO(user);
UserPublicResponseDTO publicData = UserDTOMapper.toUserPublicResponseDTO(user);
UserExtendedResponseDTO extended = UserDTOMapper.toUserExtendedResponseDTO(user);
```

## Migración de DTOs Existentes

Para mantener compatibilidad mientras se migra:

1. **Mantener DTOs existentes** temporalmente para endpoints legacy
2. **Crear nuevos endpoints** con estructura estándar (ej: `/standard`, `/public`)
3. **Actualizar frontend** gradualmente para usar nuevos endpoints
4. **Deprecar endpoints antiguos** una vez completada la migración

## Beneficios

- **Consistencia**: Todos los DTOs siguen la misma estructura
- **Flexibilidad**: Diferentes niveles de detalle según necesidad
- **Mantenibilidad**: Cambios centralizados en UserDTOMapper
- **Seguridad**: Control granular de qué información se expone
- **Escalabilidad**: Fácil agregar nuevos campos o secciones