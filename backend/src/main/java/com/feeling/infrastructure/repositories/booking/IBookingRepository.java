package com.feeling.infrastructure.repositories.booking;

import com.feeling.infrastructure.entities.booking.Availability;
import com.feeling.infrastructure.entities.booking.Booking;
import com.feeling.infrastructure.entities.tour.Tour;
import com.feeling.infrastructure.entities.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IBookingRepository extends JpaRepository<Booking, Long> {
    
    // ========================================
    // BÚSQUEDAS BÁSICAS (LEGACY - MANTENER COMPATIBILIDAD)
    // ========================================
    List<Booking> findByTourId(Long tourId);
    List<Booking> findByUserId(Long userId);
    List<Booking> findByUser(User user);
    List<Booking> findByTour(Tour tour);
    List<Booking> findByAvailability(Availability availability);
    Booking findByTourIdAndStartDate(Long tourId, LocalDateTime startDate);
    
    // ========================================
    // BÚSQUEDAS OPTIMIZADAS CON FETCH JOIN
    // ========================================
    
    // OPTIMIZACIÓN: Cargar booking con todas las relaciones necesarias
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.user u " +
            "LEFT JOIN FETCH b.tour t " +
            "LEFT JOIN FETCH b.availability a " +
            "LEFT JOIN FETCH b.pay p " +
            "WHERE b.id = :bookingId")
    Optional<Booking> findByIdWithRelations(@Param("bookingId") Long bookingId);
    
    // OPTIMIZACIÓN: Bookings de usuario con relaciones precargadas
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.tour t " +
            "LEFT JOIN FETCH b.availability a " +
            "LEFT JOIN FETCH b.pay p " +
            "WHERE b.user.id = :userId " +
            "ORDER BY b.creationDate DESC")
    Page<Booking> findByUserIdOptimized(@Param("userId") Long userId, Pageable pageable);
    
    // OPTIMIZACIÓN: Bookings de tour con relaciones precargadas
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.user u " +
            "LEFT JOIN FETCH b.availability a " +
            "LEFT JOIN FETCH b.pay p " +
            "WHERE b.tour.id = :tourId " +
            "ORDER BY b.creationDate DESC")
    Page<Booking> findByTourIdOptimized(@Param("tourId") Long tourId, Pageable pageable);
    
    // OPTIMIZACIÓN: Bookings recientes con relaciones
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.user u " +
            "LEFT JOIN FETCH b.tour t " +
            "LEFT JOIN FETCH b.availability a " +
            "WHERE b.creationDate >= :since " +
            "ORDER BY b.creationDate DESC")
    List<Booking> findRecentBookingsOptimized(@Param("since") LocalDateTime since);
    
    // ========================================
    // BÚSQUEDAS POR ESTADO Y FECHAS
    // ========================================
    
    @Query("SELECT b FROM Booking b WHERE b.startDate BETWEEN :startDate AND :endDate")
    List<Booking> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.tour.id = :tourId")
    long countByTourId(@Param("tourId") Long tourId);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.creationDate >= :since")
    long countBookingsSince(@Param("since") LocalDateTime since);
    
    // ========================================
    // CONSULTAS DE DISPONIBILIDAD
    // ========================================
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.availability.id = :availabilityId")
    long countByAvailabilityId(@Param("availabilityId") Long availabilityId);
    
    @Query("SELECT b FROM Booking b WHERE b.availability.id = :availabilityId AND b.startDate = :startDate")
    List<Booking> findConflictingBookings(@Param("availabilityId") Long availabilityId, @Param("startDate") LocalDateTime startDate);
}
