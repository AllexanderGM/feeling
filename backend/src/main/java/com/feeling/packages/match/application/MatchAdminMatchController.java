package com.feeling.packages.match.application;

import com.feeling.exception.BadRequestException;
import com.feeling.packages.match.domain.dto.MatchAdminMatchFilterDTO;
import com.feeling.packages.match.domain.dto.MatchResponseDTO;
import com.feeling.packages.match.domain.dto.MatchSummaryDTO;
import com.feeling.packages.match.domain.dto.TopUserMatchDTO;
import com.feeling.packages.match.domain.services.MatchAdminService;
import com.feeling.packages.match.infrastructure.entities.Match;
import com.feeling.packages.user.domain.services.UserAuthorizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

/**
 * Endpoints administrativos para monitorear y auditar matches.
 */
@RestController
@RequestMapping("/admin/matches")
@RequiredArgsConstructor
@Slf4j
public class MatchAdminMatchController {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    private final MatchAdminService matchAdminService;
    private final UserAuthorizationService userAuthorizationService;

    // ========================================
    // ESTADÍSTICAS
    // ========================================

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchSummaryDTO> getMatchSummary(
        @RequestParam(required = false) String from,
        @RequestParam(required = false) String to,
        Authentication authentication) {

        userAuthorizationService.getCurrentUser(authentication);

        LocalDateTime fromDate = parseDateTime(from);
        LocalDateTime toDate = parseDateTime(to);

        MatchSummaryDTO summary = matchAdminService.getSummary(fromDate, toDate);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/top-initiators")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TopUserMatchDTO>> getTopMatchInitiators(
        @RequestParam(defaultValue = "5") int limit,
        @RequestParam(required = false) String from,
        @RequestParam(required = false) String to,
        Authentication authentication) {

        userAuthorizationService.getCurrentUser(authentication);

        LocalDateTime fromDate = parseDateTime(from);
        LocalDateTime toDate = parseDateTime(to);

        List<TopUserMatchDTO> result = matchAdminService.getTopInitiators(limit, fromDate, toDate);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/top-receivers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TopUserMatchDTO>> getTopMatchReceivers(
        @RequestParam(defaultValue = "5") int limit,
        @RequestParam(required = false) String from,
        @RequestParam(required = false) String to,
        Authentication authentication) {

        userAuthorizationService.getCurrentUser(authentication);

        LocalDateTime fromDate = parseDateTime(from);
        LocalDateTime toDate = parseDateTime(to);

        List<TopUserMatchDTO> result = matchAdminService.getTopReceivers(limit, fromDate, toDate);
        return ResponseEntity.ok(result);
    }

    // ========================================
    // ADMIN - LECTURAS / CRUD
    // ========================================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<MatchResponseDTO>> getMatches(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Long initiatorUserId,
        @RequestParam(required = false) Long targetUserId,
        @RequestParam(required = false) String from,
        @RequestParam(required = false) String to,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        Authentication authentication) {

        userAuthorizationService.getCurrentUser(authentication);

        Pageable pageable = PageRequest.of(page, size);
        LocalDateTime fromDate = parseDateTime(from);
        LocalDateTime toDate = parseDateTime(to);

        MatchAdminMatchFilterDTO filter = new MatchAdminMatchFilterDTO(
            parseStatus(status),
            initiatorUserId,
            targetUserId,
            fromDate,
            toDate
        );

        Page<MatchResponseDTO> matches = matchAdminService.getMatches(filter, pageable);
        return ResponseEntity.ok(matches);
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
            throw new BadRequestException("Formato de fecha inválido. Se espera ISO-8601: " + value);
        }
    }

    private Match.MatchStatus parseStatus(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Match.MatchStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("Estado de match inválido: " + value);
        }
    }
}
