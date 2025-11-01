## Contexto de trabajo pendiente

### Cambios recientes
- **Usuarios invitados (EVENTS_ONLY)**: El backend soporta reservas públicas creando usuarios `EVENTS_ONLY` sin contraseña (`GuestUserService`). El frontend permite reservar eventos sin autenticación, solicitando datos básicos y, si el evento es pago, redirige a Wompi sin confirmar el pago en backend.
- **Reservas de eventos**: Endpoint público `POST /bookings/guest`, metadata de pago expuesta en `BookingResponseDTO`, y `EventDetail` diferencia la UX entre usuarios autenticados e invitados.
- **PQR (Soporte)**: Se corrigió el `LazyInitializationException` en `/complaints` con `@EntityGraph` y validaciones nulas en `ComplaintDTOMapper`.

### Tareas en progreso / pendientes
1. **Frontend eventos**  
   - Validar en staging/producción que las reservas públicas (gratuitas y pagas) funcionen end-to-end, incl. correos y redirecciones Wompi.  
   - Ajustar UX del modal de invitados según feedback (textos, confirmaciones, etc.).  
   - Revisar si se necesita habilitar login opcional después de reservar (CTA para “Completa tu perfil”).

2. **Seguimiento pagos invitados**  
   - Faltan endpoints/UX para que invitados confirmen pago manualmente (actualmente se confía en Wompi + backend job).  
   - Definir si enviamos correo con enlace a completar registro.

3. **PQR / soporte**  
   - Confirmar que todos los listados admin (`pending`, `urgent`, `all`, etc.) cargan correctamente después del fix.  
   - Evaluar si se deben incluir campos adicionales (e.g. `accountType`) al retorno para distinguir invitados.

4. **Verificaciones generales**  
   - Ejecutar `npm run build` y `./mvnw clean package -DskipTests` en el entorno de CI (aquí no se corrieron).  
   - Revisar rutas donde `accountType` impacta decisiones de UI (e.g. `RequireCompleteProfile`, menú client).

### Próximos pasos sugeridos
- Probar manualmente el flujo completo de invitado (reserva, pago, correo) y el flujo autenticado tradicional.  
- Decidir si se agrega un recordatorio para que los invitados completen su perfil posterior al evento.  
- Documentar en Confluence/Docs cómo operar reservas públicas y cómo convertir invitados a cuentas completas.

> Notas: Cambios locales pendientes (`git status`) incluyen muchos archivos front y backend. Validar antes de comitear qué se incluirá. README general sigue siendo el de antes; este archivo es solo guía temporal.***
