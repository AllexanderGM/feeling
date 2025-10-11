package com.feeling.packages.user.domain.dto.tags;

import lombok.Builder;

/**
 * DTO de métricas agregadas del sistema de tags.
 *
 * @param totalTags            Total de tags registrados
 * @param activeTags           Tags activos disponibles
 * @param unusedTags           Tags sin uso actual
 * @param uniqueUsersWithTags  Usuarios únicos con al menos un tag
 * @param averageTagsPerUser   Promedio de tags por usuario
 * @param averageUsageCount    Promedio de uso por tag
 */
@Builder
public record UserTagStatisticsResponseDTO(
    Long totalTags,
    Long activeTags,
    Long unusedTags,
    Long uniqueUsersWithTags,
    Double averageTagsPerUser,
    Double averageUsageCount
) {
}
