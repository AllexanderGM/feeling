package com.feeling.packages.user.domain.dto.user;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.views.AuthViews;
import com.feeling.packages.user.domain.dto.views.UserViews;

import java.time.LocalDateTime;

/**
 * DTO para estado general del usuario.
 * <p>
 * Contiene información de autenticación, aprobación y estado de cuenta.
 *
 * @param verified           Indica si el correo fue verificado
 * @param profileComplete    Indica si el perfil alcanza el mínimo requerido
 * @param approved           Indica si pasó la moderación interna
 * @param approvalStatus     Estado textual de la aprobación
 * @param role               Rol principal asignado
 * @param availableAttempts  Intentos disponibles para acciones sensibles
 * @param createdAt          Fecha de creación de la cuenta
 * @param lastActive         Última actividad registrada
 * @param accountDeactivated Estado de desactivación de cuenta
 * @param deactivationDate   Fecha de desactivación
 * @param deactivationReason Razón de desactivación
 *
 *                           <p>
 *                           Estatus respecto a sugerencias y matches.
 * @param dismissed          Indica si el usuario ha sido descartado
 * @param favorite           Indica si el usuario ha sido marcado como favorito
 * @param hasAcceptedMatch   Indica si el usuario tiene un match aceptado
 * @param hasPendingMatch    Indica si el usuario tiene un match pendiente
 */
public record UserStatusDTO(
    @JsonView({UserViews.Internal.class, AuthViews.Session.Basic.class})
    Boolean verified,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Basic.class})
    Boolean profileComplete,

    @JsonView({UserViews.Internal.class, UserViews.Suggestions.class, AuthViews.Session.Basic.class})
    LocalDateTime lastActive,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Basic.class})
    Boolean approved,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Basic.class})
    String approvalStatus,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Basic.class})
    String role,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Basic.class})
    Integer availableAttempts,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Basic.class})
    LocalDateTime createdAt,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Basic.class})
    Boolean accountDeactivated,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Basic.class})
    LocalDateTime deactivationDate,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Basic.class})
    String deactivationReason,

    @JsonView({UserViews.Suggestions.class, AuthViews.Session.Basic.class})
    Boolean dismissed,

    @JsonView({UserViews.Suggestions.class, AuthViews.Session.Basic.class})
    Boolean favorite,

    @JsonView({UserViews.Suggestions.class, AuthViews.Session.Basic.class})
    Boolean hasAcceptedMatch,

    @JsonView({UserViews.Suggestions.class, AuthViews.Session.Basic.class})
    Boolean hasPendingMatch
) {
}
