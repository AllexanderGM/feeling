package com.feeling.packages.auth.infrastructure.repositories;

import com.feeling.packages.auth.infrastructure.entities.AuthPasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repositorio para gestión de tokens de restablecimiento de contraseña.
 * <p>
 * Proporciona métodos optimizados para:
 * - Validación de tokens de recuperación
 * - Limpieza automática de tokens expirados
 * - Rate limiting (control de solicitudes por usuario)
 * - Gestión del ciclo de vida de tokens
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Repository
public interface IAuthPasswordResetTokenRepository extends JpaRepository<AuthPasswordResetToken, Long> {

    // ========================================
    // BÚSQUEDAS BÁSICAS
    // ========================================

    /**
     * Busca un token de restablecimiento por su valor.
     *
     * @param token Valor del token
     * @return Optional con el token si existe
     */
    Optional<AuthPasswordResetToken> findByToken(String token);

    // ========================================
    // BÚSQUEDAS AVANZADAS
    // ========================================

    /**
     * Busca el token activo más reciente de un usuario.
     * Un token es activo si no ha sido usado y no ha expirado.
     *
     * @param userId ID del usuario
     * @param now Fecha y hora actual para comparación
     * @return Optional con el token activo si existe
     */
    @Query("SELECT prt FROM AuthPasswordResetToken prt WHERE prt.user.id = :userId AND prt.used = false AND prt.expirationTime > :now")
    Optional<AuthPasswordResetToken> findActiveTokenByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    // ========================================
    // ESTADÍSTICAS Y RATE LIMITING
    // ========================================

    /**
     * Cuenta los tokens creados por un usuario desde una fecha específica.
     * Utilizado para rate limiting de solicitudes de restablecimiento.
     *
     * @param userId ID del usuario
     * @param since Fecha desde la cual contar
     * @return Cantidad de tokens creados desde la fecha indicada
     */
    @Query("SELECT COUNT(prt) FROM AuthPasswordResetToken prt WHERE prt.user.id = :userId AND prt.createdAt > :since")
    long countTokensCreatedSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    // ========================================
    // OPERACIONES DE LIMPIEZA
    // ========================================

    /**
     * Elimina todos los tokens de restablecimiento de un usuario.
     * Útil al desactivar cuenta o por seguridad.
     *
     * @param userId ID del usuario
     */
    @Modifying
    @Query("DELETE FROM AuthPasswordResetToken prt WHERE prt.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    /**
     * Elimina tokens expirados del sistema.
     * Utilizado por tarea programada de limpieza automática.
     *
     * @param now Fecha y hora actual
     */
    @Modifying
    @Query("DELETE FROM AuthPasswordResetToken prt WHERE prt.expirationTime < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
}
