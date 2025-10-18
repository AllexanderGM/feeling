package com.feeling.packages.user.domain.dto.profile.response;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.user.domain.dto.profile.core.UserDataDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserStatusDTO;
import com.feeling.packages.user.domain.dto.views.UserViews;

/**
 * DTO esencial del usuario para login y operaciones básicas
 * Contiene solo la información más crítica - Phase 3.2: Optimize AuthLoginResponseDTO
 */
public record UserEssentialDTO(

    @JsonView({UserViews.Public.class, UserViews.Matched.class, UserViews.Internal.class})
    Long id,

    @JsonView({UserViews.Public.class, UserViews.Matched.class, UserViews.Internal.class})
    String name,

    @JsonView({UserViews.Public.class, UserViews.Matched.class, UserViews.Internal.class})
    String lastName,

    @JsonView({UserViews.Internal.class})
    String email,

    @JsonView({UserViews.Public.class, UserViews.Matched.class, UserViews.Internal.class})
    String role,

    @JsonView({UserViews.Public.class, UserViews.Matched.class, UserViews.Internal.class})
    Boolean approved,

    @JsonView({UserViews.Public.class, UserViews.Matched.class, UserViews.Internal.class})
    String approvalStatus,

    @JsonView({UserViews.Public.class, UserViews.Matched.class, UserViews.Internal.class})
    String categoryInterest,

    @JsonView({UserViews.Public.class, UserViews.Matched.class, UserViews.Internal.class})
    Boolean profileComplete

) {

    /**
     * Factory method para crear vista esencial desde otros DTOs
     */
    public static UserEssentialDTO from(UserStatusDTO status, UserDataDTO profile) {
        return new UserEssentialDTO(
            profile.id(),
            profile.name(),
            profile.lastName(),
            profile.email(),
            status.role(),
            status.approved(),
            status.approvalStatus(),
            profile.categoryInterest(),
            status.profileComplete()
        );
    }
}
