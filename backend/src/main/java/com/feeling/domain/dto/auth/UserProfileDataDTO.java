package com.feeling.domain.dto.auth;

import java.time.LocalDate;
import java.util.List;

public record UserProfileDataDTO(
        String name,
        String lastName,
        String email,
        LocalDate dateOfBirth,
        Integer age,
        String document,
        String phone,
        String phoneCode,
        String country,
        String city,
        String department,
        String locality,
        String description,
        List<String> images,
        String mainImage,
        String categoryInterest,
        String gender,
        List<String> tags,
        // Campos de preferencias que el frontend espera
        Integer agePreferenceMin,
        Integer agePreferenceMax,
        Integer locationPreferenceRadius
) {
}