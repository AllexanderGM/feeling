package com.feeling.infrastructure.entities.user;

/**
 * Estado de aprobación para los tags de usuario
 */
public enum UserTagApprovalStatus {
    PENDING("Pendiente de aprobación"),
    APPROVED("Aprobado"),
    REJECTED("Rechazado");

    private final String description;

    UserTagApprovalStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}