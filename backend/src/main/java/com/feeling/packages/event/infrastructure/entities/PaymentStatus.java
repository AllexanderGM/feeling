package com.feeling.packages.event.infrastructure.entities;

public enum PaymentStatus {
    PENDING("Pendiente"),
    COMPLETED("Completado"),
    FAILED("Fallido"),
    CANCELLED("Cancelado");

    private final String displayName;

    PaymentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}