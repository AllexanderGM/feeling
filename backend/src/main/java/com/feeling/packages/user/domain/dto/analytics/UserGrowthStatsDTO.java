package com.feeling.packages.user.domain.dto.analytics;

/**
 * DTO para estadísticas de crecimiento y retención de usuarios.
 * <p>
 * Proporciona métricas temporales sobre el crecimiento de la base de usuarios
 * y tasas de retención en diferentes períodos de tiempo.
 * <p>
 * Las tasas de retención se calculan automáticamente mediante el método factory
 * {@link #from(Long, Long, Long, Long, Long, Long)} para garantizar consistencia.
 *
 * @param usersLast24Hours      Usuarios registrados en las últimas 24 horas
 * @param usersLast7Days        Usuarios registrados en los últimos 7 días
 * @param usersLast30Days       Usuarios registrados en los últimos 30 días
 * @param activeUsersLast7Days  Usuarios activos en los últimos 7 días
 * @param activeUsersLast30Days Usuarios activos en los últimos 30 días
 * @param retentionRate7Days    Tasa de retención a 7 días (porcentaje 0-100)
 * @param retentionRate30Days   Tasa de retención a 30 días (porcentaje 0-100)
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public record UserGrowthStatsDTO(
    Long usersLast24Hours,
    Long usersLast7Days,
    Long usersLast30Days,
    Long activeUsersLast7Days,
    Long activeUsersLast30Days,
    Integer retentionRate7Days,
    Integer retentionRate30Days
) {
    /**
     * Crea un DTO calculando automáticamente las tasas de retención.
     * <p>
     * La tasa de retención se calcula como el porcentaje de usuarios activos
     * sobre el total de usuarios en el período.
     * <p>
     * Si el total de usuarios es 0 o null, las tasas de retención serán 0%.
     *
     * @param usersLast24Hours      Usuarios registrados en 24h
     * @param usersLast7Days        Usuarios registrados en 7 días
     * @param usersLast30Days       Usuarios registrados en 30 días
     * @param activeUsersLast7Days  Usuarios activos en 7 días
     * @param activeUsersLast30Days Usuarios activos en 30 días
     * @param totalUsers            Total de usuarios del sistema (para calcular retención)
     * @return DTO con tasas de retención calculadas
     */
    public static UserGrowthStatsDTO from(
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

        return new UserGrowthStatsDTO(
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
