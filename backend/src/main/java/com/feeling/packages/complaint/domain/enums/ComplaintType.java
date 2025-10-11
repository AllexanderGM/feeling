package com.feeling.packages.complaint.domain.enums;

import lombok.Getter;

/**
 * Tipos de queja disponibles para categorización automática.
 * <p>
 * Cada tipo tiene un nivel de prioridad implícito y ruta de escalamiento.
 * Los tipos permiten categorizar las quejas para:
 * - Asignación automática al departamento correcto
 * - Escalamiento según tipo y prioridad
 * - Métricas y reportes segmentados
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Getter
public enum ComplaintType {
    /**
     * Consultas generales y dudas sobre la plataforma
     */
    GENERAL("Consulta general"),

    /**
     * Problemas técnicos como bugs, errores de funcionamiento
     */
    TECHNICAL_ISSUE("Problema técnico"),

    /**
     * Problemas con cuentas de usuario, acceso, verificación
     */
    ACCOUNT_ISSUE("Problema de cuenta"),

    /**
     * Problemas con pagos, facturación, suscripciones
     */
    PAYMENT_ISSUE("Problema de pago"),

    /**
     * Reportes sobre comportamiento de otros usuarios
     */
    USER_REPORT("Reporte de usuario"),

    /**
     * Problemas específicos con eventos de la plataforma
     */
    EVENT_ISSUE("Problema con evento"),

    /**
     * Problemas con reservas y sistema de booking
     */
    BOOKING_ISSUE("Problema con reserva"),

    /**
     * Preocupaciones sobre privacidad y datos personales
     */
    PRIVACY_CONCERN("Preocupación de privacidad"),

    /**
     * Solicitudes de nuevas funcionalidades
     */
    FEATURE_REQUEST("Solicitud de funcionalidad"),

    /**
     * Reportes de errores específicos del sistema
     */
    BUG_REPORT("Reporte de error"),

    /**
     * Reportes de abuso, acoso o contenido inapropiado
     */
    ABUSE_REPORT("Reporte de abuso"),

    /**
     * Solicitudes de reembolso y devoluciones
     */
    REFUND_REQUEST("Solicitud de reembolso");

    /**
     * Descripción legible del tipo de queja.
     */
    private final String description;

    ComplaintType(String description) {
        this.description = description;
    }

}
