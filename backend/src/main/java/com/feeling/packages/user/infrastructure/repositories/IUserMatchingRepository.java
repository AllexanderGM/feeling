package com.feeling.packages.user.infrastructure.repositories;

import com.feeling.packages.user.infrastructure.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio especializado para lógica de matching y compatibilidad de usuarios.
 * Consolida métodos de búsqueda de usuarios compatibles basados en múltiples criterios.
 * <p>
 * Este repositorio fue creado para separar la responsabilidad de matching de los repositorios
 * de usuarios y tags, siguiendo el principio de responsabilidad única (SRP).
 *
 * @author J. Alexander Gavilán M.
 */
@Repository
public interface IUserMatchingRepository extends JpaRepository<User, Long> {

    // ========================================
    // MATCHING BASADO EN TAGS
    // ========================================

    /**
     * Encuentra usuarios con tags similares para matching.
     * Busca usuarios verificados y visibles en búsqueda que comparten tags.
     *
     * @param tagNames      Lista de nombres de tags a buscar
     * @param excludeEmail  Email del usuario a excluir de resultados
     * @param limit         Número máximo de resultados
     * @return Lista de emails de usuarios con tags similares, ordenados por popularidad
     */
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
     * Encuentra candidatos para matching basado en tags y categoría de interés.
     * Permite filtrar por categoría opcional para matching más específico.
     *
     * @param tagNames       Lista de nombres de tags a buscar
     * @param excludeEmail   Email del usuario a excluir de resultados
     * @param categoryFilter Categoría de interés opcional (puede ser null)
     * @param limit          Número máximo de resultados
     * @return Lista de emails de usuarios candidatos, ordenados por popularidad
     */
    @Query(value = """
            SELECT DISTINCT u.email FROM users u
            JOIN user_tag_relations ut ON u.id = ut.user_id
            JOIN user_tags t ON ut.tag_id = t.id
            LEFT JOIN user_category_interests uci ON u.category_interest_id = uci.id
            WHERE t.name IN :tagNames
            AND u.email != :excludeEmail
            AND u.show_me_in_search = true
            AND u.verified = true
            AND (:categoryFilter IS NULL OR uci.category_interest_enum = :categoryFilter)
            ORDER BY u.popularity_score DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<String> findMatchCandidatesByTags(
            @Param("tagNames") List<String> tagNames,
            @Param("excludeEmail") String excludeEmail,
            @Param("categoryFilter") String categoryFilter,
            @Param("limit") int limit);

    // ========================================
    // MATCHING AVANZADO CON MÚLTIPLES FILTROS
    // ========================================

    /**
     * Busca usuarios compatibles con filtros avanzados y ordenamiento por proximidad.
     * Incluye FETCH JOIN para evitar N+1 queries.
     * <p>
     * Orden de prioridad:
     * 1. Usuarios de la misma ciudad
     * 2. Usuarios del mismo departamento
     * 3. Otros usuarios ordenados por popularidad
     *
     * @param excludeUserId      ID del usuario a excluir
     * @param categoryInterestId ID de categoría de interés (opcional)
     * @param minAge             Edad mínima (opcional)
     * @param maxAge             Edad máxima (opcional)
     * @param city               Ciudad preferida (opcional)
     * @param department         Departamento preferido (opcional)
     * @param pageable           Configuración de paginación
     * @return Página de usuarios compatibles ordenados por proximidad y popularidad
     */
    @Query("SELECT DISTINCT u FROM User u " +
            "LEFT JOIN FETCH u.categoryInterest uci " +
            "LEFT JOIN FETCH u.userRole ur " +
            "WHERE u.verified = true " +
            "AND u.approvalStatus = 'APPROVED' " +
            "AND u.showMeInSearch = true " +
            "AND u.profileComplete = true " +
            "AND u.publicAccount = true " +
            "AND u.searchVisibility = true " +
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
    Page<User> findCompatibleUsers(
            @Param("excludeUserId") Long excludeUserId,
            @Param("categoryInterestId") Long categoryInterestId,
            @Param("minAge") Integer minAge,
            @Param("maxAge") Integer maxAge,
            @Param("city") String city,
            @Param("department") String department,
            Pageable pageable);
}
