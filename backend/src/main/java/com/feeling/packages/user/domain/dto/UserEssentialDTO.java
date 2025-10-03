package com.feeling.packages.user.domain.dto;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.domain.dto.views.UserViews;
import com.feeling.packages.auth.domain.dto.UserStatusDTO;
import com.feeling.packages.auth.domain.dto.UserProfileDataDTO;

/**
 * DTO esencial del usuario para login y operaciones básicas
 * Contiene solo la información más crítica - Phase 3.2: Optimize AuthLoginResponseDTO
 */
public record UserEssentialDTO(

        @JsonView({UserViews.Public.class, UserViews.Matched.class, UserViews.Internal.class, UserViews.Admin.class})
        Long id,

        @JsonView({UserViews.Public.class, UserViews.Matched.class, UserViews.Internal.class, UserViews.Admin.class})
        String name,

        @JsonView({UserViews.Public.class, UserViews.Matched.class, UserViews.Internal.class, UserViews.Admin.class})
        String lastName,

        @JsonView({UserViews.Internal.class, UserViews.Admin.class})
        String email,

        @JsonView({UserViews.Public.class, UserViews.Matched.class, UserViews.Internal.class, UserViews.Admin.class})
        String role,

        @JsonView({UserViews.Public.class, UserViews.Matched.class, UserViews.Internal.class, UserViews.Admin.class})
        Boolean approved,

        @JsonView({UserViews.Public.class, UserViews.Matched.class, UserViews.Internal.class, UserViews.Admin.class})
        String approvalStatus,

        @JsonView({UserViews.Public.class, UserViews.Matched.class, UserViews.Internal.class, UserViews.Admin.class})
        String categoryInterest,

        @JsonView({UserViews.Public.class, UserViews.Matched.class, UserViews.Internal.class, UserViews.Admin.class})
        Boolean profileComplete

) {

    /**
     * Factory method para crear vista esencial desde otros DTOs
     */
    public static UserEssentialDTO from(UserStatusDTO status, UserProfileDataDTO profile) {
        return new UserEssentialDTO(
                status.id(),
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