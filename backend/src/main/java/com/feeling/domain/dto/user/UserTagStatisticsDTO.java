package com.feeling.domain.dto.user;

import lombok.Builder;

@Builder
public record UserTagStatisticsDTO(
        Long totalTags,
        Long activeTags,
        Long unusedTags,
        Long uniqueUsersWithTags,
        Double averageTagsPerUser,
        Double averageUsageCount
) {
}
