package com.feeling.packages.auth.domain.dto.response;

/**
 * Estado resumido del progreso de onboarding de un usuario.
 *
 * @param email Correo consultado
 * @param fullyRegistered Indica si completó el flujo de registro
 * @param verified Indica si el correo fue verificado exitosamente
 * @param profileComplete Indica si el perfil cumple el mínimo requerido
 */
public record AuthUserStatusDTO(
        String email,
        boolean fullyRegistered,
        boolean verified,
        boolean profileComplete
) {
}
