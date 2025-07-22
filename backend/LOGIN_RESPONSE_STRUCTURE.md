# Estructura de Respuesta del Login

Este documento describe la estructura actualizada de la respuesta del endpoint `/api/auth/login` que ahora incluye toda la información que el frontend necesita según `userStructure.js`.

## Nueva Estructura Completa

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzMyIsIm5hbWUiOiJKZWlzc29uIEFsZXhhbmRlciIsInR5cGUiOiJBQ0NFU1MiLCJzdWIiOiJhbWFyb2subm8uc2Vpc2hpbi4yNjBAZ21haWwuY29tIiwiaWF0IjoxNzUzMDMyODk4LCJleHAiOjE3NTMwNDAwOTh9.8YYPqx_5SU2b_ekErV0EhMV0YvRhsdZEM1gCyxp4RvE",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzMyIsIm5hbWUiOiJKZWlzc29uIEFsZXhhbmRlciIsInR5cGUiOiJSRUZSRVNIIiwic3ViIjoiYW1hcm9rLm5vLnNlaXNoaW4uMjYwQGdtYWlsLmNvbSIsImlhdCI6MTc1MzAzMjg5OCwiZXhwIjoxNzU1NjI0ODk4fQ.oAACFXEgEFuCUhXbreZVJHcxDNaKG1N6hMPJIsEDb0g",
  "status": {
    "verified": true,
    "profileComplete": false,
    "approved": false,
    "role": "CLIENT",
    "availableAttempts": 0,
    "createdAt": [2025, 7, 20, 14, 1, 1, 326690000],
    "lastActive": [2025, 7, 20, 17, 34, 58, 994962791]
  },
  "profile": {
    "name": "Jeisson Alexander",
    "lastName": "Gavilan Murcia",
    "email": "amarok.no.seishin.260@gmail.com",
    "dateOfBirth": null,
    "age": null,
    "document": null,
    "phone": null,
    "phoneCode": "+57",
    "country": "Colombia",
    "city": "Bogotá",
    "department": null,
    "locality": null,
    "description": null,
    "images": [],
    "mainImage": "https://lh3.googleusercontent.com/a/ACg8ocIYZXDVBRS1EpxlfZcp7Tf742KEop9ljKVss4oUbv0ExsGEtI9bmQ=s96-c",
    "categoryInterest": null,
    "gender": null,
    "tags": [],
    "agePreferenceMin": 18,
    "agePreferenceMax": 40,
    "locationPreferenceRadius": 50
  },
  "privacy": {
    "publicAccount": true,
    "searchVisibility": true,
    "locationPublic": true,
    "showAge": true,
    "showLocation": true,
    "showPhone": false,
    "showMeInSearch": true
  },
  "notifications": {
    "notificationsEmailEnabled": true,
    "notificationsPhoneEnabled": false,
    "notificationsMatchesEnabled": true,
    "notificationsEventsEnabled": true,
    "notificationsLoginEnabled": true,
    "notificationsPaymentsEnabled": true
  },
  "metrics": {
    "profileViews": 0,
    "likesReceived": 0,
    "matchesCount": 0,
    "popularityScore": 0.0
  },
  "auth": {
    "userAuthProvider": "GOOGLE",
    "externalId": "sub123456789",
    "externalAvatarUrl": "https://lh3.googleusercontent.com/...",
    "lastExternalSync": [2025, 7, 20, 17, 34, 58, 994962791]
  },
  "account": {
    "accountDeactivated": false,
    "deactivationDate": null,
    "deactivationReason": null
  }
}
```

## Compatibilidad con Frontend

Esta estructura es completamente compatible con `userStructure.js` del frontend, que espera:

- `status`: Estado del usuario (verificación, perfil completo, aprobación, etc.)
- `profile`: Información completa del perfil incluyendo preferencias de matching
- `privacy`: Configuración de privacidad
- `notifications`: Configuración de notificaciones
- `metrics`: Métricas sociales del usuario
- `auth`: Información de autenticación OAuth
- `account`: Estado de la cuenta

## Campos Nuevos Incluidos

### En profile:
- `phoneCode`: Código de país del teléfono (ej: "+57")
- `gender`: Nombre del género del usuario
- `agePreferenceMin`: Edad mínima preferida para matches
- `agePreferenceMax`: Edad máxima preferida para matches
- `locationPreferenceRadius`: Radio de búsqueda en km

### Nuevas secciones completas:
- `privacy`: Toda la configuración de privacidad
- `notifications`: Configuración de notificaciones
- `metrics`: Métricas del usuario
- `auth`: Información de autenticación OAuth
- `account`: Estado de la cuenta

## Beneficios

1. **Consistencia**: El frontend recibe toda la información necesaria en una sola respuesta
2. **Compatibilidad**: Estructura idéntica a la esperada por `userStructure.js`
3. **Eficiencia**: No necesita hacer múltiples requests para obtener información completa
4. **Mantenibilidad**: Un solo punto de verdad para la estructura de datos del usuario

## Endpoints Relacionados

- `POST /api/auth/login` - Devuelve estructura completa con tokens
- `POST /api/auth/login/google` - Devuelve estructura completa con tokens
- `GET /api/user/profile/me/extended` - Devuelve estructura sin tokens
- `GET /users/{email}/standard` - Devuelve solo status y profile
- `GET /users/{email}/public` - Devuelve solo datos públicos

La respuesta del login ahora proporciona toda la información que el frontend necesita para inicializar correctamente el estado del usuario.