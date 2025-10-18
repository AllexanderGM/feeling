package com.feeling.packages.match.domain.dto;

import com.feeling.packages.match.infrastructure.entities.Match;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchAdminMatchFilterDTO {
    private Match.MatchStatus status;
    private Long initiatorUserId;
    private Long targetUserId;
    private LocalDateTime from;
    private LocalDateTime to;
}
