# GUÍA DE ACCESSORS DE USUARIO

## Filosofía: Única Fuente de Verdad

Los **accessors** son la **ÚNICA forma correcta** de acceder a los datos del usuario en toda la aplicación. Esto garantiza:

1. **Centralización**: La estructura del usuario se maneja en un solo lugar
2. **Encapsulación**: Los componentes no conocen la estructura interna
3. **Mantenibilidad**: Si la estructura cambia, solo se actualiza en `userStructure.js`
4. **Consistencia**: Todos los componentes acceden a los datos de la misma forma

## ❌ NO HACER (Acceso Directo)

```jsx
// MAL - Acceso directo a la estructura
const userName = user?.user?.name
const userEmail = user?.user?.email
const userAvatar = user?.user?.images?.[0]
const isVerified = user?.status?.verified
```

## ✅ HACER (Usar Accessors)

```jsx
import { getUserName, getUserEmail, getUserAvatar, getUserVerified } from '@schemas'

// BIEN - Usar accessors centralizados
const userName = getUserName(user)
const userEmail = getUserEmail(user)
const userAvatar = getUserAvatar(user, defaultImage)
const isVerified = getUserVerified(user)
```

## Accessors Disponibles

### Secciones Completas

```jsx
import {
  getUserStatus, // Retorna user.status
  getUserMetrics, // Retorna user.metrics
  getUserPrivacy, // Retorna user.privacy
  getUserNotifications, // Retorna user.notifications
  getUserAuth, // Retorna user.auth
  getUserMatches // Retorna user.matches
} from '@schemas'
```

### Información Básica

```jsx
import {
  getUserId,
  getUserName,
  getUserLastName,
  getUserFullName, // Combina name + lastName
  getUserEmail,
  getUserPhone,
  getUserPhoneCode,
  getUserDateOfBirth,
  getUserAge,
  getUserDocument
} from '@schemas'
```

### Ubicación

```jsx
import { getUserCountry, getUserCity, getUserDepartment, getUserLocality } from '@schemas'
```

### Perfil e Imágenes

```jsx
import {
  getUserDescription,
  getUserImages, // Retorna array de imágenes
  getUserMainImage, // Primera imagen del array
  getUserAvatar // Acepta defaultAvatar como parámetro
} from '@schemas'
```

### Estado del Usuario

```jsx
import {
  getUserVerified,
  getUserProfileComplete,
  getUserLastActive,
  getUserApproved,
  getUserApprovalStatus,
  getUserRole,
  getUserAccountDeactivated,
  getUserFavorite,
  getUserHasAcceptedMatch,
  getUserHasPendingMatch
} from '@schemas'
```

## Ejemplos de Uso

### Ejemplo 1: Componente de Perfil

```jsx
import { getUserName, getUserLastName, getUserEmail, getUserAvatar } from '@schemas'
import imgProfile from '/profile.png'

const UserProfile = ({ user }) => {
  return (
    <div>
      <img src={getUserAvatar(user, imgProfile)} alt='Avatar' />
      <h1>
        {getUserName(user)} {getUserLastName(user)}
      </h1>
      <p>{getUserEmail(user)}</p>
    </div>
  )
}
```

### Ejemplo 2: Validación de Estado

```jsx
import { getUserVerified, getUserProfileComplete, getUserApproved } from '@schemas'

const canAccessFeature = user => {
  return getUserVerified(user) && getUserProfileComplete(user) && getUserApproved(user)
}
```

### Ejemplo 3: Componente de Tarjeta de Usuario

```jsx
import { getUserName, getUserFullName, getUserEmail, getUserAvatar } from '@schemas'
import imgProfile from '/profile.png'

const UserCard = ({ user }) => {
  const displayName = getUserName(user) || 'Usuario'
  const fullName = getUserFullName(user) || displayName
  const email = getUserEmail(user)
  const avatar = getUserAvatar(user, imgProfile)

  return (
    <div>
      <img src={avatar} alt={displayName} />
      <h2>{fullName}</h2>
      <p>{email}</p>
    </div>
  )
}
```

## Beneficios

### 1. Refactoring Seguro

Si necesitas cambiar la estructura del usuario de:

```js
{
  user: {
    name: 'Juan'
  }
}
```

a:

```js
{
  profile: {
    name: 'Juan'
  }
}
```

Solo actualizas `getUserProfile()` en `userStructure.js` y todos los componentes siguen funcionando.

### 2. TypeScript-Friendly

Los accessors son fáciles de tipar y proporcionan autocompletado.

### 3. Testeable

Es más fácil hacer mock de accessors que de la estructura completa.

```jsx
// En tests
jest.mock('@schemas', () => ({
  getUserName: jest.fn(() => 'Test User'),
  getUserEmail: jest.fn(() => 'test@example.com')
}))
```

### 4. Performance

Los accessors pueden incluir optimizaciones como memoización sin afectar a los componentes.

## Reglas

1. **NUNCA** accedas directamente a `user.user.*`, `user.status.*`, etc.
2. **SIEMPRE** usa los accessors de `@schemas`
3. Si necesitas un nuevo accessor, agrégalo a `userStructure.js` y expórtalo desde `schemas/index.js`
4. Los accessors deben ser **funciones puras** sin efectos secundarios
5. Todos los accessors deben manejar valores `null` o `undefined` de forma segura

## Migración de Código Existente

Si encuentras código que accede directamente a la estructura:

```jsx
// Antes
const name = user?.user?.name || 'Usuario'
const email = user?.user?.email
const avatar = user?.user?.images?.[0] || defaultImg

// Después
import { getUserName, getUserEmail, getUserAvatar } from '@schemas'

const name = getUserName(user) || 'Usuario'
const email = getUserEmail(user)
const avatar = getUserAvatar(user, defaultImg)
```
