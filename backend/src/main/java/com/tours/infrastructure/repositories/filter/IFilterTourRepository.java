package com.tours.infrastructure.repositories.filter;

import com.tours.infrastructure.entities.tour.Tour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface IFilterTourRepository extends JpaRepository<Tour, Long>, JpaSpecificationExecutor<Tour> {


}