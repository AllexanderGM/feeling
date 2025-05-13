package com.feeling.domain.dto.user;

import com.feeling.infrastructure.entities.user.User;

public record UserResponseDTO(
        Long id,
        String image,
        String username,
        String email,
        String role
) {
    public UserResponseDTO(User user) {
        this(user.getId(), user.getImage(), user.getUsername(), user.getEmail(), user.getRole().getUserRol().name());
    }
}
