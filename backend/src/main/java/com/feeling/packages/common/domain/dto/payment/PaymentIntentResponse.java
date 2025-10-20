package com.feeling.packages.common.domain.dto.payment;

import java.util.Collections;
import java.util.Map;

/**
 * Respuesta estándar para operaciones de intentos de pago.
 */
public record PaymentIntentResponse(
    String clientSecret,
    String paymentIntentId,
    String status,
    String message,
    Map<String, String> metadata
) {

    public PaymentIntentResponse {
        metadata = metadata == null ? Map.of() : Collections.unmodifiableMap(metadata);
    }
}
