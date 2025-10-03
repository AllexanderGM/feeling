package com.feeling.packages.user.domain.enums;

import java.util.Arrays;

/**
 * Enum que define los posibles estados de aprobación de un usuario.
 * Los usuarios requieren aprobación administrativa antes de poder usar la plataforma completamente.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public enum ApprovalStatus {
    /** Usuario pendiente de aprobación */
    PENDING,

    /** Usuario aprobado */
    APPROVED,

    /** Usuario rechazado/desaprobado */
    REJECTED;

    /**
     * Busca un estado de aprobación por su nombre (case-insensitive).
     *
     * @param status Nombre del estado a buscar
     * @return El estado correspondiente, o PENDING si no se encuentra
     */
    public static ApprovalStatus lookup(String status) {
        return Arrays.stream(values())
                .filter(s -> s.name().equalsIgnoreCase(status))
                .findFirst()
                .orElse(PENDING);
    }

    /**
     * Verifica si el estado es PENDING.
     *
     * @return true si el usuario está pendiente de aprobación
     */
    public boolean isPending() {
        return this == PENDING;
    }

    /**
     * Verifica si el estado es APPROVED.
     *
     * @return true si el usuario está aprobado
     */
    public boolean isApproved() {
        return this == APPROVED;
    }

    /**
     * Verifica si el estado es REJECTED.
     *
     * @return true si el usuario fue rechazado
     */
    public boolean isRejected() {
        return this == REJECTED;
    }
}