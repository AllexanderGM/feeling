package com.feeling.domain.dto.event;

import com.feeling.infrastructure.entities.event.EventCategory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventResponseDTO(
    Long id,
    String title,
    String description,
    LocalDateTime eventDate,
    BigDecimal price,
    Integer maxCapacity,
    Integer currentAttendees,
    Integer availableSpots,
    EventCategory category,
    String categoryDisplayName,
    String mainImage,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Boolean isActive,
    Boolean isFull,
    Boolean hasAvailableSpots,
    String createdByName,
    Long createdById
) {}