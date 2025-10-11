package com.feeling.packages.user.infrastructure.repositories;

import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.entities.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para gestión de usuarios.
 * Proporciona métodos para búsquedas optimizadas, filtrado avanzado y estadísticas.
 *
 * @author J. Alexander Gavilán M.
 */
@Repository
public interface IUserRepository extends JpaRepository<User, Long> {

    // ========================================
    // BÚSQUEDAS BÁSICAS
    // ========================================

    /**
     * Busca un usuario por email.
     *
     * @param email Email del usuario (único en el sistema)
     * @return Optional con el usuario si existe, Optional.empty() si no
     */
    Optional<User> findByEmail(String email);

    /**
     * Busca un usuario por ID con sus tags pre-cargados.
     * Incluye FETCH JOIN para evitar N+1 queries.
     *
     * @param userId ID del usuario
     * @return Optional con el usuario y sus tags si existe, Optional.empty() si no
     */
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.tags WHERE u.id = :userId")
    Optional<User> findByIdWithTags(@Param("userId") Long userId);

    /**
     * Verifica si existe un usuario con el email especificado.
     *
     * @param email Email a verificar
     * @return true si existe al menos un usuario con ese email, false si no
     */
    boolean existsByEmail(String email);

    /**
     * Verifica si un email está disponible para registro.
     * Es equivalente a !existsByEmail pero con semántica positiva.
     *
     * @param email Email a verificar
     * @return true si el email está disponible (no existe), false si ya está registrado
     */
    default boolean isEmailAvailable(String email) {
        return !existsByEmail(email);
    }

    // ========================================
    // BÚSQUEDAS ADMINISTRATIVAS
    // ========================================

