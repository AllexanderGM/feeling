package com.feeling.packages.auth.infrastructure.repositories;

import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.auth.infrastructure.entities.AuthToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface IAuthTokenRepository extends JpaRepository<AuthToken, Long> {
    Optional<AuthToken> findByToken(String jwtToken);

    List<AuthToken> findByUser(User user);

    @Query("""
                SELECT t FROM AuthToken t
                WHERE t.user.id = :userId
                AND t.expired = false
                AND t.revoked = false
            """)
    List<AuthToken> findAllValidTokensByUserId(Long userId);

    @Query("""
                SELECT t FROM AuthToken t
                WHERE t.user.id = :userId
                AND t.type = com.feeling.packages.auth.infrastructure.entities.AuthToken.TokenType.ACCESS
                AND t.expired = false
                AND t.revoked = false
            """)
    List<AuthToken> findAllValidAccessTokensByUserId(Long userId);

    @Query("""
                SELECT t FROM AuthToken t
                WHERE t.user.id = :userId
                AND t.type = com.feeling.packages.auth.infrastructure.entities.AuthToken.TokenType.REFRESH
                AND t.expired = false
                AND t.revoked = false
            """)
    List<AuthToken> findAllValidRefreshTokensByUserId(Long userId);
}
