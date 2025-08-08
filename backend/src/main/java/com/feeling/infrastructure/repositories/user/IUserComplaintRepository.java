package com.feeling.infrastructure.repositories.user;

import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.entities.user.UserComplaint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IUserComplaintRepository extends JpaRepository<UserComplaint, Long> {

    // ========================================
    // BÚSQUEDAS POR USUARIO
    // ========================================
    Page<UserComplaint> findByUser(User user, Pageable pageable);
    
    List<UserComplaint> findByUserOrderByCreatedAtDesc(User user);
    
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE c.user = :user")
    long countByUser(@Param("user") User user);

    // ========================================
    // BÚSQUEDAS POR ESTADO
    // ========================================
    Page<UserComplaint> findByStatus(UserComplaint.Status status, Pageable pageable);
    
    Page<UserComplaint> findByStatusIn(List<UserComplaint.Status> statuses, Pageable pageable);
    
    @Query("SELECT c FROM UserComplaint c WHERE c.status IN ('OPEN', 'IN_PROGRESS', 'WAITING_USER') ORDER BY c.priority DESC, c.createdAt ASC")
    Page<UserComplaint> findPendingComplaints(Pageable pageable);

    // ========================================
    // BÚSQUEDAS POR TIPO Y PRIORIDAD
    // ========================================
    Page<UserComplaint> findByComplaintType(UserComplaint.ComplaintType complaintType, Pageable pageable);
    
    Page<UserComplaint> findByPriority(UserComplaint.Priority priority, Pageable pageable);
    
    @Query("SELECT c FROM UserComplaint c WHERE c.priority = 'URGENT' AND c.status IN ('OPEN', 'IN_PROGRESS') ORDER BY c.createdAt ASC")
    List<UserComplaint> findUrgentPendingComplaints();

    // ========================================
    // BÚSQUEDAS POR FECHAS
    // ========================================
    @Query("SELECT c FROM UserComplaint c WHERE c.createdAt >= :since ORDER BY c.createdAt DESC")
    List<UserComplaint> findComplaintsSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT c FROM UserComplaint c WHERE c.createdAt BETWEEN :start AND :end ORDER BY c.createdAt DESC")
    Page<UserComplaint> findComplaintsBetweenDates(
            @Param("start") LocalDateTime start, 
            @Param("end") LocalDateTime end, 
            Pageable pageable);

    // ========================================
    // BÚSQUEDAS ADMINISTRATIVAS
    // ========================================
    @Query("SELECT c FROM UserComplaint c WHERE c.resolvedBy = :adminEmail ORDER BY c.resolvedAt DESC")
    Page<UserComplaint> findComplaintsResolvedBy(@Param("adminEmail") String adminEmail, Pageable pageable);
    
    @Query("SELECT c FROM UserComplaint c WHERE " +
           "LOWER(c.subject) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.message) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.user.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.user.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<UserComplaint> searchComplaints(@Param("searchTerm") String searchTerm, Pageable pageable);

    // ========================================
    // ESTADÍSTICAS
    // ========================================
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE c.status = :status")
    long countByStatus(@Param("status") UserComplaint.Status status);
    
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE c.complaintType = :type")
    long countByComplaintType(@Param("type") UserComplaint.ComplaintType type);
    
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE c.priority = :priority")
    long countByPriority(@Param("priority") UserComplaint.Priority priority);
    
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE c.createdAt >= :since")
    long countComplaintsSince(@Param("since") LocalDateTime since);

    // ========================================
    // CONSULTAS OPTIMIZADAS CON FETCH JOIN
    // ========================================
    @Query("SELECT c FROM UserComplaint c " +
           "LEFT JOIN FETCH c.user u " +
           "WHERE c.status IN ('OPEN', 'IN_PROGRESS', 'WAITING_USER') " +
           "ORDER BY c.priority DESC, c.createdAt ASC")
    Page<UserComplaint> findPendingComplaintsOptimized(Pageable pageable);
    
    @Query("SELECT c FROM UserComplaint c " +
           "LEFT JOIN FETCH c.user u " +
           "WHERE c.user = :user " +
           "ORDER BY c.createdAt DESC")
    Page<UserComplaint> findByUserOptimized(@Param("user") User user, Pageable pageable);

    // ========================================
    // CONSULTAS ESPECIALES
    // ========================================
    @Query("SELECT c FROM UserComplaint c WHERE " +
           "c.status IN ('OPEN', 'IN_PROGRESS') AND " +
           "c.createdAt < :overdueThreshold " +
           "ORDER BY c.createdAt ASC")
    List<UserComplaint> findOverdueComplaints(@Param("overdueThreshold") LocalDateTime overdueThreshold);
    
    @Query("SELECT c FROM UserComplaint c WHERE " +
           "c.referencedUserId = :userId OR " +
           "c.referencedEventId = :eventId OR " +
           "c.referencedBookingId = :bookingId")
    List<UserComplaint> findComplaintsByReference(
            @Param("userId") Long userId, 
            @Param("eventId") Long eventId, 
            @Param("bookingId") Long bookingId);

    // ========================================
    // MÉTRICAS DE RENDIMIENTO
    // ========================================
    @Query("SELECT AVG(TIMESTAMPDIFF(HOUR, c.createdAt, c.resolvedAt)) FROM UserComplaint c " +
           "WHERE c.status = 'RESOLVED' AND c.resolvedAt IS NOT NULL")
    Double getAverageResolutionTimeInHours();
    
    @Query("SELECT c.resolvedBy, COUNT(c) FROM UserComplaint c " +
           "WHERE c.status = 'RESOLVED' AND c.resolvedBy IS NOT NULL " +
           "GROUP BY c.resolvedBy " +
           "ORDER BY COUNT(c) DESC")
    List<Object[]> getComplaintsResolvedByAdmin();

    // ========================================
    // MÉTRICAS DE CONTEXTO
    // ========================================
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE c.referencedUserId IS NOT NULL")
    long countComplaintsWithUserReference();
    
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE c.referencedEventId IS NOT NULL")
    long countComplaintsWithEventReference();
    
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE c.referencedBookingId IS NOT NULL")
    long countComplaintsWithBookingReference();

    // ========================================
    // MÉTRICAS ADICIONALES
    // ========================================
    @Query("SELECT COUNT(c) FROM UserComplaint c WHERE " +
           "c.status IN ('OPEN', 'IN_PROGRESS') AND " +
           "c.createdAt < :overdueThreshold")
    long countOverdueComplaints(@Param("overdueThreshold") LocalDateTime overdueThreshold);
}