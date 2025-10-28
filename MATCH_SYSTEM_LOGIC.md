# 📚 Documentación Técnica - Sistema de Matches

## 🏗️ Arquitectura General

### Entidades Principales

1. **Match** - Representa una solicitud de match entre dos usuarios
   - `initiatorUser`: Usuario que envía la solicitud
   - `targetUser`: Usuario que recibe la solicitud
   - `status`: PENDING, ACCEPTED, REJECTED
   - `initiatorReservedPlan`: Plan que tiene el intento reservado

2. **UserMatchPlan** - Plan de intentos comprado por un usuario
   - `remainingAttempts`: Intentos totales disponibles
   - `reservedAttempts`: Intentos reservados (en solicitudes pendientes)
   - `user`: Usuario dueño del plan
   - `matchPlan`: Plan base con configuración

## 🔄 Flujo Completo de Match

### Estado 1️⃣: Enviar Match (`sendMatch`)

**Archivo:** `MatchService.java:117-150`

```java
@Transactional
public MatchResponseDTO sendMatch(User initiatorUser, MatchRequestDTO request) {
    // 1. Validar que el usuario objetivo existe
    User targetUser = userRepository.findById(request.getTargetUserId())
        .orElseThrow(() -> new NotFoundException("No se encontró al usuario objetivo"));

    // 2. Validar que no te envíes match a ti mismo
    if (Objects.equals(initiatorUser.getId(), targetUser.getId())) {
        throw new BadRequestException("No puedes enviarte un match a ti mismo.");
    }

    // 3. Validar que no exista match previo (en cualquier estado)
    if (matchRepository.existsMatchBetweenUsers(initiatorUser, targetUser)) {
        throw new BadRequestException("Ya existe un match entre estos usuarios.");
    }

    // 4. Verificar intentos disponibles (remaining - reserved)
    int availableToUse = matchPlanService.getAvailableAttemptsForNewMatch(initiatorUser);
    if (availableToUse <= 0) {
        throw new BadRequestException("No tienes intentos disponibles.");
    }

    // 5. RESERVAR un intento del plan del initiator
    // IMPORTANTE: Esto NO consume el intento, solo lo RESERVA
    UserMatchPlan reservedPlan = matchPlanService.reserveAttempt(initiatorUser);

    // 6. Crear el match en estado PENDING
    Match match = new Match(initiatorUser, targetUser);
    match.setInitiatorReservedPlan(reservedPlan); // Vincular plan reservado

    try {
        match = matchRepository.save(match);
    } catch (RuntimeException ex) {
        // Si falla, liberar la reserva
        matchPlanService.releaseReservedAttempt(reservedPlan);
        throw ex;
    }

    return convertToResponseDTO(match);
}
```

**¿Qué hace `reserveAttempt`?**

**Archivo:** `MatchPlanService.java:142-155`

```java
@Transactional
public UserMatchPlan reserveAttempt(User user) {
    // Busca el primer plan con intentos disponibles
    UserMatchPlan plan = findFirstPlanWithAvailability(user)
        .orElseThrow(() -> new NotFoundException("No se encontraron planes."));

    // Incrementa reservedAttempts en +1
    // NO modifica remainingAttempts aún
    plan.reserveAttempt();

    return userMatchPlanRepository.save(plan);
}
```

**Estado del plan después de `reserveAttempt`:**
```
ANTES:
- remainingAttempts: 5
- reservedAttempts: 0
- Disponibles para usar: 5 - 0 = 5

DESPUÉS:
- remainingAttempts: 5  (sin cambios)
- reservedAttempts: 1   (incrementó)
- Disponibles para usar: 5 - 1 = 4
```

**Estado del sistema:**
```
✅ Match creado: PENDING
✅ Intento RESERVADO (no consumido)
✅ Usuario A no puede usar ese intento con otra persona
⏳ Esperando respuesta de Usuario B
```

---

### Estado 2️⃣: Aceptar Match (`acceptMatch`)

**Archivo:** `MatchService.java:152-178`

