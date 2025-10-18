package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.profile.preferences.UserNotificationDTO;
import com.feeling.packages.user.infrastructure.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct mapper for notification preferences projection.
 */
@Mapper(unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface UserNotificationMapper {

    @Mapping(target = "notificationsEmailEnabled", source = "notificationsEmailEnabled")
    @Mapping(target = "notificationsPhoneEnabled", source = "notificationsPhoneEnabled")
    @Mapping(target = "notificationsMatchesEnabled", source = "notificationsMatchesEnabled")
    @Mapping(target = "notificationsEventsEnabled", source = "notificationsEventsEnabled")
    @Mapping(target = "notificationsLoginEnabled", source = "notificationsLoginEnabled")
    @Mapping(target = "notificationsPaymentsEnabled", source = "notificationsPaymentsEnabled")
    UserNotificationDTO toNotifications(User user);
}
