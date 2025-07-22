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
    // OPTIMIZACIÓN: Carga optimizada de tags populares
    @Query("SELECT t FROM UserTag t ORDER BY t.usageCount DESC")
    List<UserTag> findMostPopularTags();
    
    // OPTIMIZACIÓN: Tags populares con límite para paginación
    @Query(value = "SELECT * FROM user_tags t ORDER BY t.usage_count DESC LIMIT ?1", nativeQuery = true)
    List<UserTag> findMostPopularTagsLimited(int limit);

    @Query(value = "SELECT * FROM user_tags t ORDER BY t.usage_count DESC LIMIT ?1", nativeQuery = true)
    List<UserTag> findTopPopularTags(int limit);

    @Query(value = "SELECT * FROM user_tags t WHERE t.created_at >= ?1 ORDER BY t.usage_count DESC LIMIT ?2", nativeQuery = true)
    List<UserTag> findTopNewTags(LocalDateTime since, int limit);

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
    // OPTIMIZACIÓN: Carga relacionada optimizada sin FETCH JOIN para evitar conflictos
    @Query("SELECT DISTINCT t2 FROM UserTag t1 " +
            "JOIN t1.users u " +
            "JOIN u.tags t2 " +
            "WHERE t1.name = :tagName AND t2.name != :tagName " +
            "GROUP BY t2 " +
            "ORDER BY COUNT(t2) DESC")
    List<UserTag> findRelatedTags(@Param("tagName") String tagName);
    
    // OPTIMIZACIÓN: Versión simple sin FETCH para casos de solo IDs
    @Query("SELECT DISTINCT t2 FROM UserTag t1 " +
            "JOIN t1.users u " +
            "JOIN u.tags t2 " +
            "WHERE t1.name = :tagName AND t2.name != :tagName " +
            "GROUP BY t2 " +
            "ORDER BY COUNT(t2) DESC")
    List<UserTag> findRelatedTagsLightweight(@Param("tagName") String tagName);

    @Query(value = """
            SELECT t FROM UserTag t 
            WHERE t.id NOT IN (
                SELECT ut.id FROM User u 
                JOIN u.tags ut 
                WHERE u.email = :userEmail
            ) 
            ORDER BY t.usageCount DESC
            """)
    List<UserTag> findSuggestedTagsForUser(@Param("userEmail") String userEmail);

    @Query("SELECT t FROM UserTag t WHERE t.name NOT IN :excludedTags AND t.usageCount > 0 ORDER BY t.usageCount DESC")
    List<UserTag> findSuggestedTagsExcluding(@Param("excludedTags") List<String> excludedTags);

    // ========================================
    // TAGS POR CATEGORÍA DE INTERÉS
    // ========================================
    @Query(value = """
            SELECT t.* FROM user_tags t 
            JOIN user_tag_relations utr ON t.id = utr.tag_id
            JOIN users u ON utr.user_id = u.id 
            JOIN user_category_interest uci ON u.category_interest_id = uci.id
            WHERE uci.category_interest = :category
            AND t.usage_count > 0 
            GROUP BY t.id 
            ORDER BY COUNT(u.id) DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<UserTag> findPopularTagsByCategory(@Param("category") String category, @Param("limit") int limit);

    // ========================================
    // MATCHING Y COMPATIBILIDAD
    // ========================================
    @Query(value = """
            SELECT DISTINCT u.email FROM users u 
            JOIN user_tag_relations ut ON u.id = ut.user_id
            JOIN user_tags t ON ut.tag_id = t.id
            WHERE t.name IN :tagNames 
            AND u.email != :excludeEmail 
            AND u.show_me_in_search = true 
            AND u.verified = true
            ORDER BY u.popularity_score DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<String> findUsersWithSimilarTags(
            @Param("tagNames") List<String> tagNames,
            @Param("excludeEmail") String excludeEmail,
            @Param("limit") int limit);

    /**
     * Encuentra candidatos para matching basado en tags y categoría
     */
    @Query(value = """
            SELECT DISTINCT u.email FROM users u 
            JOIN user_tag_relations ut ON u.id = ut.user_id
            JOIN user_tags t ON ut.tag_id = t.id
            LEFT JOIN user_category_interest uci ON u.category_interest_id = uci.id
            WHERE t.name IN :tagNames 
            AND u.email != :excludeEmail 
            AND u.show_me_in_search = true 
            AND u.verified = true
            AND (:categoryFilter IS NULL OR uci.category_interest = :categoryFilter)
            ORDER BY u.popularity_score DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<String> findMatchCandidatesByTags(
            @Param("tagNames") List<String> tagNames,
            @Param("excludeEmail") String excludeEmail,
            @Param("categoryFilter") String categoryFilter,
            @Param("limit") int limit);

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
    @Query(value = """
            SELECT t.* FROM user_tags t 
            JOIN user_tag_relations ut ON t.id = ut.tag_id
            JOIN users u ON ut.user_id = u.id 
            WHERE u.city = :city 
            AND t.usage_count > 0 
            GROUP BY t.id 
            ORDER BY COUNT(u.id) DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<UserTag> findPopularTagsByCity(@Param("city") String city, @Param("limit") int limit);

    /**
     * Encuentra tags que son tendencia en una categoría específica
     */
    @Query(value = """
            SELECT t.* FROM user_tags t 
            JOIN user_tag_relations ut ON t.id = ut.tag_id
            JOIN users u ON ut.user_id = u.id 
            JOIN user_category_interest uci ON u.category_interest_id = uci.id
            WHERE uci.category_interest = :category
            AND t.last_used >= :since 
            AND t.usage_count >= :minUsage
            GROUP BY t.id 
            ORDER BY COUNT(u.id) DESC
            """, nativeQuery = true)
    List<UserTag> findTrendingTagsByCategory(
            @Param("category") String category,
            @Param("since") LocalDateTime since,
            @Param("minUsage") Long minUsage);

    /**
     * Encuentra usuarios premium con tags similares (para matching VIP)
     */
    @Query(value = """
            SELECT DISTINCT u.email FROM users u 
            JOIN user_tag_relations ut ON u.id = ut.user_id
            JOIN user_tags t ON ut.tag_id = t.id
            WHERE t.name IN :tagNames 
            AND u.email != :excludeEmail 
            AND u.available_attempts > 0 
            AND u.verified = true
            ORDER BY u.popularity_score DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<String> findPremiumUsersWithSimilarTags(
            @Param("tagNames") List<String> tagNames,
            @Param("excludeEmail") String excludeEmail,
            @Param("limit") int limit);

    /**
     * Obtiene tags que un usuario específico no tiene pero que son populares en su categoría
     */
    @Query(value = """
            SELECT t.* FROM user_tags t 
            JOIN user_tag_relations ut ON t.id = ut.tag_id
            JOIN users u ON ut.user_id = u.id 
            JOIN user_category_interest uci ON u.category_interest_id = uci.id
            WHERE uci.category_interest = (
                SELECT uci2.category_interest FROM users u2 
                JOIN user_category_interest uci2 ON u2.category_interest_id = uci2.id
                WHERE u2.email = :userEmail
            )
            AND t.id NOT IN (
                SELECT t2.id FROM users u3 
                JOIN user_tag_relations ut3 ON u3.id = ut3.user_id
                JOIN user_tags t2 ON ut3.tag_id = t2.id
                WHERE u3.email = :userEmail
            )
            AND t.usage_count > 0
            GROUP BY t.id 
            ORDER BY COUNT(u.id) DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<UserTag> findMissingPopularTagsForUser(@Param("userEmail") String userEmail, @Param("limit") int limit);

}
