package com.feeling.infrastructure.repositories.user;

import com.feeling.infrastructure.entities.user.UserCategoryInterest;
import com.feeling.infrastructure.entities.user.UserCategoryInterestList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface IUserCategoryInterestRepository extends JpaRepository<UserCategoryInterest, Long> {
    Collection<Object> findByCategoryInterest(UserCategoryInterestList category);
}
