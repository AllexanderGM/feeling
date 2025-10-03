package com.feeling.packages.user.domain.dto;

/**
 * DTO para el conteo de usuarios por pestañas del panel de administración
 */
public record UserTabsCountDTO(
        Long active,
        Long pending,
        Long incomplete,
        Long unverified,
        Long nonApproved,
        Long rejected,
        Long deactivated,
        Long total
) {
}
