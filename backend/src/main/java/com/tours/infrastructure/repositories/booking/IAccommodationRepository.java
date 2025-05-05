package com.tours.infrastructure.repositories.booking;

import com.tours.infrastructure.entities.booking.Accommodation;
import com.tours.infrastructure.entities.booking.AccommodationBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IAccommodationRepository extends JpaRepository<Accommodation, Long> {
    Optional<Accommodation> findByAccommodationBooking(AccommodationBooking accommodationBooking);
    Optional<Accommodation> findById(Long id);
}
