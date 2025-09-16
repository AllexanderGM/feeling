package com.feeling.domain.dto.auth;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.domain.dto.views.UserViews;

import java.time.LocalDate;
import java.util.List;

public record UserProfileDataDTO(
        @JsonView({UserViews.Public.class, UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Basic.class, UserViews.Suggestions.class})
        String name,

        @JsonView({UserViews.Public.class, UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Basic.class, UserViews.Suggestions.class})
        String lastName,

        @JsonView({UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Suggestions.class})
        String email,

        @JsonView({UserViews.Internal.class, UserViews.Admin.class})
        LocalDate dateOfBirth,

        @JsonView({UserViews.Public.class, UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Suggestions.class})
        Integer age,

        @JsonView({UserViews.Internal.class, UserViews.Admin.class})
        String document,

        @JsonView({UserViews.Matched.class, UserViews.Internal.class, UserViews.Admin.class})
        String phone,

        @JsonView({UserViews.Matched.class, UserViews.Internal.class, UserViews.Admin.class})
        String phoneCode,

        @JsonView({UserViews.Public.class, UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Suggestions.class})
        String country,

        @JsonView({UserViews.Public.class, UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Suggestions.class})
        String city,

        @JsonView({UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Suggestions.class})
        String department,

        @JsonView({UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Suggestions.class})
        String locality,

        @JsonView({UserViews.Public.class, UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Suggestions.class})
        String description,

        @JsonView({UserViews.Public.class, UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Basic.class, UserViews.Suggestions.class})
        List<String> images,

        @JsonView({UserViews.Public.class, UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Basic.class, UserViews.Suggestions.class})
        String mainImage,

        @JsonView({UserViews.Public.class, UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Suggestions.class})
        String categoryInterest,

        @JsonView({UserViews.Public.class, UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Suggestions.class})
        String gender,

        @JsonView({UserViews.Public.class, UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Suggestions.class})
        List<String> tags,

        // Campos de preferencias que el frontend espera
        @JsonView({UserViews.Internal.class, UserViews.Admin.class})
        Integer agePreferenceMin,

        @JsonView({UserViews.Internal.class, UserViews.Admin.class})
        Integer agePreferenceMax,

        @JsonView({UserViews.Internal.class, UserViews.Admin.class})
        Integer locationPreferenceRadius,

        // Campos específicos para SPIRIT
        @JsonView({UserViews.Public.class, UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Suggestions.class})
        String church,

        @JsonView({UserViews.Public.class, UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Suggestions.class})
        String customChurch
) {
}