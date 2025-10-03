package com.feeling.packages.event.domain.dto;

public record PaymentResponseDTO(
    String clientSecret,
    String paymentIntentId,
    String status,
    Long registrationId,
    String message
) {}