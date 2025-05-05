package com.tours.domain.dto.user;

import java.time.LocalDate;

public record UserRequestDTO(
        String image,
        String name,
        String lastName,
        String document,
        String phone,
        LocalDate dateOfBirth,
        String email,
        String password,
        String address,
        String city
) {
}
