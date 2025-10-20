package com.feeling.packages.common.domain.dto.payment;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Map;
import java.util.Objects;

/**
 * Comando genérico para solicitar la creación de un intento de pago.
 */
public record PaymentIntentCommand(
    BigDecimal amount,
    String currency,
    String description,
    Map<String, String> metadata,
    String paymentMethodId
) {

    public PaymentIntentCommand {
        Objects.requireNonNull(amount, "El monto es obligatorio");
        Objects.requireNonNull(currency, "La moneda es obligatoria");
        Objects.requireNonNull(description, "La descripción es obligatoria");
        Objects.requireNonNull(paymentMethodId, "El identificador del método de pago es obligatorio");
        metadata = metadata == null ? Map.of() : Collections.unmodifiableMap(metadata);
    }
}
