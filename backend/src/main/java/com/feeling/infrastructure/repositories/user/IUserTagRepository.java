package com.feeling.infrastructure.repositories.user;

import com.feeling.infrastructure.entities.user.UserTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IUserTagRepository extends JpaRepository<UserTag, Long> {

    // ========================================
    // BÚSQUEDAS BÁSICAS
    // ========================================
    Optional<UserTag> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<UserTag> findByUsageCountGreaterThan(Long count);

    // ========================================
    // BÚSQUEDAS POR POPULARIDAD Y TENDENCIAS
    // ========================================
    @Query("SELECT t FROM UserTag t ORDER BY t.usageCount DESC")
    List<UserTag> findMostPopularTags();

    @Query(value = "SELECT t FROM UserTag t ORDER BY t.usageCount DESC")
    List<UserTag> findTopPopularTags(@Param("limit") int limit);

    @Query(value = "SELECT t FROM UserTag t WHERE t.createdAt >= :since ORDER BY t.usageCount DESC")
    List<UserTag> findTopNewTags(@Param("since") LocalDateTime since, @Param("limit") int limit);

    // Tags en tendencia (nuevo o con crecimiento reciente)
    @Query("SELECT t FROM UserTag t WHERE t.usageCount >= :minUsage AND t.lastUsed >= :since ORDER BY t.usageCount DESC")
    List<UserTag> findTrendingTags(@Param("minUsage") Long minUsage, @Param("since") LocalDateTime since);

    default List<UserTag> findTrendingTags() {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        return findTrendingTags(5L, oneWeekAgo);
    }

    // Sobrecarga para compatibilidad con el servicio
    default List<UserTag> findTrendingTags(LocalDateTime since) {
        return findTrendingTags(3L, since);
    }

    // ========================================
    // BÚSQUEDAS DE TEXTO
    // ========================================
    @Query("SELECT t FROM UserTag t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY t.usageCount DESC")
    List<UserTag> searchByName(@Param("searchTerm") String searchTerm);

    @Query("SELECT t FROM UserTag t WHERE " +
            "LOWER(t.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "ORDER BY t.usageCount DESC")
    List<UserTag> searchByNameOrDescription(@Param("searchTerm") String searchTerm);

    // Para compatibilidad con el servicio
    default List<UserTag> searchByNameContaining(String searchTerm) {
        return searchByName(searchTerm);
    }

    // ========================================
    // GESTIÓN DE TAGS SIN USO
    // ========================================
    @Query("SELECT t FROM UserTag t WHERE t.usageCount = 0")
    List<UserTag> findUnusedTags();

    @Modifying
    @Query("DELETE FROM UserTag t WHERE t.usageCount = 0")
    int deleteUnusedTags();

    @Query("SELECT t FROM UserTag t WHERE t.usageCount = 0 AND t.createdAt < :cutoffDate")
    List<UserTag> findOldUnusedTags(@Param("cutoffDate") LocalDateTime cutoffDate);

    @Modifying
    @Query("DELETE FROM UserTag t WHERE t.usageCount = 0 AND t.createdAt < :cutoffDate")
    int deleteOldUnusedTags(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Métodos adicionales para limpieza
    @Modifying
    @Query("DELETE FROM UserTag t WHERE t.usageCount = 0 AND t.createdAt < :olderThan")
    int deleteUnusedTagsOlderThan(@Param("olderThan") LocalDateTime olderThan);

    @Modifying
    @Query("DELETE FROM UserTag t WHERE t.usageCount = 0")
    int deleteAllUnusedTags();

    // ========================================
    // ANÁLISIS Y ESTADÍSTICAS
    // ========================================
    @Query("SELECT COUNT(t) FROM UserTag t")
    long countAllTags();

    @Query("SELECT COUNT(t) FROM UserTag t WHERE t.usageCount > 0")
    long countActiveTags();

    @Query("SELECT COUNT(t) FROM UserTag t WHERE t.usageCount >= :minUsage AND t.lastUsed >= :since")
    long countTrendingTags(@Param("minUsage") Long minUsage, @Param("since") LocalDateTime since);

    default long countTrendingTags() {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        return countTrendingTags(5L, oneWeekAgo);
    }

    @Query("SELECT AVG(t.usageCount) FROM UserTag t WHERE t.usageCount > 0")
    Double getAverageUsageCount();

    @Query("SELECT COUNT(DISTINCT u) FROM User u WHERE SIZE(u.tags) > 0")
    long countUniqueUsersWithTags();

    @Query("SELECT AVG(CAST(SIZE(u.tags) AS double)) FROM User u WHERE SIZE(u.tags) > 0")
    Double getAverageTagsPerUser();

    @Query("SELECT t FROM UserTag t WHERE t.createdBy = :userEmail ORDER BY t.createdAt DESC")
    List<UserTag> findByCreatedBy(@Param("userEmail") String userEmail);

    // ========================================
    // TAGS RELACIONADOS Y RECOMENDACIONES
    // ========================================
    @Query("SELECT DISTINCT t2 FROM UserTag t1 " +
            "JOIN t1.users u " +
            "JOIN u.tags t2 " +
            "WHERE t1.name = :tagName AND t2.name != :tagName " +
            "GROUP BY t2 " +
            "ORDER BY COUNT(t2) DESC")
    List<UserTag> findRelatedTags(@Param("tagName") String tagName);

    @Query(value = """
            SELECT t FROM UserTag t 
            WHERE t.id NOT IN (
                SELECT ut.id FROM User u 
                JOIN u.tags ut 
                WHERE u.email = :userEmail
            ) 
            ORDER BY t.usageCount DESC
            """)
    List<UserTag> findSuggestedTagsForUser(@Param("userEmail") String userEmail, @Param("limit") int limit);

    @Query("SELECT t FROM UserTag t WHERE t.name NOT IN :excludedTags AND t.usageCount > 0 ORDER BY t.usageCount DESC")
    List<UserTag> findSuggestedTagsExcluding(@Param("excludedTags") List<String> excludedTags, @Param("limit") int limit);

    // ========================================
    // TAGS POR CATEGORÍA DE INTERÉS
    // ========================================
    @Query("""
            SELECT t FROM UserTag t 
            JOIN t.users u 
            WHERE u.userCategoryInterest.categoryInterest = com.feeling.infrastructure.entities.user.UserCategoryInterestList.valueOf(:category)
            AND t.usageCount > 0 
            GROUP BY t 
            ORDER BY COUNT(u) DESC
            """)
    List<UserTag> findPopularTagsByCategory(@Param("category") String category, @Param("limit") int limit);

    // ========================================
    // MATCHING Y COMPATIBILIDAD
    // ========================================
    @Query("""
            SELECT DISTINCT u.email FROM User u 
            JOIN u.tags ut 
            WHERE ut.name IN :tagNames 
            AND u.email != :excludeEmail 
            AND u.showMeInSearch = true 
            AND u.verified = true
            ORDER BY u.popularityScore DESC
            """)
    List<String> findUsersWithSimilarTags(@Param("tagNames") List<String> tagNames, @Param("excludeEmail") String excludeEmail, @Param("limit") int limit);

    @Query("""
            SELECT DISTINCT u.email FROM User u 
            JOIN u.tags ut 
            WHERE ut.name IN :tagNames 
            AND u.email != :excludeEmail 
            AND u.showMeInSearch = true 
            AND u.verified = true
            AND (:categoryFilter IS NULL OR u.userCategoryInterest.categoryInterest = com.feeling.infrastructure.entities.user.UserCategoryInterestList.valueOf(:categoryFilter))
            ORDER BY u.popularityScore DESC
            """)
    List<String> findMatchCandidatesByTags(
            @Param("tagNames") List<String> tagNames,
            @Param("excludeEmail") String excludeEmail,
            @Param("categoryFilter") String categoryFilter,
            @Param("limit") int limit
    );

    // ========================================
    // ACTUALIZACIÓN DE MÉTRICAS
    // ========================================
    @Modifying
    @Query("""
            UPDATE UserTag t SET t.usageCount = (
                SELECT COUNT(u) FROM User u JOIN u.tags ut WHERE ut.id = t.id
            )
            """)
    void updateUsageCounts();

    @Modifying
    @Query("UPDATE UserTag t SET t.lastUsed = CURRENT_TIMESTAMP WHERE t.usageCount > 0")
    void updateActiveStatus();

    // ========================================
    // MÉTODOS DE UTILIDAD ESPECÍFICOS PARA FEELING
    // ========================================

    /**
     * Encuentra tags populares en una región específica
     */
    @Query("""
            SELECT t FROM UserTag t 
            JOIN t.users u 
            WHERE u.city = :city 
            AND t.usageCount > 0 
            GROUP BY t 
            ORDER BY COUNT(u) DESC
            """)
    List<UserTag> findPopularTagsByCity(@Param("city") String city, @Param("limit") int limit);

    /**
     * Encuentra tags que son tendencia en una categoría específica
     */
    @Query("""
            SELECT t FROM UserTag t 
            JOIN t.users u 
            WHERE u.userCategoryInterest.categoryInterest = com.feeling.infrastructure.entities.user.UserCategoryInterestList.valueOf(:category)
            AND t.lastUsed >= :since 
            AND t.usageCount >= :minUsage
            GROUP BY t 
            ORDER BY COUNT(u) DESC
            """)
    List<UserTag> findTrendingTagsByCategory(@Param("category") String category, @Param("since") LocalDateTime since, @Param("minUsage") Long minUsage);

    /**
     * Encuentra usuarios premium con tags similares (para matching VIP)
     */
    @Query("""
            SELECT DISTINCT u.email FROM User u 
            JOIN u.tags ut 
            WHERE ut.name IN :tagNames 
            AND u.email != :excludeEmail 
            AND u.availableAttempts > 0 
            AND u.verified = true
            ORDER BY u.popularityScore DESC
            """)
    List<String> findPremiumUsersWithSimilarTags(@Param("tagNames") List<String> tagNames, @Param("excludeEmail") String excludeEmail, @Param("limit") int limit);

    /**
     * Obtiene tags que un usuario específico no tiene pero que son populares en su categoría
     */
    @Query("""
            SELECT t FROM UserTag t 
            JOIN t.users u 
            WHERE u.userCategoryInterest.categoryInterest = (
                SELECT u2.userCategoryInterest.categoryInterest FROM User u2 WHERE u2.email = :userEmail
            )
            AND t.id NOT IN (
                SELECT ut.id FROM User u3 JOIN u3.tags ut WHERE u3.email = :userEmail
            )
            AND t.usageCount > 0
            GROUP BY t 
            ORDER BY COUNT(u) DESC
            """)
    List<UserTag> findMissingPopularTagsForUser(@Param("userEmail") String userEmail, @Param("limit") int limit);
}
