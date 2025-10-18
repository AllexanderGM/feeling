package com.feeling.packages.auth.domain.dto.mapper;

import com.feeling.packages.auth.domain.dto.response.AuthLoginResponseDTO;
import com.feeling.packages.auth.domain.dto.response.TokenPairDTO;
import com.feeling.packages.user.domain.dto.mapper.UserAccountStatusMapper;
import com.feeling.packages.user.domain.dto.mapper.UserAuthMapper;
import com.feeling.packages.user.domain.dto.mapper.UserDataMapper;
import com.feeling.packages.user.domain.dto.mapper.UserMatchesMapper;
import com.feeling.packages.user.domain.dto.mapper.UserMetricsMapper;
import com.feeling.packages.user.domain.dto.mapper.UserNotificationMapper;
import com.feeling.packages.user.domain.dto.mapper.UserPrivacyMapper;
import com.feeling.packages.user.domain.dto.mapper.UserStatusMapper;
import com.feeling.packages.user.infrastructure.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper exclusivo del dominio de autenticación para construir {@link AuthLoginResponseDTO}.
 */
@Mapper(
    unmappedTargetPolicy = ReportingPolicy.ERROR,
    uses = {
        UserStatusMapper.class,
        UserDataMapper.class,
        UserPrivacyMapper.class,
        UserNotificationMapper.class,
        UserMetricsMapper.class,
        UserMatchesMapper.class,
        UserAuthMapper.class,
        UserAccountStatusMapper.class
    }
)
public interface AuthUserMapper {

    @Mapping(target = "tokens", source = "tokenPair")
    @Mapping(target = "status", source = "user", qualifiedByName = "fullStatus")
    @Mapping(target = "profile", source = "user")
    @Mapping(target = "privacy", source = "user")
    @Mapping(target = "notifications", source = "user")
    @Mapping(target = "metrics", source = "user")
    @Mapping(target = "matches", source = "user")
    @Mapping(target = "auth", source = "user")
    @Mapping(target = "account", source = "user")
    AuthLoginResponseDTO toAuthLoginResponse(TokenPairDTO tokenPair, User user);

    @Mapping(target = "tokens", ignore = true)
    @Mapping(target = "status", source = "user", qualifiedByName = "fullStatus")
    @Mapping(target = "profile", source = "user")
    @Mapping(target = "privacy", ignore = true)
    @Mapping(target = "notifications", ignore = true)
    @Mapping(target = "metrics", ignore = true)
    @Mapping(target = "matches", ignore = true)
    @Mapping(target = "auth", ignore = true)
    @Mapping(target = "account", ignore = true)
    AuthLoginResponseDTO toAuthLoginEssential(User user);
}
