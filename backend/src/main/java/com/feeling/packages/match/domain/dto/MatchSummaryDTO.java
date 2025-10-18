package com.feeling.packages.match.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchSummaryDTO {
    private long totalMatches;
    private long acceptedMatches;
    private long pendingMatches;
    private long rejectedMatches;
    private double conversionRate;
    private long totalAttemptsSold;
    private long totalAttemptsConsumed;
    private BigDecimal totalRevenue;
}
