package com.feeling.domain.dto.user;

/**
 * DTO para métricas de matches del usuario
 */
public record UserMatchesDTO(
        Integer availableAttempts,
        Integer todayMatches,
        Integer totalMatches,
        Integer maxDailyAttempts,
        Long pendingSent,
        Long pendingReceived,
        Long accepted,
        Long favorites
) {
}