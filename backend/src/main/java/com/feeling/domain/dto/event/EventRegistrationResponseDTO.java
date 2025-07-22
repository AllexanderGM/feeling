package com.feeling.domain.dto.event;

import com.feeling.infrastructure.entities.event.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventRegistrationResponseDTO(
    Long id,
    Long userId,
    String userName,
    Long eventId,
    String eventTitle,
    LocalDateTime eventDate,
    LocalDateTime registrationDate,
    PaymentStatus paymentStatus,
    String paymentStatusDisplayName,
    BigDecimal amountPaid,
    String stripePaymentIntentId,
    LocalDateTime paymentDate,
    LocalDateTime cancellationDate,
    Boolean isConfirmed,
    Boolean isPaid,
    Boolean isPending,
    Boolean isCancelled
) {}