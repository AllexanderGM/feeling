package com.feeling.domain.dto.event;

import com.feeling.infrastructure.entities.event.EventCategory;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventUpdateRequestDTO(
    @Size(max = 200, message = "El título no puede exceder 200 caracteres")
    String title,
    
    String description,
    
    @Future(message = "La fecha del evento debe ser en el futuro")
    LocalDateTime eventDate,
    
    @DecimalMin(value = "0.0", message = "El precio debe ser positivo")
    BigDecimal price,
    
    @Min(value = 1, message = "La capacidad debe ser al menos 1")
    Integer maxCapacity,
    
    EventCategory category,
    
    String mainImage,
    
    Boolean isActive
) {}