```java
@Transactional
public MatchResponseDTO acceptMatch(User targetUser, Long matchId) {
    // 1. Buscar el match
    Match match = matchRepository.findById(matchId)
        .orElseThrow(() -> new NotFoundException("No se encontró el match"));

    // 2. Validar que quien acepta es el targetUser
    if (!match.getTargetUser().getId().equals(targetUser.getId())) {
        throw new UnauthorizedException("No estás autorizado para aceptar este match.");
    }

    // 3. Validar que el match esté pendiente
    if (!match.isPending()) {
        throw new BadRequestException("El match ya no está pendiente.");
    }

    // 4. CONSUMIR el intento reservado del initiator
    // CLAVE: Solo se consume del que ENVIÓ la solicitud
    // El targetUser (quien acepta) NO consume intentos
    matchPlanService.consumeReservedAttempt(match.getInitiatorReservedPlan());
    match.setInitiatorReservedPlan(null);

    // 5. Cambiar estado a ACCEPTED
    match.accept();
    match = matchRepository.save(match);

    return convertToResponseDTO(match);
}
```

**¿Qué hace `consumeReservedAttempt`?**

**Archivo:** `MatchPlanService.java:168-177`

```java
@Transactional
public void consumeReservedAttempt(UserMatchPlan plan) {
    if (plan == null) {
        return;
    }

    // Decrementa reservedAttempts en -1
    // Decrementa remainingAttempts en -1
    plan.consumeReservedAttempt();
    userMatchPlanRepository.save(plan);
}
```

**Estado del plan después de `consumeReservedAttempt`:**
```
ANTES (estaba reservado):
- remainingAttempts: 5
- reservedAttempts: 1
- Disponibles: 5 - 1 = 4

DESPUÉS (consumido):
- remainingAttempts: 4  (decrementó)
- reservedAttempts: 0   (decrementó)
- Disponibles: 4 - 0 = 4
```

**Estado del sistema:**
```
✅ Match actualizado: ACCEPTED
✅ Intento CONSUMIDO del initiator
✅ TargetUser NO perdió intentos
✅ Ambos usuarios tienen match activo
```

---

### Estado 3️⃣: Rechazar Match (`rejectMatch`)

**Archivo:** `MatchService.java:183-206`

```java
@Transactional
public MatchResponseDTO rejectMatch(User targetUser, Long matchId) {
    // 1. Buscar el match
    Match match = matchRepository.findById(matchId)
        .orElseThrow(() -> new NotFoundException("No se encontró el match"));

    // 2. Validar que quien rechaza es el targetUser
    if (!match.getTargetUser().getId().equals(targetUser.getId())) {
        throw new UnauthorizedException("No estás autorizado para rechazar este match.");
    }

    // 3. Validar que el match esté pendiente
    if (!match.isPending()) {
        throw new BadRequestException("El match ya no está pendiente.");
    }

    // 4. LIBERAR el intento reservado del initiator
    // El intento vuelve a estar disponible para el initiator
    matchPlanService.releaseReservedAttempt(match.getInitiatorReservedPlan());
    match.setInitiatorReservedPlan(null);

    // 5. Cambiar estado a REJECTED
    match.reject();
    match = matchRepository.save(match);

    return convertToResponseDTO(match);
}
```

**¿Qué hace `releaseReservedAttempt`?**

**Archivo:** `MatchPlanService.java:158-166`

```java
@Transactional
public void releaseReservedAttempt(UserMatchPlan plan) {
    if (plan == null) {
        return;
    }

    // Decrementa reservedAttempts en -1
    // NO modifica remainingAttempts (se mantiene)
    plan.releaseReservedAttempt();
    userMatchPlanRepository.save(plan);
}
```

**Estado del plan después de `releaseReservedAttempt`:**
```
ANTES (estaba reservado):
- remainingAttempts: 5
- reservedAttempts: 1
- Disponibles: 5 - 1 = 4

DESPUÉS (liberado):
- remainingAttempts: 5  (sin cambios)
- reservedAttempts: 0   (decrementó)
- Disponibles: 5 - 0 = 5  ✅ Vuelve a tener 5
```

**Estado del sistema:**
```
✅ Match actualizado: REJECTED
✅ Intento LIBERADO (vuelve al initiator)
✅ Initiator puede volver a usar ese intento
✅ No se permite match entre estos usuarios en el futuro
```

