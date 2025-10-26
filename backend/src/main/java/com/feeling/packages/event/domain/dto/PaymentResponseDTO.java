package com.feeling.packages.event.domain.dto;

import java.util.Collections;
import java.util.Map;

public record PaymentResponseDTO(
    String paymentReference,
    Long registrationId,
    String status,
    String message,
    Map<String, String> data
) {
    public PaymentResponseDTO {
        data = data == null ? Map.of() : Collections.unmodifiableMap(data);
    }
}
