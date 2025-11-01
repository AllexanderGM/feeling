package com.feeling.packages.user.domain.enums;

/**
 * Define los tipos de cuenta disponibles para los usuarios dentro de la plataforma.
 * <p>
 * FULL_APP  → Usuarios con acceso completo a todos los módulos (matching, eventos, etc.).
 * EVENTS_ONLY → Usuarios creados a partir de reservas de eventos que solo requieren datos básicos.
 */
public enum UserAccountType {
    FULL_APP,
    EVENTS_ONLY
}
