package com.feeling.packages.event.domain.dto;

import com.feeling.packages.event.infrastructure.entities.EventCategory;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record EventCreateRequestDTO(
        @NotBlank(message = "El título es obligatorio")
        @Size(max = 200, message = "El título no puede exceder 200 caracteres")
        String title,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(max = 2000, message = "La descripción no puede exceder 2000 caracteres")
        String description,

        @NotBlank(message = "La ubicación es obligatoria")
        @Size(max = 300, message = "La ubicación no puede exceder 300 caracteres")
        String location,

        @NotNull(message = "La fecha del evento es obligatoria")
        @Future(message = "La fecha del evento debe ser en el futuro")
        LocalDateTime eventDate,

        @NotNull(message = "El precio es obligatorio")
        @DecimalMin(value = "0.0", message = "El precio debe ser positivo")
        BigDecimal price,

        @NotNull(message = "La capacidad máxima es obligatoria")
        @Min(value = 1, message = "La capacidad debe ser al menos 1")
        Integer maxCapacity,

        @NotNull(message = "La categoría es obligatoria")
        EventCategory category,

        String mainImage,

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
