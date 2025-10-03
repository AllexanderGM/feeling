package com.feeling.packages.match.domain.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteRequestDTO {
    
    @NotNull(message = "Favorite user ID is required")
    private Long favoriteUserId;
}