    /**
     * Búsqueda general de usuarios por término en múltiples campos.
     * Busca en: nombre, apellido, email, ubicación (país, ciudad, localidad), categoría de interés y rol.
     * Incluye FETCH JOIN para evitar N+1 queries en role, categoryInterest y tags.
     * Búsqueda case-insensitive usando LOWER() en todos los campos de texto.
     *
     * @param searchTerm Término de búsqueda (case-insensitive, se aplica LIKE con comodines)
     * @param pageable   Configuración de paginación
     * @return Página de usuarios que coinciden con el término, ordenados por fecha de creación (más recientes primero)
     */
    @Query("SELECT DISTINCT u FROM User u " +
        "LEFT JOIN FETCH u.userRole " +
        "LEFT JOIN FETCH u.categoryInterest " +
        "LEFT JOIN FETCH u.tags " +
        "WHERE " +
        "LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.country) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.locality) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.categoryInterest.categoryInterestEnum) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.userRole.userRoleList) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
        "ORDER BY u.createdAt DESC")
    Page<User> findBySearchTerm(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Busca usuarios pendientes de aprobación administrativa con búsqueda opcional.
     * Filtra por: verified = true, profileComplete = true, userApprovalStatus = PENDING, accountDeactivated = false.
     * Solo incluye usuarios que completaron su perfil y esperan revisión del administrador.
     * Incluye FETCH JOIN para tags.
     *
     * @param searchTerm Término de búsqueda opcional (puede ser null), busca en nombre, apellido, email y categoría
     * @param pageable   Configuración de paginación
     * @return Página de usuarios pendientes de aprobación, ordenados por fecha de creación (más antiguos primero = FIFO)
     */
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.tags " +
        "WHERE u.verified = true AND u.profileComplete = true AND u.userApprovalStatus = 'PENDING' AND u.accountDeactivated = false " +
        "AND (:searchTerm IS NULL OR " +
        "LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.categoryInterest.categoryInterestEnum) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
        "ORDER BY u.createdAt DESC")
    Page<User> findPendingApprovalUsers(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Busca usuarios verificados con perfil incompleto con búsqueda opcional.
     * Filtra por: verified = true, profileComplete = false, accountDeactivated = false.
     * Útil para identificar usuarios que verificaron email pero no completaron su perfil.
     * Incluye FETCH JOIN para tags.
     *
     * @param searchTerm Término de búsqueda opcional (puede ser null), busca en nombre, apellido y email
     * @param pageable   Configuración de paginación
     * @return Página de usuarios con perfil incompleto, ordenados por fecha de creación (más recientes primero)
     */
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.tags " +
        "WHERE u.verified = true AND u.profileComplete = false AND u.accountDeactivated = false " +
        "AND (:searchTerm IS NULL OR " +
        "LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
        "ORDER BY u.createdAt DESC")
    Page<User> findIncompleteProfileUsers(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Busca usuarios activos en la plataforma con búsqueda opcional.
     * Filtra por: verified = true, userApprovalStatus = APPROVED, profileComplete = true, accountDeactivated = false.
     * Incluye FETCH JOIN para tags.
     * Busca en todos los campos relevantes: identificación, ubicación, categoría y rol.
     *
     * @param searchTerm Término de búsqueda opcional (puede ser null)
     * @param pageable   Configuración de paginación
     * @return Página de usuarios activos, ordenados por fecha de creación (más recientes primero)
     */
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.tags " +
        "WHERE u.verified = true AND u.userApprovalStatus = 'APPROVED' AND u.profileComplete = true AND u.accountDeactivated = false " +
        "AND (:searchTerm IS NULL OR " +
        "LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.country) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.locality) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.categoryInterest.categoryInterestEnum) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.userRole.userRoleList) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
        "ORDER BY u.createdAt DESC")
    Page<User> findActiveUsers(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Busca usuarios no verificados con búsqueda opcional.
     * Filtra por: verified = false, accountDeactivated = false.
     * Útil para identificar usuarios que no han verificado su email.
     * Incluye FETCH JOIN para tags.
     *
     * @param searchTerm Término de búsqueda opcional (puede ser null), busca en nombre, apellido y email
     * @param pageable   Configuración de paginación
     * @return Página de usuarios no verificados, ordenados por fecha de creación (más recientes primero)
     */
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.tags " +
        "WHERE u.verified = false AND u.accountDeactivated = false " +
        "AND (:searchTerm IS NULL OR " +
        "LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
        "ORDER BY u.createdAt DESC")
    Page<User> findUnverifiedUsers(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Busca usuarios rechazados con búsqueda opcional.
     * Filtra por: verified = true, userApprovalStatus = REJECTED, accountDeactivated = false.
     * Útil para revisión administrativa de usuarios rechazados.
     * Incluye FETCH JOIN para tags.
     *
     * @param searchTerm Término de búsqueda opcional (puede ser null), busca en nombre, apellido y email
     * @param pageable   Configuración de paginación
     * @return Página de usuarios rechazados, ordenados por fecha de creación (más recientes primero)
     */
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.tags " +
        "WHERE u.verified = true AND u.userApprovalStatus = 'REJECTED' AND u.accountDeactivated = false " +
        "AND (:searchTerm IS NULL OR " +
        "LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
        "ORDER BY u.createdAt DESC")
    Page<User> findNonApprovedUsers(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Busca usuarios desactivados con búsqueda opcional.
     * Filtra por: accountDeactivated = true.
     * Incluye FETCH JOIN para tags.
     * Busca en todos los campos relevantes: identificación, ubicación, categoría y rol.
     *
     * @param searchTerm Término de búsqueda opcional (puede ser null)
     * @param pageable   Configuración de paginación
     * @return Página de usuarios desactivados, ordenados por fecha de creación (más recientes primero)
     */
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.tags " +
        "WHERE u.accountDeactivated = true " +
        "AND (:searchTerm IS NULL OR " +
        "LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.country) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.locality) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.categoryInterest.categoryInterestEnum) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.userRole.userRoleList) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
        "ORDER BY u.createdAt DESC")
    Page<User> findDeactivatedUsers(@Param("searchTerm") String searchTerm, Pageable pageable);

