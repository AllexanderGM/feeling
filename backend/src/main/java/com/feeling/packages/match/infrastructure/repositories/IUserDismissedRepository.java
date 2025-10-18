package com.feeling.packages.match.infrastructure.repositories;

import com.feeling.packages.match.infrastructure.entities.UserDismissedSuggestion;
import com.feeling.packages.user.infrastructure.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IUserDismissedRepository extends JpaRepository<UserDismissedSuggestion, Long> {

    Optional<UserDismissedSuggestion> findByUserAndDismissedUser(User user, User dismissedUser);

    @Query("SELECT uds.dismissedUser.id FROM UserDismissedSuggestion uds WHERE uds.user.id = :userId")
    List<Long> findDismissedUserIds(@Param("userId") Long userId);
}
