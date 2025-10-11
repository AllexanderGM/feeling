package com.feeling.packages.auth.domain.dto.response;

import java.time.LocalDateTime;

/**
 * Información resumida de la sesión activa asociada a un token.
 *
 * @param userId Identificador interno del usuario
 * @param email Correo del usuario
 * @param name Nombre del usuario
 * @param lastName Apellido del usuario
 * @param role Rol principal asignado
 * @param verified Indica si el correo fue verificado
 * @param profileComplete Indica si el perfil está completo
 * @param lastActive Fecha de la última actividad registrada
 */
public record SessionInfoDTO(
    Long userId,
    String email,
    String name,
    String lastName,
    String role,
    boolean verified,
    boolean profileComplete,
    LocalDateTime lastActive
) {}
