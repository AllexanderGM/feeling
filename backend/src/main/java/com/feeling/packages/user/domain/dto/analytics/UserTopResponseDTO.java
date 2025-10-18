package com.feeling.packages.user.domain.dto.analytics;

import java.util.List;

/**
 * DTO para rankings de usuarios top en diferentes categorías.
 * <p>
 * Proporciona listas de usuarios destacados organizadas por diferentes
 * métricas de rendimiento (popularidad, matches, visualizaciones).
 * <p>
 * Usado en dashboards administrativos para identificar usuarios más
 * activos, populares y exitosos en la plataforma.
 *
 * @param topByPopularity   Top usuarios ordenados por puntuación de popularidad
 * @param topByMatches      Top usuarios ordenados por cantidad de matches
 * @param topByProfileViews Top usuarios ordenados por visualizaciones de perfil
 * @param limit             Cantidad máxima de usuarios incluidos en cada ranking
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public record UserTopResponseDTO(
    List<TopUserDTO> topByPopularity,
    List<TopUserDTO> topByMatches,
    List<TopUserDTO> topByProfileViews,
    Integer limit
) {
    /**
     * DTO anidado para representar un usuario individual en el ranking.
     * <p>
     * Contiene información básica del usuario y el valor de la métrica
     * por la cual fue incluido en el ranking.
     *
     * @param userId          ID del usuario
     * @param name            Nombre completo del usuario
     * @param email           Email del usuario (para identificación administrativa)
     * @param metricValue     Valor de la métrica específica del ranking (matches, views, etc.)
     * @param popularityScore Puntuación general de popularidad del usuario
     */
    public record TopUserDTO(
        Long userId,
        String name,
        String email,
        Long metricValue,
        Double popularityScore
    ) {
    }
}
