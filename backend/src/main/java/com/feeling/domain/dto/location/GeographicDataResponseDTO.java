// DTO para respuesta completa de datos geográficos
package com.feeling.domain.dto.location;

import java.util.List;

public record GeographicDataResponseDTO(
        List<CountryResponseDTO> countries,
        List<CityResponseDTO> cities,
        List<LocalityResponseDTO> localities
) {
}
