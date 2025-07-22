package com.feeling.domain.dto.user;

/**
 * DTO para métricas del usuario
 */
public record UserMetricsDTO(
        Long profileViews,
        Long likesReceived,
        Long matchesCount,
        Double popularityScore
) {
}