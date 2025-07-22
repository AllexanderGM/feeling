package com.feeling.infrastructure.repositories.user;

import com.feeling.infrastructure.entities.user.UserAttribute;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IUserAttributeRepository extends JpaRepository<UserAttribute, Long> {

    // ========================================
    // BÚSQUEDAS BÁSICAS (LEGACY - MANTENER COMPATIBILIDAD)
    // ========================================
    Optional<UserAttribute> findByCodeAndAttributeType(String code, String attributeType);
    List<UserAttribute> findByAttributeTypeAndActiveTrue(String attributeType);
    List<UserAttribute> findByActiveTrue();
    long countByAttributeType(String attributeType);

    @Query("SELECT ua FROM UserAttribute ua WHERE ua.attributeType = :attributeType AND ua.active = true ORDER BY ua.displayOrder ASC")
    List<UserAttribute> findByAttributeTypeOrderedByDisplay(@Param("attributeType") String attributeType);

    // ========================================
    // BÚSQUEDAS OPTIMIZADAS Y MEJORADAS
    // ========================================
    
    // OPTIMIZACIÓN: Atributos con paginación para administración
    @Query("SELECT ua FROM UserAttribute ua WHERE ua.active = true ORDER BY ua.attributeType ASC, ua.displayOrder ASC")
    Page<UserAttribute> findActiveAttributesPaged(Pageable pageable);
    
    // OPTIMIZACIÓN: Búsqueda eficiente por múltiples tipos
    @Query("SELECT ua FROM UserAttribute ua WHERE ua.attributeType IN :attributeTypes AND ua.active = true ORDER BY ua.attributeType ASC, ua.displayOrder ASC")
    List<UserAttribute> findByAttributeTypesOptimized(@Param("attributeTypes") List<String> attributeTypes);
    
    // OPTIMIZACIÓN: Atributos más populares por tipo
    @Query(value = """
            SELECT ua.* FROM user_attributes ua 
            LEFT JOIN (
                SELECT attribute_code, attribute_type, COUNT(*) as usage_count 
                FROM users u 
                WHERE (
                    (u.physical_build = ua.code AND ua.attribute_type = 'PHYSICAL_BUILD') OR
                    (u.eye_color = ua.code AND ua.attribute_type = 'EYE_COLOR') OR
                    (u.hair_color = ua.code AND ua.attribute_type = 'HAIR_COLOR') OR
                    (u.body_type = ua.code AND ua.attribute_type = 'BODY_TYPE')
                )
                GROUP BY attribute_code, attribute_type
            ) usage ON ua.code = usage.attribute_code AND ua.attribute_type = usage.attribute_type
            WHERE ua.attribute_type = :attributeType AND ua.active = true 
            ORDER BY COALESCE(usage.usage_count, 0) DESC, ua.display_order ASC
            """, nativeQuery = true)
    List<UserAttribute> findPopularAttributesByType(@Param("attributeType") String attributeType);
    
    // ========================================
    // CONSULTAS PARA MATCHING Y ESTADÍSTICAS
    // ========================================
    
    // Obtener estadísticas de uso por tipo de atributo
    @Query(value = """
            SELECT ua.code, ua.name, ua.attribute_type, 
                   COUNT(CASE WHEN u.physical_build = ua.code AND ua.attribute_type = 'PHYSICAL_BUILD' THEN 1 END) +
                   COUNT(CASE WHEN u.eye_color = ua.code AND ua.attribute_type = 'EYE_COLOR' THEN 1 END) +
                   COUNT(CASE WHEN u.hair_color = ua.code AND ua.attribute_type = 'HAIR_COLOR' THEN 1 END) +
                   COUNT(CASE WHEN u.body_type = ua.code AND ua.attribute_type = 'BODY_TYPE' THEN 1 END) as usage_count
            FROM user_attributes ua 
            LEFT JOIN users u ON (
                (u.physical_build = ua.code AND ua.attribute_type = 'PHYSICAL_BUILD') OR
                (u.eye_color = ua.code AND ua.attribute_type = 'EYE_COLOR') OR
                (u.hair_color = ua.code AND ua.attribute_type = 'HAIR_COLOR') OR
                (u.body_type = ua.code AND ua.attribute_type = 'BODY_TYPE')
            )
            WHERE ua.active = true AND ua.attribute_type = :attributeType
            GROUP BY ua.id, ua.code, ua.name, ua.attribute_type
            ORDER BY usage_count DESC
            """, nativeQuery = true)
    List<Object[]> getAttributeUsageStatistics(@Param("attributeType") String attributeType);
    
    // Buscar atributos similares para recomendaciones
    @Query("SELECT ua FROM UserAttribute ua WHERE ua.attributeType = :attributeType AND ua.active = true AND ua.code != :excludeCode ORDER BY ua.displayOrder ASC")
    List<UserAttribute> findSimilarAttributes(@Param("attributeType") String attributeType, @Param("excludeCode") String excludeCode);
    
    // ========================================
    // GESTIÓN ADMINISTRATIVA
    // ========================================
    
    @Query("SELECT DISTINCT ua.attributeType FROM UserAttribute ua WHERE ua.active = true ORDER BY ua.attributeType")
    List<String> findActiveAttributeTypes();
    
    @Query("SELECT COUNT(ua) FROM UserAttribute ua WHERE ua.active = false")
    long countInactiveAttributes();
    
    @Query("SELECT ua FROM UserAttribute ua WHERE ua.active = false ORDER BY ua.attributeType ASC, ua.displayOrder ASC")
    List<UserAttribute> findInactiveAttributes();
}
