package com.feeling.packages.auth.domain.dto;

import com.feeling.packages.user.domain.dto.UserEssentialDTO;

/**
 * DTO optimizado para login - solo datos esenciales
 * Reemplaza AuthLoginResponseDTO pesado - Phase 3.2: Optimize AuthLoginResponseDTO
 *
 * ANTES: ~73 campos en 9 DTOs diferentes
 * DESPUÉS: ~9 campos esenciales
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