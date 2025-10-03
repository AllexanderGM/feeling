package com.feeling.packages.match.domain.services;

import com.feeling.packages.match.domain.dto.MatchContactDTO;
import com.feeling.packages.match.domain.dto.MatchRequestDTO;
import com.feeling.packages.match.domain.dto.MatchResponseDTO;
import com.feeling.packages.match.infrastructure.entities.Match;
import com.feeling.packages.match.infrastructure.repositories.IMatchRepository;
import com.feeling.packages.user.domain.dto.UserResponseDTO;
import com.feeling.packages.user.domain.services.UserService;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchService {

    private final IMatchRepository matchRepository;
    private final IUserRepository userRepository;
    private final MatchPlanService matchPlanService;
    private final UserService userService;

    @Transactional
    public MatchResponseDTO sendMatch(User initiatorUser, MatchRequestDTO request) {
        log.info("User {} sending match to user {}", initiatorUser.getId(), request.getTargetUserId());

        if (!matchPlanService.hasAvailableAttempts(initiatorUser)) {
            throw new RuntimeException("No available match attempts. Please purchase a match plan.");
        }

        User targetUser = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new RuntimeException("Target user not found with id: " + request.getTargetUserId()));

        if (initiatorUser.getId().equals(targetUser.getId())) {
            throw new RuntimeException("Cannot send match to yourself");
        }

        if (matchRepository.existsMatchBetweenUsers(initiatorUser, targetUser)) {
            throw new RuntimeException("Match already exists between these users");
        }

        matchPlanService.useAttempt(initiatorUser);

        Match match = new Match(initiatorUser, targetUser);
        match = matchRepository.save(match);

        log.info("Match sent successfully from user {} to user {}", initiatorUser.getId(), targetUser.getId());

        return convertToResponseDTO(match);
    }

    @Transactional
    public MatchResponseDTO acceptMatch(User targetUser, Long matchId) {
        log.info("User {} accepting match {}", targetUser.getId(), matchId);

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));

        if (!match.getTargetUser().getId().equals(targetUser.getId())) {
            throw new RuntimeException("You are not authorized to accept this match");
        }

        if (!match.isPending()) {
            throw new RuntimeException("Match is not pending");
        }

        if (!matchPlanService.hasAvailableAttempts(targetUser)) {
            throw new RuntimeException("No available match attempts. Please purchase a match plan.");
        }

        matchPlanService.useAttempt(targetUser);

        match.accept();
        match = matchRepository.save(match);

        log.info("Match {} accepted successfully by user {}", matchId, targetUser.getId());

        return convertToResponseDTO(match);
    }

    @Transactional
    public MatchResponseDTO rejectMatch(User targetUser, Long matchId) {
        log.info("User {} rejecting match {}", targetUser.getId(), matchId);

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));

        if (!match.getTargetUser().getId().equals(targetUser.getId())) {
            throw new RuntimeException("You are not authorized to reject this match");
        }

        if (!match.isPending()) {
            throw new RuntimeException("Match is not pending");
        }

        match.reject();
        match = matchRepository.save(match);

        log.info("Match {} rejected by user {}", matchId, targetUser.getId());

        return convertToResponseDTO(match);
    }

    @Transactional
    public MatchResponseDTO viewMatch(User user, Long matchId) {
        log.debug("User {} viewing match {}", user.getId(), matchId);

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));

        if (!match.getTargetUser().getId().equals(user.getId()) &&
                !match.getInitiatorUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to view this match");
        }

        match.markAsViewed();
        match = matchRepository.save(match);

        return convertToResponseDTO(match);
    }

    public Page<MatchResponseDTO> getSentMatches(User user, Pageable pageable) {
        log.debug("Getting sent matches for user: {}", user.getId());
        return matchRepository.findSentMatches(user, pageable)
                .map(this::convertToResponseDTO);
    }

    public Page<MatchResponseDTO> getReceivedMatches(User user, Pageable pageable) {
        log.debug("Getting received matches for user: {}", user.getId());
        return matchRepository.findReceivedMatches(user, pageable)
                .map(this::convertToResponseDTO);
    }

    public Page<MatchResponseDTO> getPendingReceivedMatches(User user, Pageable pageable) {
        log.debug("Getting pending received matches for user: {}", user.getId());
        return matchRepository.findPendingReceivedMatches(user, pageable)
                .map(this::convertToResponseDTO);
    }

    public Page<MatchResponseDTO> getAcceptedMatches(User user, Pageable pageable) {
        log.debug("Getting accepted matches for user: {}", user.getId());
        return matchRepository.findAcceptedMatches(user, pageable)
                .map(this::convertToResponseDTO);
    }

    public MatchContactDTO getMatchContact(User user, Long matchId) {
        log.debug("User {} getting contact info for match {}", user.getId(), matchId);

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));

        if (!match.getContactUnlocked()) {
            throw new RuntimeException("Contact information is not unlocked for this match");
        }

        if (!match.getTargetUser().getId().equals(user.getId()) &&
                !match.getInitiatorUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to view contact info for this match");
        }

        User otherUser = match.getInitiatorUser().getId().equals(user.getId())
                ? match.getTargetUser()
                : match.getInitiatorUser();

        return new MatchContactDTO(
                otherUser.getEmail(),
                otherUser.getPhone(), // Campo phone de la entidad User
                otherUser.getPhone()  // Usar el mismo campo phone para ambos
        );
    }

    public Long countPendingSentMatches(User user) {
        return matchRepository.countPendingSentMatches(user);
    }

    public Long countPendingReceivedMatches(User user) {
        return matchRepository.countPendingReceivedMatches(user);
    }

    public Long countAcceptedMatches(User user) {
        return matchRepository.countAcceptedMatches(user);
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