package com.feeling.packages.match.domain.dto;

import com.feeling.packages.match.infrastructure.entities.Match;
import com.feeling.packages.user.domain.dto.UserResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponseDTO {
    private Long id;
    private UserResponseDTO initiatorUser;
    private UserResponseDTO targetUser;
    private Match.MatchStatus status;
    private LocalDateTime respondedAt;
    private LocalDateTime viewedAt;
    private Boolean contactUnlocked;
    private LocalDateTime createdAt;
}