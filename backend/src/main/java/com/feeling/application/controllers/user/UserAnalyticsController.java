package com.feeling.application.controllers.user;

import com.feeling.domain.dto.user.UserMetricsDTO;
import com.feeling.domain.dto.user.UserTagStatisticsDTO;
import com.feeling.domain.services.user.UserService;
import com.feeling.domain.services.user.UserAttributeService;
import com.feeling.domain.services.user.UserCategoryInterestService;
import com.feeling.domain.services.user.UserTagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user-analytics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Analytics", description = "User analytics and metrics endpoints for administrators")
public class UserAnalyticsController {
    
    private final UserService userService;
    private final UserAttributeService userAttributeService;
    private final UserCategoryInterestService userCategoryInterestService;
    private final UserTagService userTagService;

    // ========================================
    // ANALYTICS ENDPOINTS (ADMIN ONLY)
    // ========================================

    @GetMapping("/overview")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get analytics overview", 
               description = "Get comprehensive analytics overview for user management")
    public ResponseEntity<Map<String, Object>> getAnalyticsOverview() {
        try {
            Map<String, Object> analytics = userService.getAnalyticsOverview();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error al obtener overview de analytics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user-metrics")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get comprehensive user metrics", 
               description = "Get user count by status, engagement stats, growth stats, and geographic distribution")
    public ResponseEntity<Map<String, Object>> getComprehensiveUserMetrics() {
        try {
            Map<String, Object> comprehensiveMetrics = Map.of(
                "userTabsCount", userService.getUserTabsCount(),
                "engagementStats", userService.getEngagementStats(),
                "growthStats", userService.getGrowthStats(null),
                "geographicDistribution", userService.getGeographicDistribution()
            );
            return ResponseEntity.ok(comprehensiveMetrics);
        } catch (Exception e) {
            log.error("Error al obtener métricas comprehensivas de usuarios", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/metrics/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get detailed user metrics", 
               description = "Get detailed metrics for a specific user")
    public ResponseEntity<UserMetricsDTO> getUserDetailedMetrics(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        try {
            UserMetricsDTO metrics = userService.getUserDetailedMetrics(userId);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            log.error("Error al obtener métricas detalladas del usuario: " + userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/top-users")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get top users rankings", 
               description = "Get rankings of most popular and active users")
    public ResponseEntity<Map<String, Object>> getTopUsers(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            Map<String, Object> topUsers = userService.getTopUsers(limit);
            return ResponseEntity.ok(topUsers);
        } catch (Exception e) {
            log.error("Error al obtener top users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/attribute-statistics")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get user attribute statistics", 
               description = "Get comprehensive statistics about user attributes usage")
    public ResponseEntity<Map<String, Object>> getAttributeStatistics() {
        try {
            Map<String, Object> attributeStats = userAttributeService.getAttributeStatistics();
            return ResponseEntity.ok(attributeStats);
        } catch (Exception e) {
            log.error("Error al obtener estadísticas de atributos", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/interests-statistics")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get user interests statistics", 
               description = "Get comprehensive statistics about user interests usage")
    public ResponseEntity<Map<String, Object>> getInterestsStatistics() {
        try {
            Map<String, Object> interestsStats = userCategoryInterestService.getInterestsStatistics();
            return ResponseEntity.ok(interestsStats);
        } catch (Exception e) {
            log.error("Error al obtener estadísticas de intereses", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/tags-statistics")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get user tags statistics", 
               description = "Get comprehensive statistics about user tags system")
    public ResponseEntity<UserTagStatisticsDTO> getTagsStatistics() {
        try {
            UserTagStatisticsDTO tagStats = userTagService.getTagStatistics();
            return ResponseEntity.ok(tagStats);
        } catch (Exception e) {
            log.error("Error al obtener estadísticas de tags", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}