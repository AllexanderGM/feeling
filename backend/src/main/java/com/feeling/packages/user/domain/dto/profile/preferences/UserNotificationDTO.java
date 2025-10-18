package com.feeling.packages.user.domain.dto.profile.preferences;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.user.domain.dto.views.UserViews;

/**
 * DTO para configuración de notificaciones del usuario
 */
public record UserNotificationDTO(
    @JsonView({UserViews.Internal.class})
    Boolean notificationsEmailEnabled,

    @JsonView({UserViews.Internal.class})
    Boolean notificationsPhoneEnabled,

    @JsonView({UserViews.Internal.class})
    Boolean notificationsMatchesEnabled,

    @JsonView({UserViews.Internal.class})
    Boolean notificationsEventsEnabled,

    @JsonView({UserViews.Internal.class})
    Boolean notificationsLoginEnabled,

    @JsonView({UserViews.Internal.class})
    Boolean notificationsPaymentsEnabled
) {
}
