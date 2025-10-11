package com.feeling.packages.user.domain.services;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.exception.NotFoundException;
import com.feeling.packages.common.domain.services.email.EmailService;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Servicio especializado para notificaciones y comunicaciones con usuarios.
 * <p>
 * Responsabilidades:
 * - Envío de emails de bienvenida
 * - Recordatorios de completar perfil
 * - Avisos de desactivación/reactivación de cuenta
 * - Notificaciones de aprobación/rechazo
 * - Envío masivo de emails (batch)
 * - Gestión de comunicaciones transaccionales
 * <p>
 * Este servicio centraliza toda la lógica de comunicación con usuarios
 * mediante emails y notificaciones, separando esta responsabilidad de
 * la lógica de negocio principal de UserService.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
public class UserNotificationService {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(UserNotificationService.class);

    private final IUserRepository userRepository;
    private final EmailService emailService;

    // ========================================
    // EMAILS DE BIENVENIDA Y ONBOARDING
    // ========================================

    /**
     * Envía email de bienvenida a un usuario recién registrado.
     * <p>
     * Este email se envía automáticamente después del registro exitoso
     * y contiene:
     * - Mensaje de bienvenida personalizado
     * - Instrucciones para completar el perfil
     * - Enlaces a recursos de ayuda
     * - Recordatorio de verificación de email (si no está verificado)
     * <p>
     * El envío es asíncrono para no bloquear el flujo de registro.
     *
     * @param userId ID del usuario al cual enviar email de bienvenida
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional(readOnly = true)
    public void sendWelcomeEmail(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + userId));

        logger.info("Enviando email de bienvenida", Map.of(
            "userId", userId,
            "email", user.getEmail()
        ));

        try {
            boolean isGoogleUser = user.getUserAuthProvider() != null
                && user.getUserAuthProvider().name().equals("GOOGLE");
            String profilePicture = user.getMainImage();

            emailService.sendWelcomeEmail(user.getEmail(), user.getName(), isGoogleUser, profilePicture);

            logger.logUserOperation("welcome_email_sent", user.getEmail(), Map.of(
                "userId", userId,
                "success", true
            ));
        } catch (Exception e) {
            logger.error("Error al enviar email de bienvenida", Map.of(
                "userId", userId,
                "email", user.getEmail()
            ), e);
        }
    }

    /**
     * Envía recordatorio para completar el perfil a usuarios con perfil incompleto.
     * <p>
     * Este email se envía a usuarios que:
     * - Están verificados
     * - Tienen perfil incompleto (profileComplete = false)
     * - No han sido desactivados
     * <p>
     * Contenido del email:
     * - Recordatorio amigable de completar perfil
     * - Beneficios de tener perfil completo
     * - Enlace directo a formulario de completar perfil
     * - Lista de campos faltantes
     *
     * @param userId ID del usuario al cual enviar recordatorio
     * @throws NotFoundException Si el usuario no existe
     * @throws IllegalStateException Si el usuario ya tiene perfil completo
     */
    @Transactional(readOnly = true)
    public void sendProfileCompletionReminder(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + userId));

        if (user.isProfileComplete()) {
            throw new IllegalStateException("El usuario ya tiene su perfil completo");
        }

        logger.info("Enviando recordatorio de completar perfil", Map.of(
            "userId", userId,
            "email", user.getEmail()
        ));

        try {
            emailService.sendProfileCompletionReminder(user);

            logger.logUserOperation("profile_reminder_sent", user.getEmail(), Map.of(
                "userId", userId,
                "success", true
            ));
        } catch (Exception e) {
            logger.error("Error al enviar recordatorio de perfil", Map.of(
                "userId", userId,
                "email", user.getEmail()
            ), e);
        }
    }

    // ========================================
    // EMAILS DE APROBACIÓN Y ESTADO
    // ========================================

    /**
     * Envía email de notificación de aprobación de cuenta.
     * <p>
     * Este email se envía cuando un administrador aprueba la cuenta del usuario.
     * <p>
     * Contenido:
     * - Confirmación de aprobación
     * - Instrucciones para comenzar a usar la plataforma
     * - Enlaces a funciones principales
     * - Tips de uso y seguridad
     *
     * @param userId ID del usuario aprobado
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional(readOnly = true)
    public void sendApprovalEmail(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + userId));

        logger.info("Enviando email de aprobación", Map.of(
            "userId", userId,
            "email", user.getEmail()
        ));

        try {
            emailService.sendUserApprovalEmail(user.getEmail(), user.getName());

            logger.logUserOperation("approval_email_sent", user.getEmail(), Map.of(
                "userId", userId,
                "success", true
            ));
        } catch (Exception e) {
            logger.error("Error al enviar email de aprobación", Map.of(
                "userId", userId,
                "email", user.getEmail()
            ), e);
        }
    }

    /**
     * Envía email de notificación de rechazo de cuenta.
     * <p>
     * Este email se envía cuando un administrador rechaza la cuenta del usuario.
     * <p>
     * Contenido:
     * - Notificación de rechazo
     * - Razón del rechazo (opcional)
     * - Instrucciones para apelar o crear nueva cuenta
     * - Información de contacto de soporte
     *
     * @param userId ID del usuario rechazado
     * @param reason Razón opcional del rechazo
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional(readOnly = true)
    public void sendRejectionEmail(Long userId, String reason) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + userId));

        logger.info("Enviando email de rechazo", Map.of(
            "userId", userId,
            "email", user.getEmail(),
            "has_reason", reason != null && !reason.isEmpty()
        ));

        try {
            emailService.sendUserRejectionEmail(user.getEmail(), user.getName(), reason);

            logger.logUserOperation("rejection_email_sent", user.getEmail(), Map.of(
                "userId", userId,
                "success", true
            ));
        } catch (Exception e) {
            logger.error("Error al enviar email de rechazo", Map.of(
                "userId", userId,
                "email", user.getEmail()
            ), e);
        }
    }

    // ========================================
    // EMAILS DE DESACTIVACIÓN
    // ========================================

    /**
     * Envía email de notificación de desactivación de cuenta.
     * <p>
     * Este email se envía cuando la cuenta del usuario es desactivada
     * (por el usuario mismo o por un administrador).
     * <p>
     * Contenido:
     * - Confirmación de desactivación
     * - Efectos de la desactivación
     * - Instrucciones para reactivar cuenta
     * - Periodo de retención de datos
     *
     * @param userId ID del usuario cuya cuenta fue desactivada
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional(readOnly = true)
    public void sendAccountDeactivationEmail(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + userId));

        logger.info("Enviando email de desactivación de cuenta", Map.of(
            "userId", userId,
            "email", user.getEmail()
        ));

        try {
            emailService.sendAccountDeactivationEmail(user.getEmail(), user.getName());

            logger.logUserOperation("deactivation_email_sent", user.getEmail(), Map.of(
                "userId", userId,
                "success", true
            ));
        } catch (Exception e) {
            logger.error("Error al enviar email de desactivación", Map.of(
                "userId", userId,
                "email", user.getEmail()
            ), e);
        }
    }

    /**
     * Envía email de notificación de reactivación de cuenta.
     * <p>
     * Este email se envía cuando una cuenta previamente desactivada es reactivada.
     * <p>
     * Contenido:
     * - Confirmación de reactivación
     * - Recordatorio de funciones disponibles
     * - Actualización de políticas (si las hay)
     * - Mensaje de bienvenida de regreso
     *
     * @param userId ID del usuario cuya cuenta fue reactivada
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional(readOnly = true)
    public void sendAccountReactivationEmail(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + userId));

        logger.info("Enviando email de reactivación de cuenta", Map.of(
            "userId", userId,
            "email", user.getEmail()
        ));

        try {
            emailService.sendAccountReactivationEmail(user.getEmail(), user.getName());

            logger.logUserOperation("reactivation_email_sent", user.getEmail(), Map.of(
                "userId", userId,
                "success", true
            ));
        } catch (Exception e) {
            logger.error("Error al enviar email de reactivación", Map.of(
                "userId", userId,
                "email", user.getEmail()
            ), e);
        }
    }

    // ========================================
    // ENVÍO MASIVO
    // ========================================

    /**
     * Envía email masivo a múltiples usuarios.
     * <p>
     * Este método permite enviar un mismo mensaje a varios usuarios,
     * útil para:
     * - Anuncios de plataforma
     * - Actualizaciones de políticas
     * - Mantenimientos programados
     * - Campañas de marketing
     * <p>
     * El envío se realiza de forma secuencial para evitar saturar
     * el servidor de emails. Considera usar procesamiento asíncrono
     * para listas muy grandes.
     *
     * @param userIds Lista de IDs de usuarios a notificar
     * @param subject Asunto del email
     * @param body    Cuerpo del email (HTML o texto plano)
     * @return Número de emails enviados exitosamente
     */
    @Transactional(readOnly = true)
    public int sendBulkEmail(List<Long> userIds, String subject, String body) {
        logger.info("Iniciando envío masivo de emails", Map.of(
            "total_users", userIds.size(),
            "subject", subject
        ));

        int successCount = 0;
        int failureCount = 0;

        for (Long userId : userIds) {
            try {
                User user = userRepository.findById(userId).orElse(null);
                if (user == null) {
                    logger.warn("Usuario no encontrado en envío masivo", Map.of("userId", userId));
                    failureCount++;
                    continue;
                }

                if (user.isAccountDeactivated()) {
                    logger.info("Saltando usuario desactivado en envío masivo", Map.of("userId", userId));
                    continue;
                }

                emailService.sendEmail(user.getEmail(), subject, body);
                successCount++;

            } catch (Exception e) {
                logger.error("Error en envío masivo para usuario", Map.of("userId", userId), e);
                failureCount++;
            }
        }

        logger.info("Envío masivo completado", Map.of(
            "total", userIds.size(),
            "success", successCount,
            "failures", failureCount
        ));

        return successCount;
    }

    /**
     * Envía recordatorios de completar perfil a todos los usuarios con perfil incompleto.
     * <p>
     * Este método busca todos los usuarios que:
     * - Están verificados
     * - Tienen perfil incompleto
     * - No están desactivados
     * <p>
     * Y les envía un recordatorio personalizado para completar su perfil.
     *
     * @return Número de recordatorios enviados exitosamente
     */
    @Transactional(readOnly = true)
    public int sendProfileCompletionReminders() {
        logger.info("Enviando recordatorios masivos de completar perfil");

        List<User> incompleteProfileUsers = userRepository.findByVerifiedTrueAndProfileCompleteFalseAndAccountDeactivatedFalse();

        logger.info("Usuarios con perfil incompleto encontrados", Map.of(
            "count", incompleteProfileUsers.size()
        ));

        int successCount = 0;
        for (User user : incompleteProfileUsers) {
            try {
                sendProfileCompletionReminder(user.getId());
                successCount++;
            } catch (Exception e) {
                logger.error("Error al enviar recordatorio a usuario", Map.of(
                    "userId", user.getId(),
                    "email", user.getEmail()
                ), e);
            }
        }

        logger.info("Recordatorios de perfil enviados", Map.of(
            "total", incompleteProfileUsers.size(),
            "success", successCount
        ));

        return successCount;
    }

    /**
     * Envía recordatorios de completar perfil a usuarios específicos seleccionados.
     * <p>
     * Este método es la versión batch del recordatorio de perfil, permitiendo
     * a los administradores seleccionar exactamente qué usuarios recibirán el recordatorio.
     * <p>
     * Validaciones aplicadas:
     * - Usuario debe existir en la base de datos
     * - Solo envía a usuarios con perfil incompleto
     * - Solo envía a usuarios NO aprobados
     * <p>
     * Retorna estadísticas completas de la operación:
     * - Correos enviados exitosamente
     * - Usuarios omitidos (perfil completo o aprobados)
     * - Usuarios no encontrados
     *
     * @param userIds Lista de IDs de usuarios seleccionados
     * @return Mensaje con estadísticas de la operación
     */
    @Transactional(readOnly = true)
    public com.feeling.packages.common.domain.dto.response.MessageResponseDTO sendProfileCompletionRemindersBatch(List<Long> userIds) {
        logger.info("Enviando recordatorios de perfil en lote", Map.of("totalRequested", userIds.size()));

        List<User> users = userRepository.findAllById(userIds);
        List<User> usersNeedingReminder = users.stream()
            .filter(user -> !user.isApproved() && !user.isProfileComplete())
            .toList();

        int sent = 0;
        int skipped = users.size() - usersNeedingReminder.size();
        int failed = userIds.size() - users.size();

        for (User user : usersNeedingReminder) {
            try {
                sendProfileCompletionReminder(user.getId());
                sent++;
            } catch (Exception e) {
                logger.error("Error enviando recordatorio a: " + user.getEmail(), e);
                failed++;
            }
        }

        logger.info("Operación de recordatorios completada",
            Map.of("sent", sent, "skipped", skipped, "failed", failed));

        String message = String.format(
            "Operación completada: %d correos enviados, %d omitidos (perfil completo/aprobado), %d fallos",
            sent, skipped, failed);

        return new com.feeling.packages.common.domain.dto.response.MessageResponseDTO(message);
    }
}
