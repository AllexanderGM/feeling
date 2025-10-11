package com.feeling.packages.user.domain.enums;

import lombok.Getter;

/**
 * Enum que define niveles de inclusión de datos en UserResponseDTO.
 * <p>
 * Permite control granular de qué información se incluye en las respuestas
 * de usuario según el contexto y permisos del solicitante.
 * <p>
 * Implementa el patrón de control de respuesta para optimizar payloads
 * y proteger información sensible según el nivel de acceso.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Getter
public enum UserResponseLevel {
    /**
     * Vista pública: solo datos básicos seguros para usuarios no autenticados
     */
    PUBLIC("public"),

    /**
     * Vista básica: datos del perfil sin información sensible para usuarios autenticados
     */
    BASIC("basic"),

    /**
     * Vista estándar: incluye métricas básicas para el propio perfil
     */
    STANDARD("standard"),

    /**
     * Vista extendida: incluye privacidad, métricas, matches y notificaciones
     */
    EXTENDED("extended"),

    /**
     * Vista completa: todos los datos incluyendo auth y account complaintStatus
     */
    FULL("full"),

    /**
     * Vista administrativa: todos los datos más campos exclusivos de administrador
     */
    ADMIN("admin");

    /**
     * Valor string del nivel para uso en APIs y queries.
     */
    private final String value;

    UserResponseLevel(String value) {
        this.value = value;
    }

    /**
     * Convierte un string a UserResponseLevel con fallback a valor por defecto.
     * <p>
     * Búsqueda case-insensitive. Si el valor es null, vacío o no existe,
     * retorna el nivel por defecto proporcionado.
     *
     * @param value        Valor string a convertir
     * @param defaultLevel Nivel por defecto si no se encuentra coincidencia
     * @return El nivel correspondiente o defaultLevel si no se encuentra
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
     * Valida si un valor string corresponde a un nivel válido.
     * <p>
     * Los valores null o vacíos se consideran válidos (usan nivel por defecto).
     *
     * @param value Valor string a validar
     * @return true si el valor es válido (existe o es null/vacío), false si es inválido
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
