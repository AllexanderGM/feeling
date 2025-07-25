package com.feeling.infrastructure.repositories.match;

import com.feeling.infrastructure.entities.match.MatchPlan;
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
}