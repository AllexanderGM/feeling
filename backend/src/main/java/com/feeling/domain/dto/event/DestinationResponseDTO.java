package com.feeling.domain.dto.event;

import com.feeling.infrastructure.entities.tour.DestinationTour;

public record DestinationResponseDTO(
        String region,
        String country,
        String city,
        String image
) {
    public DestinationResponseDTO(DestinationTour destinationTour) {
        this(
                destinationTour.getRegion(),
                destinationTour.getCountry(),
                destinationTour.getCity(),
                destinationTour.getImage()
        );
    }
}
