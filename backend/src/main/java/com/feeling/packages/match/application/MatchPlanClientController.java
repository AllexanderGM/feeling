package com.feeling.packages.match.application;

import com.feeling.packages.match.domain.dto.MatchPlanResponseDTO;
import com.feeling.packages.match.domain.dto.PurchaseMatchPlanRequestDTO;
import com.feeling.packages.match.domain.dto.UserMatchPlanResponseDTO;
import com.feeling.packages.match.domain.services.MatchPlanService;
import com.feeling.packages.user.domain.services.UserAuthorizationService;
import com.feeling.packages.user.infrastructure.entities.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/matches")
@RequiredArgsConstructor
@Slf4j
public class MatchPlanClientController {

    private final MatchPlanService matchPlanService;
    private final UserAuthorizationService userAuthorizationService;

    // ========================================
    // CLIENTE - LECTURAS
    // ========================================

    @GetMapping("/plans")
    public ResponseEntity<List<MatchPlanResponseDTO>> getMatchPlans() {
        log.debug("Getting all active match plans");
        List<MatchPlanResponseDTO> plans = matchPlanService.getAllActivePlans();
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/plans/my")
    public ResponseEntity<List<UserMatchPlanResponseDTO>> getMyMatchPlans(Authentication authentication) {
        User user = userAuthorizationService.getCurrentUser(authentication);
        log.debug("Getting match plans for user {}", user.getId());

        List<UserMatchPlanResponseDTO> plans = matchPlanService.getUserMatchPlans(user);
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/plans/my/active")
    public ResponseEntity<List<UserMatchPlanResponseDTO>> getMyActiveMatchPlans(Authentication authentication) {
        User user = userAuthorizationService.getCurrentUser(authentication);
        log.debug("Getting active match plans for user {}", user.getId());

        List<UserMatchPlanResponseDTO> plans = matchPlanService.getActiveUserMatchPlans(user);
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/attempts")
    public ResponseEntity<Map<String, Object>> getRemainingAttempts(Authentication authentication) {
        User user = userAuthorizationService.getCurrentUser(authentication);

        Integer remainingAttempts = matchPlanService.getTotalRemainingAttempts(user);
        boolean hasAttempts = matchPlanService.hasAvailableAttempts(user);

        Map<String, Object> response = new HashMap<>();
        response.put("remainingAttempts", remainingAttempts);
        response.put("hasAttempts", hasAttempts);

        return ResponseEntity.ok(response);
    }

    // ========================================
    // CLIENTE - CREACIÓN
    // ========================================

    @PostMapping("/plans/purchase")
    public ResponseEntity<UserMatchPlanResponseDTO> purchaseMatchPlan(
        @Valid @RequestBody PurchaseMatchPlanRequestDTO request,
        Authentication authentication) {

        User user = userAuthorizationService.getCurrentUser(authentication);
        log.info("User {} purchasing match plan", user.getId());

        UserMatchPlanResponseDTO result = matchPlanService.purchaseMatchPlan(user, request);
        return ResponseEntity.ok(result);
    }
}
