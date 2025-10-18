package com.feeling.packages.user.domain.dto.interest;

import java.util.List;
import java.util.Map;

/**
 * DTO para estadísticas de categorías de interés de usuario.
 * <p>
 * Proporciona métricas sobre la distribución y uso de categorías de interés
 * (ESSENCE, HARMONY, CONNECTION, etc.) en la plataforma.
 * <p>
 * Usado en analytics del panel administrativo para analizar patrones de
 * búsqueda y matching entre usuarios.
 *
 * @param totalCategories              Total de categorías de interés registradas
 * @param activeCategories             Cantidad de categorías activas
 * @param inactiveCategories           Cantidad de categorías inactivas
 * @param distributionByTargetAudience Distribución de categorías por audiencia objetivo
 * @param activeByTargetAudience       Distribución de categorías activas por audiencia objetivo
 * @param topCategories                Top 10 categorías más populares (ordenadas por displayOrder)
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public record UserInterestStatisticsResponseDTO(
    Integer totalCategories,
    Integer activeCategories,
    Integer inactiveCategories,
    Map<String, Long> distributionByTargetAudience,
    Map<String, Long> activeByTargetAudience,
    List<String> topCategories
) {
}
