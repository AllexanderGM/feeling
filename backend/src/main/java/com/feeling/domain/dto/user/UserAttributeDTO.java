package com.feeling.domain.dto.user;

import com.feeling.infrastructure.entities.user.UserAttribute;

public record UserAttributeDTO(
        Long id,
        String code,
        String name,
        String attributeType,
        String description,
        String detail,
        Integer displayOrder,
        boolean active
) {
    public UserAttributeDTO(UserAttribute attribute) {
        this(
                attribute.getId(),
                attribute.getCode(),
                attribute.getName(),
                attribute.getAttributeType(),
                attribute.getDescription(),
                attribute.getDetail(),
                attribute.getDisplayOrder(),
                attribute.isActive()
        );
    }
}
