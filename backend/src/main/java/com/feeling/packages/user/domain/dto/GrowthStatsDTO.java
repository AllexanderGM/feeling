package com.feeling.packages.user.domain.dto;

/**
 * DTO para estadísticas de crecimiento de usuarios
 */
public record GrowthStatsDTO(
        Long usersLast24Hours,
        Long usersLast7Days,
        Long usersLast30Days,
        Long activeUsersLast7Days,
        Long activeUsersLast30Days,
        Integer retentionRate7Days,
        Integer retentionRate30Days
) {
    /**
     * Constructor que calcula automáticamente las tasas de retención
     */
    public static GrowthStatsDTO from(
            Long usersLast24Hours,
            Long usersLast7Days,
            Long usersLast30Days,
            Long activeUsersLast7Days,
            Long activeUsersLast30Days,
            Long totalUsers
    ) {
        int retentionRate7Days = 0;
        int retentionRate30Days = 0;

        if (totalUsers != null && totalUsers > 0) {
            retentionRate7Days = Math.round((float) activeUsersLast7Days / totalUsers * 100);
            retentionRate30Days = Math.round((float) activeUsersLast30Days / totalUsers * 100);
        }

        return new GrowthStatsDTO(
                usersLast24Hours,
                usersLast7Days,
                usersLast30Days,
                activeUsersLast7Days,
                activeUsersLast30Days,
                retentionRate7Days,
                retentionRate30Days
        );
    }
}
