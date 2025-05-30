package com.feeling.domain.dto.auth;

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
