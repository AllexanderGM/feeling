package com.feeling.packages.user.domain.dto.user;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.views.AuthViews;
import com.feeling.packages.user.domain.dto.views.UserViews;

/**
 * DTO para configuración de notificaciones del usuario
 */
public record UserNotificationDTO(
    @JsonView({UserViews.Internal.class, AuthViews.Session.Extended.class})
    Boolean notificationsEmailEnabled,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Extended.class})
    Boolean notificationsPhoneEnabled,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Extended.class})
    Boolean notificationsMatchesEnabled,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Extended.class})
    Boolean notificationsEventsEnabled,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Extended.class})
    Boolean notificationsLoginEnabled,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Extended.class})
    Boolean notificationsPaymentsEnabled
) {
}
