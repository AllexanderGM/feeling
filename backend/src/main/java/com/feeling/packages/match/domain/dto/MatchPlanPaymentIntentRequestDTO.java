package com.feeling.packages.match.domain.dto;

import jakarta.validation.constraints.NotNull;

public record MatchPlanPaymentIntentRequestDTO(
    @NotNull(message = "Match plan ID is required")
    Long matchPlanId
) {
}

