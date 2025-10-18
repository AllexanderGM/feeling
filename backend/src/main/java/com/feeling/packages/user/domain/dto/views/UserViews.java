package com.feeling.packages.user.domain.dto.views;

/**
 * Clases de vistas JSON para controlar qué campos se serializan.
 * <p>
 * Vistas disponibles:
 * - Public: Usuarios no autenticados o perfiles públicos
 * - Internal: Usuario viendo su propio perfil
 * - Suggestions: Sistema de matching y sugerencias
 * - Matched: Usuarios que han hecho match (incluye información de contacto)
 * <p>
 * Nota: Los administradores ven todos los campos sin restricciones (sin usar @JsonView)
 */
public class UserViews {
    /**
     * Vista pública - Para usuarios autenticados viendo otros perfiles
     * * Incluye información de perfil completa pero sin datos sensibles
     */
    public static class Public {
    }

    /**
     * Vista interna - Para el propio usuario viendo su perfil
     * Incluye todos los datos incluyendo configuraciones privadas
     */
    public static class Internal {
    }

    /**
     * Vista de sugerencias - Para matching y sugerencias
     * Perfil optimizado sin datos sensibles como teléfono
     */
    public static class Suggestions {
    }

    /**
     * Vista de matching - Para usuarios que han hecho match
     * Incluye información de contacto
     */
    public static class Matched {
    }
}
