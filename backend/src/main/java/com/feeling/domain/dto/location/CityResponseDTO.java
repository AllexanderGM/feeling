// DTO para respuesta de ciudades
package com.feeling.domain.dto.location;

import java.util.List;

public record CityResponseDTO(
        String name,
        boolean priority,
        List<LocalityResponseDTO> localities
) {
}
