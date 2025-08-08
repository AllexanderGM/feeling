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

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    public List<MatchPlanResponseDTO> getAllPlansForAdmin() {
        log.debug("Getting all match plans for admin");
        return matchPlanRepository.findAll()
                .stream()
                .map(this::convertToResponseDTOWithStats)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getMatchPlanStatistics() {
        log.debug("Calculating match plan statistics");
        
        // Obtener todos los planes
        List<MatchPlan> allPlans = matchPlanRepository.findAll();
        List<MatchPlan> activePlans = matchPlanRepository.findAllActiveOrderBySortOrderAndPrice();
        
        // Obtener todas las compras
        List<UserMatchPlan> allPurchases = userMatchPlanRepository.findAll();
        
        // Calcular estadísticas básicas
        int totalPlans = allPlans.size();
        int activePlansCount = activePlans.size();
        int totalPurchases = allPurchases.size();
        
        // Calcular ingresos totales
        BigDecimal totalRevenue = allPurchases.stream()
                .map(purchase -> purchase.getMatchPlan().getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Encontrar el plan más popular
        Map<String, Long> planPopularity = allPurchases.stream()
                .collect(Collectors.groupingBy(
                        purchase -> purchase.getMatchPlan().getName(),
                        Collectors.counting()
                ));
        
        String mostPopularPlan = planPopularity.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
        
        Long mostPopularPlanSales = planPopularity.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getValue)
                .orElse(0L);
        
        // Calcular promedio de intentos restantes
        Double averageRemainingAttempts = allPurchases.stream()
                .filter(UserMatchPlan::getIsActive)
                .mapToInt(UserMatchPlan::getRemainingAttempts)
                .average()
                .orElse(0.0);
        
        // Construir respuesta
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPlans", totalPlans);
        stats.put("activePlans", activePlansCount);
        stats.put("totalPurchases", totalPurchases);
        stats.put("totalRevenue", totalRevenue);
        stats.put("mostPopularPlan", mostPopularPlan);
        stats.put("mostPopularPlanSales", mostPopularPlanSales);
        stats.put("averageRemainingAttempts", averageRemainingAttempts.intValue());
        
        log.info("Match plan statistics calculated: {} total plans, {} purchases, revenue: {}", 
                totalPlans, totalPurchases, totalRevenue);
        
        return stats;
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

    private MatchPlanResponseDTO convertToResponseDTOWithStats(MatchPlan matchPlan) {
        // Calcular estadísticas específicas del plan
        List<UserMatchPlan> planPurchases = userMatchPlanRepository.findByMatchPlan(matchPlan);
        
        int totalPurchases = planPurchases.size();
        BigDecimal totalRevenue = matchPlan.getPrice().multiply(BigDecimal.valueOf(totalPurchases));
        
        // Crear DTO básico
        MatchPlanResponseDTO dto = convertToResponseDTO(matchPlan);
        
        // Agregar estadísticas (se pueden agregar a través de un Map adicional si el DTO no las soporta)
        // Por ahora retornamos el DTO básico, pero podríamos extender el DTO para incluir estas estadísticas
        
        return dto;
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