package com.feeling.packages.auth.domain.enums;

/**
 * Tipos de token JWT soportados por la plataforma.
 * <p>
 * - {@link #ACCESS}: Token de corta duración usado para autenticación en peticiones.
 * - {@link #REFRESH}: Token de larga duración usado para generar nuevos tokens de acceso.
 */
public enum AuthTokenType {
    ACCESS,
    REFRESH
}
