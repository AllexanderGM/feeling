package com.feeling.domain.dto.event;

import com.feeling.infrastructure.entities.tour.TagTour;
import com.feeling.infrastructure.entities.tour.TagTourOptions;

public record TagDTO(TagTourOptions tag) {
    public TagDTO(TagTour tag) {
        this(tag.getTagTourOptions());
    }
}
