package com.feeling.packages.auth.domain.dto.mapper;

import com.feeling.packages.auth.domain.dto.response.AuthLoginResponseDTO;
import com.feeling.packages.auth.domain.dto.response.AuthProviderInfoDTO;
import com.feeling.packages.auth.domain.dto.response.TokenPairDTO;
import com.feeling.packages.user.domain.dto.analytics.UserPerformanceMetricsDTO;
import com.feeling.packages.user.domain.dto.mapper.UserAccountStatusMapper;
import com.feeling.packages.user.domain.dto.mapper.UserAuthMapper;
import com.feeling.packages.user.domain.dto.mapper.UserDataMapper;
import com.feeling.packages.user.domain.dto.mapper.UserMatchesMapper;
import com.feeling.packages.user.domain.dto.mapper.UserMetricsMapper;
import com.feeling.packages.user.domain.dto.mapper.UserNotificationMapper;
import com.feeling.packages.user.domain.dto.mapper.UserPrivacyMapper;
import com.feeling.packages.user.domain.dto.mapper.UserStatusMapper;
import com.feeling.packages.user.domain.dto.profile.core.UserAccountStatusDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserDataDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserMatchesDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserStatusDTO;
import com.feeling.packages.user.domain.dto.profile.preferences.UserNotificationDTO;
import com.feeling.packages.user.domain.dto.profile.preferences.UserPrivacyDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import javax.annotation.processing.Generated;
import org.mapstruct.factory.Mappers;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-18T00:44:31-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Microsoft)"
)
public class AuthUserMapperImpl implements AuthUserMapper {

    private final UserStatusMapper userStatusMapper = Mappers.getMapper( UserStatusMapper.class );
    private final UserDataMapper userDataMapper = Mappers.getMapper( UserDataMapper.class );
    private final UserPrivacyMapper userPrivacyMapper = Mappers.getMapper( UserPrivacyMapper.class );
    private final UserNotificationMapper userNotificationMapper = Mappers.getMapper( UserNotificationMapper.class );
    private final UserMetricsMapper userMetricsMapper = Mappers.getMapper( UserMetricsMapper.class );
    private final UserMatchesMapper userMatchesMapper = Mappers.getMapper( UserMatchesMapper.class );
    private final UserAuthMapper userAuthMapper = Mappers.getMapper( UserAuthMapper.class );
    private final UserAccountStatusMapper userAccountStatusMapper = Mappers.getMapper( UserAccountStatusMapper.class );

    @Override
    public AuthLoginResponseDTO toAuthLoginResponse(TokenPairDTO tokenPair, User user) {
        if ( tokenPair == null && user == null ) {
            return null;
        }

        UserStatusDTO status = null;
        UserDataDTO profile = null;
        UserPrivacyDTO privacy = null;
        UserNotificationDTO notifications = null;
        UserPerformanceMetricsDTO metrics = null;
        UserMatchesDTO matches = null;
        AuthProviderInfoDTO auth = null;
        UserAccountStatusDTO account = null;
        if ( user != null ) {
            status = userStatusMapper.toStatus( user );
            profile = userDataMapper.toUserDataDTO( user );
            privacy = userPrivacyMapper.toPrivacy( user );
            notifications = userNotificationMapper.toNotifications( user );
            metrics = userMetricsMapper.toMetrics( user );
            matches = userMatchesMapper.toMatches( user );
            auth = userAuthMapper.toAuthProviderInfo( user );
            account = userAccountStatusMapper.toAccountStatus( user );
        }
        TokenPairDTO tokens = null;
        tokens = tokenPair;

        AuthLoginResponseDTO authLoginResponseDTO = new AuthLoginResponseDTO( tokens, status, profile, privacy, notifications, metrics, matches, auth, account );

        return authLoginResponseDTO;
    }

    @Override
    public AuthLoginResponseDTO toAuthLoginEssential(User user) {
        if ( user == null ) {
            return null;
        }

        UserStatusDTO status = null;
        UserDataDTO profile = null;

        status = userStatusMapper.toStatus( user );
        profile = userDataMapper.toUserDataDTO( user );

        TokenPairDTO tokens = null;
        UserPrivacyDTO privacy = null;
        UserNotificationDTO notifications = null;
        UserPerformanceMetricsDTO metrics = null;
        UserMatchesDTO matches = null;
        AuthProviderInfoDTO auth = null;
        UserAccountStatusDTO account = null;

        AuthLoginResponseDTO authLoginResponseDTO = new AuthLoginResponseDTO( tokens, status, profile, privacy, notifications, metrics, matches, auth, account );

        return authLoginResponseDTO;
    }
}
