package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.auth.domain.dto.response.AuthProviderInfoDTO;
import com.feeling.packages.user.domain.dto.analytics.UserPerformanceMetricsDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserAccountStatusDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserDataDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserMatchesDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserStatusDTO;
import com.feeling.packages.user.domain.dto.profile.preferences.UserNotificationDTO;
import com.feeling.packages.user.domain.dto.profile.preferences.UserPrivacyDTO;
import com.feeling.packages.user.domain.dto.profile.response.UserResponseDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import javax.annotation.processing.Generated;
import org.mapstruct.factory.Mappers;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-18T00:44:31-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Microsoft)"
)
public class UserResponseMapperImpl implements UserResponseMapper {

    private final UserStatusMapper userStatusMapper = Mappers.getMapper( UserStatusMapper.class );
    private final UserPrivacyMapper userPrivacyMapper = Mappers.getMapper( UserPrivacyMapper.class );
    private final UserNotificationMapper userNotificationMapper = Mappers.getMapper( UserNotificationMapper.class );
    private final UserMatchesMapper userMatchesMapper = Mappers.getMapper( UserMatchesMapper.class );
    private final UserMetricsMapper userMetricsMapper = Mappers.getMapper( UserMetricsMapper.class );
    private final UserAuthMapper userAuthMapper = Mappers.getMapper( UserAuthMapper.class );
    private final UserAccountStatusMapper userAccountStatusMapper = Mappers.getMapper( UserAccountStatusMapper.class );
    private final UserDataMapper userDataMapper = Mappers.getMapper( UserDataMapper.class );

    @Override
    public UserResponseDTO toPublicResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserStatusDTO status = null;
        UserDataDTO profile = null;

        status = userStatusMapper.toStatus( user );
        profile = userDataMapper.toUserDataDTO( user );

        UserPrivacyDTO privacy = null;
        UserPerformanceMetricsDTO metrics = null;
        UserMatchesDTO matches = null;
        AuthProviderInfoDTO auth = null;
        UserAccountStatusDTO account = null;
        UserNotificationDTO notifications = null;

        UserResponseDTO userResponseDTO = new UserResponseDTO( status, profile, privacy, metrics, matches, auth, account, notifications );

        return userResponseDTO;
    }

    @Override
    public UserResponseDTO toStandardResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserStatusDTO status = null;
        UserDataDTO profile = null;
        UserPerformanceMetricsDTO metrics = null;

        status = userStatusMapper.toStatus( user );
        profile = userDataMapper.toUserDataDTO( user );
        metrics = userMetricsMapper.toMetrics( user );

        UserPrivacyDTO privacy = null;
        UserMatchesDTO matches = null;
        AuthProviderInfoDTO auth = null;
        UserAccountStatusDTO account = null;
        UserNotificationDTO notifications = null;

        UserResponseDTO userResponseDTO = new UserResponseDTO( status, profile, privacy, metrics, matches, auth, account, notifications );

        return userResponseDTO;
    }

    @Override
    public UserResponseDTO toExtendedResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserStatusDTO status = null;
        UserDataDTO profile = null;
        UserPrivacyDTO privacy = null;
        UserPerformanceMetricsDTO metrics = null;
        UserNotificationDTO notifications = null;

        status = userStatusMapper.toStatus( user );
        profile = userDataMapper.toUserDataDTO( user );
        privacy = userPrivacyMapper.toPrivacy( user );
        metrics = userMetricsMapper.toMetrics( user );
        notifications = userNotificationMapper.toNotifications( user );

        UserMatchesDTO matches = null;
        AuthProviderInfoDTO auth = null;
        UserAccountStatusDTO account = null;

        UserResponseDTO userResponseDTO = new UserResponseDTO( status, profile, privacy, metrics, matches, auth, account, notifications );

        return userResponseDTO;
    }

    @Override
    public UserResponseDTO toExtendedResponse(User user, UserMatchesDTO matches) {
        if ( user == null && matches == null ) {
            return null;
        }

        UserStatusDTO status = null;
        UserDataDTO profile = null;
        UserPrivacyDTO privacy = null;
        UserPerformanceMetricsDTO metrics = null;
        UserNotificationDTO notifications = null;
        if ( user != null ) {
            status = userStatusMapper.toStatus( user );
            profile = userDataMapper.toUserDataDTO( user );
            privacy = userPrivacyMapper.toPrivacy( user );
            metrics = userMetricsMapper.toMetrics( user );
            notifications = userNotificationMapper.toNotifications( user );
        }
        UserMatchesDTO matches1 = null;
        matches1 = matches;

        AuthProviderInfoDTO auth = null;
        UserAccountStatusDTO account = null;

        UserResponseDTO userResponseDTO = new UserResponseDTO( status, profile, privacy, metrics, matches1, auth, account, notifications );

        return userResponseDTO;
    }

    @Override
    public UserResponseDTO toFullResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserStatusDTO status = null;
        UserDataDTO profile = null;
        UserPrivacyDTO privacy = null;
        UserPerformanceMetricsDTO metrics = null;
        UserMatchesDTO matches = null;
        AuthProviderInfoDTO auth = null;
        UserAccountStatusDTO account = null;
        UserNotificationDTO notifications = null;

        status = userStatusMapper.toStatus( user );
        profile = userDataMapper.toUserDataDTO( user );
        privacy = userPrivacyMapper.toPrivacy( user );
        metrics = userMetricsMapper.toMetrics( user );
        matches = userMatchesMapper.toMatches( user );
        auth = userAuthMapper.toAuthProviderInfo( user );
        account = userAccountStatusMapper.toAccountStatus( user );
        notifications = userNotificationMapper.toNotifications( user );

        UserResponseDTO userResponseDTO = new UserResponseDTO( status, profile, privacy, metrics, matches, auth, account, notifications );

        return userResponseDTO;
    }

    @Override
    public UserResponseDTO toSuggestionResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserStatusDTO status = null;
        UserDataDTO profile = null;

        status = userStatusMapper.toPublicStatus( user );
        profile = userDataMapper.toUserDataDTO( user );

        UserPrivacyDTO privacy = null;
        UserPerformanceMetricsDTO metrics = null;
        UserMatchesDTO matches = null;
        AuthProviderInfoDTO auth = null;
        UserAccountStatusDTO account = null;
        UserNotificationDTO notifications = null;

        UserResponseDTO userResponseDTO = new UserResponseDTO( status, profile, privacy, metrics, matches, auth, account, notifications );

        return userResponseDTO;
    }
}
