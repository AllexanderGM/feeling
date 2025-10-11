package com.feeling.packages.auth.infrastructure.repositories;

import com.feeling.packages.auth.infrastructure.entities.AuthVerificationCode;
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
 * Repositorio para gestión de códigos de verificación.
 * <p>
 * Proporciona métodos optimizados para:
 * - Validación de códigos de verificación
 * - Verificación de email en registro
 * - Autenticación de dos factores (2FA)
 * - Limpieza automática de códigos expirados
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Repository
public interface IAuthVerificationCodeRepository extends JpaRepository<AuthVerificationCode, Long> {

    // ========================================
    // BÚSQUEDAS BÁSICAS
    // ========================================

    /**
     * Busca un código de verificación por su valor.
     *
     * @param code Valor del código
     * @return Optional con el código si existe
     */
    Optional<AuthVerificationCode> findByCode(String code);

    /**
     * Busca el código de verificación de un usuario por su ID.
     * Útil cuando se espera un código único por usuario.
     *
     * @param userId ID del usuario
     * @return Optional con el código si existe
     */
    Optional<AuthVerificationCode> findByUserId(Long userId);

    // ========================================
    // BÚSQUEDAS AVANZADAS
    // ========================================

    /**
     * Busca un código específico asociado a un usuario.
     * Proporciona validación combinada de usuario y código.
     *
     * @param user Usuario propietario del código
     * @param code Valor del código a buscar
     * @return Optional con el código si existe y pertenece al usuario
     */
    Optional<AuthVerificationCode> findByUserAndCode(User user, String code);

    /**
     * Busca el código activo más reciente de un usuario.
     * Un código es activo si no ha sido verificado y no ha expirado.
     *
     * @param userId ID del usuario
     * @param now Fecha y hora actual para comparación
     * @return Optional con el código activo si existe
     */
    @Query("SELECT vc FROM AuthVerificationCode vc WHERE vc.user.id = :userId AND vc.verified = false AND vc.expirationTime > :now ORDER BY vc.createdAt DESC")
    Optional<AuthVerificationCode> findActiveCodeByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    // ========================================
    // OPERACIONES DE LIMPIEZA
    // ========================================

    /**
     * Busca códigos expirados para limpieza.
     * Este método es usado para identificar códigos a eliminar.
     *
     * @param dateTime Fecha límite (códigos anteriores están expirados)
     * @return Lista de códigos expirados
     */
    List<AuthVerificationCode> findByExpirationTimeBefore(LocalDateTime dateTime);

    /**
     * Elimina códigos expirados del sistema.
     * Utilizado por tarea programada de limpieza automática.
     *
     * @param now Fecha y hora actual
     */
    @Modifying
    @Query("DELETE FROM AuthVerificationCode vc WHERE vc.expirationTime < :now")
    void deleteExpiredCodes(@Param("now") LocalDateTime now);

    /**
     * Elimina todos los códigos de verificación de un usuario.
     * Útil al desactivar cuenta o regenerar código.
     *
     * @param userId ID del usuario
     */
    @Modifying
    @Query("DELETE FROM AuthVerificationCode vc WHERE vc.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    // ========================================
    // ESTADÍSTICAS Y RATE LIMITING
    // ========================================

    /**
     * Cuenta los códigos creados por un usuario desde una fecha específica.
     * Utilizado para rate limiting de solicitudes de verificación.
     *
     * @param userId ID del usuario
     * @param since Fecha desde la cual contar
     * @return Cantidad de códigos creados desde la fecha indicada
     */
    @Query("SELECT COUNT(vc) FROM AuthVerificationCode vc WHERE vc.user.id = :userId AND vc.createdAt > :since")
    long countCodesCreatedSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);
}
