package com.feeling.infrastructure.repositories.booking;

import com.feeling.infrastructure.entities.booking.Accommodation;
import com.feeling.infrastructure.entities.booking.AccommodationBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IAccommodationRepository extends JpaRepository<Accommodation, Long> {
    Optional<Accommodation> findByAccommodationBooking(AccommodationBooking accommodationBooking);
    Optional<Accommodation> findById(Long id);
}
