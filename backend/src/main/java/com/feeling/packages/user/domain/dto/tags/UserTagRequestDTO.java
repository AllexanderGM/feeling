package com.feeling.packages.user.domain.dto.tags;

import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Unified DTO for tag operations - handles both single tag and multiple tags
 * Phase 8.4: Consolidation of tag DTOs
 */
public record UserTagRequestDTO(
    // Single tag (for creation)
    @Size(min = 2, max = 30, message = "El tag debe tener entre 2 y 30 caracteres")
    String name,

    // Multiple tags (for updates)
    @Size(max = 10, message = "No se pueden asignar más de 10 tags")
    List<String> tags
) {
}
