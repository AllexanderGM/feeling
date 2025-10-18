package com.feeling.packages.auth.domain.dto.mapper;

import com.feeling.packages.auth.domain.dto.response.AuthLoginResponseDTO;
import com.feeling.packages.auth.domain.dto.response.TokenPairDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Component;

/**
 * Factoría centralizada para construir respuestas de autenticación.
 */
@Component
public class AuthUserFactory {

    private final AuthUserMapper authUserMapper = Mappers.getMapper(AuthUserMapper.class);

    public AuthLoginResponseDTO buildLoginResponse(String accessToken, String refreshToken, User user) {
        return authUserMapper.toAuthLoginResponse(new TokenPairDTO(accessToken, refreshToken), user);
    }

    public AuthLoginResponseDTO buildEssentialResponse(User user) {
        return authUserMapper.toAuthLoginEssential(user);
    }
}
