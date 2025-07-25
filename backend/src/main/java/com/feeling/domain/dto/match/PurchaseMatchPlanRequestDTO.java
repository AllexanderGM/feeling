package com.feeling.domain.dto.match;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseMatchPlanRequestDTO {
    
    @NotNull(message = "Match plan ID is required")
    private Long matchPlanId;
}