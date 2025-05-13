package com.feeling.infrastructure.repositories.tour;

import com.feeling.infrastructure.entities.tour.TagTour;
import com.feeling.infrastructure.entities.tour.TagTourOptions;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ITagTourRepository extends JpaRepository<TagTour, Long> {
    Optional<TagTour> findByTagTourOptions(TagTourOptions tagTourOptions);
}