---

### Estado 4️⃣: Retirar Match (`withdrawMatch`)

**Archivo:** `MatchService.java:208-234`

```java
@Transactional
public MatchResponseDTO withdrawMatch(User initiatorUser, Long matchId) {
    // 1. Buscar el match
    Match match = matchRepository.findById(matchId)
        .orElseThrow(() -> new NotFoundException("No se encontró el match"));

    // 2. Validar que quien retira es el initiator
    if (!match.getInitiatorUser().getId().equals(initiatorUser.getId())) {
        throw new UnauthorizedException("No estás autorizado para retirar este match.");
    }

    // 3. Validar que el match esté pendiente
    if (!match.isPending()) {
        throw new BadRequestException("Solo puedes retirar matches pendientes.");
    }

    // 4. LIBERAR el intento reservado
    if (match.getInitiatorReservedPlan() != null) {
        matchPlanService.releaseReservedAttempt(match.getInitiatorReservedPlan());
        match.setInitiatorReservedPlan(null);
    }

    // 5. ELIMINAR el match (no se marca como rechazado, se borra)
    MatchResponseDTO response = convertToResponseDTO(match);
    matchRepository.delete(match);

    return response;
}
```

**Estado del sistema:**
```
✅ Match ELIMINADO (no queda registro)
✅ Intento LIBERADO (vuelve al initiator)
✅ Initiator puede volver a enviar match a la misma persona
```

---

## 📊 Diagrama de Estados

```
                    sendMatch()
    [NO MATCH] ─────────────────────> [PENDING]
                                          │
                                          ├─ acceptMatch() ──> [ACCEPTED] ✅
                                          │
                                          ├─ rejectMatch() ──> [REJECTED] ❌
                                          │
                                          └─ withdrawMatch() -> [DELETED] 🗑️
```

## 🔢 Lógica de Conteo de Intentos

### Método: `getAvailableAttemptsForNewMatch`

**Archivo:** `MatchPlanService.java:120-125`

```java
@Transactional(readOnly = true)
public Integer getAvailableAttemptsForNewMatch(User user) {
    int remaining = getTotalRemainingAttempts(user);  // Total comprados
    int reserved = getTotalReservedAttempts(user);     // En solicitudes pendientes
    return Math.max(remaining - reserved, 0);          // Disponibles = remaining - reserved
}
```

**Ejemplo:**
```
Usuario compró 2 planes:
  Plan A: 5 intentos
  Plan B: 3 intentos
  Total: 8 intentos

Usuario envió 2 matches pendientes:
  Match 1: 1 intento reservado
  Match 2: 1 intento reservado
  Total reservado: 2

Intentos disponibles para nuevo match:
  8 (remaining) - 2 (reserved) = 6 ✅
```

---

## 🎯 Escenarios Completos

### Escenario 1: Match Aceptado

```
Estado Inicial:
  Usuario A: 5 intentos (remaining: 5, reserved: 0)
  Usuario B: 3 intentos (remaining: 3, reserved: 0)

Paso 1: A envía match a B
  ├─ A: remaining: 5, reserved: 1 → Disponibles: 4
  ├─ B: remaining: 3, reserved: 0 → Disponibles: 3
  └─ Match: PENDING con reserva en Plan de A

Paso 2: B acepta el match
  ├─ A: remaining: 4, reserved: 0 → Disponibles: 4 (perdió 1 intento)
  ├─ B: remaining: 3, reserved: 0 → Disponibles: 3 (NO perdió intentos) ✅
  └─ Match: ACCEPTED sin reserva

Resultado Final:
  ✅ Match exitoso
  ✅ A consumió 1 intento
  ✅ B NO consumió intentos
```

### Escenario 2: Match Rechazado

```
Estado Inicial:
  Usuario A: 5 intentos (remaining: 5, reserved: 0)
  Usuario B: 3 intentos (remaining: 3, reserved: 0)

Paso 1: A envía match a B
  ├─ A: remaining: 5, reserved: 1 → Disponibles: 4
  ├─ B: remaining: 3, reserved: 0 → Disponibles: 3
  └─ Match: PENDING con reserva en Plan de A

Paso 2: B rechaza el match
  ├─ A: remaining: 5, reserved: 0 → Disponibles: 5 (recuperó el intento) ✅
  ├─ B: remaining: 3, reserved: 0 → Disponibles: 3 (NO perdió intentos) ✅
  └─ Match: REJECTED sin reserva

Resultado Final:
  ✅ A recuperó su intento
  ✅ B NO consumió intentos
  ❌ No pueden hacer match en el futuro
```

