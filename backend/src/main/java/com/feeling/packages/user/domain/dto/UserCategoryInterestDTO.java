package com.feeling.packages.user.domain.dto;

import java.time.LocalDateTime;
import java.util.List;


public record UserCategoryInterestDTO(
        Long id,
        String categoryInterestEnum,
        String name,
        String description,
        String icon,
        String fullDescription,
        String targetAudience,
        List<String> features,
        boolean isActive,
        Integer displayOrder,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}