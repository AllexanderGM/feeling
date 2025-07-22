package com.feeling.domain.services.event;

import com.feeling.domain.dto.event.EventStatsDTO;
import com.feeling.infrastructure.entities.event.EventCategory;
import com.feeling.infrastructure.entities.event.PaymentStatus;
import com.feeling.infrastructure.repositories.event.IEventRegistrationRepository;
import com.feeling.infrastructure.repositories.event.IEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EventStatsService {
    
    private final IEventRepository eventRepository;
    private final IEventRegistrationRepository registrationRepository;

    @Cacheable(value = "eventStats", key = "'dashboard'")
    public EventStatsDTO getDashboardStats() {
        // Basic counts
        Long totalEvents = eventRepository.count();
        Long activeEvents = eventRepository.countActiveEvents();
        Long totalRegistrations = registrationRepository.count();
        
        // Registration stats
        List<Object[]> registrationsByStatus = registrationRepository
                .findAll()
                .stream()
                .collect(
                    java.util.stream.Collectors.groupingBy(
                        reg -> reg.getPaymentStatus(),
                        java.util.stream.Collectors.counting()
                    )
                ).entrySet()
                .stream()
                .map(entry -> new Object[]{entry.getKey().name(), entry.getValue()})
                .toList();
        
        Map<String, Long> statusMap = new HashMap<>();
        Long completedCount = 0L;
        
        for (Object[] row : registrationsByStatus) {
            String status = (String) row[0];
            Long count = (Long) row[1];
            statusMap.put(status, count);
            
            if ("COMPLETED".equals(status)) {
                completedCount = count;
            }
        }
        
        // Calculate total revenue (this is a simplified calculation)
        // In a real implementation, you'd want to sum actual payment amounts
        BigDecimal totalRevenue = registrationRepository.findAll()
                .stream()
                .filter(reg -> reg.getPaymentStatus() == PaymentStatus.COMPLETED && reg.getAmountPaid() != null)
                .map(reg -> reg.getAmountPaid())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Events by category
        Map<String, Long> categoryMap = new HashMap<>();
        for (EventCategory category : EventCategory.values()) {
            Long count = eventRepository.countActiveEventsByCategory(category);
            categoryMap.put(category.getDisplayName(), count);
        }
        
        // Calculate averages
        Double avgAttendees = totalEvents > 0 ? (double) completedCount / totalEvents : 0.0;
        
        // Calculate capacity utilization (simplified)
        // This would need more complex calculation in real implementation
        Double capacityUtilization = 0.75; // Placeholder
        
        return new EventStatsDTO(
            totalEvents,
            activeEvents,
            totalRegistrations,
            completedCount,
            totalRevenue,
            categoryMap,
            statusMap,
            avgAttendees,
            capacityUtilization
        );
    }
}