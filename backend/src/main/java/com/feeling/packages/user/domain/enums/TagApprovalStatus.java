package com.feeling.packages.user.domain.enums;

/**
 * Enum que define los posibles estados de aprobación para los tags de usuario.
 * Los tags creados por usuarios requieren aprobación administrativa para evitar contenido inapropiado.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public enum TagApprovalStatus {
    PENDING("Pendiente de aprobación"),
    APPROVED("Aprobado"),
    REJECTED("Rechazado");

    private final String description;

    TagApprovalStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}