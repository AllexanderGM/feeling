package com.feeling.packages.user.domain.dto;

/**
 * DTO para el overview de analytics de usuarios
 * Proporciona contadores por diferentes estados de usuario
 */
public record AnalyticsOverviewDTO(
        Long total,
        Long active,
        Long pending,
        Long incomplete,
        Long unverified,
        Long rejected,
        Long deactivated
) {
}
