package com.tours.infrastructure.repositories.tour;

import com.tours.infrastructure.entities.tour.HotelTour;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IHotelRepository extends JpaRepository<HotelTour, Long> {
}
