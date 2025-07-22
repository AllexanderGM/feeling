package com.feeling.domain.ports.repositories;

import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.entities.user.UserCategoryInterest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Port para operaciones de usuario según Clean Architecture
 * Define el contrato que debe implementar la infraestructura
 */
public interface IUserPortRepository {

    // ========================================
    // OPERACIONES BÁSICAS CRUD
    // ========================================
    
    User save(User user);
    
    Optional<User> findById(Long id);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    void deleteById(Long id);
    
    long count();

    // ========================================
    // BÚSQUEDAS DE NEGOCIO
    // ========================================
    
    List<User> findVerifiedUsers();
    
    List<User> findByProfileCompleted(boolean completed);
    
    Page<User> findBySearchTerm(String searchTerm, Pageable pageable);
    
    Optional<User> findByEmailWithRelations(String email);

    // ========================================
    // MATCHING Y SUGERENCIAS
    // ========================================
    
    Page<User> findCompatibleUsers(
            Long excludeUserId,
            Long categoryInterestId,
            Integer minAge,
            Integer maxAge,
            String city,
            String department,
            Pageable pageable
    );
    
    List<User> findCompatibleUsersRandomized(
            Long excludeUserId,
            Long categoryInterestId,
            Integer minAge,
            Integer maxAge,
            String city,
            String department,
            int limit
    );

    // ========================================
    // ESTADÍSTICAS Y MÉTRICAS
    // ========================================
    
    long countVerifiedUsers();
    
    long countUsersWithCompleteProfile();
    
    long countNewUsersSince(LocalDateTime since);
    
    long countActiveUsersSince(LocalDateTime since);
    
    Long countByCategoryInterest(UserCategoryInterest categoryInterest);

    // ========================================
    // BÚSQUEDAS POR UBICACIÓN
    // ========================================
    
    List<User> findByCity(String city);
    
    List<User> findByDepartment(String department);
    
    List<User> findVerifiedUsersByCity(String city);

    // ========================================
    // BÚSQUEDAS POR ACTIVIDAD
    // ========================================
    
    List<User> findActiveUsersSince(LocalDateTime since);
    
    Page<User> findRecentlyActiveUsers(Pageable pageable);
    
    Page<User> findMostPopularUsers(Pageable pageable);

    // ========================================
    // OPERACIONES ADMINISTRATIVAS
    // ========================================
    
    List<User> findAdminUsers();
    
    int updateLastActive(Long userId, LocalDateTime lastActive, LocalDateTime updatedAt);
}