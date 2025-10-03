# Migración de Base de Datos Requerida

## Renombrado de Tablas de Autenticación

Durante la reestructuración del módulo Auth, se renombraron las siguientes tablas:

### Tablas a Renombrar:
1. `user_tokens` → `auth_tokens`
2. `user_password_reset_tokens` → `auth_password_reset_tokens`
3. `user_verification_codes` → `auth_verification_codes`

### Scripts SQL Sugeridos:

```sql
-- Renombrar tabla de tokens
ALTER TABLE user_tokens RENAME TO auth_tokens;

-- Renombrar tabla de tokens de reset de contraseña
ALTER TABLE user_password_reset_tokens RENAME TO auth_password_reset_tokens;

-- Renombrar tabla de códigos de verificación
ALTER TABLE user_verification_codes RENAME TO auth_verification_codes;
```

### Consideraciones:
- Verificar que no hay procesos corriendo que usen estas tablas
- Hacer backup antes de ejecutar
- Revisar índices y constraints que puedan necesitar actualización
- Notificar al equipo antes de la migración

### Entidades Afectadas:
- `AuthToken.java` (antes UserToken)
- `AuthPasswordResetToken.java` (antes UserPasswordResetToken)
- `AuthVerificationCode.java` (antes UserVerificationCode)

**Fecha de creación:** $(date)
**Autor:** Claude Code Refactoring