package com.feeling.packages.match.application;

import com.feeling.packages.match.domain.dto.MatchHistoryItemDTO;
import com.feeling.packages.match.domain.dto.MatchResponseDTO;
import com.feeling.packages.match.domain.services.MatchService;
import com.feeling.packages.match.infrastructure.entities.Match;
import com.feeling.packages.user.domain.services.UserAuthorizationService;
import com.feeling.packages.user.infrastructure.entities.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

@RestController
@RequestMapping("/matches")
@RequiredArgsConstructor
@Slf4j
public class MatchQueryController {

    private final MatchService matchService;
    private final UserAuthorizationService userAuthorizationService;

    // ========================================
    // CLIENTE - LECTURAS
    // ========================================

    @GetMapping("/history")
    public ResponseEntity<Page<MatchHistoryItemDTO>> getMatchHistory(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String from,
        @RequestParam(required = false) String to,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        Authentication authentication) {

        User user = userAuthorizationService.getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(page, size);

        Match.MatchStatus matchStatus = parseStatus(status);
        LocalDateTime fromDateTime = normalizeStartDate(from);
        LocalDateTime toDateTime = normalizeEndDate(to);

        Page<MatchHistoryItemDTO> history = matchService.getMatchHistory(user, matchStatus, fromDateTime, toDateTime, pageable);
        return ResponseEntity.ok(history);
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

    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================

    private Match.MatchStatus parseStatus(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Match.MatchStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new RuntimeException("Invalid match status: " + value);
        }
    }

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
