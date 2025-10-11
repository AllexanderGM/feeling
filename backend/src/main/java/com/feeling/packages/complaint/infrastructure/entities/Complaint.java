package com.feeling.packages.complaint.infrastructure.entities;

import com.feeling.packages.complaint.domain.enums.ComplaintPriority;
import com.feeling.packages.complaint.domain.enums.ComplaintStatus;
import com.feeling.packages.complaint.domain.enums.ComplaintType;
import com.feeling.packages.user.infrastructure.entities.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad que representa quejas, sugerencias y reportes enviados por usuarios de la plataforma Feeling.
 * Gestiona un sistema completo de soporte al cliente y comunicación usuario-administración.
 * <p>
 * Esta entidad maneja:
 * - Diferentes tipos de consultas (técnicas, pagos, reportes, etc.)
 * - Sistema de prioridades y estados para gestión
 * - Seguimiento de resolución con timestamps
 * - Información de auditoría (IP, user agent)
 * - Referencias a otros elementos del sistema
 * - Comunicación bidireccional usuario-administrador
 * <p>
 * Características principales:
 * - Categorización automática por tipo de queja
 * - Workflow de estados desde creación hasta cierre
 * - Sistema de escalamiento por tiempo
 * - Notas internas para administradores
 * - Trazabilidad completa de resolución
 * - Soporte para diferentes tipos de referencias
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "complaints")
public class Complaint {

    /**
     * Identificador único de la queja en la base de datos.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Usuario que envió la queja.
     * Relación lazy para optimizar consultas administrativas.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "El usuario es obligatorio")
    private User user;

    /**
     * Asunto o título de la queja.
     * Debe ser descriptivo y conciso para facilitar la gestión.
     */
    @Column(nullable = false)
    @NotBlank(message = "El asunto es obligatorio")
    private String subject;

    /**
     * Mensaje detallado describiendo la queja o consulta.
     * Campo de texto largo para permitir descripciones completas.
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    @NotBlank(message = "El mensaje es obligatorio")
    private String message;

    /**
     * Tipo de queja que permite categorización y enrutamiento automático.
     * Ayuda a los administradores a priorizar y asignar quejas correctamente.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "complaint_type", nullable = false)
    @Builder.Default
    private ComplaintType complaintType = ComplaintType.GENERAL;

    /**
     * Prioridad de la queja determinada por tipo y contenido.
     * Define el orden de atención por parte del equipo de soporte.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "complaint_priority", nullable = false)
    @Builder.Default
    private ComplaintPriority complaintPriority = ComplaintPriority.MEDIUM;

    /**
     * Estado actual de la queja en el workflow de resolución.
     * Permite seguimiento desde creación hasta cierre.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "complaint_status", nullable = false)
    @Builder.Default
    private ComplaintStatus complaintStatus = ComplaintStatus.OPEN;

    /**
     * Fecha y hora de creación de la queja.
     */
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Fecha y hora de la última actualización de la queja.
     * Se actualiza automáticamente con @PreUpdate.
     */
    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    /**
     * Fecha y hora de resolución de la queja.
     * Se establece cuando el estado cambia a RESOLVED o CLOSED.
     */
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    /**
     * Email del administrador que resolvió la queja.
     * Permite trazabilidad y métricas de rendimiento del equipo.
     */
    @Column(name = "resolved_by")
    private String resolvedBy;

    /**
     * Respuesta oficial del administrador visible para el usuario.
     * Comunicación formal de la resolución de la queja.
     */
    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    /**
     * Notas internas de administración no visibles para el usuario.
     * Útil para tracking interno, escalamiento y traspaso entre administradores.
     */
    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    // ========================================
    // INFORMACIÓN DE AUDITORÍA
    // ========================================

    /**
     * Dirección IP del usuario al momento de crear la queja.
     * Útil para detección de spam y análisis de patrones.
     */
    @Column(name = "user_ip")
    private String userIp;

    /**
     * User Agent del navegador del usuario.
     * Ayuda en troubleshooting de problemas específicos de browser/dispositivo.
     */
    @Column(name = "user_agent")
    private String userAgent;

    // ========================================
    // REFERENCIAS A ENTIDADES RELACIONADAS
    // ========================================

