package com.feeling.infrastructure.repositories.user;

import com.feeling.infrastructure.entities.user.UserCategoryInterest;
import com.feeling.infrastructure.entities.user.UserCategoryInterestList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface IUserCategoryInterestRepository extends JpaRepository<UserCategoryInterest, Long> {
    Collection<Object> findByCategoryInterest(UserCategoryInterestList category);

    @Query("SELECT uci FROM UserCategoryInterest uci WHERE uci.categoryInterest = :category")
    Optional<UserCategoryInterest> findByCategoryInterestEnum(@Param("category") UserCategoryInterestList category);
}
