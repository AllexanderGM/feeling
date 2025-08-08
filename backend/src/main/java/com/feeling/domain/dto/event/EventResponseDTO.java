package com.feeling.domain.dto.event;

import com.feeling.infrastructure.entities.event.EventCategory;
import com.feeling.infrastructure.entities.event.EventStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
    EventStatus status,
    String statusDisplayName,
    String mainImage,
    List<String> images,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Boolean isActive,
    Boolean isFull,
    Boolean hasAvailableSpots,
    Boolean isPublished,
    Boolean canAcceptRegistrations,
    String createdByName,
    Long createdById
) {}