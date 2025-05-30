package com.feeling.infrastructure.entities.user;

import lombok.Getter;

@Getter
public enum UserAuthProvider {
    /**
     * Registro tradicional con email y contraseña
     */
    LOCAL("Feeling"),

    /**
     * Autenticación mediante Google OAuth2
     */
    GOOGLE("Google"),

    /**
     * Autenticación mediante Facebook (para implementación futura)
     */
    FACEBOOK("Facebook"),

    /**
     * Autenticación mediante Apple (para implementación futura)
     */
    APPLE("Apple");

    private final String displayName;

    UserAuthProvider(String displayName) {
        this.displayName = displayName;
    }

    /**
     * Verifica si el proveedor requiere contraseña local
     */
    public boolean requiresLocalPassword() {
        return this == LOCAL;
    }

    /**
     * Verifica si el proveedor es OAuth externo
     */
    public boolean isExternalOAuth() {
        return this != LOCAL;
    }
}
