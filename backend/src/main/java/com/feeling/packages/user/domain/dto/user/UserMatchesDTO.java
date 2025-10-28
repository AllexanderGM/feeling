package com.feeling.packages.user.domain.dto.user;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.views.AuthViews;
import com.feeling.packages.user.domain.dto.views.UserViews;

/**
 * DTO para métricas de matches del usuario
 */
public record UserMatchesDTO(
    @JsonView({UserViews.Internal.class, AuthViews.Session.Full.class})
    Integer availableAttempts,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Full.class})
    Integer reservedAttempts,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Full.class})
    Integer totalRemainingAttempts,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Full.class})
    Integer todayMatches,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Full.class})
    Long sentMatches,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Full.class})
    Long receivedMatches,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Full.class})
    Long pendingSent,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Full.class})
    Long pendingReceived,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Full.class})
    Long accepted,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Full.class})
    Long favorites
) {
}
