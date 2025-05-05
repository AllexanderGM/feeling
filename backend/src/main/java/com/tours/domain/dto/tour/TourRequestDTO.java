package com.tours.domain.dto.tour;

import com.tours.domain.dto.tour.availability.AvailabilityRequestDTO;
import com.tours.infrastructure.entities.tour.StatusTourOptions;
import com.tours.infrastructure.entities.tour.TagTourOptions;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record TourRequestDTO(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
        String name,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
        String description,

        @NotNull(message = "El precio de adulto es obligatorio")
        @DecimalMin(value = "0.0", inclusive = false, message = "El precio de adulto debe ser mayor a 0")
        BigDecimal adultPrice,

        @NotNull(message = "El precio de niño es obligatorio")
        @DecimalMin(value = "0.0", inclusive = false, message = "El precio de niño debe ser mayor a 0")
        BigDecimal childPrice,

        @NotEmpty(message = "Debe haber al menos una imagen")
        List<@NotBlank(message = "La URL de la imagen no puede estar vacía") String> images,

        @NotNull(message = "El estado es obligatorio")
        StatusTourOptions status,

        @Valid
        @NotEmpty(message = "Debe haber al menos una etiqueta")
        List<TagTourOptions> tags,

        @NotEmpty(message = "Debe haber al menos un include")
        List<@Valid String> includes,

        @NotNull(message = "El destino es obligatorio")
        @Valid DestinationRequestDTO destination,

        @PositiveOrZero(message = "El ID del hotel debe ser un número positivo o cero")
        Long hotel,

        @NotNull(message = "Ingresa la disponibilidad")
        @Valid List<AvailabilityRequestDTO> availability
        ) {
}
