package com.feeling.packages.match.domain.services;

import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.packages.match.domain.dto.MatchContactDTO;
import com.feeling.packages.match.domain.dto.MatchHistoryItemDTO;
import com.feeling.packages.match.domain.dto.MatchRequestDTO;
import com.feeling.packages.match.domain.dto.MatchResponseDTO;
import com.feeling.packages.match.domain.enums.MatchParticipantRole;
import com.feeling.packages.match.infrastructure.entities.Match;
import com.feeling.packages.match.infrastructure.repositories.IMatchRepository;
import com.feeling.packages.user.domain.dto.mapper.UserResponseFactory;
import com.feeling.packages.user.domain.dto.user.UserResponseDTO;
import com.feeling.packages.user.domain.enums.UserResponseLevel;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * Servicio que gestiona el ciclo de vida de los matches entre usuarios.
 * <p>
 * Responsabilidades:
 * - Creación, aceptación, rechazo y visualización de matches
 * - Cálculo de métricas y estadísticas para usuarios
 * - Exposición de información de contacto cuando el match lo permite
 * - Recuperación de historiales paginados para clientes y administradores
 *
 * <p>
 * Las operaciones de lectura se ejecutan en transacciones read-only para
 * garantizar consistencia y eficiencia con cargas diferidas.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MatchService {

    private final IMatchRepository matchRepository;
    private final IUserRepository userRepository;
    private final MatchPlanService matchPlanService;
    private final UserResponseFactory userResponseFactory;

    // ========================================
    // ESTADÍSTICAS
    // ========================================

    @Transactional(readOnly = true)
    public Map<String, Long> getUserMatchCounters(User user, LocalDateTime from, LocalDateTime to) {
        Map<String, Long> counters = new HashMap<>();
        counters.put("pendingSent", countPendingSentMatches(user, from, to));
        counters.put("pendingReceived", countPendingReceivedMatches(user, from, to));
        counters.put("accepted", countAcceptedMatches(user, from, to));
        counters.put("sent", countSentMatches(user, from, to));
        counters.put("received", countReceivedMatches(user, from, to));
        return counters;
    }

    @Transactional(readOnly = true)
    public Long countPendingSentMatches(User user) {
        return matchRepository.countPendingSentMatches(user);
    }

    @Transactional(readOnly = true)
    public Long countPendingSentMatches(User user, LocalDateTime from, LocalDateTime to) {
        return matchRepository.countPendingSentMatches(user, from, to);
    }

    @Transactional(readOnly = true)
    public Long countPendingReceivedMatches(User user) {
        return matchRepository.countPendingReceivedMatches(user);
    }

    @Transactional(readOnly = true)
    public Long countPendingReceivedMatches(User user, LocalDateTime from, LocalDateTime to) {
        return matchRepository.countPendingReceivedMatches(user, from, to);
    }

    @Transactional(readOnly = true)
    public Long countAcceptedMatches(User user) {
        return matchRepository.countAcceptedMatches(user);
    }

    @Transactional(readOnly = true)
    public Long countAcceptedMatches(User user, LocalDateTime from, LocalDateTime to) {
        return matchRepository.countAcceptedMatches(user, from, to);
    }

    @Transactional(readOnly = true)
    public Long countSentMatches(User user, LocalDateTime from, LocalDateTime to) {
        return matchRepository.countSentMatches(user, from, to);
    }

    @Transactional(readOnly = true)
    public Long countReceivedMatches(User user, LocalDateTime from, LocalDateTime to) {
        return matchRepository.countReceivedMatches(user, from, to);
    }

    // ========================================
    // CLIENTE - OPERACIONES CRUD
    // ========================================

    @Transactional
    public MatchResponseDTO sendMatch(User initiatorUser, MatchRequestDTO request) {
        log.info("User {} sending match to user {}", initiatorUser.getId(), request.getTargetUserId());

        if (!matchPlanService.hasAvailableAttempts(initiatorUser)) {
            throw new BadRequestException("No tienes intentos disponibles. Compra un plan de matches para continuar.");
        }

        User targetUser = userRepository.findById(request.getTargetUserId())
            .orElseThrow(() -> new NotFoundException("No se encontró al usuario objetivo con id: " + request.getTargetUserId()));

        if (Objects.equals(initiatorUser.getId(), targetUser.getId())) {
            throw new BadRequestException("No puedes enviarte un match a ti mismo.");
        }

        if (matchRepository.existsMatchBetweenUsers(initiatorUser, targetUser)) {
            throw new BadRequestException("Ya existe un match entre estos usuarios.");
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
            .orElseThrow(() -> new NotFoundException("No se encontró el match con id: " + matchId));

        if (!match.getTargetUser().getId().equals(targetUser.getId())) {
            throw new UnauthorizedException("No estás autorizado para aceptar este match.");
        }

        if (!match.isPending()) {
            throw new BadRequestException("El match ya no está pendiente.");
        }

        if (!matchPlanService.hasAvailableAttempts(targetUser)) {
            throw new BadRequestException("No tienes intentos disponibles. Compra un plan de matches para continuar.");
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
            .orElseThrow(() -> new NotFoundException("No se encontró el match con id: " + matchId));

        if (!match.getTargetUser().getId().equals(targetUser.getId())) {
            throw new UnauthorizedException("No estás autorizado para rechazar este match.");
        }

        if (!match.isPending()) {
            throw new BadRequestException("El match ya no está pendiente.");
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
            .orElseThrow(() -> new NotFoundException("No se encontró el match con id: " + matchId));

        if (!match.getTargetUser().getId().equals(user.getId()) &&
            !match.getInitiatorUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("No estás autorizado para ver este match.");
        }

        match.markAsViewed();
        match = matchRepository.save(match);

        return convertToResponseDTO(match);
    }

    @Transactional(readOnly = true)
    public Page<MatchResponseDTO> getSentMatches(User user, Pageable pageable) {
        log.debug("Getting sent matches for user: {}", user.getId());
        return matchRepository.findSentMatches(user, pageable)
            .map(this::convertToResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<MatchResponseDTO> getReceivedMatches(User user, Pageable pageable) {
        log.debug("Getting received matches for user: {}", user.getId());
        return matchRepository.findReceivedMatches(user, pageable)
            .map(this::convertToResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<MatchResponseDTO> getPendingReceivedMatches(User user, Pageable pageable) {
        log.debug("Getting pending received matches for user: {}", user.getId());
        return matchRepository.findPendingReceivedMatches(user, pageable)
            .map(this::convertToResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<MatchResponseDTO> getAcceptedMatches(User user, Pageable pageable) {
        log.debug("Getting accepted matches for user: {}", user.getId());
        return matchRepository.findAcceptedMatches(user, pageable)
            .map(this::convertToResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<MatchHistoryItemDTO> getMatchHistory(User user,
                                                     Match.MatchStatus status,
                                                     LocalDateTime from,
                                                     LocalDateTime to,
                                                     Pageable pageable) {
        log.debug("Getting match history for user {} with status {} between {} and {}",
            user.getId(), status, from, to);

        return matchRepository.findUserMatchHistory(user, status, from, to, pageable)
            .map(match -> convertToHistoryItem(match, user));
    }

    public MatchContactDTO getMatchContact(User user, Long matchId) {
        log.debug("User {} getting contact info for match {}", user.getId(), matchId);

        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new NotFoundException("No se encontró el match con id: " + matchId));

        if (!Boolean.TRUE.equals(match.getContactUnlocked())) {
            throw new BadRequestException("La información de contacto aún no está disponible para este match.");
        }

        if (!match.getTargetUser().getId().equals(user.getId()) &&
            !match.getInitiatorUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("No estás autorizado para ver la información de contacto de este match.");
        }

        User otherUser = match.getInitiatorUser().getId().equals(user.getId())
            ? match.getTargetUser()
            : match.getInitiatorUser();

        return new MatchContactDTO(
            otherUser.getEmail(),
            buildInternationalPhone(otherUser),
            otherUser.getPhone(),
            otherUser.getPhoneCode()
        );
    }

    // ========================================
    // FUTURE EXTENSIONS
    // ========================================

    // TODO(feature-mgmt): reopenMatch(Long matchId) - requires admin workflow and audit trail.
    // TODO(feature-messaging): notifyMatchParticipants(Long matchId, String templateCode).

    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================

    private MatchHistoryItemDTO convertToHistoryItem(Match match, User currentUser) {
        MatchParticipantRole role = match.getInitiatorUser().getId().equals(currentUser.getId())
            ? MatchParticipantRole.INITIATOR
            : MatchParticipantRole.TARGET;

        User otherUser = role == MatchParticipantRole.INITIATOR
            ? match.getTargetUser()
            : match.getInitiatorUser();

        UserResponseDTO otherUserDTO = userResponseFactory.create(otherUser, UserResponseLevel.PUBLIC);

        return new MatchHistoryItemDTO(
            match.getId(),
            role,
            match.getStatus(),
            otherUserDTO,
            match.getCreatedAt(),
            match.getRespondedAt(),
            match.getViewedAt(),
            match.getContactUnlocked()
        );
    }

    private MatchResponseDTO convertToResponseDTO(Match match) {
        UserResponseDTO initiatorUserDTO = userResponseFactory.create(match.getInitiatorUser(), UserResponseLevel.PUBLIC);
        UserResponseDTO targetUserDTO = userResponseFactory.create(match.getTargetUser(), UserResponseLevel.PUBLIC);

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

    private String buildInternationalPhone(User user) {
        if (user.getPhone() == null || user.getPhone().isBlank()) {
            return null;
        }
        String phoneCode = user.getPhoneCode() != null ? user.getPhoneCode().trim() : "";
        String number = user.getPhone().trim();
        return (phoneCode + " " + number).trim();
    }
}
