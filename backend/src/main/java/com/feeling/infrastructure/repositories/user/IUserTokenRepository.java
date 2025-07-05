package com.feeling.infrastructure.repositories.user;

import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.entities.user.UserToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface IUserTokenRepository extends JpaRepository<UserToken, Long> {
    Optional<UserToken> findByToken(String jwtToken);

    List<UserToken> findByUser(User user);

    @Query("""
                SELECT t FROM UserToken t 
                WHERE t.user.id = :userId 
                AND t.expired = false 
                AND t.revoked = false
            """)
    List<UserToken> findAllValidTokensByUserId(Long userId);

    @Query("""
                SELECT t FROM UserToken t 
                WHERE t.user.id = :userId 
                AND t.type = com.feeling.infrastructure.entities.user.UserToken.TokenType.ACCESS
                AND t.expired = false 
                AND t.revoked = false
            """)
    List<UserToken> findAllValidAccessTokensByUserId(Long userId);

    @Query("""
                SELECT t FROM UserToken t 
                WHERE t.user.id = :userId 
                AND t.type = com.feeling.infrastructure.entities.user.UserToken.TokenType.REFRESH
                AND t.expired = false 
                AND t.revoked = false
            """)
    List<UserToken> findAllValidRefreshTokensByUserId(Long userId);
}
