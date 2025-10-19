package com.feeling.packages.auth.domain.dto.mapper;

import com.feeling.packages.auth.domain.dto.auth.AuthLoginResponseDTO;
import com.feeling.packages.auth.domain.dto.auth.AuthProviderInfoDTO;
import com.feeling.packages.auth.domain.dto.auth.AuthUserView;
import com.feeling.packages.auth.domain.dto.auth.TokenResponseDTO;
import com.feeling.packages.user.domain.dto.analytics.UserPerformanceMetricsDTO;
import com.feeling.packages.user.domain.dto.mapper.IUserDataMapper;
import com.feeling.packages.user.domain.dto.mapper.IUserMatchesMapper;
import com.feeling.packages.user.domain.dto.mapper.IUserMetricsMapper;
import com.feeling.packages.user.domain.dto.mapper.IUserNotificationMapper;
import com.feeling.packages.user.domain.dto.mapper.IUserPrivacyMapper;
import com.feeling.packages.user.domain.dto.mapper.IUserStatusMapper;
import com.feeling.packages.user.domain.dto.user.UserDataDTO;
import com.feeling.packages.user.domain.dto.user.UserMatchesDTO;
import com.feeling.packages.user.domain.dto.user.UserNotificationDTO;
import com.feeling.packages.user.domain.dto.user.UserPrivacyDTO;
import com.feeling.packages.user.domain.dto.user.UserStatusDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-19T14:55:54-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Microsoft)"
)
@Component
public class IAuthUserMapperImpl implements IAuthUserMapper {

    @Autowired
    private IUserStatusMapper iUserStatusMapper;
    @Autowired
    private IUserDataMapper iUserDataMapper;
    @Autowired
    private IUserPrivacyMapper iUserPrivacyMapper;
    @Autowired
    private IUserNotificationMapper iUserNotificationMapper;
    @Autowired
    private IUserMetricsMapper iUserMetricsMapper;
    @Autowired
    private IUserMatchesMapper iUserMatchesMapper;
    @Autowired
    private IUserAuthMapper iUserAuthMapper;

    @Override
    public AuthLoginResponseDTO toAuthLoginResponse(TokenResponseDTO tokens, User user) {
        if ( tokens == null && user == null ) {
            return null;
        }

        UserStatusDTO status = null;
        UserDataDTO user1 = null;
        if ( user != null ) {
            status = iUserStatusMapper.toStatus( user );
            user1 = iUserDataMapper.toUserDataDTO( user );
        }
        TokenResponseDTO tokens1 = null;
        tokens1 = tokens;

        AuthLoginResponseDTO authLoginResponseDTO = new AuthLoginResponseDTO( tokens1, status, user1 );

        return authLoginResponseDTO;
    }

    @Override
    public AuthUserView toAuthUserView(User user) {
        if ( user == null ) {
            return null;
        }

        UserStatusDTO status = null;
        UserDataDTO profile = null;
        UserPrivacyDTO privacy = null;
        UserNotificationDTO notifications = null;
        UserPerformanceMetricsDTO metrics = null;
        UserMatchesDTO matches = null;
        AuthProviderInfoDTO authProvider = null;

        status = iUserStatusMapper.toStatus( user );
        profile = iUserDataMapper.toUserDataDTO( user );
        privacy = iUserPrivacyMapper.toPrivacy( user );
        notifications = iUserNotificationMapper.toNotifications( user );
        metrics = iUserMetricsMapper.toMetrics( user );
        matches = iUserMatchesMapper.toMatches( user );
        authProvider = iUserAuthMapper.toAuthProviderInfo( user );

        AuthUserView authUserView = new AuthUserView( status, profile, privacy, notifications, metrics, matches, authProvider );

        return authUserView;
    }
}
