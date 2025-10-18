package com.feeling.packages.user.domain.dto.profile.core;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.user.domain.dto.views.UserViews;

import java.time.LocalDateTime;

/**
 * DTO para estado de cuenta del usuario
 */
public record UserAccountStatusDTO(
    @JsonView({UserViews.Internal.class})
    Boolean accountDeactivated,

    @JsonView({UserViews.Internal.class})
    LocalDateTime deactivationDate,

    @JsonView({UserViews.Internal.class})
    String deactivationReason
) {
}
