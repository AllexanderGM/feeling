package com.feeling.packages.auth.domain.dto.response;

import com.feeling.packages.user.domain.dto.response.UserEssentialDTO;

/**
 * Respuesta compacta para flujos de login que solo requieren datos esenciales.
 * <p>
 * Se diseñó para reducir el tamaño de la carga útil en clientes ligeros,
 * manteniendo únicamente los tokens y la vista mínima del usuario.
 *
 * @param tokens Par de tokens JWT emitidos tras la autenticación
 * @param user Información esencial del usuario autenticado
 */
public record AuthLoginEssentialResponseDTO(

    TokenPairDTO tokens,
    UserEssentialDTO user

) {

    /**
     * Constructor de conveniencia con tokens separados
     */
    public AuthLoginEssentialResponseDTO(String accessToken, String refreshToken, UserEssentialDTO user) {
        this(new TokenPairDTO(accessToken, refreshToken), user);
    }

    /**
     * Getters para compatibilidad hacia atrás
     */
    public String accessToken() {
        return tokens.accessToken();
    }

    public String refreshToken() {
        return tokens.refreshToken();
    }

    /**
     * Factory method para crear desde el DTO completo
     */
    public static AuthLoginEssentialResponseDTO from(AuthLoginResponseDTO fullResponse) {
        return new AuthLoginEssentialResponseDTO(
            fullResponse.tokens(),
            UserEssentialDTO.from(fullResponse.status(), fullResponse.profile())
        );
    }
}
