package com.tours.domain.dto.user;

import java.time.LocalDate;

public record UserModifyDTO(
        String image,
        String name,
        String lastName,
        String document,
        String phone,
        LocalDate dateOfBirth,
        String email,
        String password,
        String address,
        String city,
        String role
) {
    public CharSequence birthdate() {
        return dateOfBirth.toString();
    }
}
