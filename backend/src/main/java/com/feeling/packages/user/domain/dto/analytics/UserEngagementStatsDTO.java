package com.feeling.packages.user.domain.dto.analytics;

/**
 * DTO para estadísticas de engagement y activación de usuarios.
 * <p>
 * Proporciona métricas clave sobre el nivel de compromiso de los usuarios
 * con la plataforma, incluyendo tasas de verificación y completitud de perfiles.
 * <p>
 * Las tasas porcentuales se calculan automáticamente mediante el método factory
 * {@link #from(Long, Long, Long)} para garantizar consistencia en los cálculos.
 *
 * @param totalUsers              Total de usuarios en el sistema
 * @param verifiedUsers           Usuarios que completaron verificación de email/teléfono
 * @param completeProfiles        Usuarios con perfiles completos (100% datos)
 * @param averageVerificationRate Porcentaje de verificación (0-100)
 * @param averageCompletionRate   Porcentaje de completitud de perfiles (0-100)
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public record UserEngagementStatsDTO(
    Long totalUsers,
    Long verifiedUsers,
    Long completeProfiles,
    Integer averageVerificationRate,
    Integer averageCompletionRate
) {
    /**
     * Crea un DTO calculando automáticamente las tasas porcentuales de engagement.
     * <p>
     * Si el total de usuarios es 0 o null, retorna un DTO con valores por defecto.
     *
     * @param totalUsers       Total de usuarios en el sistema
     * @param verifiedUsers    Usuarios verificados
     * @param completeProfiles Usuarios con perfil completo
     * @return DTO con tasas porcentuales calculadas
     */
    public static UserEngagementStatsDTO from(Long totalUsers, Long verifiedUsers, Long completeProfiles) {
        if (totalUsers == null || totalUsers == 0) {
            return new UserEngagementStatsDTO(0L, 0L, 0L, 0, 0);
        }

        int verificationRate = Math.round((float) verifiedUsers / totalUsers * 100);
        int completionRate = Math.round((float) completeProfiles / totalUsers * 100);

        return new UserEngagementStatsDTO(
            totalUsers,
            verifiedUsers,
            completeProfiles,
            verificationRate,
            completionRate
        );
    }
}
