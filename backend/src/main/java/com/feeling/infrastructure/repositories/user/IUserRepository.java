package com.feeling.infrastructure.repositories.user;

import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.entities.user.UserCategoryInterest;
import com.feeling.infrastructure.entities.user.UserCategoryInterestList;
import com.feeling.infrastructure.entities.user.UserRole;
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

@Repository
public interface IUserRepository extends JpaRepository<User, Long> {

    // ========================================
    // BÚSQUEDAS BÁSICAS
    // ========================================
    Optional<User> findByEmail(String email);

    boolean existsByUserRole(UserRole userRole);

    boolean existsByEmail(String email);

    // ========================================
    // BÚSQUEDAS POR ESTADO DE VERIFICACIÓN
    // ========================================
    List<User> findByVerifiedTrue();

    List<User> findByVerifiedFalse();

    List<User> findByProfileCompleteTrue();

    List<User> findByProfileCompleteFalse();

    // ========================================
    // BÚSQUEDAS POR APROBACIÓN
    // ========================================
    @Query("SELECT u FROM User u WHERE u.verified = true AND u.profileComplete = true AND u.approvalStatus = 'PENDING' AND u.accountDeactivated = false")
    Page<User> findPendingApprovalUsers(Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.verified = true AND u.profileComplete = false AND u.accountDeactivated = false")
    Page<User> findIncompleteProfileUsers(Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.approvalStatus = 'APPROVED'")
    List<User> findByApprovedTrue();

    @Query("SELECT u FROM User u WHERE u.approvalStatus != 'APPROVED'")
    List<User> findByApprovedFalse();

    // ========================================
    // BÚSQUEDAS POR CATEGORÍA DE INTERÉS
    // ========================================
    List<User> findByCategoryInterest(UserCategoryInterest categoryInterest);

    @Query("SELECT u FROM User u WHERE u.categoryInterest.categoryInterestEnum = :categoryInterest AND u.verified = true AND u.approvalStatus = 'APPROVED' AND u.showMeInSearch = true AND u.publicAccount = true AND u.searchVisibility = true AND u.accountDeactivated = false")
    List<User> findVerifiedUsersByCategory(@Param("categoryInterest") UserCategoryInterestList categoryInterest);

    // Si tienes consultas que usen String en lugar del enum:
    @Query("SELECT u FROM User u WHERE u.categoryInterest.categoryInterestEnum = :categoryInterest AND u.verified = true AND u.approvalStatus = 'APPROVED' AND u.showMeInSearch = true AND u.publicAccount = true AND u.searchVisibility = true AND u.accountDeactivated = false")
    List<User> findVerifiedUsersByCategoryString(@Param("categoryInterest") String categoryInterest);

    // ========================================
    // BÚSQUEDAS PARA MATCHING
    // ========================================
    @Query("SELECT u FROM User u WHERE " +
            "u.verified = true AND u.approvalStatus = 'APPROVED' AND u.showMeInSearch = true AND " +
            "u.categoryInterest = :categoryInterest AND " +
            "u.id != :excludeUserId AND " +
            "(:minAge IS NULL OR YEAR(CURRENT_DATE) - YEAR(u.dateOfBirth) >= :minAge) AND " +
            "(:maxAge IS NULL OR YEAR(CURRENT_DATE) - YEAR(u.dateOfBirth) <= :maxAge) AND " +
            "(:city IS NULL OR u.city = :city)")
    List<User> findPotentialMatches(
            @Param("categoryInterest") UserCategoryInterest categoryInterest,
            @Param("excludeUserId") Long excludeUserId,
            @Param("minAge") Integer minAge,
            @Param("maxAge") Integer maxAge,
            @Param("city") String city
    );

    // OPTIMIZACIÓN: Consulta con FETCH JOIN para evitar N+1
    @Query("SELECT DISTINCT u FROM User u " +
            "LEFT JOIN FETCH u.categoryInterest uci " +
            "LEFT JOIN FETCH u.userRole ur " +
            "WHERE u.verified = true AND u.approvalStatus = 'APPROVED' AND u.showMeInSearch = true " +
            "AND u.profileComplete = true AND u.publicAccount = true AND u.searchVisibility = true " +
            "AND u.accountDeactivated = false " +
            "AND u.id != :excludeUserId " +
            "AND (:categoryInterestId IS NULL OR uci.id = :categoryInterestId) " +
            "AND (:minAge IS NULL OR YEAR(CURRENT_DATE) - YEAR(u.dateOfBirth) >= :minAge) " +
            "AND (:maxAge IS NULL OR YEAR(CURRENT_DATE) - YEAR(u.dateOfBirth) <= :maxAge) " +
            "AND (:city IS NULL OR u.city = :city OR u.department = :department) " +
            "ORDER BY " +
            "CASE WHEN u.city = :city THEN 1 " +
            "     WHEN u.department = :department THEN 2 " +
            "     ELSE 3 END, " +
            "u.popularityScore DESC")
    Page<User> findCompatibleUsersOptimized(
            @Param("excludeUserId") Long excludeUserId,
            @Param("categoryInterestId") Long categoryInterestId,
            @Param("minAge") Integer minAge,
            @Param("maxAge") Integer maxAge,
            @Param("city") String city,
            @Param("department") String department,
            Pageable pageable
    );

    // Versión aleatoria para variedad (usar alternativamente)
    @Query(value = "SELECT u.* FROM users u " +
            "LEFT JOIN user_category_interests uci ON u.category_interest_id = uci.id " +
            "WHERE u.verified = true AND u.approval_status = 'APPROVED' AND u.show_me_in_search = true " +
            "AND u.profile_complete = true AND u.public_account = true AND u.search_visibility = true " +
            "AND u.account_deactivated = false " +
            "AND u.id != :excludeUserId " +
            "AND (:categoryInterestId IS NULL OR u.category_interest_id = :categoryInterestId) " +
            "AND (:minAge IS NULL OR YEAR(CURDATE()) - YEAR(u.date_of_birth) >= :minAge) " +
            "AND (:maxAge IS NULL OR YEAR(CURDATE()) - YEAR(u.date_of_birth) <= :maxAge) " +
            "AND (:city IS NULL OR u.city = :city OR u.department = :department) " +
            "ORDER BY RAND() " +
            "LIMIT :limit",
            nativeQuery = true)
    List<User> findCompatibleUsersRandomized(
            @Param("excludeUserId") Long excludeUserId,
            @Param("categoryInterestId") Long categoryInterestId,
            @Param("minAge") Integer minAge,
            @Param("maxAge") Integer maxAge,
            @Param("city") String city,
            @Param("department") String department,
            @Param("limit") int limit
    );

    // OPTIMIZACIÓN: Búsqueda con fetch join
    @Query("SELECT DISTINCT u FROM User u " +
            "LEFT JOIN FETCH u.userRole ur " +
            "LEFT JOIN FETCH u.categoryInterest uci " +
            "WHERE " +
            "LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<User> findBySearchTermOptimized(@Param("searchTerm") String searchTerm, Pageable pageable);

    // OPTIMIZACIÓN: Cargar usuario con todas las relaciones necesarias
    @Query("SELECT u FROM User u " +
            "LEFT JOIN FETCH u.userRole " +
            "LEFT JOIN FETCH u.categoryInterest " +
            "LEFT JOIN FETCH u.userTokens " +
            "WHERE u.email = :email")
    Optional<User> findByEmailWithRelations(@Param("email") String email);

    // OPTIMIZACIÓN: Usuarios con métricas pre-cargadas
    @Query("SELECT u FROM User u " +
            "LEFT JOIN FETCH u.userRole " +
            "WHERE u.verified = true " +
            "ORDER BY u.popularityScore DESC")
    Page<User> findMostPopularUsersOptimized(Pageable pageable);

    // ========================================
    // BÚSQUEDAS POR UBICACIÓN
    // ========================================
    List<User> findByCity(String city);

    List<User> findByDepartment(String department);

    List<User> findByCountry(String country);

    @Query("SELECT u FROM User u WHERE u.city = :city AND u.verified = true AND u.approvalStatus = 'APPROVED' AND u.showMeInSearch = true AND u.publicAccount = true AND u.searchVisibility = true AND u.accountDeactivated = false")
    List<User> findVerifiedUsersByCity(@Param("city") String city);

    // ========================================
    // BÚSQUEDAS POR ACTIVIDAD
    // ========================================
    @Query("SELECT u FROM User u WHERE u.lastActive >= :since ORDER BY u.lastActive DESC")
    List<User> findActiveUsersSince(@Param("since") LocalDateTime since);

    @Query("SELECT u FROM User u WHERE u.verified = true ORDER BY u.lastActive DESC")
    Page<User> findRecentlyActiveUsers(Pageable pageable);

    // ========================================
    // BÚSQUEDAS POR POPULARIDAD
    // ========================================

    // ========================================
    // ESTADÍSTICAS
    // ========================================

    /**
     * Cuenta usuarios por categoría de interés
     *
     * @param categoryInterest Categoría de interés
     * @return Número de usuarios en esa categoría
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.categoryInterest = :categoryInterest")
    Long countByCategoryInterest(@Param("categoryInterest") UserCategoryInterest categoryInterest);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since")
    long countNewUsersSince(@Param("since") LocalDateTime since);

    // ========================================
    // BÚSQUEDAS ADMINISTRATIVAS
    // ========================================
    @Query("SELECT u FROM User u WHERE u.userRole.userRoleList = 'ADMIN'")
    List<User> findAdminUsers();

    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<User> searchUsers(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.country) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.locality) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.categoryInterest.categoryInterestEnum) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.userRole.userRoleList) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<User> findBySearchTerm(@Param("searchTerm") String searchTerm, Pageable pageable);

    // ========================================
    // MÉTODOS PARA ANALYTICS BÁSICOS
    // ========================================

    @Query("SELECT COUNT(u) FROM User u WHERE u.verified = true")
    long countByVerifiedTrue();

    @Query("SELECT COUNT(u) FROM User u WHERE u.verified = false")
    long countByVerifiedFalse();

    @Query("SELECT COUNT(u) FROM User u WHERE u.approvalStatus = 'APPROVED'")
    long countByApprovedTrue();

    @Query("SELECT COUNT(u) FROM User u WHERE u.approvalStatus != 'APPROVED'")
    long countByApprovedFalse();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.approvalStatus = 'PENDING'")
    long countByPendingApproval();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.approvalStatus = 'REJECTED'")
    long countByRejected();

    @Query("SELECT COUNT(u) FROM User u WHERE u.profileComplete = true")
    long countByProfileCompleteTrue();

    @Query("SELECT COUNT(u) FROM User u WHERE u.profileComplete = false")
    long countByProfileCompleteFalse();

    @Query("SELECT COUNT(u) FROM User u WHERE u.lastActive >= :since")
    long countActiveUsersSince(@Param("since") LocalDateTime since);

    @Query("SELECT u.country, COUNT(u) FROM User u WHERE u.country IS NOT NULL GROUP BY u.country ORDER BY COUNT(u) DESC")
    List<Object[]> getUserCountByCountry();

    @Query("SELECT u.city, COUNT(u) FROM User u WHERE u.city IS NOT NULL GROUP BY u.city ORDER BY COUNT(u) DESC")
    List<Object[]> getUserCountByCity();

    // ========================================
    // CONSULTAS PARA ADMINISTRACIÓN DE USUARIOS
    // ========================================
    
    @Query("SELECT u FROM User u WHERE u.verified = true AND u.approvalStatus = 'APPROVED' AND u.profileComplete = true AND u.accountDeactivated = false")
    Page<User> findActiveUsers(Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.verified = false AND u.accountDeactivated = false")
    Page<User> findUnverifiedUsers(Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.verified = true AND u.approvalStatus = 'REJECTED' AND u.accountDeactivated = false")
    Page<User> findNonApprovedUsers(Pageable pageable);
    
    
    @Query("SELECT u FROM User u WHERE u.accountDeactivated = true")
    Page<User> findDeactivatedUsers(Pageable pageable);

    // ========================================
    // CONSULTAS PARA ADMINISTRACIÓN DE USUARIOS CON BÚSQUEDA
    // ========================================
    
    @Query("SELECT u FROM User u WHERE u.verified = true AND u.approvalStatus = 'APPROVED' AND u.profileComplete = true AND u.accountDeactivated = false AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.country) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.locality) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.categoryInterest.categoryInterestEnum) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.userRole.userRoleList) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<User> findActiveUsersWithSearch(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.verified = true AND u.profileComplete = true AND u.approvalStatus = 'PENDING' AND u.accountDeactivated = false AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.categoryInterest.categoryInterestEnum) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<User> findPendingApprovalUsersWithSearch(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.verified = false AND u.accountDeactivated = false AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<User> findUnverifiedUsersWithSearch(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.verified = true AND u.approvalStatus = 'REJECTED' AND u.accountDeactivated = false AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<User> findNonApprovedUsersWithSearch(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.accountDeactivated = true AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.country) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.locality) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.categoryInterest.categoryInterestEnum) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.userRole.userRoleList) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<User> findDeactivatedUsersWithSearch(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.verified = true AND u.profileComplete = false AND u.accountDeactivated = false AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<User> findIncompleteProfileUsersWithSearch(@Param("searchTerm") String searchTerm, Pageable pageable);

    // ========================================
    // ACTUALIZACIONES ESPECÍFICAS
    // ========================================
    @Modifying
    @Query("UPDATE User u SET u.lastActive = :lastActive, u.updatedAt = :updatedAt WHERE u.id = :userId")
    int updateLastActive(@Param("userId") Long userId, @Param("lastActive") LocalDateTime lastActive, @Param("updatedAt") LocalDateTime updatedAt);

    // ========================================
    // MÉTODOS PARA USUARIOS DE PRUEBA
    // ========================================
    
    /**
     * Cuenta usuarios que contienen el dominio especificado en su email
     * Útil para contar usuarios de prueba con @test-feeling.com
     */
    long countByEmailContaining(String emailDomain);
}
