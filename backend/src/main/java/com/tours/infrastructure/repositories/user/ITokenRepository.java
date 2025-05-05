package com.tours.infrastructure.repositories.user;

import com.tours.infrastructure.entities.user.Token;
import com.tours.infrastructure.entities.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ITokenRepository extends JpaRepository<Token, Long> {
    List<Token> findAllValidIsFalseOrRevokedIsFalseByUserId(Long id);

    Optional<Token> findByToken(String jwtToken);

    List<Token> findByUser(User user);
}
