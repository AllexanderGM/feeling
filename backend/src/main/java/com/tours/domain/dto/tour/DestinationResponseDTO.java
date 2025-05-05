package com.tours.domain.dto.tour;

import com.tours.infrastructure.entities.tour.DestinationTour;

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
