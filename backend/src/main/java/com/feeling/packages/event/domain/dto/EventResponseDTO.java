package com.feeling.packages.event.domain.dto;

import com.feeling.packages.event.infrastructure.entities.EventCategory;
import com.feeling.packages.event.infrastructure.entities.EventStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record EventResponseDTO(
        Long id,
        String title,
        String description,
        String location,
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
) {
}