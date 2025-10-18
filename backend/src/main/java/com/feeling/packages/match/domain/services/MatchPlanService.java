package com.feeling.packages.match.domain.services;

import com.feeling.packages.match.domain.dto.MatchPlanRequestDTO;
import com.feeling.packages.match.domain.dto.MatchPlanResponseDTO;
import com.feeling.packages.match.domain.dto.PurchaseMatchPlanRequestDTO;
import com.feeling.packages.match.domain.dto.UserMatchPlanResponseDTO;
import com.feeling.packages.match.infrastructure.entities.MatchPlan;
import com.feeling.packages.match.infrastructure.entities.UserMatchPlan;
import com.feeling.packages.match.infrastructure.repositories.IMatchPlanRepository;
import com.feeling.packages.match.infrastructure.repositories.IUserMatchPlanRepository;
import com.feeling.packages.user.infrastructure.entities.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchPlanService {

    private final IMatchPlanRepository matchPlanRepository;
    private final IUserMatchPlanRepository userMatchPlanRepository;

    // ========================================
    // CLIENTE - OPERACIONES CRUD
    // ========================================

    public List<MatchPlanResponseDTO> getAllActivePlans() {
        log.debug("Getting all active match plans");
        return matchPlanRepository.findAllActiveOrderBySortOrderAndPrice()
            .stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
    }

    public MatchPlanResponseDTO getPlanById(Long planId) {
        log.debug("Getting match plan by id: {}", planId);
        MatchPlan plan = matchPlanRepository.findById(planId)
            .orElseThrow(() -> new RuntimeException("No se encontró el plan de matches con id: " + planId));
        return convertToResponseDTO(plan);
    }

    @Transactional
    public UserMatchPlanResponseDTO purchaseMatchPlan(User user, PurchaseMatchPlanRequestDTO request) {
        log.info("User {} purchasing match plan {}", user.getId(), request.getMatchPlanId());

        MatchPlan matchPlan = matchPlanRepository.findById(request.getMatchPlanId())
            .orElseThrow(() -> new RuntimeException("No se encontró el plan de matches con id: " + request.getMatchPlanId()));

        if (!Boolean.TRUE.equals(matchPlan.getIsActive())) {
            throw new RuntimeException("El plan de matches no está activo.");
        }

        UserMatchPlan userMatchPlan = new UserMatchPlan(user, matchPlan, matchPlan.getAttempts());
        userMatchPlan = userMatchPlanRepository.save(userMatchPlan);

        log.info("User {} successfully purchased match plan {} with {} attempts",
            user.getId(), matchPlan.getName(), matchPlan.getAttempts());

        return convertToUserMatchPlanResponseDTO(userMatchPlan);
    }

    public List<UserMatchPlanResponseDTO> getUserMatchPlans(User user) {
        log.debug("Getting match plans for user: {}", user.getId());
        return userMatchPlanRepository.findAllUserMatchPlans(user)
            .stream()
            .map(this::convertToUserMatchPlanResponseDTO)
            .collect(Collectors.toList());
    }

    public List<UserMatchPlanResponseDTO> getActiveUserMatchPlans(User user) {
        log.debug("Getting active match plans for user: {}", user.getId());
        return userMatchPlanRepository.findActiveUserMatchPlans(user)
            .stream()
            .map(this::convertToUserMatchPlanResponseDTO)
            .collect(Collectors.toList());
    }

    public Integer getTotalRemainingAttempts(User user) {
        log.debug("Getting total remaining attempts for user: {}", user.getId());
        Integer total = userMatchPlanRepository.getTotalRemainingAttempts(user);
        return Optional.ofNullable(total).orElse(0);
    }

    public boolean hasAvailableAttempts(User user) {
        return getTotalRemainingAttempts(user) > 0;
    }

    @Transactional
    public void useAttempt(User user) {
        log.debug("Using one attempt for user: {}", user.getId());

        UserMatchPlan activeUserMatchPlan = userMatchPlanRepository.findFirstActiveUserMatchPlan(user)
            .orElseThrow(() -> new RuntimeException("No se encontraron planes de matches activos para el usuario."));

        activeUserMatchPlan.useAttempt();
        userMatchPlanRepository.save(activeUserMatchPlan);

        log.info("Used one attempt for user {}. Remaining attempts: {}",
            user.getId(), activeUserMatchPlan.getRemainingAttempts());
    }

    // ========================================
    // ADMIN - OPERACIONES CRUD
    // ========================================

    public List<MatchPlanResponseDTO> getAllPlansForAdmin() {
        log.debug("Getting all match plans for admin");
        return matchPlanRepository.findAll()
            .stream()
            .sorted((a, b) -> {
                int sort = Integer.compare(
                    Optional.ofNullable(a.getSortOrder()).orElse(0),
                    Optional.ofNullable(b.getSortOrder()).orElse(0));
                if (sort == 0) {
                    BigDecimal priceA = Optional.ofNullable(a.getPrice()).orElse(BigDecimal.ZERO);
                    BigDecimal priceB = Optional.ofNullable(b.getPrice()).orElse(BigDecimal.ZERO);
                    return priceA.compareTo(priceB);
                }
                return sort;
            })
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public MatchPlanResponseDTO createMatchPlan(MatchPlanRequestDTO request) {
        log.info("Creating new match plan {}", request.getName());

        validateUniqueName(request.getName(), null);

        MatchPlan matchPlan = new MatchPlan(
            request.getName(),
            request.getDescription(),
            request.getAttempts(),
            request.getPrice(),
            Optional.ofNullable(request.getSortOrder()).orElse(0)
        );
        boolean active = request.getIsActive() == null || Boolean.TRUE.equals(request.getIsActive());
        matchPlan.setIsActive(active);

        MatchPlan savedPlan = matchPlanRepository.save(matchPlan);
        return convertToResponseDTO(savedPlan);
    }

    @Transactional
    public MatchPlanResponseDTO updateMatchPlan(Long planId, MatchPlanRequestDTO request) {
        log.info("Updating match plan {}", planId);

        MatchPlan matchPlan = matchPlanRepository.findById(planId)
            .orElseThrow(() -> new RuntimeException("No se encontró el plan de matches con id: " + planId));

        validateUniqueName(request.getName(), planId);

        matchPlan.setName(request.getName());
        matchPlan.setDescription(request.getDescription());
        matchPlan.setAttempts(request.getAttempts());
        matchPlan.setPrice(request.getPrice());
        matchPlan.setSortOrder(Optional.ofNullable(request.getSortOrder()).orElse(0));
        if (request.getIsActive() != null) {
            matchPlan.setIsActive(Boolean.TRUE.equals(request.getIsActive()));
        }

        MatchPlan savedPlan = matchPlanRepository.save(matchPlan);
        return convertToResponseDTO(savedPlan);
    }

    @Transactional
    public MatchPlanResponseDTO updateMatchPlanStatus(Long planId, Boolean isActive) {
        log.info("Updating match plan {} status to {}", planId, isActive);

        MatchPlan matchPlan = matchPlanRepository.findById(planId)
            .orElseThrow(() -> new RuntimeException("No se encontró el plan de matches con id: " + planId));

        matchPlan.setIsActive(Boolean.TRUE.equals(isActive));
        MatchPlan savedPlan = matchPlanRepository.save(matchPlan);

        return convertToResponseDTO(savedPlan);
    }

    @Transactional
    public void deleteMatchPlan(Long planId) {
        log.info("Deleting match plan {}", planId);

        MatchPlan matchPlan = matchPlanRepository.findById(planId)
            .orElseThrow(() -> new RuntimeException("No se encontró el plan de matches con id: " + planId));

        matchPlanRepository.delete(matchPlan);
    }

    public Map<String, Object> getMatchPlanStatistics(LocalDateTime from, LocalDateTime to) {
        log.debug("Calculating match plan statistics for range from {} to {}", from, to);

        long totalPlans = matchPlanRepository.count();
        long activePlans = matchPlanRepository.findAllActive().size();
        long totalPurchases = Optional.ofNullable(userMatchPlanRepository.countPurchases(from, to)).orElse(0L);
        BigDecimal totalRevenue = Optional.ofNullable(userMatchPlanRepository.sumTotalRevenue(from, to)).orElse(BigDecimal.ZERO);
        long totalAttemptsSold = Optional.ofNullable(userMatchPlanRepository.sumTotalAttemptsSold(from, to)).orElse(0L);
        long totalAttemptsConsumed = Optional.ofNullable(userMatchPlanRepository.sumTotalAttemptsConsumed(from, to)).orElse(0L);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPlans", totalPlans);
        stats.put("activePlans", activePlans);
        stats.put("totalPurchases", totalPurchases);
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalAttemptsSold", totalAttemptsSold);
        stats.put("totalAttemptsConsumed", totalAttemptsConsumed);

        return stats;
    }

    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================

    private void validateUniqueName(String name, Long currentPlanId) {
        boolean exists;
        if (currentPlanId == null) {
            exists = matchPlanRepository.existsByNameIgnoreCase(name);
        } else {
            exists = matchPlanRepository.existsByNameIgnoreCaseAndIdNot(name, currentPlanId);
        }

        if (exists) {
            throw new RuntimeException("Ya existe un plan de matches con el nombre: " + name);
        }
    }

    private MatchPlanResponseDTO convertToResponseDTO(MatchPlan matchPlan) {
        return new MatchPlanResponseDTO(
            matchPlan.getId(),
            matchPlan.getName(),
            matchPlan.getDescription(),
            matchPlan.getAttempts(),
            matchPlan.getPrice(),
            matchPlan.getIsActive(),
            matchPlan.getSortOrder()
        );
    }

    private UserMatchPlanResponseDTO convertToUserMatchPlanResponseDTO(UserMatchPlan userMatchPlan) {
        return new UserMatchPlanResponseDTO(
            userMatchPlan.getId(),
            convertToResponseDTO(userMatchPlan.getMatchPlan()),
            userMatchPlan.getRemainingAttempts(),
            userMatchPlan.getIsActive(),
            userMatchPlan.getPurchaseDate(),
            userMatchPlan.getExpirationDate(),
            userMatchPlan.getCreatedAt()
        );
    }
}
