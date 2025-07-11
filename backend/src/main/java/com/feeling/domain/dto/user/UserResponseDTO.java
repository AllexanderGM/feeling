package com.feeling.domain.dto.user;

import com.feeling.infrastructure.entities.user.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record UserResponseDTO(
        Long id,
        String name,
        String lastName,
        String email,
        String role,
        boolean verified,
        boolean profileComplete,
        LocalDate dateOfBirth,
        Integer age,
        String document,
        String phone,
        String city,
        String department,
        String locality,
        String country,
        String description,
        List<String> images,
        String mainImage,
        String externalAvatarUrl,
        String categoryInterest,
        LocalDateTime createdAt,
        LocalDateTime lastActive,
        Integer availableAttempts,
        Long profileViews,
        Long likesReceived,
        Long matchesCount,
        List<String> tags
) {
    public UserResponseDTO(User user) {
        this(
                user.getId(),
                user.getName(),
                user.getLastName(),
                user.getEmail(),
                user.getUserRole().getUserRoleList().name(),
                user.isVerified(),
                user.isProfileComplete(),
                user.getDateOfBirth(),
                user.getAge(),
                user.getDocument(),
                user.getPhone(),
                user.getCity(),
                user.getDepartment(),
                user.getLocality(),
                user.getCountry(),
                user.getDescription(),
                user.getImages(),
                user.getMainImage(),
                user.getExternalAvatarUrl(),
                user.getUserCategoryInterest() != null ?
                        user.getUserCategoryInterest().getCategoryInterestEnum().name() : null,
                user.getCreatedAt(),
                user.getLastActive(),
                user.getAvailableAttempts(),
                user.getProfileViews(),
                user.getLikesReceived(),
                user.getMatchesCount(),
                user.getTagNames()
        );
    }
}
