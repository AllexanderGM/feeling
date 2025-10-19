package com.feeling.packages.match.domain.dto;

import com.feeling.packages.user.domain.dto.user.UserResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteResponseDTO {
    private Long id;
    private UserResponseDTO favoriteUser;
    private LocalDateTime createdAt;
}