### Escenario 3: Match Retirado

```
Estado Inicial:
  Usuario A: 5 intentos (remaining: 5, reserved: 0)
  Usuario B: 3 intentos (remaining: 3, reserved: 0)

Paso 1: A envía match a B
  ├─ A: remaining: 5, reserved: 1 → Disponibles: 4
  ├─ B: remaining: 3, reserved: 0 → Disponibles: 3
  └─ Match: PENDING con reserva en Plan de A

Paso 2: A retira el match
  ├─ A: remaining: 5, reserved: 0 → Disponibles: 5 (recuperó el intento) ✅
  ├─ B: remaining: 3, reserved: 0 → Disponibles: 3
  └─ Match: ELIMINADO

Resultado Final:
  ✅ A recuperó su intento
  ✅ B nunca se enteró (opcional: notificación)
  ✅ A puede volver a enviar match a B
```

### Escenario 4: Múltiples Matches Pendientes

```
Estado Inicial:
  Usuario A: 10 intentos (remaining: 10, reserved: 0)

Paso 1: A envía match a B
  ├─ A: remaining: 10, reserved: 1 → Disponibles: 9

Paso 2: A envía match a C
  ├─ A: remaining: 10, reserved: 2 → Disponibles: 8

Paso 3: A envía match a D
  ├─ A: remaining: 10, reserved: 3 → Disponibles: 7

Paso 4: B acepta
  ├─ A: remaining: 9, reserved: 2 → Disponibles: 7
  └─ Match con B: ACCEPTED

Paso 5: C rechaza
  ├─ A: remaining: 9, reserved: 1 → Disponibles: 8
  └─ Match con C: REJECTED

Paso 6: A retira match con D
  ├─ A: remaining: 9, reserved: 0 → Disponibles: 9
  └─ Match con D: ELIMINADO

Resultado Final:
  ✅ A tiene 9 intentos disponibles (consumió 1 con B)
  ✅ Match activo solo con B
```

---

## 🛡️ Validaciones Importantes

### 1. No enviar match a ti mismo
```java
if (Objects.equals(initiatorUser.getId(), targetUser.getId())) {
    throw new BadRequestException("No puedes enviarte un match a ti mismo.");
}
```

### 2. No duplicar matches
```java
if (matchRepository.existsMatchBetweenUsers(initiatorUser, targetUser)) {
    throw new BadRequestException("Ya existe un match entre estos usuarios.");
}
```

### 3. Verificar intentos disponibles
```java
int availableToUse = matchPlanService.getAvailableAttemptsForNewMatch(initiatorUser);
if (availableToUse <= 0) {
    throw new BadRequestException("No tienes intentos disponibles.");
}
```

### 4. Solo el targetUser puede aceptar/rechazar
```java
if (!match.getTargetUser().getId().equals(targetUser.getId())) {
    throw new UnauthorizedException("No estás autorizado.");
}
```

### 5. Solo el initiator puede retirar
```java
if (!match.getInitiatorUser().getId().equals(initiatorUser.getId())) {
    throw new UnauthorizedException("No estás autorizado.");
}
```

---

## 📝 Métodos de la Entidad UserMatchPlan

**Archivo:** `UserMatchPlan.java` (métodos clave)

```java
// Reservar un intento (enviar match)
public void reserveAttempt() {
    if (!hasSpareAttempts()) {
        throw new IllegalStateException("No hay intentos disponibles para reservar");
    }
    this.reservedAttempts++;
}

// Liberar un intento reservado (rechazar o retirar match)
public void releaseReservedAttempt() {
    if (this.reservedAttempts <= 0) {
        throw new IllegalStateException("No hay intentos reservados para liberar");
    }
    this.reservedAttempts--;
}

// Consumir un intento reservado (aceptar match)
public void consumeReservedAttempt() {
    if (this.reservedAttempts <= 0) {
        throw new IllegalStateException("No hay intentos reservados para consumir");
    }
    this.remainingAttempts--;
    this.reservedAttempts--;
}

// Verificar si hay intentos disponibles (remaining - reserved > 0)
public boolean hasSpareAttempts() {
    return (this.remainingAttempts - this.reservedAttempts) > 0;
}
```

