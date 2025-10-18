package com.feeling.packages.match.domain.dto;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.user.domain.dto.profile.response.UserResponseDTO;
import com.feeling.packages.user.domain.dto.views.UserViews;

/**
 * DTO que representa una sugerencia de usuario con metadatos de interacción y compatibilidad.
 */
public record UserSuggestionDTO(
    @JsonView(UserViews.Suggestions.class)
    UserResponseDTO user,

    @JsonView(UserViews.Suggestions.class)
    MatchCompatibilityDTO compatibility,

    @JsonView(UserViews.Suggestions.class)
    Boolean favorite,

    @JsonView(UserViews.Suggestions.class)
    Boolean hasPendingMatch,

    @JsonView(UserViews.Suggestions.class)
    Boolean hasAcceptedMatch,

    @JsonView(UserViews.Suggestions.class)
    Boolean dismissed
) {
}
