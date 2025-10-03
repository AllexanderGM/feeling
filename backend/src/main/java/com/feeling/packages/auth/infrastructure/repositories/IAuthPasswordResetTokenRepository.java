package com.feeling.packages.auth.infrastructure.repositories;

import com.feeling.packages.auth.infrastructure.entities.AuthPasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface IAuthPasswordResetTokenRepository extends JpaRepository<AuthPasswordResetToken, Long> {

    /**
     * Buscar token por valor
     */
    Optional<AuthPasswordResetToken> findByToken(String token);

    /**
     * Eliminar todos los tokens de un usuario
     */
    @Modifying
    @Query("DELETE FROM AuthPasswordResetToken prt WHERE prt.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    /**
     * Buscar tokens activos de un usuario
     */
    @Query("SELECT prt FROM AuthPasswordResetToken prt WHERE prt.user.id = :userId AND prt.used = false AND prt.expirationTime > :now")
    Optional<AuthPasswordResetToken> findActiveTokenByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    /**
     * Limpiar tokens expirados (para tarea programada)
     */
    @Modifying
    @Query("DELETE FROM AuthPasswordResetToken prt WHERE prt.expirationTime < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);

    /**
     * Contar tokens activos de un usuario (para rate limiting)
     */
    @Query("SELECT COUNT(prt) FROM AuthPasswordResetToken prt WHERE prt.user.id = :userId AND prt.createdAt > :since")
    long countTokensCreatedSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);
}
