package com.feeling.packages.auth.domain.enums;

import lombok.Getter;

/**
 * Enum que define los proveedores de autenticación disponibles en la plataforma.
 * Soporta tanto autenticación local como proveedores OAuth externos.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Getter
public enum AuthProvider {
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
    APPLE("Apple"),

    /**
     * Usuarios creados automáticamente a través de reservas de eventos.
     * No poseen credenciales locales hasta que completen su registro.
     */
    GUEST("Eventos");

    private final String displayName;

    AuthProvider(String displayName) {
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
        return this != LOCAL && this != GUEST;
    }
}
