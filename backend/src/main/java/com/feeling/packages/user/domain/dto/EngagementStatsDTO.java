package com.feeling.packages.user.domain.dto;

/**
 * DTO para estadísticas de engagement de usuarios
 */
public record EngagementStatsDTO(
        Long totalUsers,
        Long verifiedUsers,
        Long completeProfiles,
        Integer averageVerificationRate,
        Integer averageCompletionRate
) {
    /**
     * Constructor que calcula automáticamente las tasas porcentuales
     */
    public static EngagementStatsDTO from(Long totalUsers, Long verifiedUsers, Long completeProfiles) {
        if (totalUsers == null || totalUsers == 0) {
            return new EngagementStatsDTO(0L, 0L, 0L, 0, 0);
        }

        int verificationRate = Math.round((float) verifiedUsers / totalUsers * 100);
        int completionRate = Math.round((float) completeProfiles / totalUsers * 100);

        return new EngagementStatsDTO(
                totalUsers,
                verifiedUsers,
                completeProfiles,
                verificationRate,
                completionRate
        );
    }
}
