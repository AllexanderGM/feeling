package com.feeling.packages.auth.domain.dto;

import java.util.List;

public record AuthMethodInfoDTO(
        String email,
        String currentAuthProvider,
        boolean isRegistered,
        String message,
        List<String> availableMethods
) {
}
