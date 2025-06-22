package com.feeling.domain.dto.event.availability;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.feeling.infrastructure.entities.booking.Availability;

import java.time.LocalDateTime;

public record AvailabilityResponseDTO(
        Long id,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime availableDate, // Cambio aquí
        Integer availableSlots,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime departureTime,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime returnTime,
        Long tourId,
        Boolean isReserved
) {
    public AvailabilityResponseDTO(Availability availability, Boolean isReserved) {
        this(
                availability.getId(),
                availability.getAvailableDate(),
                availability.getAvailableSlots(),
                availability.getDepartureTime(),
                availability.getReturnTime(),
                availability.getTour().getId(),
                isReserved
        );
    }
}
