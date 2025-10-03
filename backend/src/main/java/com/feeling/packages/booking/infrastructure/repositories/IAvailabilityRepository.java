package com.feeling.packages.booking.infrastructure.repositories;

import com.feeling.packages.booking.infrastructure.entities.Availability;
import com.feeling.packages.event.infrastructure.entities.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IAvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByEvent(Event event);

    List<Availability> findByEventId(Long eventId);

    @Query("SELECT a FROM Availability a WHERE a.availableDate >= :startDate AND a.availableDate <= :endDate")
    List<Availability> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a FROM Availability a WHERE a.event.id = :eventId AND a.availableDate >= :startDate AND a.availableDate <= :endDate")
    List<Availability> findByEventIdAndDateRange(@Param("eventId") Long eventId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    Optional<Availability> findByEventIdAndAvailableDate(Long eventId, LocalDateTime availableDate);

    @Query("SELECT a FROM Availability a WHERE a.event.id = :eventId AND a.isAvailable = true AND a.availableDate >= :currentDate ORDER BY a.availableDate ASC")
    List<Availability> findAvailableSlotsByEventId(@Param("eventId") Long eventId, @Param("currentDate") LocalDateTime currentDate);
}
