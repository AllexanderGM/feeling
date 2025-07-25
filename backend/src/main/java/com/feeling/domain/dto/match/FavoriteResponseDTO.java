package com.feeling.domain.dto.match;

import com.feeling.domain.dto.user.UserPublicResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteResponseDTO {
    private Long id;
    private UserPublicResponseDTO favoriteUser;
    private LocalDateTime createdAt;
}