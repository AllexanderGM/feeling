package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.auth.domain.dto.auth.AuthProviderInfoDTO;
import com.feeling.packages.auth.domain.dto.mapper.IUserAuthMapper;
import com.feeling.packages.user.domain.dto.analytics.UserPerformanceMetricsDTO;
import com.feeling.packages.user.domain.dto.user.UserDataDTO;
import com.feeling.packages.user.domain.dto.user.UserMatchesDTO;
import com.feeling.packages.user.domain.dto.user.UserNotificationDTO;
import com.feeling.packages.user.domain.dto.user.UserPrivacyDTO;
import com.feeling.packages.user.domain.dto.user.UserResponseDTO;
import com.feeling.packages.user.domain.dto.user.UserStatusDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-19T14:43:05-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Microsoft)"
)
@Component
public class IUserResponseMapperImpl implements IUserResponseMapper {

    @Autowired
    private IUserStatusMapper iUserStatusMapper;
    @Autowired
    private IUserPrivacyMapper iUserPrivacyMapper;
    @Autowired
    private IUserNotificationMapper iUserNotificationMapper;
    @Autowired
    private IUserMatchesMapper iUserMatchesMapper;
    @Autowired
    private IUserMetricsMapper iUserMetricsMapper;
    @Autowired
    private IUserAuthMapper iUserAuthMapper;
    @Autowired
    private IUserDataMapper iUserDataMapper;

    @Override
    public UserResponseDTO toPublicResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserStatusDTO status = null;
        UserDataDTO user1 = null;

        status = iUserStatusMapper.toStatus( user );
        user1 = iUserDataMapper.toUserDataDTO( user );

        UserPrivacyDTO privacy = null;
        UserPerformanceMetricsDTO metrics = null;
        UserMatchesDTO matches = null;
        AuthProviderInfoDTO auth = null;
        UserNotificationDTO notifications = null;

        UserResponseDTO userResponseDTO = new UserResponseDTO( status, user1, privacy, metrics, matches, auth, notifications );

        return userResponseDTO;
    }

    @Override
    public UserResponseDTO toStandardResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserStatusDTO status = null;
        UserDataDTO user1 = null;
        UserPerformanceMetricsDTO metrics = null;

        status = iUserStatusMapper.toStatus( user );
        user1 = iUserDataMapper.toUserDataDTO( user );
        metrics = iUserMetricsMapper.toMetrics( user );

        UserPrivacyDTO privacy = null;
        UserMatchesDTO matches = null;
        AuthProviderInfoDTO auth = null;
        UserNotificationDTO notifications = null;

        UserResponseDTO userResponseDTO = new UserResponseDTO( status, user1, privacy, metrics, matches, auth, notifications );

        return userResponseDTO;
    }

    @Override
    public UserResponseDTO toExtendedResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserStatusDTO status = null;
        UserDataDTO user1 = null;
        UserPrivacyDTO privacy = null;
        UserPerformanceMetricsDTO metrics = null;
        UserNotificationDTO notifications = null;

        status = iUserStatusMapper.toStatus( user );
        user1 = iUserDataMapper.toUserDataDTO( user );
        privacy = iUserPrivacyMapper.toPrivacy( user );
        metrics = iUserMetricsMapper.toMetrics( user );
        notifications = iUserNotificationMapper.toNotifications( user );

        UserMatchesDTO matches = null;
        AuthProviderInfoDTO auth = null;

        UserResponseDTO userResponseDTO = new UserResponseDTO( status, user1, privacy, metrics, matches, auth, notifications );

        return userResponseDTO;
    }

    @Override
    public UserResponseDTO toFullResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserStatusDTO status = null;
        UserDataDTO user1 = null;
        UserPrivacyDTO privacy = null;
        UserPerformanceMetricsDTO metrics = null;
        UserMatchesDTO matches = null;
        AuthProviderInfoDTO auth = null;
        UserNotificationDTO notifications = null;

        status = iUserStatusMapper.toStatus( user );
        user1 = iUserDataMapper.toUserDataDTO( user );
        privacy = iUserPrivacyMapper.toPrivacy( user );
        metrics = iUserMetricsMapper.toMetrics( user );
        matches = iUserMatchesMapper.toMatches( user );
        auth = iUserAuthMapper.toAuthProviderInfo( user );
        notifications = iUserNotificationMapper.toNotifications( user );

        UserResponseDTO userResponseDTO = new UserResponseDTO( status, user1, privacy, metrics, matches, auth, notifications );

        return userResponseDTO;
    }

    @Override
    public UserResponseDTO toSuggestionResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserStatusDTO status = null;
        UserDataDTO user1 = null;

        status = iUserStatusMapper.toPublicStatus( user );
        user1 = iUserDataMapper.toUserDataDTO( user );

        UserPrivacyDTO privacy = null;
        UserPerformanceMetricsDTO metrics = null;
        UserMatchesDTO matches = null;
        AuthProviderInfoDTO auth = null;
        UserNotificationDTO notifications = null;

        UserResponseDTO userResponseDTO = new UserResponseDTO( status, user1, privacy, metrics, matches, auth, notifications );

        return userResponseDTO;
    }
}
