package com.tours.infrastructure.repositories.tour;

import com.tours.infrastructure.entities.tour.TagTour;
import com.tours.infrastructure.entities.tour.TagTourOptions;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ITagTourRepository extends JpaRepository<TagTour, Long> {
    Optional<TagTour> findByTagTourOptions(TagTourOptions tagTourOptions);
}
