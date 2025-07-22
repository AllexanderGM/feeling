package com.feeling.domain.dto.event;

public record PaymentResponseDTO(
    String clientSecret,
    String paymentIntentId,
    String status,
    Long registrationId,
    String message
) {}