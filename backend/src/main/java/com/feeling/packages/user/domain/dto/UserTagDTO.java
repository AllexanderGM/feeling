package com.feeling.packages.user.domain.dto;

import com.feeling.packages.user.infrastructure.entities.UserTag;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record UserTagDTO(
        Long id,
        String name,
        String displayName,
        LocalDateTime createdAt,
        String createdBy,
        Long usageCount,
        LocalDateTime lastUsed
) {
    public UserTagDTO(UserTag userTag) {
        this(
                userTag.getId(),
                userTag.getName(),
                userTag.getDisplayName(),
                userTag.getCreatedAt(),
                userTag.getCreatedBy(),
                userTag.getUsageCount(),
                userTag.getLastUsed()
        );
    }
}
