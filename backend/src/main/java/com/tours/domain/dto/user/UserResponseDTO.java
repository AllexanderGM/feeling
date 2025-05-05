package com.tours.domain.dto.user;

import com.tours.infrastructure.entities.user.User;

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
