package com.feeling.domain.dto.user;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UserTagUpdateRequestDTO(
        @NotNull(message = "La lista de tags no puede ser nula")
        @Size(max = 10, message = "No puedes tener más de 10 tags")
        List<String> tags
) {
}
