package com.feeling.infrastructure.repositories.tour;

import com.feeling.infrastructure.entities.tour.Tour;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ITourRepository extends JpaRepository<Tour, Long> {
    
    // ========================================
    // BÚSQUEDAS BÁSICAS (LEGACY - MANTENER COMPATIBILIDAD)
    // ========================================
    @NotNull Page<Tour> findAll(@NotNull Pageable pageable);
    boolean existsByName(String name);
    List<Tour> findByNameContainingIgnoreCase(String name);

    @Query("SELECT t FROM Tour t " +
            "LEFT JOIN t.availabilities a " +
            "WHERE (:name IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:startDate IS NULL OR a.departureTime >= COALESCE(:startDate, a.departureTime)) " +
            "AND (:endDate IS NULL OR a.departureTime <= COALESCE(:endDate, a.departureTime))")
    List<Tour> findByFilters(@Param("name") String name,
                             @Param("startDate") LocalDateTime startDate,
                             @Param("endDate") LocalDateTime endDate);

    // ========================================
    // BÚSQUEDAS OPTIMIZADAS CON FETCH JOIN
    // ========================================
    
    // OPTIMIZACIÓN: Cargar tour con todas las relaciones necesarias
    @Query("SELECT t FROM Tour t " +
            "LEFT JOIN FETCH t.availabilities a " +
            "LEFT JOIN FETCH t.tags tt " +
            "LEFT JOIN FETCH t.includeTours it " +
            "LEFT JOIN FETCH t.hotelTour h " +
            "WHERE t.id = :tourId")
    Optional<Tour> findByIdWithRelations(@Param("tourId") Long tourId);
    
    // OPTIMIZACIÓN: Tours con disponibilidades precargadas
    @Query("SELECT DISTINCT t FROM Tour t " +
            "LEFT JOIN FETCH t.availabilities a " +
            "WHERE t.statusTour IS NOT NULL " +
            "ORDER BY t.creationDate DESC")
    Page<Tour> findActiveToursOptimized(Pageable pageable);
    
    // OPTIMIZACIÓN: Búsqueda con filtros y relaciones precargadas
    @Query("SELECT DISTINCT t FROM Tour t " +
            "LEFT JOIN FETCH t.availabilities a " +
            "LEFT JOIN FETCH t.tags tt " +
            "WHERE (:name IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:startDate IS NULL OR a.departureTime >= COALESCE(:startDate, a.departureTime)) " +
            "AND (:endDate IS NULL OR a.departureTime <= COALESCE(:endDate, a.departureTime)) " +
            "AND t.statusTour IS NOT NULL")
    List<Tour> findByFiltersOptimized(@Param("name") String name,
                                      @Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);
    
    // OPTIMIZACIÓN: Tours populares con métricas precargadas
    @Query("SELECT t FROM Tour t " +
            "LEFT JOIN FETCH t.availabilities a " +
            "WHERE t.statusTour IS NOT NULL " +
            "AND EXISTS (SELECT 1 FROM t.availabilities av WHERE av.departureTime > CURRENT_TIMESTAMP) " +
            "ORDER BY SIZE(t.bookings) DESC, t.creationDate DESC")
    Page<Tour> findPopularToursOptimized(Pageable pageable);
    
    // OPTIMIZACIÓN: Tours por destino con relaciones
    @Query("SELECT DISTINCT t FROM Tour t " +
            "LEFT JOIN FETCH t.availabilities a " +
            "LEFT JOIN FETCH t.tags tt " +
            "WHERE (LOWER(t.destinationTour.city) LIKE LOWER(CONCAT('%', :destination, '%')) " +
            "OR LOWER(t.destinationTour.country) LIKE LOWER(CONCAT('%', :destination, '%')) " +
            "OR LOWER(t.destinationTour.region) LIKE LOWER(CONCAT('%', :destination, '%'))) " +
            "AND t.statusTour IS NOT NULL")
    List<Tour> findByDestinationOptimized(@Param("destination") String destination);
    
    // ========================================
    // CONSULTAS DE DISPONIBILIDAD Y ESTADÍSTICAS
    // ========================================
    
    @Query("SELECT COUNT(t) FROM Tour t WHERE t.statusTour IS NOT NULL")
    long countActiveTours();
    
    @Query("SELECT COUNT(t) FROM Tour t WHERE t.creationDate >= :since")
    long countToursCreatedSince(@Param("since") LocalDate since);
    
    @Query("SELECT t FROM Tour t WHERE EXISTS (SELECT 1 FROM t.availabilities a WHERE a.departureTime BETWEEN :startDate AND :endDate)")
    List<Tour> findToursWithAvailabilityInRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
