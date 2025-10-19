package com.feeling.packages.auth.domain.dto.mapper;

import com.feeling.packages.auth.domain.dto.auth.AuthLoginResponseDTO;
import com.feeling.packages.auth.domain.dto.auth.AuthUserView;
import com.feeling.packages.auth.domain.dto.auth.TokenResponseDTO;
import com.feeling.packages.user.domain.dto.mapper.*;
import com.feeling.packages.user.infrastructure.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper exclusivo del dominio de autenticación para construir {@link AuthLoginResponseDTO}.
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.ERROR,
    uses = {
        IUserStatusMapper.class,
        IUserDataMapper.class,
        IUserPrivacyMapper.class,
        IUserNotificationMapper.class,
        IUserMetricsMapper.class,
        IUserMatchesMapper.class,
        IUserAuthMapper.class
    }
)
public interface IAuthUserMapper {
    @Mapping(target = "tokens", source = "tokens")
    @Mapping(target = "status", source = "user", qualifiedByName = "fullStatus")
    @Mapping(target = "user", source = "user")
    @Mapping(target = "privacy", source = "user")
    @Mapping(target = "notifications", source = "user")
    @Mapping(target = "metrics", source = "user")
    @Mapping(target = "matches", source = "user")
    @Mapping(target = "auth", source = "user")
    AuthLoginResponseDTO toAuthLoginResponse(TokenResponseDTO tokens, User user);

    @Mapping(target = "status", source = "user", qualifiedByName = "fullStatus")
    @Mapping(target = "profile", source = "user")
    @Mapping(target = "privacy", source = "user")
    @Mapping(target = "notifications", source = "user")
    @Mapping(target = "metrics", source = "user")
    @Mapping(target = "matches", source = "user")
    @Mapping(target = "authProvider", source = "user")
    AuthUserView toAuthUserView(User user);
}
