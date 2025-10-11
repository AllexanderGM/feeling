package com.feeling.packages.auth.domain.dto.response;

/**
 * Par de tokens JWT emitidos por el servicio de autenticación.
 *
 * @param accessToken Token de acceso de corta duración
 * @param refreshToken Token de refresco utilizado para obtener nuevos tokens
 */
public record TokenPairDTO(
        String accessToken,
        String refreshToken
) {
}
