package com.tours.infrastructure.repositories.tour;

import com.tours.infrastructure.entities.tour.IncludeTours;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IIncludeRepository extends JpaRepository<IncludeTours, Long> {
    Optional<IncludeTours> findByType(String type);
}