    // ========================================
    // ESTADÍSTICAS - CONTADORES
    // ========================================
    // Nota: Se eliminaron countByCategoryInterest, countByApprovedTrue y countByApprovedFalse
    // por no tener uso.

    /**
     * Cuenta nuevos usuarios registrados desde una fecha específica.
     *
     * @param since Fecha desde la cual contar
     * @return Número de usuarios creados desde esa fecha
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since")
    long countNewUsersSince(@Param("since") LocalDateTime since);

    /**
     * Cuenta usuarios verificados.
     *
     * @return Número de usuarios con verified = true
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.verified = true")
    long countByVerifiedTrue();

    /**
     * Cuenta usuarios no verificados (excluyendo desactivados).
     *
     * @return Número de usuarios con verified = false y accountDeactivated = false
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.verified = false AND u.accountDeactivated = false")
    long countByVerifiedFalse();


    /**
     * Cuenta usuarios pendientes de aprobación.
     * Solo incluye usuarios verificados con perfil completo.
     *
     * @return Número de usuarios en estado PENDING
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.verified = true AND u.profileComplete = true AND u.userApprovalStatus = 'PENDING' AND u.accountDeactivated = false")
    long countByPendingApproval();

    /**
     * Cuenta usuarios rechazados.
     * Solo incluye usuarios verificados no desactivados.
     *
     * @return Número de usuarios con userApprovalStatus = 'REJECTED'
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.verified = true AND u.userApprovalStatus = 'REJECTED' AND u.accountDeactivated = false")
    long countByRejected();

    /**
     * Cuenta usuarios no aprobados (ni aprobados, ni pendientes, ni rechazados).
     * Incluye usuarios que aún no han alcanzado el estado de revisión.
     *
     * @return Número de usuarios sin userApprovalStatus = 'APPROVED'
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.userApprovalStatus != 'APPROVED' AND u.accountDeactivated = false")
    long countNonApprovedUsers();

    /**
     * Cuenta usuarios con perfil completo.
     *
     * @return Número de usuarios con profileComplete = true
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.profileComplete = true")
    long countByProfileCompleteTrue();

    /**
     * Cuenta usuarios verificados con perfil incompleto.
     *
     * @return Número de usuarios verificados con profileComplete = false
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.verified = true AND u.profileComplete = false AND u.accountDeactivated = false")
    long countByProfileCompleteFalse();

    /**
     * Encuentra usuarios verificados con perfil incompleto y cuenta activa.
     * Útil para envío de recordatorios masivos de completar perfil.
     *
     * @return Lista de usuarios que cumplen los criterios
     */
    List<User> findByVerifiedTrueAndProfileCompleteFalseAndAccountDeactivatedFalse();

    /**
     * Cuenta usuarios activos desde una fecha específica.
     *
     * @param since Fecha desde la cual contar actividad
     * @return Número de usuarios con lastActive >= since
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.lastActive >= :since")
    long countActiveUsersSince(@Param("since") LocalDateTime since);

    /**
     * Cuenta usuarios activos en la plataforma.
     * Solo incluye verificados, aprobados, con perfil completo y no desactivados.
     *
     * @return Número de usuarios activos
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.verified = true AND u.userApprovalStatus = 'APPROVED' AND u.profileComplete = true AND u.accountDeactivated = false")
    long countActiveUsers();

    /**
     * Cuenta usuarios desactivados.
     *
     * @return Número de usuarios con accountDeactivated = true
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.accountDeactivated = true")
    long countDeactivatedUsers();

    /**
     * Cuenta usuarios que contienen un dominio específico en su email.
     * Útil para contar usuarios de prueba con @test-feeling.com.
     *
     * @param emailDomain Dominio a buscar en emails
     * @return Número de usuarios con ese dominio
     */
    long countByEmailContaining(String emailDomain);

