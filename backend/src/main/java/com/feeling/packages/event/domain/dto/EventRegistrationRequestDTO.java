package com.feeling.packages.event.domain.dto;

import jakarta.validation.constraints.NotNull;

public record EventRegistrationRequestDTO(
    @NotNull(message = "El ID del evento es obligatorio")
    Long eventId
) {}