---

## 🔍 Queries Importantes

### Verificar si existe match entre usuarios (cualquier estado)
```java
@Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Match m " +
       "WHERE ((m.initiatorUser = :user1 AND m.targetUser = :user2) OR " +
       "(m.initiatorUser = :user2 AND m.targetUser = :user1))")
boolean existsMatchBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
```

### Verificar match pendiente entre usuarios
```java
@Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Match m " +
       "WHERE ((m.initiatorUser = :user1 AND m.targetUser = :user2) OR " +
       "(m.initiatorUser = :user2 AND m.targetUser = :user1)) AND m.status = 'PENDING'")
boolean existsPendingMatchBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
```

### Obtener matches recibidos pendientes
```java
@Query("SELECT m FROM Match m " +
       "WHERE m.targetUser = :user AND m.status = 'PENDING' " +
       "ORDER BY m.createdAt DESC")
Page<Match> findPendingReceivedMatches(@Param("user") User user, Pageable pageable);
```

---

## ⚠️ Casos Edge y Consideraciones

### 1. ¿Qué pasa si el usuario elimina su cuenta con matches pendientes?
**Solución:** Implementar cascade delete o cleanup job para liberar intentos reservados

### 2. ¿Qué pasa si expira el plan con matches pendientes?
**Solución:** El plan tiene `expirationDate`, deberías tener un job que libere reservas de planes expirados

### 3. ¿Puede un usuario tener múltiples planes activos?
**Respuesta:** Sí, `findFirstPlanWithAvailability` busca el primer plan con intentos disponibles

### 4. ¿El orden de consumo de planes importa?
**Respuesta:** Sí, se consume del primer plan con intentos disponibles (ordenado por fecha de compra)

---

## 🚀 Posibles Mejoras Futuras

### 1. Expiración automática de matches pendientes
```java
// Después de 7 días sin respuesta, liberar intento automáticamente
@Scheduled(cron = "0 0 2 * * *") // 2 AM daily
public void expirePendingMatches() {
    LocalDateTime threshold = LocalDateTime.now().minusDays(7);
    List<Match> expired = matchRepository.findPendingOlderThan(threshold);
    expired.forEach(match -> {
        releaseReservedAttempt(match.getInitiatorReservedPlan());
        match.setStatus(Match.MatchStatus.EXPIRED);
    });
}
```

### 2. Notificaciones
- Notificar a B cuando A envía match
- Notificar a A cuando B acepta/rechaza
- Notificar a B cuando A retira match

### 3. Métricas y Analytics
- Tasa de aceptación por usuario
- Tiempo promedio de respuesta
- Matches más activos por hora/día

### 4. Rate Limiting
- Limitar matches enviados por día (ej: 10 max)
- Evitar spam de solicitudes

### 5. Sistema de prioridad en planes
```java
// Consumir primero de planes que expiran más pronto
@Query("SELECT ump FROM UserMatchPlan ump " +
       "WHERE ump.user = :user AND ump.isActive = true " +
       "AND (ump.remainingAttempts - ump.reservedAttempts) > 0 " +
       "ORDER BY ump.expirationDate ASC, ump.purchaseDate ASC")
List<UserMatchPlan> findActivePlansWithAvailableAttempts(@Param("user") User user);
```

---

## 📊 Resumen de Cambios vs Lógica Anterior

### ❌ Lógica ANTERIOR (Incorrecta)

```java
@Transactional
public MatchResponseDTO acceptMatch(User targetUser, Long matchId) {
    // ...
    matchPlanService.consumeReservedAttempt(match.getInitiatorReservedPlan());
    match.setInitiatorReservedPlan(null);
    matchPlanService.useAttempt(targetUser); // ❌ CONSUME intento del que acepta
    // ...
}
```

