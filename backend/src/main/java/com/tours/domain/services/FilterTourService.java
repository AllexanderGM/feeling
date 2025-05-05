package com.tours.domain.services;

import com.tours.domain.dto.tour.filter.TourFilterDTO;
import com.tours.infrastructure.entities.tour.Tour;
import com.tours.infrastructure.repositories.filter.IFilterTourRepository;
import com.tours.infrastructure.repositories.filter.TourSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FilterTourService {

    private final IFilterTourRepository repository;

    public List<Tour> filterByCategory(TourFilterDTO filtro) {
        if (filtro.getTags() == null || filtro.getTags().isEmpty()) {
            return repository.findAll();
        }

        Specification<Tour> spec = TourSpecification.hasTags(filtro.getTags());
        return repository.findAll(spec);
    }
}