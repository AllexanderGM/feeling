package com.feeling.domain.dto.tour;

import com.feeling.infrastructure.entities.tour.StatusTour;
import com.feeling.infrastructure.entities.tour.StatusTourOptions;

public record StatusDTO(StatusTourOptions status) {
    public StatusDTO(StatusTour statusTour) {
        this(statusTour.getStatus());
    }
}
