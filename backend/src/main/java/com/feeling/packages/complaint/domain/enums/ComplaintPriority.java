package com.feeling.packages.complaint.domain.enums;

import lombok.Getter;

/**
 * Niveles de prioridad para gestión y escalamiento automático de quejas.
 * <p>
 * Define los SLA (Service Level Agreement) de tiempo de respuesta:
 * - LOW: 72 horas
 * - MEDIUM: 24 horas
 * - HIGH: 8 horas
 * - URGENT: 2 horas
 * <p>
 * Las quejas que excedan estos tiempos se marcan como "overdue" y pueden
 * ser escaladas automáticamente.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Getter
public enum ComplaintPriority {
    /**
     * Prioridad baja - tiempo de respuesta: 72 horas
     */
    LOW("Baja"),

    /**
     * Prioridad media - tiempo de respuesta: 24 horas
     */
    MEDIUM("Media"),

    /**
     * Prioridad alta - tiempo de respuesta: 8 horas
     */
    HIGH("Alta"),

    /**
     * Prioridad urgente - tiempo de respuesta: 2 horas
     */
    URGENT("Urgente");

    /**
     * Descripción legible de la prioridad.
     */
    private final String description;

    ComplaintPriority(String description) {
        this.description = description;
    }
}
