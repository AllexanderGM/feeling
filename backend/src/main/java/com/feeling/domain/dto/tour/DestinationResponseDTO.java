package com.feeling.domain.dto.tour;

import com.feeling.infrastructure.entities.tour.DestinationTour;

public record DestinationResponseDTO(
        String region,
        String country,
        CityResponseDTO city,
        String image
) {
    public DestinationResponseDTO(DestinationTour destinationTour) {
        this (
                destinationTour.getRegion(),
                destinationTour.getCountry(),
                new CityResponseDTO(destinationTour.getCity()),
                destinationTour.getImage()
        );
    }
}
