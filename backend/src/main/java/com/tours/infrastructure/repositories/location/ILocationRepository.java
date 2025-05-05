package com.tours.infrastructure.repositories.location;

import com.tours.infrastructure.entities.location.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ILocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByCountryAndCity(String city, String country);
}
