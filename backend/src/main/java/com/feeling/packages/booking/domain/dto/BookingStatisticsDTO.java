package com.feeling.packages.booking.domain.dto;

import java.time.LocalDateTime;

public record BookingStatisticsDTO(
    long totalBookings,
    long upcomingBookings,
    long cancelledBookings,
    long completedBookings,
    LocalDateTime referenceDate
) {
}
