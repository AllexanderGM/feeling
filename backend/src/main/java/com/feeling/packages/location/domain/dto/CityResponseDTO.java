// DTO para respuesta de ciudades
package com.feeling.packages.location.domain.dto;

import java.util.List;

public record CityResponseDTO(
        String name,
        boolean priority,
        List<LocalityResponseDTO> localities
) {
}
