package com.feeling.packages.auth.domain.dto.response;

/**
 * Disponibilidad de los proveedores OAuth soportados por la plataforma.
 *
 * @param googleEnabled Indica si Google OAuth está habilitado
 * @param facebookEnabled Indica si Facebook OAuth está habilitado
 * @param appleEnabled Indica si Apple Sign In está habilitado
 * @param microsoftEnabled Indica si Microsoft OAuth está habilitado
 */
public record OAuthProvidersDTO(
    boolean googleEnabled,
    boolean facebookEnabled,
    boolean appleEnabled,
    boolean microsoftEnabled
) {
}
