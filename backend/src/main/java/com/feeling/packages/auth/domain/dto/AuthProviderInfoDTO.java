package com.feeling.packages.auth.domain.dto;

import com.feeling.packages.auth.domain.enums.AuthProvider;

import java.time.LocalDateTime;

/**
 * DTO para información del proveedor de autenticación del usuario
 */
public record AuthProviderInfoDTO(
        AuthProvider userAuthProvider,
        String externalId,
        String externalAvatarUrl,
        LocalDateTime lastExternalSync
) {
}