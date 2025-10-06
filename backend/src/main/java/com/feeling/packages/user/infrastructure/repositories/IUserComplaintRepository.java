package com.feeling.packages.user.infrastructure.repositories;

import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.entities.UserComplaint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para gestión de quejas y soporte de usuarios.
 * Proporciona métodos para búsquedas optimizadas, filtrado avanzado y estadísticas.
 *
 * @author J. Alexander Gavilán M.
 */
@Repository
public interface IUserComplaintRepository extends JpaRepository<UserComplaint, Long> {

    // ========================================
    // BÚSQUEDAS BÁSICAS
    // ========================================

    /**
     * Busca todas las quejas de un usuario con paginación.
     * Incluye FETCH JOIN para evitar N+1 queries.
     *
     * @param user Usuario
     * @param pageable Configuración de paginación
     * @return Página de quejas ordenadas por fecha de creación (más recientes primero)
     */
    @Query("SELECT c FROM UserComplaint c " +
            "LEFT JOIN FETCH c.user u " +
            "WHERE c.user = :user " +
            "ORDER BY c.createdAt DESC")
    Page<UserComplaint> findByUser(@Param("user") User user, Pageable pageable);

    /**
     * Busca quejas por uno o varios estados con paginación.
     *
     * @param statuses Lista de estados a buscar
     * @param pageable Configuración de paginación
     * @return Página de quejas con los estados especificados
     */
    Page<UserComplaint> findByStatusIn(List<UserComplaint.Status> statuses, Pageable pageable);

    /**
     * Busca quejas pendientes de resolución con paginación.
     * Incluye estados: OPEN, IN_PROGRESS, WAITING_USER.
     * Ordenadas por prioridad (descendente) y fecha de creación (ascendente).
     *
     * @param pageable Configuración de paginación
     * @return Página de quejas pendientes con FETCH JOIN
     */
    @Query("SELECT c FROM UserComplaint c " +
            "LEFT JOIN FETCH c.user u " +
            "WHERE c.status IN ('OPEN', 'IN_PROGRESS', 'WAITING_USER') " +
            "ORDER BY c.priority DESC, c.createdAt ASC")
    Page<UserComplaint> findPendingComplaints(Pageable pageable);

    /**
     * Busca quejas por tipo con paginación.
     *
     * @param complaintType Tipo de queja
     * @param pageable Configuración de paginación
     * @return Página de quejas del tipo especificado
     */
    Page<UserComplaint> findByComplaintType(UserComplaint.ComplaintType complaintType, Pageable pageable);

    /**
     * Busca quejas por prioridad con paginación.
     *
     * @param priority Prioridad de la queja
     * @param pageable Configuración de paginación
     * @return Página de quejas con la prioridad especificada
     */
    Page<UserComplaint> findByPriority(UserComplaint.Priority priority, Pageable pageable);

    /**
     * Busca quejas urgentes que están pendientes de resolución.
     * Solo incluye estados OPEN e IN_PROGRESS con prioridad URGENT.
     *
     * @param pageable Configuración de paginación
     * @return Página de quejas urgentes ordenadas por fecha de creación (más antiguas primero)
     */
    @Query("SELECT c FROM UserComplaint c " +
            "LEFT JOIN FETCH c.user u " +
            "WHERE c.priority = 'URGENT' AND c.status IN ('OPEN', 'IN_PROGRESS') " +
            "ORDER BY c.createdAt ASC")
    Page<UserComplaint> findUrgentComplaints(Pageable pageable);

    /**
     * Busca quejas resueltas para cálculo de métricas.
     * Solo incluye quejas con estado RESOLVED y fecha de resolución.
     *
     * @return Lista de quejas resueltas
     */
    @Query("SELECT c FROM UserComplaint c WHERE c.status = 'RESOLVED' AND c.resolvedAt IS NOT NULL")
    List<UserComplaint> findResolvedComplaints();

    // ========================================
    // BÚSQUEDAS POR FECHAS
    // ========================================

    /**
     * Busca quejas creadas en un rango de fechas con paginación.
     *
     * @param start Fecha y hora de inicio del rango
     * @param end Fecha y hora de fin del rango
     * @param pageable Configuración de paginación
     * @return Página de quejas en el rango especificado ordenadas por fecha (más recientes primero)
     */
    @Query("SELECT c FROM UserComplaint c WHERE c.createdAt BETWEEN :start AND :end ORDER BY c.createdAt DESC")
    Page<UserComplaint> findComplaintsBetweenDates(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable);

    /**
     * Busca quejas atrasadas (más de 24 horas sin resolver).
     * Solo incluye estados OPEN e IN_PROGRESS.
     *
     * @param overdueThreshold Umbral de tiempo (quejas creadas antes de esta fecha se consideran atrasadas)
     * @param pageable Configuración de paginación
     * @return Página de quejas atrasadas ordenadas por antigüedad (más antiguas primero)
     */
    @Query("SELECT c FROM UserComplaint c " +
            "LEFT JOIN FETCH c.user u " +
            "WHERE c.status IN ('OPEN', 'IN_PROGRESS') AND " +
            "c.createdAt < :overdueThreshold " +
            "ORDER BY c.createdAt ASC")
    Page<UserComplaint> findOverdueComplaints(@Param("overdueThreshold") LocalDateTime overdueThreshold, Pageable pageable);

