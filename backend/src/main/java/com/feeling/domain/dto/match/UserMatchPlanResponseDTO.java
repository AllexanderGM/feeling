package com.feeling.domain.dto.match;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserMatchPlanResponseDTO {
    private Long id;
    private MatchPlanResponseDTO matchPlan;
    private Integer remainingAttempts;
    private Boolean isActive;
    private LocalDateTime purchaseDate;
    private LocalDateTime expirationDate;
    private LocalDateTime createdAt;
}