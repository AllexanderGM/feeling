package com.feeling.infrastructure.repositories.filter;

import com.feeling.infrastructure.entities.tour.TagTour;
import com.feeling.infrastructure.entities.tour.TagTourOptions;
import com.feeling.infrastructure.entities.tour.Tour;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import java.util.List;
import java.util.stream.Collectors;

public class TourSpecification {
    public static Specification<Tour> hasTags(List<String> tagNames) {
        return (Root<Tour> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            if (tagNames == null || tagNames.isEmpty()) {
                return cb.conjunction();
            }
            Join<Tour, TagTour> tagsJoin = root.join("tags");
            List<TagTourOptions> tagEnums = tagNames.stream()
                    .map(TagTourOptions::lookup)
                    .collect(Collectors.toList());

            return tagsJoin.get("tagTourOptions").in(tagEnums);
        };
    }
}
