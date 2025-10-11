package com.feeling.packages.user.infrastructure.repositories;

import com.feeling.packages.user.domain.enums.UserTagApprovalStatus;
import com.feeling.packages.user.infrastructure.entities.UserTag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
 * Repositorio para gestión de tags dinámicos de usuarios.
 * Proporciona métodos para búsquedas, tendencias, popularidad y sistema de aprobación de tags.
 * <p>
 * Los tags en Feeling son etiquetas dinámicas que los usuarios utilizan para:
 * - Describir sus intereses, hobbies y características
 * - Mejorar la precisión del sistema de matching
 * - Facilitar descubrimiento de usuarios con intereses similares
 * <p>
 * Características del sistema de tags:
 * - Sistema de aprobación: PENDING, APPROVED, REJECTED (ver {@link UserTagApprovalStatus})
 * - Contador de uso (usageCount) para medir popularidad
 * - Timestamp de último uso (lastUsed) para identificar tendencias
 * - Limpieza automática de tags sin uso
 * - Búsqueda de usuarios con tags similares para matching
 * <p>
 * Este repositorio maneja:
 * - Búsquedas básicas por nombre
 * - Análisis de popularidad y tendencias
 * - Búsquedas de texto y autocompletado
 * - Gestión de tags sin uso (limpieza)
 * - Estadísticas y análisis de uso
 * - Sistema de aprobación administrativa
 * - Actualización de métricas (usageCount, lastUsed)
 *
 * @author J. Alexander Gavilán M.
 * @see UserTag
 * @see UserTagApprovalStatus
 */
@Repository
public interface IUserTagRepository extends JpaRepository<UserTag, Long> {

    // ========================================
    // BÚSQUEDAS BÁSICAS
    // ========================================

    /**
     * Busca un tag por nombre (case-insensitive).
     * Útil para evitar duplicados al crear nuevos tags.
     *
     * @param name Nombre del tag a buscar (no sensible a mayúsculas/minúsculas)
     * @return Optional con el tag si existe, Optional.empty() si no
     */
    Optional<UserTag> findByNameIgnoreCase(String name);

    // Nota: Se eliminó el método existsByNameIgnoreCase por no tener uso en el sistema.

    // ========================================
    // BÚSQUEDAS POR POPULARIDAD Y TENDENCIAS
    // ========================================

    /**
     * Obtiene todos los tags ordenados por popularidad (usageCount descendente).
     * Útil para mostrar tags más usados en toda la plataforma.
     * OPTIMIZACIÓN: Carga optimizada de tags populares sin límite.
     *
     * @return Lista de tags ordenados por usageCount (más populares primero)
     */
    @Query("SELECT t FROM UserTag t ORDER BY t.usageCount DESC")
    List<UserTag> findMostPopularTags();

    // Nota: Se eliminó el método findMostPopularTagsLimited por no tener uso en el sistema.

    /**
     * Obtiene los N tags más populares con paginación.
     * Reemplaza nativeQuery con JPQL + Pageable para mejor consistencia y flexibilidad.
     *
     * @param pageable Configuración de paginación (page, size, sort)
     * @return Página de tags más populares ordenados por usageCount (descendente)
     */
    @Query("SELECT t FROM UserTag t ORDER BY t.usageCount DESC")
    Page<UserTag> findTopPopularTags(Pageable pageable);

    /**
     * Método de conveniencia para obtener N tags populares sin paginación.
     * Usa el método con Pageable internamente.
     *
     * @param limit Número máximo de tags a retornar
     * @return Lista de tags más populares limitada
     */
    default List<UserTag> findTopPopularTags(int limit) {
        return findTopPopularTags(PageRequest.of(0, limit)).getContent();
    }

    // Nota: Se eliminó el método findTopNewTags por no tener uso en el sistema.

    /**
     * Encuentra tags en tendencia basándose en uso reciente y popularidad mínima.
     * Un tag está en tendencia si ha sido usado recientemente y tiene uso significativo.
     *
     * @param minUsage Número mínimo de usos para considerar el tag
     * @param since    Fecha desde la cual el tag debe haber sido usado
     * @return Lista de tags en tendencia ordenados por popularidad (descendente)
     */
    @Query("SELECT t FROM UserTag t WHERE t.usageCount >= :minUsage AND t.lastUsed >= :since ORDER BY t.usageCount DESC")
    List<UserTag> findTrendingTags(@Param("minUsage") Long minUsage, @Param("since") LocalDateTime since);

    /**
     * Encuentra tags en tendencia con parámetros por defecto.
     * Busca tags con al menos 5 usos en la última semana.
     *
     * @return Lista de tags en tendencia en la última semana
     */
    default List<UserTag> findTrendingTags() {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        return findTrendingTags(5L, oneWeekAgo);
    }

    /**
     * Encuentra tags en tendencia desde una fecha específica.
     * Usa umbral de 3 usos mínimos.
     *
     * @param since Fecha desde la cual buscar tendencias
     * @return Lista de tags en tendencia desde la fecha especificada
     */
    default List<UserTag> findTrendingTags(LocalDateTime since) {
        return findTrendingTags(3L, since);
    }

