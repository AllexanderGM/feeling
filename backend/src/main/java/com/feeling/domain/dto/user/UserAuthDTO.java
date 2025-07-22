package com.feeling.domain.dto.user;

import com.feeling.infrastructure.entities.user.UserAuthProvider;
import java.time.LocalDateTime;

/**
 * DTO para información de autenticación del usuario
 */
public record UserAuthDTO(
        UserAuthProvider userAuthProvider,
        String externalId,
        String externalAvatarUrl,
        LocalDateTime lastExternalSync
) {
}