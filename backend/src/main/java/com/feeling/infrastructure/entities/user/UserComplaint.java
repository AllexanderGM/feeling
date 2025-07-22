package com.feeling.infrastructure.entities.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_complaints")
public class UserComplaint {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "El usuario es obligatorio")
    private User user;

    @Column(nullable = false)
    @NotBlank(message = "El asunto es obligatorio")
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    @NotBlank(message = "El mensaje es obligatorio")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "complaint_type", nullable = false)
    @Builder.Default
    private ComplaintType complaintType = ComplaintType.GENERAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private Status status = Status.OPEN;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by")
    private String resolvedBy; // Email del administrador que resolvió

    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes; // Notas internas para administradores

    // Información adicional para tracking
    @Column(name = "user_ip")
    private String userIp;

    @Column(name = "user_agent")
    private String userAgent;

    // Referencia a otros elementos del sistema si es relevante
    @Column(name = "referenced_user_id")
    private Long referencedUserId; // Si la queja es sobre otro usuario

    @Column(name = "referenced_event_id")
    private Long referencedEventId; // Si la queja es sobre un evento

    @Column(name = "referenced_booking_id")
    private Long referencedBookingId; // Si la queja es sobre una reserva

    // ========================================
    // ENUMS
    // ========================================
    
    public enum ComplaintType {
        GENERAL("Consulta general"),
        TECHNICAL_ISSUE("Problema técnico"),
        ACCOUNT_ISSUE("Problema de cuenta"),
        PAYMENT_ISSUE("Problema de pago"),
        USER_REPORT("Reporte de usuario"),
        EVENT_ISSUE("Problema con evento"),
        BOOKING_ISSUE("Problema con reserva"),
        PRIVACY_CONCERN("Preocupación de privacidad"),
        FEATURE_REQUEST("Solicitud de funcionalidad"),
        BUG_REPORT("Reporte de error"),
        ABUSE_REPORT("Reporte de abuso"),
        REFUND_REQUEST("Solicitud de reembolso");

        private final String description;

        ComplaintType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum Priority {
        LOW("Baja"),
        MEDIUM("Media"),
        HIGH("Alta"),
        URGENT("Urgente");

        private final String description;

        Priority(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum Status {
        OPEN("Abierto"),
        IN_PROGRESS("En progreso"),
        WAITING_USER("Esperando usuario"),
        RESOLVED("Resuelto"),
        CLOSED("Cerrado"),
        ESCALATED("Escalado");

        private final String description;

        Status(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================

    /**
     * Marca la queja como resuelta
     */
    public void markAsResolved(String adminEmail, String response) {
        this.status = Status.RESOLVED;
        this.resolvedAt = LocalDateTime.now();
        this.resolvedBy = adminEmail;
        this.adminResponse = response;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Marca la queja como cerrada
     */
    public void markAsClosed(String adminEmail) {
        this.status = Status.CLOSED;
        this.resolvedAt = LocalDateTime.now();
        this.resolvedBy = adminEmail;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Actualiza el estado de la queja
     */
    public void updateStatus(Status newStatus) {
        this.status = newStatus;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Añade notas de administrador
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
     * Verifica si la queja está pendiente de resolución
     */
    public boolean isPending() {
        return status == Status.OPEN || status == Status.IN_PROGRESS || status == Status.WAITING_USER;
    }

    /**
     * Verifica si la queja está resuelta
     */
    public boolean isResolved() {
        return status == Status.RESOLVED || status == Status.CLOSED;
    }

    /**
     * Calcula el tiempo transcurrido desde la creación
     */
    public long getHoursSinceCreated() {
        return java.time.Duration.between(createdAt, LocalDateTime.now()).toHours();
    }

    /**
     * Verifica si la queja es urgente (más de 24 horas sin resolver)
     */
    public boolean isOverdue() {
        return isPending() && getHoursSinceCreated() > 24;
    }

    // ========================================
    // LIFECYCLE METHODS
    // ========================================
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }
}