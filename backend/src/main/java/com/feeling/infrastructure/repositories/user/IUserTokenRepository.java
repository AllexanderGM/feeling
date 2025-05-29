package com.feeling.infrastructure.repositories.user;

import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.entities.user.UserToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IUserTokenRepository extends JpaRepository<UserToken, Long> {
    List<UserToken> findAllValidIsFalseOrRevokedIsFalseByUserId(Long id);

    Optional<UserToken> findByToken(String jwtToken);

    List<UserToken> findByUser(User user);
}
