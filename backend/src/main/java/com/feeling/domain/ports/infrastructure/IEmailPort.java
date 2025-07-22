package com.feeling.domain.ports.infrastructure;

import java.util.Map;

/**
 * Port para operaciones de email según Clean Architecture
 * Abstrae el envío de emails independientemente del proveedor
 */
public interface IEmailPort {

    // ========================================
    // OPERACIONES BÁSICAS DE EMAIL
    // ========================================
    
    /**
     * Envía un email simple
     */
    boolean sendEmail(String to, String subject, String body);
    
    /**
     * Envía un email HTML
     */
    boolean sendHtmlEmail(String to, String subject, String htmlBody);
    
    /**
     * Envía email con template
     */
    boolean sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> variables);
    
    /**
     * Envía email con múltiples destinatarios
     */
    boolean sendBulkEmail(String[] to, String subject, String body);

    // ========================================
    // EMAILS ESPECÍFICOS PARA FEELING
    // ========================================
    
    /**
     * Envía email de verificación de registro
     */
    boolean sendVerificationEmail(String to, String userName, String verificationCode, String frontendUrl);
    
    /**
     * Envía email de bienvenida para usuarios locales
     */
    boolean sendWelcomeEmailLocal(String to, String userName);
    
    /**
     * Envía email de bienvenida para usuarios de Google OAuth
     */
    boolean sendWelcomeEmailGoogle(String to, String userName);
    
    /**
     * Envía email de recuperación de contraseña
     */
    boolean sendPasswordResetEmail(String to, String userName, String resetToken, String frontendUrl);
    
    /**
     * Envía email de confirmación de cambio de contraseña
     */
    boolean sendPasswordChangedEmail(String to, String userName);

    // ========================================
    // EMAILS DE NOTIFICACIÓN
    // ========================================
    
    /**
     * Envía notificación de nuevo match
     */
    boolean sendNewMatchNotification(String to, String userName, String matchUserName);
    
    /**
     * Envía notificación de nuevo mensaje
     */
    boolean sendNewMessageNotification(String to, String userName, String senderName);
    
    /**
     * Envía confirmación de booking de tour
     */
    boolean sendBookingConfirmation(String to, String userName, String tourName, String bookingDetails);
    
    /**
     * Envía recordatorio de tour próximo
     */
    boolean sendTourReminder(String to, String userName, String tourName, String tourDate);

    // ========================================
    // EMAILS ADMINISTRATIVOS
    // ========================================
    
    /**
     * Envía notificación de cuenta suspendida
     */
    boolean sendAccountSuspendedEmail(String to, String userName, String reason);
    
    /**
     * Envía notificación de reactivación de cuenta
     */
    boolean sendAccountReactivatedEmail(String to, String userName);
    
    /**
     * Envía email de eliminación de cuenta
     */
    boolean sendAccountDeletionEmail(String to, String userName);

    // ========================================
    // CONFIGURACIÓN Y VALIDACIÓN
    // ========================================
    
    /**
     * Valida formato de email
     */
    boolean isValidEmail(String email);
    
    /**
     * Verifica estado del servicio de email
     */
    boolean isEmailServiceAvailable();
    
    /**
     * Obtiene configuración actual del email
     */
    EmailConfig getEmailConfiguration();

    // ========================================
    // CLASE DE CONFIGURACIÓN
    // ========================================
    
    record EmailConfig(
            String smtpHost,
            int smtpPort,
            String fromEmail,
            String fromName,
            boolean tlsEnabled,
            boolean authEnabled
    ) {}
}