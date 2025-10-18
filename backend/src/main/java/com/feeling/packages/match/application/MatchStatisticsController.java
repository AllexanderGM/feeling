package com.feeling.packages.match.application;

import com.feeling.packages.match.domain.services.FavoriteService;
import com.feeling.packages.match.domain.services.MatchPlanService;
import com.feeling.packages.match.domain.services.MatchService;
import com.feeling.packages.user.domain.services.UserAuthorizationService;
import com.feeling.packages.user.infrastructure.entities.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/matches")
@RequiredArgsConstructor
@Slf4j
public class MatchStatisticsController {

    private final MatchService matchService;
    private final MatchPlanService matchPlanService;
    private final FavoriteService favoriteService;
    private final UserAuthorizationService userAuthorizationService;

    // ========================================
    // ESTADÍSTICAS
    // ========================================

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getMatchStats(
        @RequestParam(required = false) String from,
        @RequestParam(required = false) String to,
        Authentication authentication) {

        User user = userAuthorizationService.getCurrentUser(authentication);
        LocalDateTime fromDateTime = normalizeStartDate(from);
        LocalDateTime toDateTime = normalizeEndDate(to);

        Map<String, Long> counters = matchService.getUserMatchCounters(user, fromDateTime, toDateTime);

        Map<String, Object> stats = new HashMap<>(counters);
        stats.put("favorites", favoriteService.countUserFavorites(user));
        stats.put("remainingAttempts", matchPlanService.getTotalRemainingAttempts(user));

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/notifications")
    public ResponseEntity<Map<String, Object>> getMatchNotifications(Authentication authentication) {
        User user = userAuthorizationService.getCurrentUser(authentication);

        Long pendingMatches = matchService.countPendingReceivedMatches(user);
        Long acceptedMatches = matchService.countAcceptedMatches(user);

        Map<String, Object> notifications = new HashMap<>();
        notifications.put("pendingMatches", pendingMatches);
        notifications.put("acceptedMatches", acceptedMatches);
        notifications.put("hasNotifications", pendingMatches > 0);

        return ResponseEntity.ok(notifications);
    }

    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================

    private LocalDateTime normalizeStartDate(String date) {
        if (date == null || date.isBlank()) {
            return null;
        }
        try {
            LocalDate localDate = LocalDate.parse(date);
            return localDate.atStartOfDay();
        } catch (DateTimeParseException exception) {
            throw new RuntimeException("Invalid start date. Expected format yyyy-MM-dd: " + date);
        }
    }

    private LocalDateTime normalizeEndDate(String date) {
        if (date == null || date.isBlank()) {
            return null;
        }
        try {
            LocalDate localDate = LocalDate.parse(date);
            return localDate.plusDays(1).atStartOfDay().minusNanos(1);
        } catch (DateTimeParseException exception) {
            throw new RuntimeException("Invalid end date. Expected format yyyy-MM-dd: " + date);
        }
    }
}
