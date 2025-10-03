package com.feeling.packages.location.infrastructure.repositories;

import com.feeling.packages.location.infrastructure.entities.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ILocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByCountryAndCity(String city, String country);
}
