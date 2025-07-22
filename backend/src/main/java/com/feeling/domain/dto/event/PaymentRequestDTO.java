package com.feeling.domain.dto.event;

import jakarta.validation.constraints.NotNull;

public record PaymentRequestDTO(
    @NotNull(message = "El ID del evento es obligatorio")
    Long eventId,
    
    @NotNull(message = "El payment method ID de Stripe es obligatorio")
    String paymentMethodId
) {}