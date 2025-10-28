package com.feeling.packages.match.domain.dto;

public record MatchPlanPaymentIntentResponseDTO(
    String paymentReference,
    String signature,
    Long amountInCents,
    String currency,
    String publicKey,
    String redirectUrl,
    MatchPlanResponseDTO matchPlan
) {
}

