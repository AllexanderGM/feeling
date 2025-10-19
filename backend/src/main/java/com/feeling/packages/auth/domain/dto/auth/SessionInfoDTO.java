package com.feeling.packages.auth.domain.dto.auth;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.views.AuthViews;

import java.time.LocalDateTime;

/**
 * Información resumida de la sesión activa asociada a un token.
 *
 * @param userId          Identificador interno del usuario.
 * @param email           Correo del usuario.
 * @param name            Nombre del usuario.
 * @param lastName        Apellido del usuario.
 * @param role            Rol principal asignado.
 * @param verified        Indica si el correo fue verificado.
 * @param profileComplete Indica si el perfil está completo.
 * @param lastActive      Fecha de la última actividad registrada.
 */
public record SessionInfoDTO(
    @JsonView(AuthViews.Session.Basic.class)
    Long userId,

    @JsonView(AuthViews.Session.Basic.class)
    String email,

    @JsonView(AuthViews.Session.Basic.class)
    String name,

    @JsonView(AuthViews.Session.Basic.class)
    String lastName,

    @JsonView(AuthViews.Session.Basic.class)
    String role,

    @JsonView(AuthViews.Session.Basic.class)
    boolean verified,

    @JsonView(AuthViews.Session.Basic.class)
    boolean profileComplete,

    @JsonView(AuthViews.Session.Basic.class)
    LocalDateTime lastActive
) {
}
