package com.feeling.packages.auth.infrastructure.repositories;

import com.feeling.packages.auth.domain.enums.AuthTokenType;
import com.feeling.packages.auth.infrastructure.entities.AuthToken;
import com.feeling.packages.user.infrastructure.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para gestión de tokens JWT de autenticación.
 * <p>
 * Proporciona métodos optimizados para:
 * - Validación y búsqueda de tokens
 * - Gestión de tokens por usuario y tipo
 * - Limpieza automática de tokens expirados/revocados
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Repository
public interface IAuthTokenRepository extends JpaRepository<AuthToken, Long> {

    // ========================================
    // BÚSQUEDAS BÁSICAS
    // ========================================

    /**
     * Busca un token por su valor JWT.
     *
     * @param jwtToken Valor del token JWT
     * @return Optional con el token si existe
     */
    Optional<AuthToken> findTopByTokenOrderByCreatedAtDesc(String jwtToken);

    /**
     * Busca todos los tokens de un usuario específico.
     *
     * @param user Usuario propietario de los tokens
     * @return Lista de todos los tokens del usuario
     */
    List<AuthToken> findByUser(User user);

    // ========================================
    // BÚSQUEDAS AVANZADAS
    // ========================================

    /**
     * Busca todos los tokens válidos (no expirados ni revocados) de un usuario.
     *
     * @param userId ID del usuario
     * @return Lista de tokens válidos
     */
    @Query("""
                SELECT t FROM AuthToken t
                WHERE t.user.id = :userId
                AND t.expired = false
                AND t.revoked = false
            """)
    List<AuthToken> findAllValidTokensByUserId(@Param("userId") Long userId);

    /**
     * Busca todos los tokens de acceso válidos de un usuario.
     * Útil para revocación de sesiones activas.
     *
     * @param userId ID del usuario
     * @return Lista de tokens ACCESS válidos
     */
    @Query("""
                SELECT t FROM AuthToken t
                WHERE t.user.id = :userId
                AND t.type = com.feeling.packages.auth.domain.enums.AuthTokenType.ACCESS
                AND t.expired = false
                AND t.revoked = false
            """)
    List<AuthToken> findAllValidAccessTokensByUserId(@Param("userId") Long userId);

    /**
     * Busca todos los tokens de renovación válidos de un usuario.
     * Útil para gestión de refresh tokens activos.
     *
     * @param userId ID del usuario
     * @return Lista de tokens REFRESH válidos
     */
    @Query("""
                SELECT t FROM AuthToken t
                WHERE t.user.id = :userId
                AND t.type = com.feeling.packages.auth.domain.enums.AuthTokenType.REFRESH
                AND t.expired = false
                AND t.revoked = false
            """)
    List<AuthToken> findAllValidRefreshTokensByUserId(@Param("userId") Long userId);

    /**
     * Busca todos los tokens de un usuario filtrados por tipo.
     * Ordenados por fecha de creación descendente (más recientes primero).
     *
     * @param userId ID del usuario
     * @param tokenType Tipo de token (ACCESS o REFRESH)
     * @return Lista de tokens ordenados por fecha de creación
     */
    @Query("""
                SELECT t FROM AuthToken t
                WHERE t.user.id = :userId
                AND t.type = :tokenType
                ORDER BY t.createdAt DESC
            """)
    List<AuthToken> findAllTokensByUserIdAndType(@Param("userId") Long userId, @Param("tokenType") AuthTokenType tokenType);

    // ========================================
    // OPERACIONES DE LIMPIEZA
    // ========================================

    /**
     * Elimina tokens expirados o revocados anteriores a una fecha específica.
     * Utilizado por tarea programada de limpieza automática.
     *
     * @param cutoffDate Fecha límite (tokens anteriores serán eliminados)
     */
    @Modifying
    @Query("""
                DELETE FROM AuthToken t
                WHERE (t.expired = true OR t.revoked = true)
                AND t.createdAt < :cutoffDate
            """)
    void deleteExpiredAndRevokedTokensOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);
}
