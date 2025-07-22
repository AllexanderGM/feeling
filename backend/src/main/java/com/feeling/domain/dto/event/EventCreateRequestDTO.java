package com.feeling.domain.dto.event;

import com.feeling.infrastructure.entities.event.EventCategory;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventCreateRequestDTO(
    @NotBlank(message = "El título es obligatorio")
    @Size(max = 200, message = "El título no puede exceder 200 caracteres")
    String title,
    
    @NotBlank(message = "La descripción es obligatoria")
    String description,
    
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
    
    String mainImage
) {}