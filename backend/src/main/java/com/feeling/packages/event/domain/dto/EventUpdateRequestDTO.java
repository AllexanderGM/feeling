package com.feeling.packages.event.domain.dto;

import com.feeling.packages.event.infrastructure.entities.EventCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record EventUpdateRequestDTO(
        @Size(max = 200, message = "El título no puede exceder 200 caracteres")
        String title,

        @Size(max = 2000, message = "La descripción no puede exceder 2000 caracteres")
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

        Boolean isActive,

        @Size(max = 5, message = "No se pueden registrar más de 5 imágenes para la galería")
        List<String> images,

        @Size(max = 160, message = "El título SEO no puede exceder 160 caracteres")
        String seoTitle,

        @Size(max = 320, message = "La descripción SEO no puede exceder 320 caracteres")
        String seoDescription,

        @Size(max = 500, message = "Las palabras clave SEO no pueden exceder 500 caracteres")
        String seoKeywords,

        @Size(max = 500, message = "La URL de la imagen SEO no puede exceder 500 caracteres")
        String seoImage
) {
}
