package com.feeling.infrastructure.repositories.tour;

import com.feeling.infrastructure.entities.tour.HotelTour;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IHotelRepository extends JpaRepository<HotelTour, Long> {
}
