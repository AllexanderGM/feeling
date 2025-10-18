package com.feeling.packages.match.domain.dto;

import com.feeling.packages.match.domain.enums.MatchParticipantRole;
import com.feeling.packages.match.infrastructure.entities.Match;
import com.feeling.packages.user.domain.dto.profile.response.UserResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchHistoryItemDTO {
    private Long id;
    private MatchParticipantRole role;
    private Match.MatchStatus status;
    private UserResponseDTO otherUser;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
    private LocalDateTime viewedAt;
    private Boolean contactUnlocked;
}
