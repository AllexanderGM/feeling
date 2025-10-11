package com.feeling.packages.user.domain.enums;

import lombok.Getter;

/**
 * Enum que define los posibles estados de aprobación para los tags de usuario.
 * Los tags creados por usuarios requieren aprobación administrativa para evitar contenido inapropiado.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Getter
public enum UserTagApprovalStatus {
    /**
     * Tag pendiente de aprobación administrativa
     */
    PENDING("Pendiente de aprobación"),

    /**
     * Tag aprobado y disponible para uso
     */
    APPROVED("Aprobado"),

    /**
     * Tag rechazado por contenido inapropiado
     */
    REJECTED("Rechazado");

    /**
     * Descripción legible del estado de aprobación en español.
     */
    private final String description;

    UserTagApprovalStatus(String description) {
        this.description = description;
    }
}
