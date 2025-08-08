package com.feeling.infrastructure.entities.event;

import com.feeling.infrastructure.entities.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 200, message = "El título no puede exceder 200 caracteres")
    @Column(nullable = false, length = 200)
    private String title;

    @NotBlank(message = "La descripción es obligatoria")
    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "La fecha del evento es obligatoria")
    @Future(message = "La fecha del evento debe ser en el futuro")
    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", message = "El precio debe ser positivo")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @NotNull(message = "La capacidad máxima es obligatoria")
    @Min(value = 1, message = "La capacidad debe ser al menos 1")
    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity;

    @Column(name = "current_attendees")
    @Builder.Default
    private Integer currentAttendees = 0;

    @NotNull(message = "La categoría es obligatoria")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventCategory category;

    @NotNull(message = "El estado del evento es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EventStatus status = EventStatus.EN_EDICION;


    @Column(name = "main_image")
    private String mainImage;

    @Column(name = "images")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EventRegistration> registrations = new ArrayList<>();

    public boolean isFull() {
        return currentAttendees != null && maxCapacity != null && currentAttendees >= maxCapacity;
    }

    public boolean hasAvailableSpots() {
        return currentAttendees != null && maxCapacity != null && currentAttendees < maxCapacity;
    }

    public Integer getAvailableSpots() {
        if (maxCapacity == null || currentAttendees == null) {
            return 0;
        }
        return maxCapacity - currentAttendees;
    }

    public void incrementAttendees() {
        if (hasAvailableSpots() && currentAttendees != null) {
            this.currentAttendees++;
        }
    }

    public void decrementAttendees() {
        if (currentAttendees != null && currentAttendees > 0) {
            this.currentAttendees--;
        }
    }

    public boolean isPublished() {
        return status != null && status == EventStatus.PUBLICADO;
    }

    public boolean canAcceptRegistrations() {
        return status != null && status.canReceiveRegistrations() && hasAvailableSpots();
    }

    public boolean isEditable() {
        return status != null && status.isEditable();
    }

    public boolean isFinalStatus() {
        return status != null && status.isFinal();
    }

    public void publish() {
        if (status == EventStatus.EN_EDICION || status == EventStatus.PAUSADO) {
            this.status = EventStatus.PUBLICADO;
            this.isActive = true;
        }
    }

    public void pause() {
        if (status == EventStatus.PUBLICADO) {
            this.status = EventStatus.PAUSADO;
        }
    }

    public void cancel() {
        this.status = EventStatus.CANCELADO;
        this.isActive = false;
    }

    public void finish() {
        this.status = EventStatus.TERMINADO;
        this.isActive = false;
    }

    public void backToEdition() {
        if (status == EventStatus.PAUSADO) {
            this.status = EventStatus.EN_EDICION;
            this.isActive = false;
        }
    }

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