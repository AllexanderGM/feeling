package com.feeling.packages.auth.domain.dto;

import java.util.List;

public record EmailAvailabilityDTO(
        String email,
        boolean available,
        String existingAuthProvider,
        String message,
        List<String> availableRegistrationMethods,
        String loginInstruction
) {
}
