package com.feeling.packages.match.domain.dto;

import com.feeling.packages.user.domain.dto.user.UserResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopUserMatchDTO {
    private UserResponseDTO user;
    private long initiatedMatches;
    private long acceptedMatches;
    private double acceptanceRate;
}
