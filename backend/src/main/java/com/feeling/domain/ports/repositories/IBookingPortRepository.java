package com.feeling.domain.ports.repositories;

import com.feeling.infrastructure.entities.booking.Availability;
import com.feeling.infrastructure.entities.booking.Booking;
import com.feeling.infrastructure.entities.tour.Tour;
import com.feeling.infrastructure.entities.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Port para operaciones de booking según Clean Architecture
 */
public interface IBookingPortRepository {

    // ========================================
    // OPERACIONES BÁSICAS CRUD
    // ========================================
    
    Booking save(Booking booking);
    
    Optional<Booking> findById(Long id);
    
    Optional<Booking> findByIdWithRelations(Long bookingId);
    
    void deleteById(Long id);
    
    long count();

    // ========================================
    // BÚSQUEDAS POR USUARIO
    // ========================================
    
    List<Booking> findByUser(User user);
    
    List<Booking> findByUserId(Long userId);
    
    Page<Booking> findByUserIdOptimized(Long userId, Pageable pageable);
    
    long countByUserId(Long userId);

    // ========================================
    // BÚSQUEDAS POR TOUR
    // ========================================
    
    List<Booking> findByTour(Tour tour);
    
    List<Booking> findByTourId(Long tourId);
    
    Page<Booking> findByTourIdOptimized(Long tourId, Pageable pageable);
    
    long countByTourId(Long tourId);

    // ========================================
    // BÚSQUEDAS POR DISPONIBILIDAD
    // ========================================
    
    List<Booking> findByAvailability(Availability availability);
    
    long countByAvailabilityId(Long availabilityId);
    
    List<Booking> findConflictingBookings(Long availabilityId, LocalDateTime startDate);

    // ========================================
    // BÚSQUEDAS POR FECHAS
    // ========================================
    
    Booking findByTourIdAndStartDate(Long tourId, LocalDateTime startDate);
    
    List<Booking> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    List<Booking> findRecentBookingsOptimized(LocalDateTime since);

    // ========================================
    // ESTADÍSTICAS
    // ========================================
    
    long countBookingsSince(LocalDateTime since);
}