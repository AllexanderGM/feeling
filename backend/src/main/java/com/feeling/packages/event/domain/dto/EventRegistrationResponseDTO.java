package com.feeling.packages.event.domain.dto;

import com.feeling.packages.event.infrastructure.entities.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventRegistrationResponseDTO(
        Long id,
        Long userId,
        String userName,
        String userEmail,
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
) {
}
