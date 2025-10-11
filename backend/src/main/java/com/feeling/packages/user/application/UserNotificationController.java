package com.feeling.packages.user.application;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.user.domain.services.UserNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestión de notificaciones y emails a usuarios.
 * <p>
 * Este controlador maneja todas las operaciones relacionadas con el envío de
 * comunicaciones por email a usuarios de la plataforma, incluyendo:
 * <ul>
 *   <li>Emails de bienvenida a nuevos usuarios</li>
 *   <li>Recordatorios de completar perfil</li>
 *   <li>Notificaciones de aprobación/rechazo</li>
 *   <li>Notificaciones de activación/desactivación de cuenta</li>
 *   <li>Envío masivo de emails (batch)</li>
 *   <li>Emails personalizados a múltiples usuarios</li>
 * </ul>
 * <p>
 * Todos los endpoints requieren rol de administrador (ADMIN) para su acceso.
 * <p>
 * Características:
 * - Envío asíncrono de emails para no bloquear operaciones
 * - Templates HTML para emails profesionales
 * - Logging completo de todos los envíos para auditoría
 * - Manejo de errores de envío sin interrumpir el flujo
 * - Soporte para operaciones batch optimizadas
 * <p>
 * Casos de uso:
 * - Onboarding automático de nuevos usuarios
 * - Recordatorios programados a usuarios con perfil incompleto
 * - Notificaciones de moderación (aprobación/rechazo)
 * - Comunicaciones masivas para anuncios de plataforma
 * - Notificaciones de cambios de estado de cuenta
 * <p>
 * Arquitectura:
 * - Sigue principios DDD (Domain-Driven Design)
 * - No contiene lógica de negocio (delegada a UserNotificationService)
 * - Manejo de errores específico para operaciones de email
 * - Logging estructurado de todas las comunicaciones
 * - Documentación completa con Swagger/OpenAPI
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @see UserNotificationService
 * @see com.feeling.packages.common.domain.services.email.EmailService
 * @since 1.0
 */
@RestController
@RequestMapping("/user-notifications")
@RequiredArgsConstructor
@Tag(name = "User Notifications", description = "Endpoints para gestión de notificaciones y emails a usuarios (solo administradores)")
@PreAuthorize("hasAuthority('ADMIN')")
public class UserNotificationController {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(UserNotificationController.class);

    private final UserNotificationService userNotificationService;

    // ========================================
    // EMAILS DE ONBOARDING Y PERFIL
    // ========================================

