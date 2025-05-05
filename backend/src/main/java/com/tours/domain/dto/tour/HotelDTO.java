package com.tours.domain.dto.tour;

import com.tours.infrastructure.entities.tour.HotelTour;

public record HotelDTO(
        String name,
        Integer stars
) {
    public HotelDTO(HotelTour hotelTour) {
        this(
                hotelTour.getName(),
                hotelTour.getStars()
        );
    }
}
