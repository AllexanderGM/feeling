package com.feeling.domain.dto.auth;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record AuthLoginResponseDTO(
        Long id,
        String name,
        String lastName,
        String email,
        String role,
        String accessToken,
        String refreshToken,
        Boolean verified,
        Boolean completeProfile,
        LocalDate dateOfBirth,
        Integer age,
        String document,
        String phone,
        String city,
        String department,
        String country,
        String description,
        List<String> images,
        String mainImage,
        String categoryInterest,
        LocalDateTime createdAt,
        LocalDateTime lastActive,
        Integer availableAttempts,
        Long profileViews,
        Long likesReceived,
        Long matchesCount,
        List<String> tags
) {
}