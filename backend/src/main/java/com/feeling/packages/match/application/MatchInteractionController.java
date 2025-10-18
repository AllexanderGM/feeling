package com.feeling.packages.match.application;

import com.feeling.packages.match.domain.dto.MatchContactDTO;
import com.feeling.packages.match.domain.dto.MatchRequestDTO;
import com.feeling.packages.match.domain.dto.MatchResponseDTO;
import com.feeling.packages.match.domain.services.MatchService;
import com.feeling.packages.user.domain.services.UserAuthorizationService;
import com.feeling.packages.user.infrastructure.entities.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/matches")
@RequiredArgsConstructor
@Slf4j
public class MatchInteractionController {

    private final MatchService matchService;
    private final UserAuthorizationService userAuthorizationService;

    // ========================================
    // CLIENTE - CREACIÓN / ACCIONES
    // ========================================

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

    // ========================================
    // CLIENTE - LECTURAS DETALLE
    // ========================================

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
}