    // ========================================
    // ESTADÍSTICAS - AGREGADOS
    // ========================================

    /**
     * Obtiene distribución de usuarios por país.
     * Retorna pares [país, cantidad] ordenados por cantidad (descendente).
     *
     * @return Lista de Object[] donde [0] = país (String), [1] = cantidad (Long)
     */
    @Query("SELECT u.country, COUNT(u) FROM User u WHERE u.country IS NOT NULL GROUP BY u.country ORDER BY COUNT(u) DESC")
    List<Object[]> getUserCountByCountry();

    /**
     * Obtiene distribución de usuarios por ciudad.
     * Retorna pares [ciudad, cantidad] ordenados por cantidad (descendente).
     *
     * @return Lista de Object[] donde [0] = ciudad (String), [1] = cantidad (Long)
     */
    @Query("SELECT u.city, COUNT(u) FROM User u WHERE u.city IS NOT NULL GROUP BY u.city ORDER BY COUNT(u) DESC")
    List<Object[]> getUserCountByCity();

    /**
     * Cuenta cuántos usuarios tienen al menos un tag asignado.
     * Métrica útil para medir adopción del sistema de tags.
     * Movido desde IUserTagRepository para cumplir con SRP.
     *
     * @return Número de usuarios únicos que tienen al menos un tag
     */
    @Query("SELECT COUNT(DISTINCT u) FROM User u WHERE SIZE(u.tags) > 0")
    long countUniqueUsersWithTags();

    /**
     * Calcula el promedio de tags por usuario.
     * Solo considera usuarios que tienen al menos un tag.
     * Métrica útil para medir engagement con el sistema de tags.
     * Movido desde IUserTagRepository para cumplir con SRP.
     *
     * @return Promedio de tags por usuario, null si ningún usuario tiene tags
     */
    @Query("SELECT AVG(CAST(SIZE(u.tags) AS double)) FROM User u WHERE SIZE(u.tags) > 0")
    Double getAverageTagsPerUser();

    // ========================================
    // ACTUALIZACIONES
    // ========================================

    /**
     * Actualiza la última fecha de actividad de un usuario.
     * También actualiza el timestamp de updatedAt automáticamente.
     * <p>
     * IMPORTANTE: Este método DEBE ejecutarse dentro de una transacción activa.
     * El servicio que invoque este método debe estar anotado con @Transactional,
     * de lo contrario la actualización no se persistirá en la base de datos.
     * <p>
     * Uso típico:
     * <pre>
     * {@code
     * @Transactional
     * public void updateUserActivity(Long userId) {
     *     LocalDateTime now = LocalDateTime.now();
     *     userRepository.updateLastActive(userId, now, now);
     * }
     * }
     * </pre>
     *
     * @param userId     ID del usuario a actualizar
     * @param lastActive Nueva fecha de última actividad
     * @param updatedAt  Nueva fecha de actualización
     * @return Número de registros actualizados (0 si el usuario no existe, 1 si se actualizó)
     */
    @Modifying
    @Query("UPDATE User u SET u.lastActive = :lastActive, u.updatedAt = :updatedAt WHERE u.id = :userId")
    int updateLastActive(@Param("userId") Long userId, @Param("lastActive") LocalDateTime lastActive, @Param("updatedAt") LocalDateTime updatedAt);

    // ========================================
    // CONSULTAS POR ROL
    // ========================================

    /**
     * Busca usuarios por rol específico con paginación.
     *
     * @param userRole Rol a buscar
     * @param pageable Configuración de paginación
     * @return Página de usuarios con ese rol
     */
    Page<User> findByUserRole(UserRole userRole, Pageable pageable);

    /**
     * Cuenta usuarios por rol específico.
     *
     * @param userRole Rol a contar
     * @return Número de usuarios con ese rol
     */
    long countByUserRole(UserRole userRole);
}
