package com.feeling.domain.services.match;

import com.feeling.domain.dto.match.MatchPlanResponseDTO;
import com.feeling.domain.dto.match.PurchaseMatchPlanRequestDTO;
import com.feeling.domain.dto.match.UserMatchPlanResponseDTO;
import com.feeling.infrastructure.entities.match.MatchPlan;
import com.feeling.infrastructure.entities.match.UserMatchPlan;
import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.repositories.match.IMatchPlanRepository;
import com.feeling.infrastructure.repositories.match.IUserMatchPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchPlanService {

    private final IMatchPlanRepository matchPlanRepository;
    private final IUserMatchPlanRepository userMatchPlanRepository;

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
                .orElseThrow(() -> new RuntimeException("Match plan not found with id: " + planId));
        return convertToResponseDTO(plan);
    }

    @Transactional
    public UserMatchPlanResponseDTO purchaseMatchPlan(User user, PurchaseMatchPlanRequestDTO request) {
        log.info("User {} purchasing match plan {}", user.getId(), request.getMatchPlanId());
        
        MatchPlan matchPlan = matchPlanRepository.findById(request.getMatchPlanId())
                .orElseThrow(() -> new RuntimeException("Match plan not found with id: " + request.getMatchPlanId()));

        if (!matchPlan.getIsActive()) {
            throw new RuntimeException("Match plan is not active");
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
        return total != null ? total : 0;
    }

    public boolean hasAvailableAttempts(User user) {
        return getTotalRemainingAttempts(user) > 0;
    }

    @Transactional
    public void useAttempt(User user) {
        log.debug("Using one attempt for user: {}", user.getId());
        
        UserMatchPlan activeUserMatchPlan = userMatchPlanRepository.findFirstActiveUserMatchPlan(user)
                .orElseThrow(() -> new RuntimeException("No active match plans found for user"));

        activeUserMatchPlan.useAttempt();
        userMatchPlanRepository.save(activeUserMatchPlan);

        log.info("Used one attempt for user {}. Remaining attempts: {}", 
                user.getId(), activeUserMatchPlan.getRemainingAttempts());
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