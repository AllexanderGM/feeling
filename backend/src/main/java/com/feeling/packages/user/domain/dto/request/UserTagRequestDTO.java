package com.feeling.packages.user.domain.dto.request;

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
    /**
     * Constructor for single tag creation
     */
    public UserTagRequestDTO(String name) {
        this(name, null);
    }

    /**
     * Constructor for multiple tag update
     */
    public UserTagRequestDTO(List<String> tags) {
        this(null, tags);
    }

    /**
     * Check if this is a single tag request
     */
    public boolean isSingleTag() {
        return name != null && tags == null;
    }

    /**
     * Check if this is a multiple tags request
     */
    public boolean isMultipleTags() {
        return tags != null && name == null;
    }
}
