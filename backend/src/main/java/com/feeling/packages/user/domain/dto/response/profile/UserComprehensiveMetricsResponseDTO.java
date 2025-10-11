package com.feeling.packages.user.domain.dto.response.profile;

import com.feeling.packages.user.domain.dto.analytics.UserEngagementStatsDTO;
import com.feeling.packages.user.domain.dto.analytics.UserGeographicDistributionDTO;
import com.feeling.packages.user.domain.dto.analytics.UserGrowthStatsDTO;
import com.feeling.packages.user.domain.dto.analytics.UserTabsCountDTO;

/**
 * DTO para métricas comprehensivas de usuarios del panel de administración.
 * <p>
 * Agrega múltiples dimensiones de analytics en un solo objeto para proporcionar
 * una vista completa del estado de la plataforma:
 * <ul>
 *   <li>Conteo de usuarios por estado/pestaña (active, pending, incomplete, etc.)</li>
 *   <li>Estadísticas de engagement y verificación (tasas de completitud, verificación)</li>
 *   <li>Estadísticas de crecimiento y retención (nuevos usuarios, usuarios activos)</li>
 *   <li>Distribución geográfica de usuarios (países, ciudades, top locations)</li>
 * </ul>
 * <p>
 * Usado en el dashboard principal de administración para proporcionar un
 * overview completo de todas las métricas importantes en una sola llamada API.
 *
 * @param userTabsCount          Contadores de usuarios por estado/pestaña del panel
 * @param engagementStats        Estadísticas de engagement (verificación, completitud)
 * @param growthStats            Estadísticas de crecimiento y retención temporal
 * @param geographicDistribution Distribución geográfica de usuarios
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public record UserComprehensiveMetricsResponseDTO(
    UserTabsCountDTO userTabsCount,
    UserEngagementStatsDTO engagementStats,
    UserGrowthStatsDTO growthStats,
    UserGeographicDistributionDTO geographicDistribution
) {
}
