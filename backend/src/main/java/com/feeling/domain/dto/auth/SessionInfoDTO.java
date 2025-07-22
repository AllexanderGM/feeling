package com.feeling.domain.dto.auth;

import java.time.LocalDateTime;

public record SessionInfoDTO(
    Long userId,
    String email,
    String name,
    String lastName,
    String role,
    boolean verified,
    boolean profileComplete,
    LocalDateTime lastActive
) {}