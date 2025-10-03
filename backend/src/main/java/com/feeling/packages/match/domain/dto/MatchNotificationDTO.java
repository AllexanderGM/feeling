package com.feeling.packages.match.domain.dto;

import com.feeling.packages.user.domain.dto.UserResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchNotificationDTO {
    private Long matchId;
    private String type; // "NEW_MATCH", "MATCH_ACCEPTED", "MATCH_REJECTED"
    private String title;
    private String message;
    private UserResponseDTO fromUser;
    private LocalDateTime createdAt;
    private Boolean isRead;
}