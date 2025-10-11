package com.feeling.packages.auth.domain.dto.response;

import java.time.LocalDateTime;

/**
 * Estado general del usuario desde la perspectiva de autenticación.
 *
 * @param id Identificador del usuario
 * @param verified Indica si el correo fue verificado
 * @param profileComplete Indica si el perfil alcanza el mínimo requerido
 * @param approved Indica si pasó la moderación interna
 * @param approvalStatus Estado textual de la aprobación
 * @param role Rol principal asignado
 * @param availableAttempts Intentos disponibles para acciones sensibles (como matches)
 * @param createdAt Fecha de creación de la cuenta
 * @param lastActive Última actividad registrada
 */
public record UserStatusDTO(
        Long id,
        Boolean verified,
        Boolean profileComplete,
        Boolean approved,
        String approvalStatus,
        String role,
        Integer availableAttempts,
        LocalDateTime createdAt,
        LocalDateTime lastActive
) {
}
