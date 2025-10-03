package com.feeling.packages.user.domain.dto;

import java.util.Map;

/**
 * DTO para la distribución geográfica de usuarios
 */
public record GeographicDistributionDTO(
        Map<String, Long> usersByCountry,
        Map<String, Long> usersByCity,
        TopLocationsDTO topLocations
) {
    public record TopLocationsDTO(
            Map<String, Long> topCountries,
            Map<String, Long> topCities
    ) {}
}
