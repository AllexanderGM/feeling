package com.feeling.packages.event.domain.dto;

import com.feeling.packages.event.infrastructure.entities.EventCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventUpdateRequestDTO(
        @Size(max = 200, message = "El título no puede exceder 200 caracteres")
        String title,

        String description,

        @Size(max = 300, message = "La ubicación no puede exceder 300 caracteres")
        String location,

        @Future(message = "La fecha del evento debe ser en el futuro")
        LocalDateTime eventDate,

        @DecimalMin(value = "0.0", message = "El precio debe ser positivo")
        BigDecimal price,

        @Min(value = 1, message = "La capacidad debe ser al menos 1")
        Integer maxCapacity,

        EventCategory category,

        String mainImage,

        Boolean isActive
) {
}