    // ========================================
    // BÚSQUEDAS DE TEXTO
    // ========================================

    /**
     * Busca tags por nombre con búsqueda parcial (case-insensitive).
     * Útil para autocompletado y búsquedas de usuario.
     * Los resultados se ordenan por popularidad para mostrar tags más relevantes primero.
     *
     * @param searchTerm Término de búsqueda (se aplica LIKE con comodines)
     * @return Lista de tags que coinciden con el término, ordenados por popularidad (descendente)
     */
    @Query("SELECT t FROM UserTag t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY t.usageCount DESC")
    List<UserTag> searchByName(@Param("searchTerm") String searchTerm);

    /**
     * Busca tags por nombre o descripción con búsqueda parcial (case-insensitive).
     * Similar a searchByName pero preparado para búsqueda en múltiples campos.
     * Actualmente solo busca en nombre pero estructura permite expansión futura.
     *
     * @param searchTerm Término de búsqueda (se aplica LIKE con comodines)
     * @return Lista de tags que coinciden con el término, ordenados por popularidad (descendente)
     */
    @Query("SELECT t FROM UserTag t WHERE " +
        "LOWER(t.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
        "ORDER BY t.usageCount DESC")
    List<UserTag> searchByNameOrDescription(@Param("searchTerm") String searchTerm);

    /**
     * Alias para searchByName para compatibilidad con servicios existentes.
     *
     * @param searchTerm Término de búsqueda
     * @return Lista de tags que contienen el término en su nombre
     */
    default List<UserTag> searchByNameContaining(String searchTerm) {
        return searchByName(searchTerm);
    }

    // ========================================
    // GESTIÓN DE TAGS SIN USO
    // ========================================
    // Nota: Se eliminaron findUnusedTags, findOldUnusedTags y deleteOldUnusedTags por no tener uso.

    /**
     * Elimina todos los tags sin uso (usageCount = 0).
     * Útil para limpieza periódica de tags creados pero nunca asignados.
     * IMPORTANTE: Debe ejecutarse dentro de una transacción (@Transactional).
     *
     * @return Número de tags eliminados
     */
    @Modifying
    @Query("DELETE FROM UserTag t WHERE t.usageCount = 0")
    int deleteUnusedTags();

    /**
     * Elimina tags sin uso creados antes de una fecha específica.
     * Útil para limpiar tags antiguos que nunca fueron adoptados.
     * IMPORTANTE: Debe ejecutarse dentro de una transacción (@Transactional).
     *
     * @param olderThan Fecha límite - tags creados antes de esta fecha serán eliminados
     * @return Número de tags eliminados
     */
    @Modifying
    @Query("DELETE FROM UserTag t WHERE t.usageCount = 0 AND t.createdAt < :olderThan")
    int deleteUnusedTagsOlderThan(@Param("olderThan") LocalDateTime olderThan);

    // Nota: Se eliminó deleteAllUnusedTags() por ser duplicado idéntico de deleteUnusedTags().

    // ========================================
    // ANÁLISIS Y ESTADÍSTICAS
    // ========================================
    // Nota: Se eliminaron countAllTags, countTrendingTags (ambas versiones) y findByCreatedBy por no tener uso.

    /**
     * Cuenta tags activos (con al menos 1 uso).
     * Excluye tags creados pero nunca asignados a usuarios.
     *
     * @return Número de tags con usageCount > 0
     */
    @Query("SELECT COUNT(t) FROM UserTag t WHERE t.usageCount > 0")
    long countActiveTags();

    /**
     * Calcula el promedio de uso de tags activos.
     * Solo considera tags con al menos 1 uso.
     *
     * @return Promedio de usageCount de tags activos, null si no hay tags activos
     */
    @Query("SELECT AVG(t.usageCount) FROM UserTag t WHERE t.usageCount > 0")
    Double getAverageUsageCount();

    // Nota: Los métodos countUniqueUsersWithTags y getAverageTagsPerUser fueron movidos
    // a IUserRepository porque consultaban la entidad User, violando el principio de
    // responsabilidad única (SRP). Un repositorio de Tags no debería consultar Users.

    // ========================================
    // TAGS RELACIONADOS Y RECOMENDACIONES
    // ========================================
    // Nota: Se eliminaron findRelatedTags, findRelatedTagsLightweight y findSuggestedTagsForUser
    // por no tener uso (eran duplicados idénticos).

    /**
     * Sugiere tags populares excluyendo los ya usados por un usuario.
     * Útil para recomendar tags adicionales a usuarios.
     * Los resultados se ordenan por popularidad.
     *
     * @param excludedTags Lista de nombres de tags a excluir (generalmente los que ya tiene el usuario)
     * @return Lista de tags sugeridos ordenados por popularidad (descendente)
     */
    @Query("SELECT t FROM UserTag t WHERE t.name NOT IN :excludedTags AND t.usageCount > 0 ORDER BY t.usageCount DESC")
    List<UserTag> findSuggestedTagsExcluding(@Param("excludedTags") List<String> excludedTags);

