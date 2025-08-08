package com.feeling.infrastructure.entities.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "user_tags")
public class UserTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // Nombre del tag (ej: "fiestero", "amante del café", "rockero")

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "created_by")
    private String createdBy; // Email del usuario que creó el tag

    @Column(name = "usage_count")
    @Builder.Default
    private Long usageCount = 0L; // Cuántos usuarios tienen este tag

    @Column(name = "last_used")
    private LocalDateTime lastUsed; // Última vez que alguien usó este tag

    // NUEVO CAMPO AGREGADO
    @Column(name = "trending")
    @Builder.Default
    private Boolean trending = false; // Si el tag está en tendencia

    // SISTEMA DE APROBACIÓN DE TAGS
    @Builder.Default
    private Boolean approved = false; // Si el tag está aprobado por administrador
    
    @Column(name = "approved_by")
    private String approvedBy; // Email del admin que aprobó el tag
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt; // Fecha de aprobación
    
    @Column(name = "rejection_reason")
    private String rejectionReason; // Razón de rechazo si aplica

    // ========================================
    // RELACIONES
    // ========================================
    @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
    private List<User> users; // Usuarios que tienen este tag

    // ========================================
    // CONSTRUCTORES DE UTILIDAD
    // ========================================
    public UserTag(String name, String createdBy) {
        this.name = name.toLowerCase().trim();
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
        this.usageCount = 1L;
        this.lastUsed = LocalDateTime.now();
    }

    public UserTag(String name, String description, String createdBy) {
        this(name, createdBy);
    }

    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================

    // Incrementar el contador de uso cuando un usuario añade este tag
    public void incrementUsage() {
        this.usageCount++;
        this.lastUsed = LocalDateTime.now();
    }

    // Decrementar el contador cuando un usuario remueve este tag
    public void decrementUsage() {
        if (this.usageCount > 0) {
            this.usageCount--;
        }
    }

    // Verificar si el tag debe ser eliminado (sin usuarios)
    public boolean shouldBeDeleted() {
        return this.usageCount == 0;
    }

    // Método para normalizar el nombre del tag
    public void setName(String name) {
        this.name = name != null ? name.toLowerCase().trim() : null;
    }

    // Método para obtener el nombre con formato para mostrar
    public String getDisplayName() {
        if (this.name == null) return "";

        // Capitalizar la primera letra de cada palabra
        String[] words = this.name.split("\\s+");
        StringBuilder result = new StringBuilder();

        for (String word : words) {
            if (word.length() > 0) {
                result.append(Character.toUpperCase(word.charAt(0)))
                        .append(word.substring(1).toLowerCase())
                        .append(" ");
            }
        }

        return result.toString().trim();
    }

    // NUEVOS MÉTODOS PARA TRENDING
    public void markAsTrending() {
        this.trending = true;
    }

    public void unmarkAsTrending() {
        this.trending = false;
    }

    // MÉTODOS PARA APROBACIÓN
    public void approve(String approvedByEmail) {
        this.approved = true;
        this.approvedBy = approvedByEmail;
        this.approvedAt = LocalDateTime.now();
        this.rejectionReason = null; // Limpiar razón de rechazo si existía
    }

    public void reject(String rejectionReason) {
        this.approved = false;
        this.rejectionReason = rejectionReason;
        this.approvedBy = null;
        this.approvedAt = null;
    }

    public boolean isApproved() {
        return this.approved != null && this.approved;
    }

    public boolean isPendingApproval() {
        return this.approved == null || !this.approved;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        UserTag userTag = (UserTag) obj;
        return name != null && name.equals(userTag.name);
    }

    @Override
    public int hashCode() {
        return name != null ? name.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "UserTag{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", usageCount=" + usageCount +
                ", trending=" + trending +
                '}';
    }
}
