package com.tours.infrastructure.repositories.booking;

import com.tours.infrastructure.entities.booking.Availability;
import com.tours.infrastructure.entities.tour.Tour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IAvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByTour(Tour tour);

    @Query("SELECT a FROM Availability a WHERE a.availableDate <= :endDate AND a.availableDate >= :startDate")
    List<Availability> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    Availability findByTourIdAndAvailableDate(Long tourId, LocalDateTime availableDate);
}