package com.feeling.packages.complaint.domain.enums;

import lombok.Getter;

/**
 * Estados del workflow de resolución de quejas.
 * <p>
 * Flujo típico:
 * OPEN → IN_PROGRESS → [WAITING_USER] → RESOLVED → CLOSED
 * <p>
 * Flujo alternativo:
 * OPEN → IN_PROGRESS → ESCALATED → RESOLVED → CLOSED
 * <p>
 * Estados terminales: RESOLVED, CLOSED
 * Estados activos: OPEN, IN_PROGRESS, WAITING_USER, ESCALATED
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Getter
public enum ComplaintStatus {
    /**
     * Queja recién creada, pendiente de asignación
     */
    OPEN("Abierto"),

    /**
     * Queja asignada y siendo trabajada por un administrador
     */
    IN_PROGRESS("En progreso"),

    /**
     * Esperando respuesta o acción del usuario
     */
    WAITING_USER("Esperando usuario"),

    /**
     * Queja resuelta satisfactoriamente
     */
    RESOLVED("Resuelto"),

    /**
     * Queja cerrada (resuelto o sin resolución)
     */
    CLOSED("Cerrado"),

    /**
     * Queja escalada a nivel superior de soporte
     */
    ESCALATED("Escalado");

    /**
     * Descripción legible del estado.
     */
    private final String description;

    ComplaintStatus(String description) {
        this.description = description;
    }
}
