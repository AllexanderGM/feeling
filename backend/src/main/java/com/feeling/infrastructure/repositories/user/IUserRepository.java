package com.feeling.infrastructure.repositories.user;

import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.entities.user.UserCategoryInterest;
import com.feeling.infrastructure.entities.user.UserCategoryInterestList;
import com.feeling.infrastructure.entities.user.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
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
    // BÚSQUEDAS POR CATEGORÍA DE INTERÉS
    // ========================================
    List<User> findByUserCategoryInterest(UserCategoryInterest categoryInterest);

    @Query("SELECT u FROM User u WHERE u.userCategoryInterest.categoryInterestEnum = :categoryInterest AND u.verified = true AND u.showMeInSearch = true")
    List<User> findVerifiedUsersByCategory(@Param("categoryInterest") UserCategoryInterestList categoryInterest);

    // Si tienes consultas que usen String en lugar del enum:
    @Query("SELECT u FROM User u WHERE u.userCategoryInterest.categoryInterestEnum = :categoryInterest AND u.verified = true AND u.showMeInSearch = true")
    List<User> findVerifiedUsersByCategoryString(@Param("categoryInterest") String categoryInterest);

    // ========================================
    // BÚSQUEDAS PARA MATCHING
    // ========================================
    @Query("SELECT u FROM User u WHERE " +
            "u.verified = true AND u.showMeInSearch = true AND " +
            "u.userCategoryInterest = :categoryInterest AND " +
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

    // ========================================
    // BÚSQUEDAS POR UBICACIÓN
    // ========================================
    List<User> findByCity(String city);

    List<User> findByDepartment(String department);

    List<User> findByCountry(String country);

    @Query("SELECT u FROM User u WHERE u.city = :city AND u.verified = true AND u.showMeInSearch = true")
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
    @Query("SELECT u FROM User u WHERE u.verified = true ORDER BY u.popularityScore DESC")
    Page<User> findMostPopularUsers(Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.verified = true ORDER BY u.profileViews DESC")
    Page<User> findMostViewedUsers(Pageable pageable);

    // ========================================
    // ESTADÍSTICAS
    // ========================================
    long countByVerifiedTrue();

    long countByProfileCompleteTrue();

    /**
     * Cuenta usuarios por categoría de interés
     *
     * @param categoryInterest Categoría de interés
     * @return Número de usuarios en esa categoría
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.userCategoryInterest = :categoryInterest")
    Long countByUserCategoryInterest(@Param("categoryInterest") UserCategoryInterest categoryInterest);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since")
    long countNewUsersSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(u) FROM User u WHERE u.lastActive >= :since")
    long countActiveUsersSince(@Param("since") LocalDateTime since);

    // ========================================
    // BÚSQUEDAS ADMINISTRATIVAS
    // ========================================
    @Query("SELECT u FROM User u WHERE u.userRole.userRoleList = 'ADMIN'")
    List<User> findAdminUsers();

    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.lastname) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<User> searchUsers(@Param("searchTerm") String searchTerm, Pageable pageable);
}
