package com.feeling.domain.dto.event;

import java.math.BigDecimal;
import java.util.Map;

public record EventStatsDTO(
    Long totalEvents,
    Long activeEvents,
    Long totalRegistrations,
    Long completedRegistrations,
    BigDecimal totalRevenue,
    Map<String, Long> eventsByCategory,
    Map<String, Long> registrationsByStatus,
    Double averageAttendeesPerEvent,
    Double eventCapacityUtilization
) {}