package com.tours.infrastructure.repositories.tour;

import com.tours.infrastructure.entities.tour.StatusTour;
import com.tours.infrastructure.entities.tour.StatusTourOptions;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IStatusTourRepository extends JpaRepository<StatusTour, Long> {
    Optional<StatusTour> findByStatus(StatusTourOptions status);
}
