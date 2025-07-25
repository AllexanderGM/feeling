package com.feeling.domain.dto.match;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchPlanResponseDTO {
    private Long id;
    private String name;
    private String description;
    private Integer attempts;
    private BigDecimal price;
    private Boolean isActive;
    private Integer sortOrder;
}