package com.feeling.packages.user.domain.dto.profile.core;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.user.domain.dto.views.UserViews;

/**
 * DTO para métricas de matches del usuario
 */
public record UserMatchesDTO(
    @JsonView({UserViews.Internal.class})
    Integer availableAttempts,

    @JsonView({UserViews.Internal.class})
    Integer todayMatches,

    @JsonView({UserViews.Internal.class})
    Integer totalMatches,

    @JsonView({UserViews.Internal.class})
    Integer maxDailyAttempts,

    @JsonView({UserViews.Internal.class})
    Long pendingSent,

    @JsonView({UserViews.Internal.class})
    Long pendingReceived,

    @JsonView({UserViews.Internal.class})
    Long accepted,

    @JsonView({UserViews.Internal.class})
    Long favorites
) {
}