    /**
     * Envía email de bienvenida a un usuario específico.
     *
     * @param userId ID del usuario que recibirá el email de bienvenida
     * @return Mensaje de confirmación del envío
     */
    @PostMapping("/{userId}/welcome")
    @Operation(summary = "Enviar email de bienvenida",
        description = "Envía un email de bienvenida personalizado a un usuario recién registrado")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Email enviado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> sendWelcomeEmail(
        @Parameter(description = "ID del usuario") @PathVariable Long userId
    ) {
        try {
            logger.info("Enviando email de bienvenida a usuario", Map.of("userId", userId));
            userNotificationService.sendWelcomeEmail(userId);
            return ResponseEntity.ok(new MessageResponseDTO("Email de bienvenida enviado exitosamente"));
        } catch (Exception e) {
            logger.error("Error enviando email de bienvenida a usuario", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al enviar email de bienvenida"));
        }
    }

    /**
     * Envía recordatorio para completar perfil a un usuario específico.
     *
     * @param userId ID del usuario que recibirá el recordatorio
     * @return Mensaje de confirmación del envío
     */
    @PostMapping("/{userId}/profile-reminder")
    @Operation(summary = "Enviar recordatorio de completar perfil",
        description = "Envía un recordatorio personalizado a un usuario con perfil incompleto")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Recordatorio enviado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Usuario ya tiene perfil completo"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> sendProfileCompletionReminder(
        @Parameter(description = "ID del usuario") @PathVariable Long userId
    ) {
        try {
            logger.info("Enviando recordatorio de completar perfil a usuario", Map.of("userId", userId));
            userNotificationService.sendProfileCompletionReminder(userId);
            return ResponseEntity.ok(new MessageResponseDTO("Recordatorio enviado exitosamente"));
        } catch (IllegalStateException e) {
            logger.warn("Usuario ya tiene perfil completo", Map.of("userId", userId));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponseDTO(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error enviando recordatorio a usuario", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al enviar recordatorio"));
        }
    }

    // ========================================
    // EMAILS DE APROBACIÓN Y MODERACIÓN
    // ========================================

    /**
     * Envía email de notificación de aprobación de cuenta.
     *
     * @param userId ID del usuario aprobado
     * @return Mensaje de confirmación del envío
     */
    @PostMapping("/{userId}/approval")
    @Operation(summary = "Enviar email de aprobación",
        description = "Envía notificación de aprobación de cuenta a un usuario")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Email enviado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> sendApprovalEmail(
        @Parameter(description = "ID del usuario") @PathVariable Long userId
    ) {
        try {
            logger.info("Enviando email de aprobación a usuario", Map.of("userId", userId));
            userNotificationService.sendApprovalEmail(userId);
            return ResponseEntity.ok(new MessageResponseDTO("Email de aprobación enviado exitosamente"));
        } catch (Exception e) {
            logger.error("Error enviando email de aprobación a usuario", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al enviar email de aprobación"));
        }
    }

    /**
     * Envía email de notificación de rechazo de cuenta.
     *
     * @param userId ID del usuario rechazado
     * @param reason Razón opcional del rechazo
     * @return Mensaje de confirmación del envío
     */
    @PostMapping("/{userId}/rejection")
    @Operation(summary = "Enviar email de rechazo",
        description = "Envía notificación de rechazo de cuenta a un usuario con razón opcional")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Email enviado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> sendRejectionEmail(
        @Parameter(description = "ID del usuario") @PathVariable Long userId,
        @Parameter(description = "Razón del rechazo (opcional)") @RequestParam(required = false) String reason
    ) {
        try {
            logger.info("Enviando email de rechazo a usuario", Map.of("userId", userId));
            userNotificationService.sendRejectionEmail(userId, reason);
            return ResponseEntity.ok(new MessageResponseDTO("Email de rechazo enviado exitosamente"));
        } catch (Exception e) {
            logger.error("Error enviando email de rechazo a usuario", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al enviar email de rechazo"));
        }
    }

    // ========================================
    // EMAILS DE GESTIÓN DE CUENTA
    // ========================================

    /**
     * Envía email de notificación de desactivación de cuenta.
     *
     * @param userId ID del usuario cuya cuenta fue desactivada
     * @return Mensaje de confirmación del envío
     */
    @PostMapping("/{userId}/deactivation")
    @Operation(summary = "Enviar email de desactivación",
        description = "Envía notificación de desactivación de cuenta a un usuario")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Email enviado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> sendDeactivationEmail(
        @Parameter(description = "ID del usuario") @PathVariable Long userId
    ) {
        try {
            logger.info("Enviando email de desactivación a usuario", Map.of("userId", userId));
            userNotificationService.sendAccountDeactivationEmail(userId);
            return ResponseEntity.ok(new MessageResponseDTO("Email de desactivación enviado exitosamente"));
        } catch (Exception e) {
            logger.error("Error enviando email de desactivación a usuario", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al enviar email de desactivación"));
        }
    }

    /**
     * Envía email de notificación de reactivación de cuenta.
     *
     * @param userId ID del usuario cuya cuenta fue reactivada
     * @return Mensaje de confirmación del envío
     */
    @PostMapping("/{userId}/reactivation")
    @Operation(summary = "Enviar email de reactivación",
        description = "Envía notificación de reactivación de cuenta a un usuario")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Email enviado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> sendReactivationEmail(
        @Parameter(description = "ID del usuario") @PathVariable Long userId
    ) {
        try {
            logger.info("Enviando email de reactivación a usuario", Map.of("userId", userId));
            userNotificationService.sendAccountReactivationEmail(userId);
            return ResponseEntity.ok(new MessageResponseDTO("Email de reactivación enviado exitosamente"));
        } catch (Exception e) {
            logger.error("Error enviando email de reactivación a usuario", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al enviar email de reactivación"));
        }
    }

    // ========================================
    // ENVÍO MASIVO - OPERACIONES BATCH
    // ========================================

    /**
     * Envía recordatorios de completar perfil a múltiples usuarios seleccionados.
     *
     * @param userIds Lista de IDs de usuarios que recibirán el recordatorio
     * @return Mensaje con estadísticas de la operación
     */
    @PostMapping("/profile-reminders-batch")
    @Operation(summary = "Enviar recordatorios de perfil en lote",
        description = "Envía recordatorios de completar perfil a múltiples usuarios con perfil incompleto")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Operación completada (revisar contadores)"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> sendProfileRemindersBatch(
        @Parameter(description = "Lista de IDs de usuarios")
        @RequestBody List<Long> userIds
    ) {
        try {
            logger.info("Enviando recordatorios de perfil en lote", Map.of("total", userIds.size()));
            MessageResponseDTO response = userNotificationService.sendProfileCompletionRemindersBatch(userIds);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error enviando recordatorios en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al enviar recordatorios en lote"));
        }
    }

    /**
     * Envía email masivo personalizado a múltiples usuarios.
     *
     * @param request DTO con lista de usuarios, asunto y cuerpo del email
     * @return Mensaje con número de emails enviados exitosamente
     */
    @PostMapping("/bulk-email")
    @Operation(summary = "Enviar email masivo personalizado",
        description = "Envía un email con asunto y contenido personalizado a múltiples usuarios")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Operación completada (revisar contador)"),
        @ApiResponse(responseCode = "400", description = "Datos de request inválidos"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> sendBulkEmail(
        @Parameter(description = "Datos del email masivo")
        @RequestBody @NotBlank BulkEmailRequestDTO request
    ) {
        try {
            logger.info("Enviando email masivo", Map.of(
                "destinatarios", request.userIds().size(),
                "asunto", request.subject()
            ));

            int sentCount = userNotificationService.sendBulkEmail(
                request.userIds(),
                request.subject(),
                request.body()
            );

            String message = String.format("Email masivo enviado: %d de %d exitosos",
                sentCount, request.userIds().size());

            return ResponseEntity.ok(new MessageResponseDTO(message));
        } catch (Exception e) {
            logger.error("Error enviando email masivo", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al enviar email masivo"));
        }
    }

    /**
     * DTO para solicitudes de email masivo.
     *
     * @param userIds Lista de IDs de usuarios destinatarios
     * @param subject Asunto del email
     * @param body    Cuerpo del email (HTML o texto plano)
     */
    public record BulkEmailRequestDTO(
        @NotEmpty List<Long> userIds,
        @NotBlank String subject,
        @NotBlank String body
    ) {
    }
}
