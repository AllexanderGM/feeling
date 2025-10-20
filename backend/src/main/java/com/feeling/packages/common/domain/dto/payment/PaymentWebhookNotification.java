package com.feeling.packages.common.domain.dto.payment;

import java.util.Collections;
import java.util.Map;
import java.util.Objects;

/**
 * Representa un evento relevante recibido desde el gateway de pagos.
 */
public record PaymentWebhookNotification(
    String paymentIntentId,
    String status,
    Map<String, String> metadata
) {

    public PaymentWebhookNotification {
        Objects.requireNonNull(paymentIntentId, "El identificador del intento de pago es obligatorio");
        Objects.requireNonNull(status, "El estado del pago es obligatorio");
        metadata = metadata == null ? Map.of() : Collections.unmodifiableMap(metadata);
    }
}
