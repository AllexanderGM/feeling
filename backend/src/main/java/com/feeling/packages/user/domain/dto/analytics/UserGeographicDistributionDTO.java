package com.feeling.packages.user.domain.dto.analytics;

import java.util.Map;

/**
 * DTO para la distribución geográfica de usuarios en la plataforma.
 * <p>
 * Proporciona mapeos de usuarios por país y ciudad, junto con rankings
 * de las ubicaciones más populares.
 * <p>
 * Usado en dashboards administrativos para analizar la distribución
 * geográfica de la base de usuarios y tomar decisiones de expansión.
 *
 * @param usersByCountry Mapa de país → cantidad de usuarios
 * @param usersByCity    Mapa de ciudad → cantidad de usuarios
 * @param topLocations   Rankings de ubicaciones más populares
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public record UserGeographicDistributionDTO(
    Map<String, Long> usersByCountry,
    Map<String, Long> usersByCity,
    TopLocationsDTO topLocations
) {
    /**
     * DTO anidado para rankings de ubicaciones más populares.
     * <p>
     * Contiene el top de países y ciudades por cantidad de usuarios,
     * limitados típicamente a los 10 primeros de cada categoría.
     *
     * @param topCountries Top países ordenados por cantidad de usuarios (descendente)
     * @param topCities    Top ciudades ordenadas por cantidad de usuarios (descendente)
     */
    public record TopLocationsDTO(
        Map<String, Long> topCountries,
        Map<String, Long> topCities
    ) {
    }
}
