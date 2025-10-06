package com.feeling.packages.user.domain.enums;

import lombok.Getter;

/**
 * Enum para definir niveles de inclusión de datos en UserResponseDTO
 * Phase 4.2: Query Parameters for Response Control - API Modernization
 */
@Getter
public enum UserResponseLevel {
    /**
     * Vista pública: solo datos básicos seguros
     * Para usuarios no logueados, sugerencias, búsquedas públicas
     */
    PUBLIC("public"),

    /**
     * Vista básica: datos del perfil sin información sensible
     * Para usuarios logueados viendo otros perfiles
     */
    BASIC("basic"),

    /**
     * Vista estándar: incluye métricas básicas
     * Para el propio perfil del usuario, vista general
     */
    STANDARD("standard"),

    /**
     * Vista extendida: incluye privacidad, métricas, matches, notificaciones
     * Para el propio perfil con más detalle
     */
    EXTENDED("extended"),

    /**
     * Vista completa: todos los datos incluyendo auth y account status
     * Para administradores y APIs internas
     */
    FULL("full"),

    /**
     * Vista administrativa: todos los datos + campos de admin
     * Solo para administradores
     */
    ADMIN("admin");

    private final String value;

    UserResponseLevel(String value) {
        this.value = value;
    }

    /**
     * Convierte un string a UserResponseLevel, con valor por defecto
     */
    public static UserResponseLevel fromString(String value, UserResponseLevel defaultLevel) {
        if (value == null || value.trim().isEmpty()) {
            return defaultLevel;
        }

        for (UserResponseLevel level : UserResponseLevel.values()) {
            if (level.value.equalsIgnoreCase(value.trim())) {
                return level;
            }
        }

        return defaultLevel;
    }

    /**
     * Valida si el level es válido
     */
    public static boolean isValidLevel(String value) {
        if (value == null || value.trim().isEmpty()) {
            return true;
        }

        for (UserResponseLevel level : UserResponseLevel.values()) {
            if (level.value.equalsIgnoreCase(value.trim())) {
                return true;
            }
        }

        return false;
    }

    @Override
    public String toString() {
        return value;
    }
}
