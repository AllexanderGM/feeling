package com.feeling.packages.match.domain.services;

import com.feeling.packages.match.domain.dto.MatchAdminMatchFilterDTO;
import com.feeling.packages.match.domain.dto.MatchResponseDTO;
import com.feeling.packages.match.domain.dto.MatchSummaryDTO;
import com.feeling.packages.match.domain.dto.TopUserMatchDTO;
import com.feeling.packages.match.infrastructure.entities.Match;
import com.feeling.packages.match.infrastructure.repositories.IMatchRepository;
import com.feeling.packages.match.infrastructure.repositories.IUserMatchPlanRepository;
import com.feeling.packages.user.domain.dto.user.UserResponseDTO;
import com.feeling.packages.user.domain.services.UserService;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchAdminService {

    private final IMatchRepository matchRepository;
    private final IUserRepository userRepository;
    private final IUserMatchPlanRepository userMatchPlanRepository;
    private final UserService userService;

    public MatchSummaryDTO getSummary(LocalDateTime from, LocalDateTime to) {
        log.debug("Calculating admin match summary between {} and {}", from, to);

        long totalMatches = Optional.ofNullable(matchRepository.countMatches(from, to)).orElse(0L);
        long acceptedMatches = Optional.ofNullable(matchRepository.countMatchesByStatus(Match.MatchStatus.ACCEPTED, from, to)).orElse(0L);
        long pendingMatches = Optional.ofNullable(matchRepository.countMatchesByStatus(Match.MatchStatus.PENDING, from, to)).orElse(0L);
        long rejectedMatches = Optional.ofNullable(matchRepository.countMatchesByStatus(Match.MatchStatus.REJECTED, from, to)).orElse(0L);
        double conversionRate = totalMatches > 0 ? (acceptedMatches * 1.0) / totalMatches : 0.0;

        long totalAttemptsSold = Optional.ofNullable(userMatchPlanRepository.sumTotalAttemptsSold(from, to)).orElse(0L);
        long totalAttemptsConsumed = Optional.ofNullable(userMatchPlanRepository.sumTotalAttemptsConsumed(from, to)).orElse(0L);
        BigDecimal totalRevenue = Optional.ofNullable(userMatchPlanRepository.sumTotalRevenue(from, to)).orElse(BigDecimal.ZERO);

        return new MatchSummaryDTO(
            totalMatches,
            acceptedMatches,
            pendingMatches,
            rejectedMatches,
            conversionRate,
            totalAttemptsSold,
            totalAttemptsConsumed,
            totalRevenue
        );
    }

    public List<TopUserMatchDTO> getTopInitiators(int limit, LocalDateTime from, LocalDateTime to) {
        log.debug("Getting top {} match initiators", limit);
        Pageable pageable = PageRequest.of(0, Math.max(limit, 1));

        return matchRepository.findTopInitiators(from, to, pageable).stream()
            .map(this::buildTopUserDTO)
            .collect(Collectors.toList());
    }

    public List<TopUserMatchDTO> getTopReceivers(int limit, LocalDateTime from, LocalDateTime to) {
        log.debug("Getting top {} match receivers", limit);
        Pageable pageable = PageRequest.of(0, Math.max(limit, 1));

        return matchRepository.findTopReceivers(from, to, pageable).stream()
            .map(this::buildTopUserDTO)
            .collect(Collectors.toList());
    }

    public Page<MatchResponseDTO> getMatches(MatchAdminMatchFilterDTO filter, Pageable pageable) {
        log.debug("Listing matches for admin with filter {}", filter);
        Page<Match> matches = matchRepository.findMatchesForAdmin(
            filter.getStatus(),
            filter.getInitiatorUserId(),
            filter.getTargetUserId(),
            filter.getFrom(),
            filter.getTo(),
            pageable
        );

        return matches.map(this::convertToResponseDTO);
    }

    private TopUserMatchDTO buildTopUserDTO(Object[] record) {
        Long userId = (Long) record[0];
        long totalMatches = ((Number) record[1]).longValue();
        long acceptedMatches = ((Number) record[2]).longValue();
        double acceptanceRate = totalMatches > 0 ? acceptedMatches * 1.0 / totalMatches : 0.0;

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        UserResponseDTO userDTO = userService.get(user.getEmail(), null, "public");

        return new TopUserMatchDTO(userDTO, totalMatches, acceptedMatches, acceptanceRate);
    }

    private MatchResponseDTO convertToResponseDTO(Match match) {
        UserResponseDTO initiatorUserDTO = userService.get(match.getInitiatorUser().getEmail(), null, "public");
        UserResponseDTO targetUserDTO = userService.get(match.getTargetUser().getEmail(), null, "public");

        return new MatchResponseDTO(
            match.getId(),
            initiatorUserDTO,
            targetUserDTO,
            match.getStatus(),
            match.getRespondedAt(),
            match.getViewedAt(),
            match.getContactUnlocked(),
            match.getCreatedAt()
        );
    }
}
