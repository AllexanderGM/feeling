package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.user.UserNotificationDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-19T14:43:05-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Microsoft)"
)
@Component
public class IUserNotificationMapperImpl implements IUserNotificationMapper {

    @Override
    public UserNotificationDTO toNotifications(User user) {
        if ( user == null ) {
            return null;
        }

        Boolean notificationsEmailEnabled = null;
        Boolean notificationsPhoneEnabled = null;
        Boolean notificationsMatchesEnabled = null;
        Boolean notificationsEventsEnabled = null;
        Boolean notificationsLoginEnabled = null;
        Boolean notificationsPaymentsEnabled = null;

        notificationsEmailEnabled = user.isNotificationsEmailEnabled();
        notificationsPhoneEnabled = user.isNotificationsPhoneEnabled();
        notificationsMatchesEnabled = user.isNotificationsMatchesEnabled();
        notificationsEventsEnabled = user.isNotificationsEventsEnabled();
        notificationsLoginEnabled = user.isNotificationsLoginEnabled();
        notificationsPaymentsEnabled = user.isNotificationsPaymentsEnabled();

        UserNotificationDTO userNotificationDTO = new UserNotificationDTO( notificationsEmailEnabled, notificationsPhoneEnabled, notificationsMatchesEnabled, notificationsEventsEnabled, notificationsLoginEnabled, notificationsPaymentsEnabled );

        return userNotificationDTO;
    }
}
