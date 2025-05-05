package com.tours.infrastructure.repositories.booking;

import com.tours.infrastructure.entities.booking.Availability;
import com.tours.infrastructure.entities.booking.Booking;
import com.tours.infrastructure.entities.tour.Tour;
import com.tours.infrastructure.entities.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IBookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByTourId(Long tourId);
    List<Booking> findByUserId(Long userId);
    List<Booking> findByUser(User user);
    List<Booking> findByTour(Tour tour);
    List<Booking> findByAvailability(Availability availability);
    Booking findByTourIdAndStartDate(Long tourId, LocalDateTime startDate);
    }