**Problema:**
- Ambos usuarios consumían intentos
- No era justo para quien acepta
- Desincentivaba aceptar matches

### ✅ Lógica ACTUAL (Correcta)

```java
@Transactional
public MatchResponseDTO acceptMatch(User targetUser, Long matchId) {
    // ...
    // Solo se consume el intento del usuario que envió la solicitud (initiator)
    // El usuario que acepta NO consume intentos
    matchPlanService.consumeReservedAttempt(match.getInitiatorReservedPlan());
    match.setInitiatorReservedPlan(null);
    // ✅ NO se llama a useAttempt(targetUser)
    // ...
}
```

**Ventajas:**
- ✅ Solo quien envía paga el intento
- ✅ Aceptar es gratis → más matches
- ✅ Sistema más justo y balanceado
- ✅ Incentiva la interacción

---

## 🎓 Conceptos Clave

### Reserva vs Consumo

- **RESERVA** (`reserveAttempt`): El intento se marca como "en uso" pero no se elimina
  - Incrementa `reservedAttempts`
  - NO modifica `remainingAttempts`
  - Permite "hold" temporal del intento

- **CONSUMO** (`consumeReservedAttempt`): El intento se usa definitivamente
  - Decrementa `reservedAttempts`
  - Decrementa `remainingAttempts`
  - Es irreversible (salvo rollback)

- **LIBERACIÓN** (`releaseReservedAttempt`): El intento vuelve a estar disponible
  - Decrementa `reservedAttempts`
  - NO modifica `remainingAttempts`
  - Permite reutilizar el intento

### Fórmula de Disponibilidad

```
Disponibles = remainingAttempts - reservedAttempts
```

**Ejemplo:**
```
Plan A:
  remainingAttempts: 10
  reservedAttempts: 3
  Disponibles: 10 - 3 = 7 ✅

Plan B:
  remainingAttempts: 2
  reservedAttempts: 2
  Disponibles: 2 - 2 = 0 ❌ No puede enviar más matches
```

---

## 🔐 Seguridad y Autorización

### Principio: Solo los participantes pueden actuar

```java
// Verificación de permisos en acceptMatch
if (!match.getTargetUser().getId().equals(targetUser.getId())) {
    throw new UnauthorizedException("No estás autorizado para aceptar este match.");
}

// Verificación de permisos en withdrawMatch
if (!match.getInitiatorUser().getId().equals(initiatorUser.getId())) {
    throw new UnauthorizedException("No estás autorizado para retirar este match.");
}
```

### Transaccionalidad

Todas las operaciones críticas usan `@Transactional`:
- Si falla cualquier paso, se hace rollback completo
- Garantiza consistencia de datos
- Previene estados inconsistentes

**Ejemplo:**
```java
@Transactional
public MatchResponseDTO sendMatch(User initiatorUser, MatchRequestDTO request) {
    UserMatchPlan reservedPlan = matchPlanService.reserveAttempt(initiatorUser);
    try {
        match = matchRepository.save(match);
    } catch (RuntimeException ex) {
        // Automáticamente se hace rollback de la reserva
        matchPlanService.releaseReservedAttempt(reservedPlan);
        throw ex;
    }
}
```

---

## 📍 Ubicación de Archivos Clave

```
backend/src/main/java/com/feeling/packages/
├── match/
│   ├── domain/
│   │   ├── services/
│   │   │   ├── MatchService.java              # Lógica principal de matches
│   │   │   └── MatchPlanService.java          # Gestión de planes e intentos
│   │   └── dto/
│   │       ├── MatchRequestDTO.java
│   │       ├── MatchResponseDTO.java
│   │       └── UserMatchPlanResponseDTO.java
│   └── infrastructure/
│       ├── entities/
│       │   ├── Match.java                     # Entidad Match
│       │   └── UserMatchPlan.java             # Entidad UserMatchPlan
│       └── repositories/
│           ├── IMatchRepository.java          # Queries de Match
│           └── IUserMatchPlanRepository.java  # Queries de UserMatchPlan
```

---

Esta documentación cubre toda la lógica del sistema de matches implementado en el backend de Feeling. Guárdala para futuras referencias y modificaciones. 📚
