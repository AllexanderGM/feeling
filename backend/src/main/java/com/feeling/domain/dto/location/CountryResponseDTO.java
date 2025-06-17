// DTO para respuesta de países
package com.feeling.domain.dto.location;

import java.util.List;

public record CountryResponseDTO(
        String code,
        String name,
        String image,
        String phoneCode,
        String region,
        boolean priority,
        List<CityResponseDTO> cities
) {
}
