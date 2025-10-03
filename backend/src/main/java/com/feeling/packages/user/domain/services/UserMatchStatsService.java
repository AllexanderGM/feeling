package com.feeling.packages.user.domain.services;

import com.feeling.packages.user.domain.dto.UserMatchesDTO;
import com.feeling.packages.match.domain.services.MatchService;
import com.feeling.packages.match.domain.services.MatchPlanService;
import com.feeling.packages.match.domain.services.FavoriteService;
import com.feeling.packages.user.infrastructure.entities.User;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

/**
 * Servicio dedicado para calcular métricas de matches de usuario
 * Separado para evitar dependencias circulares
 */
@Service
public class UserMatchStatsService {
    
    private final MatchService matchService;
    private final MatchPlanService matchPlanService;
    private final FavoriteService favoriteService;
    
    public UserMatchStatsService(@Lazy MatchService matchService, 
                                @Lazy MatchPlanService matchPlanService, 
                                @Lazy FavoriteService favoriteService) {
        this.matchService = matchService;
        this.matchPlanService = matchPlanService;
        this.favoriteService = favoriteService;
    }
    
    /**
     * Calcula las métricas completas de matches para un usuario
     */
    public UserMatchesDTO calculateMatchStats(User user) {
        return new UserMatchesDTO(
                matchPlanService.getTotalRemainingAttempts(user),
                0, // todayMatches - TODO: implementar lógica para obtener matches de hoy
                user.getMatchesCount().intValue(), // Total de matches del usuario
                10, // maxDailyAttempts - TODO: obtener de configuración
                matchService.countPendingSentMatches(user),
                matchService.countPendingReceivedMatches(user),
                matchService.countAcceptedMatches(user),
                favoriteService.countUserFavorites(user)
        );
    }
}