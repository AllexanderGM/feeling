package com.feeling.domain.dto.event;

import com.feeling.infrastructure.entities.tour.HotelTour;

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
