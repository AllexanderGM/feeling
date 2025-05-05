package com.tours.domain.dto.tour;

import com.tours.infrastructure.entities.tour.TagTour;
import com.tours.infrastructure.entities.tour.TagTourOptions;

public record TagDTO(TagTourOptions tag) {
    public TagDTO(TagTour tag) {
        this(tag.getTagTourOptions());
    }
}
