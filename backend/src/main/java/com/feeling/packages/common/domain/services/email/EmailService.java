package com.feeling.packages.common.domain.services.email;

import com.feeling.packages.event.domain.dto.EventRegistrationResponseDTO;
import com.feeling.packages.event.domain.dto.EventResponseDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Servicio centralizado para gestión de envío de correos electrónicos.
 * <p>
 * Proporciona métodos para enviar diferentes tipos de notificaciones por email
 * incluyendo verificación, bienvenida, recuperación de contraseña, eventos y gestión de usuarios.
 * Utiliza Thymeleaf para renderizar plantillas HTML y JavaMailSender para el envío asíncrono.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${cors.allowed.origins}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${complaint.email:soporte@feeling.com}")
    private String supportEmail;

    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    // ==============================
    // EMAIL DE VERIFICACIÓN
    // ==============================

    /**
     * Envía email de verificación de cuenta con código de verificación.
     *
     * @param to               Email del destinatario
     * @param name             Nombre del usuario
     * @param verificationCode Código de 6 dígitos para verificación
     * @throws MessagingException si ocurre un error al enviar el email
     */
    @Async
    public void sendVerificationEmail(String to, String name, String verificationCode) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("verificationCode", verificationCode);

            String htmlContent = templateEngine.process("email-verification.html", context);

            helper.setTo(to);
            helper.setSubject("Verificación de cuenta - Feeling");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Correo de verificación enviado a: {}", to);
        } catch (Exception e) {
            logger.error("Error al enviar correo de verificación: {}", e.getMessage(), e);
            throw new MessagingException("Error al enviar el correo de verificación", e);
        }
    }

    // ==============================
    // EMAILS DE BIENVENIDA
    // ==============================

    /**
     * Envía email de bienvenida para usuarios registrados con Google
     */
    @Async
    public void sendWelcomeEmailForGoogleUser(String to, String name, String profilePicture) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("registrationMethod", "Google");
            context.setVariable("profilePicture", profilePicture);
            context.setVariable("isGoogleUser", true);

            // CORRECCIÓN: Usar el nombre correcto de la plantilla
            String htmlContent = templateEngine.process("email-welcome-google.html", context);

            helper.setTo(to);
            helper.setSubject("¡Bienvenido a Feeling! - Registro completado");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Email de bienvenida para usuario de Google enviado a: {}", to);
        } catch (Exception e) {
            logger.error("Error al enviar email de bienvenida para usuario de Google: {}", e.getMessage(), e);
            throw new MessagingException("Error al enviar el email de bienvenida", e);
        }
    }

    /**
     * Envía email de bienvenida para usuarios registrados localmente (después de verificar email)
     */
    @Async
    public void sendWelcomeEmailForLocalUser(String to, String name) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("registrationMethod", "Email");
            context.setVariable("isGoogleUser", false);
            context.setVariable("profilePicture", null); // No hay foto para usuarios locales

            // CORRECCIÓN: Usar el nombre correcto de la plantilla
            String htmlContent = templateEngine.process("email-welcome-local.html", context);

            helper.setTo(to);
            helper.setSubject("¡Bienvenido a Feeling! - Cuenta verificada");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Email de bienvenida para usuario local enviado a: {}", to);
        } catch (Exception e) {
            logger.error("Error al enviar email de bienvenida para usuario local: {}", e.getMessage(), e);
            throw new MessagingException("Error al enviar el email de bienvenida", e);
        }
    }

    // ==============================
    // EMAILS DE RECUPERACIÓN DE CONTRASEÑA
    // ==============================

    /**
     * Envía email de recuperación de contraseña con enlace de restablecimiento
     */
    @Async
    public void sendPasswordResetEmail(String to, String name, String resetLink, int expirationMinutes) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("resetLink", resetLink);
            context.setVariable("expirationMinutes", expirationMinutes);

            String htmlContent = templateEngine.process("email-password-reset.html", context);

            helper.setTo(to);
            helper.setSubject("Recupera tu contraseña - Feeling");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Email de recuperación de contraseña enviado a: {}", to);
        } catch (Exception e) {
            logger.error("Error al enviar email de recuperación de contraseña: {}", e.getMessage(), e);
            throw new MessagingException("Error al enviar email de recuperación de contraseña", e);
        }
    }

    /**
     * Envía email de confirmación de cambio de contraseña
     */
    @Async
    public void sendPasswordChangeConfirmationEmail(String to, String name) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("changeDate", LocalDateTime.now().format(
                DateTimeFormatter.ofPattern("dd/MM/yyyy 'a las' HH:mm")
            ));

            String htmlContent = templateEngine.process("email-password-changed.html", context);

            helper.setTo(to);
            helper.setSubject("Contraseña actualizada - Feeling");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Email de confirmación de cambio de contraseña enviado a: {}", to);
        } catch (Exception e) {
            logger.error("Error al enviar email de confirmación de cambio de contraseña: {}", e.getMessage(), e);
            // No lanzar excepción aquí porque el cambio de contraseña ya fue exitoso
        }
    }

    // ==============================
    // EMAIL DE CONFIRMACIÓN DE EVENTOS
    // ==============================

    /**
     * Envía correo de confirmación cuando un usuario se registra en un evento.
     *
     * @param email        Email del usuario registrado
     * @param userName     Nombre completo del usuario
     * @param registration DTO con información del registro y evento
     * @throws MessagingException si ocurre un error al enviar el correo
     */
    @Async
    public void sendEventRegistrationConfirmation(
        String email,
        String userName,
        EventRegistrationResponseDTO registration
    ) throws MessagingException {
        try {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

            Context context = new Context();

            // Información del usuario
            context.setVariable("userName", userName);

            // Información del evento
            context.setVariable("eventTitle", registration.eventTitle());
            context.setVariable("eventDate", registration.eventDate().format(dateFormatter));
            context.setVariable("eventTime", registration.eventDate().format(timeFormatter));

            // Información del registro
            context.setVariable("registrationId", registration.id());
            context.setVariable("registrationDate", registration.registrationDate().format(dateFormatter));

            // Información de pago
            context.setVariable("amountPaid", registration.amountPaid());
            context.setVariable("paymentStatus", registration.paymentStatusDisplayName());
            context.setVariable("isPaid", registration.isPaid());
            context.setVariable("isPending", registration.isPending());

            // Link al evento (puedes personalizarlo)
            String eventLink = frontendUrl + "/events/" + registration.eventId();
            context.setVariable("eventLink", eventLink);

            String html = templateEngine.process("event-registration-confirmation.html", context);

            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true);

            helper.setTo(email);
            helper.setSubject("Confirmación de registro - " + registration.eventTitle());
            helper.setText(html, true);

            mailSender.send(mensaje);

            logger.info("Correo de confirmación de registro a evento enviado a {}", email);
        } catch (Exception e) {
            logger.error("Error al enviar correo de confirmación de registro a evento: {}", e.getMessage(), e);
            throw new MessagingException("Error al enviar correo de confirmación de registro a evento", e);
        }
    }

    /**
     * Envía email de bienvenida para usuarios validados por administrador
     */
    @Async
    public void sendWelcomeEmailForApprovedUser(String to, String name, boolean isGoogleUser, String profilePicture) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("isGoogleUser", isGoogleUser);
            context.setVariable("profilePicture", profilePicture);
            context.setVariable("isApprovedByAdmin", true);

            // Usar la plantilla apropiada según el tipo de usuario
            String templateName = isGoogleUser ? "email-welcome-google.html" : "email-welcome-local.html";
            String htmlContent = templateEngine.process(templateName, context);

            helper.setTo(to);
            helper.setSubject("¡Tu cuenta ha sido validada! - Bienvenido a Feeling");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Email de bienvenida para usuario aprobado enviado a: {}", to);
        } catch (Exception e) {
            logger.error("Error al enviar email de bienvenida para usuario aprobado: {}", e.getMessage(), e);
            throw new MessagingException("Error al enviar el email de bienvenida de aprobación", e);
        }
    }

    // ==============================
    // MÉTODOS DE UTILIDAD
    // ==============================

    /**
     * Método genérico para enviar emails con contenido personalizado.
     * Útil para notificaciones y comunicaciones que no tienen plantilla específica.
     *
     * @param to      Email del destinatario
     * @param subject Asunto del email
     * @param body    Contenido del email (puede ser HTML o texto plano)
     * @throws MessagingException si ocurre un error al enviar el email
     */
    @Async
    public void sendEmail(String to, String subject, String body) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true = is HTML
            helper.setFrom(fromEmail);

            mailSender.send(message);
            logger.info("Email genérico enviado a: {} con asunto: {}", to, subject);
        } catch (Exception e) {
            logger.error("Error al enviar email genérico a {}: {}", to, e.getMessage(), e);
            throw new MessagingException("Error al enviar email", e);
        }
    }

    /**
     * Método genérico para enviar email de bienvenida
     * Determina automáticamente el tipo de usuario
     */
    @Async
    public void sendWelcomeEmail(String to, String name, boolean isGoogleUser, String profilePicture) throws MessagingException {
        if (isGoogleUser) {
            sendWelcomeEmailForGoogleUser(to, name, profilePicture);
        } else {
            sendWelcomeEmailForLocalUser(to, name);
        }
    }

    // ==============================
    // EMAILS DE EVENTOS
    // ==============================

    /**
     * Envía email de confirmación de registro a evento
     */
    @Async
    public void sendEventRegistrationConfirmation(EventRegistrationResponseDTO registration, EventResponseDTO event) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("userName", registration.userName());
            context.setVariable("eventTitle", event.title());
            context.setVariable("eventDate", event.eventDate());
            context.setVariable("eventCategory", event.categoryDisplayName());
            context.setVariable("amountPaid", registration.amountPaid());
            context.setVariable("registrationId", registration.id());

            String htmlContent = templateEngine.process("email-event-registration-confirmation.html", context);

            helper.setTo(getUserEmailFromRegistration(registration));
            helper.setSubject("✅ Confirmación de registro - " + event.title());
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Correo de confirmación de evento enviado para registro ID: {}", registration.id());
        } catch (Exception e) {
            logger.error("Error al enviar correo de confirmación de evento: {}", e.getMessage(), e);
            throw new MessagingException("Error al enviar correo de confirmación de evento", e);
        }
    }

    /**
     * Envía recordatorio de evento 24 horas antes
     */
    @Async
    public void sendEventReminder(EventRegistrationResponseDTO registration, EventResponseDTO event) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("userName", registration.userName());
            context.setVariable("eventTitle", event.title());
            context.setVariable("eventDate", event.eventDate());
            context.setVariable("eventCategory", event.categoryDisplayName());
            context.setVariable("registrationId", registration.id());

            String htmlContent = templateEngine.process("email-event-reminder.html", context);

            helper.setTo(getUserEmailFromRegistration(registration));
            helper.setSubject("⏰ Recordatorio: " + event.title() + " es mañana");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Recordatorio de evento enviado para registro ID: {}", registration.id());
        } catch (Exception e) {
            logger.error("Error al enviar recordatorio de evento: {}", e.getMessage(), e);
            throw new MessagingException("Error al enviar recordatorio de evento", e);
        }
    }

    private String getUserEmailFromRegistration(EventRegistrationResponseDTO registration) {
        return registration.userEmail();
    }

    /**
     * Envía correo recordatorio para completar el perfil
     */
    @Async
    public void sendProfileCompletionReminder(User user) {
        try {
            Context context = new Context();
            context.setVariable("name", user.getName());
            context.setVariable("lastName", user.getLastName());
            context.setVariable("email", user.getEmail());
            context.setVariable("profileUrl", frontendUrl + "/complete-user");
            context.setVariable("supportEmail", supportEmail);

            String htmlContent = templateEngine.process("email-user-completion-reminder", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("Completa tu perfil en Feeling - ¡Te estamos esperando!");
            helper.setText(htmlContent, true);
            helper.setFrom(fromEmail, "Feeling Team");

            mailSender.send(message);

            logger.info("Correo recordatorio enviado exitosamente a: {}", user.getEmail());

        } catch (Exception e) {
            logger.error("Error al enviar correo recordatorio a: " + user.getEmail(), e);
            throw new RuntimeException("Error al enviar correo recordatorio", e);
        }
    }

    // ==============================
    // EMAILS DE GESTIÓN DE USUARIOS
    // ==============================

    /**
     * Envía email de aprobación cuando un usuario es aprobado por el administrador
     */
    @Async
    public void sendUserApprovalEmail(String to, String name) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("name", name);

            String htmlContent = templateEngine.process("email-user-approval.html", context);

            helper.setTo(to);
            helper.setSubject("¡Tu cuenta ha sido aprobada! - Feeling");
            helper.setText(htmlContent, true);
            helper.setFrom(fromEmail);

            mailSender.send(message);
            logger.info("Email de aprobación de usuario enviado a: {}", to);
        } catch (Exception e) {
            logger.error("Error al enviar email de aprobación a {}: {}", to, e.getMessage(), e);
            throw new MessagingException("Error al enviar email de aprobación", e);
        }
    }

    /**
     * Envía email de rechazo cuando un usuario no es aprobado por el administrador
     */
    @Async
    public void sendUserRejectionEmail(String to, String name, String reason) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("reason", reason != null ? reason : "No se proporcionó un motivo específico.");

            String htmlContent = templateEngine.process("email-user-rejection.html", context);

            helper.setTo(to);
            helper.setSubject("Actualización sobre tu solicitud - Feeling");
            helper.setText(htmlContent, true);
            helper.setFrom(fromEmail);

            mailSender.send(message);
            logger.info("Email de rechazo de usuario enviado a: {}", to);
        } catch (Exception e) {
            logger.error("Error al enviar email de rechazo a {}: {}", to, e.getMessage(), e);
            throw new MessagingException("Error al enviar email de rechazo", e);
        }
    }

    /**
     * Envía email de notificación de desactivación de cuenta
     */
    @Async
    public void sendAccountDeactivationEmail(String to, String name) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("name", name);

            String htmlContent = templateEngine.process("email-account-deactivation.html", context);

            helper.setTo(to);
            helper.setSubject("Tu cuenta ha sido desactivada - Feeling");
            helper.setText(htmlContent, true);
            helper.setFrom(fromEmail);

            mailSender.send(message);
            logger.info("Email de desactivación de cuenta enviado a: {}", to);
        } catch (Exception e) {
            logger.error("Error al enviar email de desactivación a {}: {}", to, e.getMessage(), e);
            throw new MessagingException("Error al enviar email de desactivación", e);
        }
    }

    /**
     * Envía email de notificación de reactivación de cuenta
     */
    @Async
    public void sendAccountReactivationEmail(String to, String name) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("name", name);

            String htmlContent = templateEngine.process("email-account-reactivation.html", context);

            helper.setTo(to);
            helper.setSubject("¡Bienvenido de vuelta! - Feeling");
            helper.setText(htmlContent, true);
            helper.setFrom(fromEmail);

            mailSender.send(message);
            logger.info("Email de reactivación de cuenta enviado a: {}", to);
        } catch (Exception e) {
            logger.error("Error al enviar email de reactivación a {}: {}", to, e.getMessage(), e);
            throw new MessagingException("Error al enviar email de reactivación", e);
        }
    }
}
