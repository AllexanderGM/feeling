package com.feeling.infrastructure.entities.event;

public enum EventStatus {
    EN_EDICION("En Edición"),
    PUBLICADO("Publicado"),
    PAUSADO("Pausado"),
    CANCELADO("Cancelado"),
    TERMINADO("Terminado");

    private final String displayName;

    EventStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isActive() {
        return this == PUBLICADO;
    }

    public boolean isEditable() {
        return this == EN_EDICION || this == PAUSADO;
    }

    public boolean canReceiveRegistrations() {
        return this == PUBLICADO;
    }

    public boolean isFinal() {
        return this == CANCELADO || this == TERMINADO;
    }
}