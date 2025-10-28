package com.feeling.packages.match.domain.dto;

import com.feeling.packages.match.domain.enums.MatchPlanPurchaseStatus;

public record MatchPlanPurchaseResponseDTO(
    MatchPlanPurchaseStatus status,
    String paymentReference,
    String transactionId,
    String gatewayStatus,
    String paymentMethod,
    String environment,
    MatchPlanResponseDTO matchPlan,
    UserMatchPlanResponseDTO userMatchPlan
) {
}
