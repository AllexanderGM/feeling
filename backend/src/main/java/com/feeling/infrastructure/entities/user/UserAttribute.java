package com.feeling.infrastructure.entities.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "user_attributes", uniqueConstraints = @UniqueConstraint(columnNames = {"code", "attribute_type"}))
public class UserAttribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String code; // Código único para el atributo (ej: "MALE", "FEMALE")

    @Column(nullable = false)
    private String name; // Nombre para mostrar (ej: "Masculino", "Femenino")

    @Column(name = "attribute_type", nullable = false)
    private String attributeType; // Tipo del atributo (ej: "GENDER", "RELIGION", "BODY_TYPE")

    @Column(columnDefinition = "TEXT")
    private String description; // Descripción opcional

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0; // Orden para mostrar en formularios

    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true; // Si está activo para selección

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // ========================================
    // CONSTRUCTORES DE UTILIDAD
    // ========================================
    public UserAttribute(String code, String name, String attributeType) {
        this.code = code.toUpperCase();
        this.name = name;
        this.attributeType = attributeType.toUpperCase();
        this.active = true;
        this.displayOrder = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public UserAttribute(String code, String name, String attributeType, String description, Integer displayOrder) {
        this(code, name, attributeType);
        this.description = description;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }

    // ========================================
    // MÉTODOS DE UTILIDAD
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
        if (this.code != null) {
            this.code = this.code.toUpperCase();
        }
        if (this.attributeType != null) {
            this.attributeType = this.attributeType.toUpperCase();
        }
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        UserAttribute that = (UserAttribute) obj;
        return code != null && code.equals(that.code) &&
                attributeType != null && attributeType.equals(that.attributeType);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(code, attributeType);
    }

    @Override
    public String toString() {
        return "UserAttribute{" +
                "id=" + id +
                ", code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", attributeType='" + attributeType + '\'' +
                ", active=" + active +
                '}';
    }
}
