package com.feeling.domain.services;

import com.feeling.domain.dto.booking.BookingResponseDTO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    // ==============================
    // EMAIL DE VERIFICACIÓN
    // ==============================
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
    // EMAIL DE RESERVA (LEGACY)
    // ==============================
    @Async
    public void sendMailBooking(String email, String name, BookingResponseDTO bookingResponseDTO) throws MessagingException {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("tourName", bookingResponseDTO.getTourName());
            context.setVariable("tourDescription", bookingResponseDTO.getTourDescription());
            context.setVariable("startDate", bookingResponseDTO.getStartDate().format(formatter));
            context.setVariable("endDate", bookingResponseDTO.getEndDate().format(formatter));
            context.setVariable("creationDate", bookingResponseDTO.getCreationDate().format(formatter));
            context.setVariable("adults", bookingResponseDTO.getAdults());
            context.setVariable("children", bookingResponseDTO.getChildren());
            context.setVariable("includes", bookingResponseDTO.getIncludes());
            context.setVariable("price", bookingResponseDTO.getPrice());
            context.setVariable("paymentMethod", bookingResponseDTO.getPaymentMethod());

            String html = templateEngine.process("email-verification.html", context);

            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true);

            helper.setTo(email);
            helper.setSubject("Confirmación de reserva GT");
            helper.setText(html, true);

            mailSender.send(mensaje);

            logger.info("Correo de confirmación de reserva enviado a {}", email);
        } catch (Exception e) {
            logger.error("Error al enviar correo de confirmación de reserva: {}", e.getMessage(), e);
            throw new MessagingException("Error al enviar correo de confirmación de reserva", e);
        }
    }

    // ==============================
    // MÉTODOS DE UTILIDAD
    // ==============================

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
}
