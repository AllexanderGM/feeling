package com.feeling.application.controllers.match;

import com.feeling.domain.dto.match.*;
import com.feeling.domain.services.match.FavoriteService;
import com.feeling.domain.services.match.MatchPlanService;
import com.feeling.domain.services.match.MatchService;
import com.feeling.domain.services.user.UserAuthorizationService;
import com.feeling.infrastructure.entities.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
@Slf4j
public class MatchController {

    private final MatchService matchService;
    private final MatchPlanService matchPlanService;
    private final FavoriteService favoriteService;
    private final UserAuthorizationService userAuthorizationService;

    @GetMapping("/plans")
    public ResponseEntity<List<MatchPlanResponseDTO>> getMatchPlans() {
        log.debug("Getting all active match plans");
        List<MatchPlanResponseDTO> plans = matchPlanService.getAllActivePlans();
        return ResponseEntity.ok(plans);
    }

    @PostMapping("/plans/purchase")
    public ResponseEntity<UserMatchPlanResponseDTO> purchaseMatchPlan(
            @Valid @RequestBody PurchaseMatchPlanRequestDTO request,
            Authentication authentication) {
        
        User user = userAuthorizationService.getCurrentUser(authentication);
        log.info("User {} purchasing match plan", user.getId());
        
        UserMatchPlanResponseDTO result = matchPlanService.purchaseMatchPlan(user, request);
        return ResponseEntity.ok(result);
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

    @PostMapping("/send")
    public ResponseEntity<MatchResponseDTO> sendMatch(
            @Valid @RequestBody MatchRequestDTO request,
            Authentication authentication) {
        
        User user = userAuthorizationService.getCurrentUser(authentication);
        log.info("User {} sending match", user.getId());
        
        MatchResponseDTO result = matchService.sendMatch(user, request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{matchId}/accept")
    public ResponseEntity<MatchResponseDTO> acceptMatch(
            @PathVariable Long matchId,
            Authentication authentication) {
        
        User user = userAuthorizationService.getCurrentUser(authentication);
        log.info("User {} accepting match {}", user.getId(), matchId);
        
        MatchResponseDTO result = matchService.acceptMatch(user, matchId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{matchId}/reject")
    public ResponseEntity<MatchResponseDTO> rejectMatch(
            @PathVariable Long matchId,
            Authentication authentication) {
        
        User user = userAuthorizationService.getCurrentUser(authentication);
        log.info("User {} rejecting match {}", user.getId(), matchId);
        
        MatchResponseDTO result = matchService.rejectMatch(user, matchId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{matchId}")
    public ResponseEntity<MatchResponseDTO> viewMatch(
            @PathVariable Long matchId,
            Authentication authentication) {
        
        User user = userAuthorizationService.getCurrentUser(authentication);
        MatchResponseDTO result = matchService.viewMatch(user, matchId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{matchId}/contact")
    public ResponseEntity<MatchContactDTO> getMatchContact(
            @PathVariable Long matchId,
            Authentication authentication) {
        
        User user = userAuthorizationService.getCurrentUser(authentication);
        log.debug("User {} getting contact for match {}", user.getId(), matchId);
        
        MatchContactDTO contact = matchService.getMatchContact(user, matchId);
        return ResponseEntity.ok(contact);
    }

    @GetMapping("/sent")
    public ResponseEntity<Page<MatchResponseDTO>> getSentMatches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        User user = userAuthorizationService.getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(page, size);
        
        Page<MatchResponseDTO> matches = matchService.getSentMatches(user, pageable);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/received")
    public ResponseEntity<Page<MatchResponseDTO>> getReceivedMatches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        User user = userAuthorizationService.getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(page, size);
        
        Page<MatchResponseDTO> matches = matchService.getReceivedMatches(user, pageable);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/received/pending")
    public ResponseEntity<Page<MatchResponseDTO>> getPendingReceivedMatches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        User user = userAuthorizationService.getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(page, size);
        
        Page<MatchResponseDTO> matches = matchService.getPendingReceivedMatches(user, pageable);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/accepted")
    public ResponseEntity<Page<MatchResponseDTO>> getAcceptedMatches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        User user = userAuthorizationService.getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(page, size);
        
        Page<MatchResponseDTO> matches = matchService.getAcceptedMatches(user, pageable);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getMatchStats(Authentication authentication) {
        User user = userAuthorizationService.getCurrentUser(authentication);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("pendingSent", matchService.countPendingSentMatches(user));
        stats.put("pendingReceived", matchService.countPendingReceivedMatches(user));
        stats.put("accepted", matchService.countAcceptedMatches(user));
        stats.put("favorites", favoriteService.countUserFavorites(user));
        stats.put("remainingAttempts", matchPlanService.getTotalRemainingAttempts(user));
        
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/favorites")
    public ResponseEntity<FavoriteResponseDTO> addFavorite(
            @Valid @RequestBody FavoriteRequestDTO request,
            Authentication authentication) {
        
        User user = userAuthorizationService.getCurrentUser(authentication);
        log.info("User {} adding favorite", user.getId());
        
        FavoriteResponseDTO result = favoriteService.addFavorite(user, request);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/favorites/{favoriteUserId}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable Long favoriteUserId,
            Authentication authentication) {
        
        User user = userAuthorizationService.getCurrentUser(authentication);
        log.info("User {} removing favorite {}", user.getId(), favoriteUserId);
        
        favoriteService.removeFavorite(user, favoriteUserId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/favorites")
    public ResponseEntity<Page<FavoriteResponseDTO>> getFavorites(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        User user = userAuthorizationService.getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(page, size);
        
        Page<FavoriteResponseDTO> favorites = favoriteService.getUserFavorites(user, pageable);
        return ResponseEntity.ok(favorites);
    }

    @GetMapping("/favorites/{userId}/check")
    public ResponseEntity<Map<String, Boolean>> checkIfFavorite(
            @PathVariable Long userId,
            Authentication authentication) {
        
        User user = userAuthorizationService.getCurrentUser(authentication);
        boolean isFavorite = favoriteService.isFavorite(user, userId);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("isFavorite", isFavorite);
        
        return ResponseEntity.ok(response);
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
}