package com.feeling.packages.user.domain.dto;

import java.util.List;

/**
 * DTO para el ranking de usuarios top
 */
public record TopUsersDTO(
        List<TopUserDTO> topByPopularity,
        List<TopUserDTO> topByMatches,
        List<TopUserDTO> topByProfileViews,
        Integer limit
) {
    public record TopUserDTO(
            Long userId,
            String name,
            String email,
            Long metricValue,
            Double popularityScore
    ) {}
}