    /**
     * ID del usuario sobre el cual se hace la queja.
     * Usado para reportes de comportamiento inapropiado.
     */
    @Column(name = "referenced_user_id")
    private Long referencedUserId;

    /**
     * ID del evento relacionado con la queja.
     * Usado para problemas específicos con eventos.
     */
    @Column(name = "referenced_event_id")
    private Long referencedEventId;

    /**
     * ID de la reserva relacionada con la queja.
     * Usado para problemas con reservas y pagos.
     */
    @Column(name = "referenced_booking_id")
    private Long referencedBookingId;

    // ========================================
    // MÉTODOS DE GESTIÓN DE ESTADO
    // ========================================

    /**
     * Marca la queja como resuelta con respuesta del administrador.
     * Actualiza estado, fecha de resolución y asigna responsable.
     *
     * @param adminEmail Email del administrador que resuelve la queja
     * @param response   Respuesta oficial para el usuario
     */
    public void markAsResolved(String adminEmail, String response) {
        this.complaintStatus = ComplaintStatus.RESOLVED;
        this.resolvedAt = LocalDateTime.now();
        this.resolvedBy = adminEmail;
        this.adminResponse = response;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Marca la queja como cerrada sin resolución específica.
     * Usado para cerrar quejas que no requieren respuesta.
     *
     * @param adminEmail Email del administrador que cierra la queja
     */
    public void markAsClosed(String adminEmail) {
        this.complaintStatus = ComplaintStatus.CLOSED;
        this.resolvedAt = LocalDateTime.now();
        this.resolvedBy = adminEmail;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Actualiza el estado de la queja a uno nuevo.
     * Usado para cambios de estado durante el workflow.
     *
     * @param newComplaintStatus Nuevo estado de la queja
     */
    public void updateStatus(ComplaintStatus newComplaintStatus) {
        this.complaintStatus = newComplaintStatus;
        this.updatedAt = LocalDateTime.now();

        // Si se marca como escalado, incrementar prioridad
        if (newComplaintStatus == ComplaintStatus.ESCALATED && this.complaintPriority != ComplaintPriority.URGENT) {
            this.complaintPriority = ComplaintPriority.values()[Math.min(this.complaintPriority.ordinal() + 1, ComplaintPriority.values().length - 1)];
        }
    }

    /**
     * Escala la queja al siguiente nivel de prioridad y marca como escalado.
     * Usado cuando una queja no se resuelve en el tiempo esperado.
     *
     * @param reason Razón del escalamiento para tracking interno
     */
    public void escalate(String reason) {
        this.complaintStatus = ComplaintStatus.ESCALATED;
        this.complaintPriority = ComplaintPriority.URGENT;
        addAdminNotes("ESCALAMIENTO AUTOMÁTICO: " + reason);
    }

    // ========================================
    // MÉTODOS DE ADMINISTRACIÓN
    // ========================================

    /**
     * Añade notas internas de administración con timestamp automático.
     * Las notas se acumulan con separadores y fechas para trazabilidad.
     *
     * @param notes Notas a añadir
     */
    public void addAdminNotes(String notes) {
        if (this.adminNotes == null) {
            this.adminNotes = notes;
        } else {
            this.adminNotes += "\n---\n" + LocalDateTime.now() + ": " + notes;
        }
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Establece la información de auditoría del usuario.
     * Debe llamarse al crear la queja para tracking.
     *
     * @param userIp    Dirección IP del usuario
     * @param userAgent User agent del navegador
     */
    public void setAuditInfo(String userIp, String userAgent) {
        this.userIp = userIp;
        this.userAgent = userAgent;
    }

    /**
     * Establece una referencia a un usuario reportado.
     *
     * @param userId ID del usuario sobre el cual se hace la queja
     */
    public void setUserReference(Long userId) {
        this.referencedUserId = userId;
    }

    /**
     * Establece una referencia a un evento problemático.
     *
     * @param eventId ID del evento relacionado con la queja
     */
    public void setEventReference(Long eventId) {
        this.referencedEventId = eventId;
    }

    /**
     * Establece una referencia a una reserva problemática.
     *
     * @param bookingId ID de la reserva relacionada con la queja
     */
    public void setBookingReference(Long bookingId) {
        this.referencedBookingId = bookingId;
    }

    // ========================================
    // MÉTODOS DE CONSULTA DE ESTADO
    // ========================================

    /**
     * Verifica si la queja está pendiente de resolución.
     * Una queja está pendiente si está en estados activos del workflow.
     *
     * @return true si la queja requiere atención
     */
    public boolean isPending() {
        return complaintStatus == ComplaintStatus.OPEN || complaintStatus == ComplaintStatus.IN_PROGRESS ||
            complaintStatus == ComplaintStatus.WAITING_USER || complaintStatus == ComplaintStatus.ESCALATED;
    }

    /**
     * Verifica si la queja está resuelta (finalizada).
     * Una queja está resuelta si está en estados finales del workflow.
     *
     * @return true si la queja está finalizada
     */
    public boolean isResolved() {
        return complaintStatus == ComplaintStatus.RESOLVED || complaintStatus == ComplaintStatus.CLOSED;
    }

    /**
     * Verifica si la queja ha sido escalada.
     *
     * @return true si la queja está en estado escalado
     */
    public boolean isEscalated() {
        return complaintStatus == ComplaintStatus.ESCALATED;
    }

    /**
     * Verifica si la queja tiene alta prioridad.
     *
     * @return true si la prioridad es HIGH o URGENT
     */
    public boolean isHighPriority() {
        return complaintPriority == ComplaintPriority.HIGH || complaintPriority == ComplaintPriority.URGENT;
    }

    // ========================================
    // MÉTODOS DE MÉTRICAS Y ANÁLISIS
    // ========================================

    /**
     * Calcula el tiempo transcurrido desde la creación en horas.
     *
     * @return Horas transcurridas desde la creación
     */
    public long getHoursSinceCreated() {
        return java.time.Duration.between(createdAt, LocalDateTime.now()).toHours();
    }

    /**
     * Calcula el tiempo transcurrido desde la última actualización en horas.
     *
     * @return Horas transcurridas desde la última actualización
     */
    public long getHoursSinceUpdated() {
        return java.time.Duration.between(updatedAt, LocalDateTime.now()).toHours();
    }

    /**
     * Verifica si la queja está vencida según su prioridad.
     * Los tiempos de vencimiento varían según la prioridad asignada.
     *
     * @return true si la queja ha excedido el tiempo esperado de resolución
     */
    public boolean isOverdue() {
        if (isResolved()) return false;

        long hoursOld = getHoursSinceCreated();
        return switch (complaintPriority) {
            case URGENT -> hoursOld > 2;
            case HIGH -> hoursOld > 8;
            case MEDIUM -> hoursOld > 24;
            case LOW -> hoursOld > 72;
        };
    }

    /**
     * Calcula la puntuación de urgencia de la queja para priorización automática.
     * Considera tipo, prioridad, tiempo transcurrido y referencias.
     *
     * @return Puntuación de urgencia (mayor = más urgente)
     */
    public int getUrgencyScore() {
        int score = 0;

        // Puntuación base por prioridad
        score += switch (complaintPriority) {
            case URGENT -> 100;
            case HIGH -> 75;
            case MEDIUM -> 50;
            case LOW -> 25;
        };

        // Bonus por tipo crítico
        if (complaintType == ComplaintType.ABUSE_REPORT ||
            complaintType == ComplaintType.PAYMENT_ISSUE ||
            complaintType == ComplaintType.PRIVACY_CONCERN) {
            score += 25;
        }

        // Penalty por tiempo (quejas viejas son menos urgentes que las nuevas)
        score -= (int) Math.min(getHoursSinceCreated(), 50);

        // Bonus si está escalado
        if (isEscalated()) {
            score += 50;
        }

        return Math.max(score, 0);
    }

    // ========================================
    // MÉTODOS DEL CICLO DE VIDA JPA
    // ========================================

    /**
     * Método ejecutado automáticamente antes de actualizar la queja.
     * Actualiza la fecha de modificación.
     */
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Método ejecutado automáticamente antes de persistir la queja.
     * Inicializa fechas si no están establecidas.
     */
    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }
}