    // ========================================
    // TAGS POR CATEGORÍA DE INTERÉS
    // ========================================

    /**
     * Encuentra los tags más populares dentro de una categoría de interés específica.
     * Útil para mostrar tags relevantes según el tipo de usuario (ESSENCE, SPIRIT, ADVENTURE).
     * Ordena por número de usuarios que usan cada tag dentro de esa categoría.
     *
     * @param category Nombre de la categoría de interés (ej: "ESSENCE", "SPIRIT", "ADVENTURE")
     * @param limit    Número máximo de tags a retornar
     * @return Lista de tags más populares en la categoría, ordenados por cantidad de usuarios que los usan
     */
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
    // Nota: Los métodos de matching de usuarios fueron movidos a IUserMatchingRepository
    // para seguir el principio de responsabilidad única (SRP).
    // Métodos movidos:
    // - findUsersWithSimilarTags
    // - findMatchCandidatesByTags

    // ========================================
    // ACTUALIZACIÓN DE MÉTRICAS
    // ========================================

    /**
     * Actualiza el contador de uso (usageCount) de todos los tags.
     * Recalcula el usageCount contando cuántos usuarios tienen asignado cada tag.
     * Útil para sincronizar métricas después de operaciones batch o inconsistencias.
     * IMPORTANTE: Debe ejecutarse dentro de una transacción (@Transactional).
     */
    @Modifying
    @Query("""
        UPDATE UserTag t SET t.usageCount = (
            SELECT COUNT(u) FROM User u JOIN u.tags ut WHERE ut.id = t.id
        )
        """)
    void updateUsageCounts();

    /**
     * Actualiza el timestamp de último uso (lastUsed) de todos los tags activos.
     * Solo actualiza tags con usageCount > 0.
     * IMPORTANTE: Debe ejecutarse dentro de una transacción (@Transactional).
     */
    @Modifying
    @Query("UPDATE UserTag t SET t.lastUsed = CURRENT_TIMESTAMP WHERE t.usageCount > 0")
    void updateActiveStatus();

    // Nota: La sección "MÉTODOS DE UTILIDAD ESPECÍFICOS PARA FEELING" fue eliminada.
    // Se eliminaron findPopularTagsByCity, findTrendingTagsByCategory,
    // findPremiumUsersWithSimilarTags y findMissingPopularTagsForUser por no tener uso.

    // ========================================
    // ADMINISTRACIÓN Y APROBACIÓN DE TAGS (NUEVO SISTEMA)
    // ========================================
    // Nota: Se eliminaron findByApprovalStatus (List), findApprovedTags, findPendingTagsByUser
    // y findPendingApprovalTagsPageable (método default) por no tener uso.

    /**
     * Busca tags por estado de aprobación con paginación.
     * Útil para panel administrativo de gestión de tags.
     *
     * @param approvalStatus Estado de aprobación (PENDING, APPROVED, REJECTED)
     * @param pageable       Configuración de paginación
     * @return Página de tags con el estado especificado
     */
    Page<UserTag> findByApprovalStatus(UserTagApprovalStatus approvalStatus, Pageable pageable);

    /**
     * Encuentra tags pendientes de aprobación.
     * Ordenados por fecha de creación (más antiguos primero = FIFO).
     * Útil para que administradores procesen tags en orden de llegada.
     *
     * @return Lista de tags con userApprovalStatus = PENDING ordenados por antigüedad
     */
    @Query("SELECT t FROM UserTag t WHERE t.approvalStatus = 'PENDING' ORDER BY t.createdAt ASC")
    List<UserTag> findPendingApprovalTags();

    /**
     * Cuenta tags por estado de aprobación.
     * Útil para métricas y dashboard administrativo.
     *
     * @param approvalStatus Estado de aprobación a contar
     * @return Número de tags con el estado especificado
     */
    long countByApprovalStatus(UserTagApprovalStatus approvalStatus);

    /**
     * Busca tags aprobados por término de búsqueda (case-insensitive).
     * Solo retorna tags con userApprovalStatus = APPROVED.
     * Los resultados se ordenan por popularidad.
     *
     * @param searchTerm Término de búsqueda (se aplica LIKE con comodines)
     * @return Lista de tags aprobados que coinciden con el término, ordenados por usageCount (descendente)
     */
    @Query("SELECT t FROM UserTag t WHERE t.approvalStatus = 'APPROVED' AND LOWER(t.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY t.usageCount DESC")
    List<UserTag> searchApprovedTagsByName(@Param("searchTerm") String searchTerm);

    /**
     * Obtiene los tags más populares que están aprobados.
     * Combina filtro de aprobación con ordenamiento por popularidad.
     * Usa Pageable para permitir paginación flexible.
     *
     * @param pageable Configuración de paginación (incluye límite y página)
     * @return Lista paginada de tags aprobados ordenados por usageCount (descendente)
     */
    @Query("SELECT t FROM UserTag t WHERE t.approvalStatus = 'APPROVED' ORDER BY t.usageCount DESC")
    List<UserTag> findTopApprovedPopularTags(Pageable pageable);
}
