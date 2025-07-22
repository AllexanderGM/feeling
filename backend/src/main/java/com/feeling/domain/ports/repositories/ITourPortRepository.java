package com.feeling.domain.ports.repositories;

import com.feeling.infrastructure.entities.tour.Tour;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Port para operaciones de tour según Clean Architecture
 */
public interface ITourPortRepository {

    // ========================================
    // OPERACIONES BÁSICAS CRUD
    // ========================================
    
    Tour save(Tour tour);
    
    Optional<Tour> findById(Long id);
    
    Optional<Tour> findByIdWithRelations(Long tourId);
    
    void deleteById(Long id);
    
    long count();
    
    boolean existsByName(String name);

    // ========================================
    // BÚSQUEDAS Y FILTROS
    // ========================================
    
    Page<Tour> findAll(Pageable pageable);
    
    List<Tour> findByNameContainingIgnoreCase(String name);
    
    List<Tour> findByFilters(String name, LocalDateTime startDate, LocalDateTime endDate);
    
    List<Tour> findByFiltersOptimized(String name, LocalDateTime startDate, LocalDateTime endDate);

    // ========================================
    // BÚSQUEDAS OPTIMIZADAS
    // ========================================
    
    Page<Tour> findActiveToursOptimized(Pageable pageable);
    
    Page<Tour> findPopularToursOptimized(Pageable pageable);
    
    List<Tour> findByDestinationOptimized(String destination);

    // ========================================
    // ESTADÍSTICAS Y DISPONIBILIDAD
    // ========================================
    
    long countActiveTours();
    
    long countToursCreatedSince(LocalDateTime since);
    
    List<Tour> findToursWithAvailabilityInRange(LocalDateTime startDate, LocalDateTime endDate);
}