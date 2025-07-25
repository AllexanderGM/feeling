package com.feeling.domain.dto.match;

import com.feeling.domain.dto.user.UserPublicResponseDTO;
import com.feeling.infrastructure.entities.match.Match;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponseDTO {
    private Long id;
    private UserPublicResponseDTO initiatorUser;
    private UserPublicResponseDTO targetUser;
    private Match.MatchStatus status;
    private LocalDateTime respondedAt;
    private LocalDateTime viewedAt;
    private Boolean contactUnlocked;
    private LocalDateTime createdAt;
}