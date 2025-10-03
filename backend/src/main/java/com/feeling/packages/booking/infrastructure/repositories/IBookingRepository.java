package com.feeling.packages.booking.infrastructure.repositories;

import com.feeling.packages.booking.infrastructure.entities.Booking;
import com.feeling.packages.event.infrastructure.entities.Event;
import com.feeling.packages.user.infrastructure.entities.User;
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
    // BÚSQUEDAS BÁSICAS PARA EVENTOS
    // ========================================
    List<Booking> findByUserOrderByCreatedAtDesc(User user);

    Page<Booking> findByEventOrderByCreatedAtDesc(Event event, Pageable pageable);

    // ========================================
    // BÚSQUEDAS OPTIMIZADAS CON FETCH JOIN
    // ========================================

    // OPTIMIZACIÓN: Cargar booking con todas las relaciones necesarias
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.user u " +
            "LEFT JOIN FETCH b.event e " +
            "LEFT JOIN FETCH b.payment p " +
            "WHERE b.id = :bookingId")
    Optional<Booking> findByIdWithRelations(@Param("bookingId") Long bookingId);

    // OPTIMIZACIÓN: Bookings de usuario con relaciones precargadas
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.event e " +
            "LEFT JOIN FETCH b.payment p " +
            "WHERE b.user.id = :userId " +
            "ORDER BY b.createdAt DESC")
    Page<Booking> findByUserIdOptimized(@Param("userId") Long userId, Pageable pageable);

    // OPTIMIZACIÓN: Bookings de evento con relaciones precargadas
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.user u " +
            "LEFT JOIN FETCH b.payment p " +
            "WHERE b.event.id = :eventId " +
            "ORDER BY b.createdAt DESC")
    Page<Booking> findByEventIdOptimized(@Param("eventId") Long eventId, Pageable pageable);

    // OPTIMIZACIÓN: Bookings recientes con relaciones
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.user u " +
            "LEFT JOIN FETCH b.event e " +
            "WHERE b.createdAt >= :since " +
            "ORDER BY b.createdAt DESC")
    List<Booking> findRecentBookingsOptimized(@Param("since") LocalDateTime since);

    // ========================================
    // BÚSQUEDAS POR ESTADO Y FECHAS
    // ========================================

    @Query("SELECT b FROM Booking b WHERE b.bookingDate BETWEEN :startDate AND :endDate")
    List<Booking> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.event.id = :eventId")
    long countByEventId(@Param("eventId") Long eventId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt >= :since")
    long countBookingsSince(@Param("since") LocalDateTime since);

    // ========================================
    // CONSULTAS DE CAPACIDAD PARA EVENTOS
    // ========================================

    @Query("SELECT COALESCE(SUM(b.attendees), 0) FROM Booking b WHERE b.event.id = :eventId AND b.status != 'CANCELLED'")
    Integer sumAttendeesByEventId(@Param("eventId") Long eventId);

    @Query("SELECT b FROM Booking b WHERE b.event.id = :eventId AND b.bookingDate = :bookingDate AND b.status != 'CANCELLED'")
    List<Booking> findConflictingBookings(@Param("eventId") Long eventId, @Param("bookingDate") LocalDateTime bookingDate);
}
