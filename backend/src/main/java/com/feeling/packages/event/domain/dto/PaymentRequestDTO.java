package com.feeling.packages.event.domain.dto;

import jakarta.validation.constraints.NotNull;

public record PaymentRequestDTO(
    @NotNull(message = "El ID del evento es obligatorio")
    Long eventId,
    
    @NotNull(message = "El identificador del método de pago es obligatorio")
    String paymentMethodId
) {}
