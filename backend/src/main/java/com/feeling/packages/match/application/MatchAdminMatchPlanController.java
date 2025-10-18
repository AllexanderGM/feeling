package com.feeling.packages.match.application;

import com.feeling.packages.match.domain.dto.MatchPlanRequestDTO;
import com.feeling.packages.match.domain.dto.MatchPlanResponseDTO;
import com.feeling.packages.match.domain.services.MatchPlanService;
import com.feeling.packages.user.domain.services.UserAuthorizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/match-plans")
@RequiredArgsConstructor
@Slf4j
public class MatchAdminMatchPlanController {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    private final MatchPlanService matchPlanService;
    private final UserAuthorizationService userAuthorizationService;

    // ========================================
    // ADMIN - LECTURAS
    // ========================================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MatchPlanResponseDTO>> getMatchPlansForAdmin(
        Authentication authentication) {

        userAuthorizationService.getCurrentUser(authentication);

        List<MatchPlanResponseDTO> plans = matchPlanService.getAllPlansForAdmin();
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getMatchPlanStats(
        @RequestParam(required = false) String from,
        @RequestParam(required = false) String to,
        Authentication authentication) {

        userAuthorizationService.getCurrentUser(authentication);

        LocalDateTime fromDate = parseDateTime(from);
        LocalDateTime toDate = parseDateTime(to);

        Map<String, Object> stats = matchPlanService.getMatchPlanStatistics(fromDate, toDate);
        return ResponseEntity.ok(stats);
    }

    // ========================================
    // ADMIN - CREACIÓN / ACTUALIZACIÓN
    // ========================================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchPlanResponseDTO> createMatchPlan(
        @Valid @RequestBody MatchPlanRequestDTO request,
        Authentication authentication) {

        userAuthorizationService.getCurrentUser(authentication);

        MatchPlanResponseDTO response = matchPlanService.createMatchPlan(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{planId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchPlanResponseDTO> updateMatchPlan(
        @PathVariable Long planId,
        @Valid @RequestBody MatchPlanRequestDTO request,
        Authentication authentication) {

        userAuthorizationService.getCurrentUser(authentication);

        MatchPlanResponseDTO response = matchPlanService.updateMatchPlan(planId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{planId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchPlanResponseDTO> updateMatchPlanStatus(
        @PathVariable Long planId,
        @RequestBody Map<String, Boolean> request,
        Authentication authentication) {

        userAuthorizationService.getCurrentUser(authentication);

        Boolean isActive = request.get("isActive");
        if (isActive == null) {
            throw new RuntimeException("Field isActive is required");
        }

        MatchPlanResponseDTO response = matchPlanService.updateMatchPlanStatus(planId, isActive);
        return ResponseEntity.ok(response);
    }

    // ========================================
    // ADMIN - ELIMINACIÓN
    // ========================================

    @DeleteMapping("/{planId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMatchPlan(
        @PathVariable Long planId,
        Authentication authentication) {

        userAuthorizationService.getCurrentUser(authentication);

        matchPlanService.deleteMatchPlan(planId);
        return ResponseEntity.noContent().build();
    }

    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(value, DATE_TIME_FORMATTER);
        } catch (DateTimeParseException exception) {
            throw new RuntimeException("Invalid date format. Expected ISO-8601 date time: " + value);
        }
    }
}
