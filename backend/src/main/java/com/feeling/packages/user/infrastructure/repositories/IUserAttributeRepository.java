package com.feeling.packages.user.infrastructure.repositories;

import com.feeling.packages.user.infrastructure.entities.UserAttribute;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para gestión de atributos de usuario (características físicas, preferencias, etc.).
 * Proporciona queries optimizadas para búsquedas, validaciones y administración de atributos.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Repository
public interface IUserAttributeRepository extends JpaRepository<UserAttribute, Long> {

    // ========================================
    // BÚSQUEDAS BÁSICAS
    // ========================================

    /**
     * Busca todos los atributos activos de un tipo específico ordenados por displayOrder.
     *
     * @param attributeType Tipo de atributo
     * @return Lista de atributos activos ordenados
     */
    @Query("SELECT ua FROM UserAttribute ua WHERE ua.attributeType = :attributeType AND ua.active = true ORDER BY ua.displayOrder ASC")
    List<UserAttribute> findByAttributeTypeAndActiveTrueOrderByDisplayOrderAsc(@Param("attributeType") String attributeType);

    /**
     * Busca todos los atributos activos ordenados por tipo y displayOrder.
     *
     * @return Lista de todos los atributos activos ordenados
     */
    @Query("SELECT ua FROM UserAttribute ua WHERE ua.active = true ORDER BY ua.attributeType ASC, ua.displayOrder ASC")
    List<UserAttribute> findAllActiveOrdered();

    /**
     * Busca todos los atributos activos con paginación para panel de administración.
     *
     * @param pageable Configuración de paginación
     * @return Página de atributos activos ordenados por tipo y displayOrder
     */
    @Query("SELECT ua FROM UserAttribute ua WHERE ua.active = true ORDER BY ua.attributeType ASC, ua.displayOrder ASC")
    Page<UserAttribute> findActiveAttributesPaged(Pageable pageable);

    // ========================================
    // BÚSQUEDAS OPTIMIZADAS
    // ========================================

    /**
     * Busca un atributo activo por código y tipo.
     *
     * @param code          Código del atributo (case-sensitive)
     * @param attributeType Tipo de atributo
     * @return Optional con el atributo activo, vacío si no existe o está inactivo
     */
    @Query("SELECT ua FROM UserAttribute ua WHERE ua.code = :code AND ua.attributeType = :attributeType AND ua.active = true")
    Optional<UserAttribute> findActiveByCodeAndType(@Param("code") String code, @Param("attributeType") String attributeType);

    /**
     * Busca todos los atributos activos de un tipo específico sin orden.
     * Usado para validaciones internas donde el orden no es relevante.
     *
     * @param attributeType Tipo de atributo
     * @return Lista de atributos activos sin orden específico
     */
    @Query("SELECT ua FROM UserAttribute ua WHERE ua.attributeType = :attributeType AND ua.active = true")
    List<UserAttribute> findActiveByAttributeType(@Param("attributeType") String attributeType);

    /**
     * Busca atributos activos de múltiples tipos en una sola query.
     * Optimizado para reducir llamadas a BD cuando se necesitan varios tipos.
     *
     * @param attributeTypes Lista de tipos de atributos a buscar
     * @return Lista de atributos activos ordenados por tipo y displayOrder
     */
    @Query("SELECT ua FROM UserAttribute ua WHERE ua.attributeType IN :attributeTypes AND ua.active = true ORDER BY ua.attributeType ASC, ua.displayOrder ASC")
    List<UserAttribute> findByAttributeTypeIn(@Param("attributeTypes") List<String> attributeTypes);

    // ========================================
    // VALIDACIONES
    // ========================================

    /**
     * Verifica existencia de un atributo por código y tipo (activos e inactivos).
     * Usado para validación de duplicados al crear/actualizar atributos.
     * Método derivado de Spring Data JPA (no requiere @Query explícita).
     *
     * @param code          Código del atributo
     * @param attributeType Tipo de atributo
     * @return true si existe (activo o inactivo), false en caso contrario
     */
    boolean existsByCodeAndAttributeType(String code, String attributeType);

    // ========================================
    // CONSULTAS PARA MATCHING Y ESTADÍSTICAS
    // ========================================

    // Nota: Se eliminó findSimilarAttributes por no tener uso en el sistema.

    // ========================================
    // GESTIÓN ADMINISTRATIVA
    // ========================================

    /**
     * Obtiene lista de tipos de atributos activos disponibles.
     *
     * @return Lista de tipos de atributos únicos ordenados alfabéticamente
     */
    @Query("SELECT DISTINCT ua.attributeType FROM UserAttribute ua WHERE ua.active = true ORDER BY ua.attributeType")
    List<String> findActiveAttributeTypes();

    /**
     * Cuenta atributos inactivos pendientes de aprobación.
     *
     * @return Cantidad de atributos inactivos
     */
    @Query("SELECT COUNT(ua) FROM UserAttribute ua WHERE ua.active = false")
    long countInactiveAttributes();

    /**
     * Obtiene todos los atributos inactivos para revisión administrativa.
     *
     * @return Lista de atributos inactivos ordenados por tipo y displayOrder
     */
    @Query("SELECT ua FROM UserAttribute ua WHERE ua.active = false ORDER BY ua.attributeType ASC, ua.displayOrder ASC")
    List<UserAttribute> findInactiveAttributes();
}
