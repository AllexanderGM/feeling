package com.feeling.packages.match.infrastructure.repositories;

import com.feeling.packages.match.infrastructure.entities.MatchPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IMatchPlanRepository extends JpaRepository<MatchPlan, Long> {

    @Query("SELECT mp FROM MatchPlan mp WHERE mp.isActive = true ORDER BY mp.sortOrder, mp.price")
    List<MatchPlan> findAllActiveOrderBySortOrderAndPrice();

    @Query("SELECT mp FROM MatchPlan mp WHERE mp.isActive = true")
    List<MatchPlan> findAllActive();

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
