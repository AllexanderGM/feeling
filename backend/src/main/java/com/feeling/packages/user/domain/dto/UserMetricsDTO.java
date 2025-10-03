package com.feeling.packages.user.domain.dto;

/**
 * DTO básico para métricas del usuario
 */
public record UserMetricsDTO(
        Long profileViews,
        Long likesReceived,
        Long matchesCount,
        Double popularityScore,
        Double profileCompleteness
) {
}