    // ========================================
    // BÚSQUEDAS ADMINISTRATIVAS
    // ========================================

    /**
     * Busca quejas resueltas por un administrador específico.
     * Útil para métricas de rendimiento por administrador.
     *
     * @param adminEmail Email del administrador que resolvió las quejas
     * @param pageable Configuración de paginación
     * @return Página de quejas resueltas por el admin ordenadas por fecha de resolución (más recientes primero)
     */
    @Query("SELECT c FROM UserComplaint c WHERE c.resolvedBy = :adminEmail ORDER BY c.resolvedAt DESC")
    Page<UserComplaint> findComplaintsResolvedBy(@Param("adminEmail") String adminEmail, Pageable pageable);

    /**
     * Busca quejas por término de búsqueda en múltiples campos.
     * Busca en: asunto, mensaje, email del usuario y nombre del usuario.
     * Búsqueda case-insensitive.
     *
     * @param searchTerm Término de búsqueda
     * @param pageable Configuración de paginación
     * @return Página de quejas que coinciden con el término de búsqueda
     */
    @Query("SELECT c FROM UserComplaint c WHERE " +
            "LOWER(c.subject) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(c.message) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(c.user.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(c.user.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<UserComplaint> searchComplaints(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Busca quejas relacionadas con referencias específicas (usuario, evento o reserva).
     * Útil para investigar todas las quejas asociadas a un elemento específico.
     *
     * @param userId ID del usuario referenciado en la queja
     * @param eventId ID del evento referenciado en la queja
     * @param bookingId ID de la reserva referenciada en la queja
     * @param pageable Configuración de paginación
     * @return Página de quejas que coinciden con alguna de las referencias
     */
    @Query("SELECT c FROM UserComplaint c " +
            "LEFT JOIN FETCH c.user u " +
            "WHERE c.referencedUserId = :userId OR " +
            "c.referencedEventId = :eventId OR " +
            "c.referencedBookingId = :bookingId")
    Page<UserComplaint> findComplaintsByReference(
            @Param("userId") Long userId,
            @Param("eventId") Long eventId,
            @Param("bookingId") Long bookingId,
            Pageable pageable);

    // ========================================
    // ESTADÍSTICAS - CONTADORES
    // ========================================

    // Nota: Se eliminó countByUser por no tener uso en el sistema.

    /**
     * Cuenta quejas por estado.
     *
     * @param status Estado de la queja
     * @return Cantidad de quejas con el estado especificado
     */
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE c.status = :status")
    long countByStatus(@Param("status") UserComplaint.Status status);

    /**
     * Cuenta quejas por tipo.
     *
     * @param type Tipo de queja
     * @return Cantidad de quejas del tipo especificado
     */
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE c.complaintType = :type")
    long countByComplaintType(@Param("type") UserComplaint.ComplaintType type);

    /**
     * Cuenta quejas por prioridad.
     *
     * @param priority Prioridad de la queja
     * @return Cantidad de quejas con la prioridad especificada
     */
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE c.priority = :priority")
    long countByPriority(@Param("priority") UserComplaint.Priority priority);

    /**
     * Cuenta quejas creadas desde una fecha específica.
     *
     * @param since Fecha y hora desde la cual contar
     * @return Cantidad de quejas creadas desde la fecha especificada
     */
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE c.createdAt >= :since")
    long countComplaintsSince(@Param("since") LocalDateTime since);

    /**
     * Cuenta quejas atrasadas (más de 24 horas sin resolver).
     * Solo incluye estados OPEN e IN_PROGRESS.
     *
     * @param overdueThreshold Umbral de tiempo (quejas creadas antes de esta fecha se consideran atrasadas)
     * @return Cantidad de quejas atrasadas
     */
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE " +
            "c.status IN ('OPEN', 'IN_PROGRESS') AND " +
            "c.createdAt < :overdueThreshold")
    long countOverdueComplaints(@Param("overdueThreshold") LocalDateTime overdueThreshold);

    /**
     * Cuenta quejas que referencian a un usuario específico.
     *
     * @return Cantidad de quejas con referencia a usuario
     */
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE c.referencedUserId IS NOT NULL")
    long countComplaintsWithUserReference();

    /**
     * Cuenta quejas que referencian a un evento específico.
     *
     * @return Cantidad de quejas con referencia a evento
     */
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE c.referencedEventId IS NOT NULL")
    long countComplaintsWithEventReference();

    /**
     * Cuenta quejas que referencian a una reserva específica.
     *
     * @return Cantidad de quejas con referencia a reserva
     */
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE c.referencedBookingId IS NOT NULL")
    long countComplaintsWithBookingReference();

}
