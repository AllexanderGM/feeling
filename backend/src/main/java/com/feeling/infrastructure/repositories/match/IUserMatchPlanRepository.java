package com.feeling.infrastructure.repositories.match;

import com.feeling.infrastructure.entities.match.UserMatchPlan;
import com.feeling.infrastructure.entities.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IUserMatchPlanRepository extends JpaRepository<UserMatchPlan, Long> {

    @Query("SELECT ump FROM UserMatchPlan ump " +
           "WHERE ump.user = :user AND ump.isActive = true AND ump.remainingAttempts > 0 " +
           "ORDER BY ump.createdAt DESC")
    List<UserMatchPlan> findActiveUserMatchPlans(@Param("user") User user);

    @Query("SELECT ump FROM UserMatchPlan ump " +
           "WHERE ump.user = :user AND ump.isActive = true AND ump.remainingAttempts > 0 " +
           "ORDER BY ump.createdAt DESC")
    Optional<UserMatchPlan> findFirstActiveUserMatchPlan(@Param("user") User user);

    @Query("SELECT ump FROM UserMatchPlan ump " +
           "WHERE ump.user = :user " +
           "ORDER BY ump.createdAt DESC")
    List<UserMatchPlan> findAllUserMatchPlans(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(ump.remainingAttempts), 0) FROM UserMatchPlan ump " +
           "WHERE ump.user = :user AND ump.isActive = true")
    Integer getTotalRemainingAttempts(@Param("user") User user);
}