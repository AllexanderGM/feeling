package com.feeling.packages.match.domain.dto;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.user.domain.dto.views.UserViews;

/**
 * DTO para estado general del usuario.
 * <p>
 * Contiene información de autenticación, aprobación y estado de cuenta.
 *
 * <p>
 * Estatus respecto a sugerencias y matches.
 *
 * @param dismissed        Indica si el usuario ha sido descartado
 * @param favorite         Indica si el usuario ha sido marcado como favorito
 * @param hasAcceptedMatch Indica si el usuario tiene un match aceptado
 * @param hasPendingMatch  Indica si el usuario tiene un match pendiente
 */
public record MatchStatusDTO(
    @JsonView({UserViews.Suggestions.class})
    Boolean dismissed,

    @JsonView({UserViews.Suggestions.class})
    Boolean favorite,

    @JsonView({UserViews.Suggestions.class})
    Boolean hasAcceptedMatch,

    @JsonView({UserViews.Suggestions.class})
    Boolean hasPendingMatch
) {
}
