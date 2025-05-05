package com.tours.infrastructure.repositories.tour;

import com.tours.infrastructure.entities.tour.Tour;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ITourRepository extends JpaRepository<Tour, Long> {
    @NotNull Page<Tour> findAll(@NotNull Pageable pageable);
    boolean existsByName(String name);

    List<Tour> findByNameContainingIgnoreCase(String name);


    @Query("SELECT t FROM Tour t " +
            "LEFT JOIN t.availabilities a " + // LEFT JOIN para incluir tours sin disponibilidad
            "WHERE (:name IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:startDate IS NULL OR a.departureTime >= COALESCE(:startDate, a.departureTime)) " +
            "AND (:endDate IS NULL OR a.departureTime <= COALESCE(:endDate, a.departureTime))")
    List<Tour> findByFilters(@Param("name") String name,
                             @Param("startDate") LocalDateTime startDate,
                             @Param("endDate") LocalDateTime endDate);

}
