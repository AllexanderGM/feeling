package com.feeling.packages.match.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record ConfirmMatchPlanPurchaseRequestDTO(
    @NotBlank(message = "Transaction identifier is required")
    String transactionId,

    @NotBlank(message = "Payment reference is required")
    String paymentReference
) {
}

