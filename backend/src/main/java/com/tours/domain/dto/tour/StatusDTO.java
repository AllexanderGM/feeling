package com.tours.domain.dto.tour;

import com.tours.infrastructure.entities.tour.StatusTour;
import com.tours.infrastructure.entities.tour.StatusTourOptions;

public record StatusDTO(StatusTourOptions status) {
    public StatusDTO(StatusTour statusTour) {
        this(statusTour.getStatus());
    }
}
