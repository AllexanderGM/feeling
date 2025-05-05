package com.tours.domain.dto.tour;

import com.tours.infrastructure.entities.tour.IncludeTours;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public record IncludeDTO(
        String type,
        String icon,
        String details,
        String description
) {
    private static final Logger logger = LoggerFactory.getLogger(IncludeDTO.class);
    public IncludeDTO(IncludeTours includeTours) {
        this(includeTours != null ? includeTours.getType() : "Desconocido",
                includeTours != null ? includeTours.getIcon() : "No disponible",
                includeTours != null ? includeTours.getDetails() : "No disponible",
                includeTours != null ? includeTours.getDescription() : "No disponible"
        );
        if (includeTours == null) {
            logger.warn("Se intentó crear un IncludeDTO con un objeto IncludeTours nulo");
        }
    }
}
