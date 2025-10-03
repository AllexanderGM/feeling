package com.feeling.packages.user.infrastructure.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.feeling.packages.user.domain.enums.TagApprovalStatus;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidad que representa un tag o etiqueta que los usuarios pueden utilizar para describirse.
 * Los tags son dinámicos y pueden ser creados por los usuarios, pero requieren aprobación administrativa.
 *
 * Características principales:
 * - Sistema de aprobación para evitar contenido inapropiado
 * - Contador de uso para estadísticas y trending
 * - Normalización automática de nombres (lowercase)
 * - Relación many-to-many con usuarios
 * - Sistema de trending para tags populares
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "user_tags")
public class UserTag {
    /**
     * Identificador único del tag.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nombre del tag (ej: "fiestero", "amante del café", "rockero").
     * Se almacena en lowercase para evitar duplicados.
     */
    @Column(nullable = false, unique = true)
    private String name;

    /**
     * Fecha y hora de creación del tag.
     */
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Email del usuario que creó el tag.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Número de usuarios que actualmente tienen este tag.
     * Se actualiza automáticamente cuando los usuarios añaden/remueven el tag.
     */
    @Column(name = "usage_count")
    @Builder.Default
    private Long usageCount = 0L;

    /**
     * Fecha y hora de la última vez que alguien añadió este tag a su perfil.
     * Utilizado para calcular tags trending y estadísticas de popularidad reciente.
     */
    @Column(name = "last_used")
    private LocalDateTime lastUsed;

    /**
     * Indica si el tag está en tendencia (trending).
     * Los tags trending son aquellos con alto uso reciente y se destacan en la UI.
     * Se calcula periódicamente basado en usageCount y lastUsed.
     */
    @Column(name = "trending")
    @Builder.Default
    private Boolean trending = false;

    // ========================================
    // SISTEMA DE APROBACIÓN DE TAGS
    // ========================================

    /**
     * Estado de aprobación del tag por parte de los administradores.
     * <p>
     * Estados posibles:
     * - PENDING: Tag recién creado, pendiente de revisión
     * - APPROVED: Tag aprobado, visible para todos los usuarios
     * - REJECTED: Tag rechazado por contenido inapropiado u otras razones
     * <p>
     * Solo los tags aprobados son visibles en búsquedas y pueden ser usados por otros usuarios.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    @Builder.Default
    private TagApprovalStatus approvalStatus = TagApprovalStatus.PENDING;

    /**
     * Email del administrador que aprobó el tag.
     * Permite trazabilidad de las decisiones de moderación.
     */
    @Column(name = "approved_by")
    private String approvedBy;

    /**
     * Fecha y hora en que el tag fue aprobado.
     * Utilizado para auditoría y estadísticas de moderación.
     */
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    /**
     * Razón por la cual el tag fue rechazado.
     * Ayuda a los usuarios a entender por qué su tag no fue aprobado
     * y permite mejorar la calidad de los tags futuros.
     */
    @Column(name = "rejection_reason")
    private String rejectionReason;


    // ========================================
    // RELACIONES
    // ========================================

    /**
     * Lista de usuarios que actualmente tienen este tag en su perfil.
     * Relación many-to-many inversa mapeada desde User.tags.
     * Se carga de forma lazy para optimizar el rendimiento.
     */
    @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
    private List<User> users;

    // ========================================
    // CONSTRUCTORES DE UTILIDAD
    // ========================================
    /**
     * Constructor de conveniencia para crear un nuevo tag.
     * Normaliza automáticamente el nombre a lowercase.
     *
     * @param name Nombre del tag
     * @param createdBy Email del usuario creador
     */
    public UserTag(String name, String createdBy) {
        this.name = name.toLowerCase().trim();
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
        this.usageCount = 1L;
        this.lastUsed = LocalDateTime.now();
    }

    /**
     * Constructor alternativo que acepta un parámetro description por compatibilidad.
     * El parámetro description ya no se usa pero se mantiene para compatibilidad con código legacy.
     *
     * @param name Nombre del tag
     * @param description Descripción (deprecado, se ignora)
     * @param createdBy Email del usuario creador
     * @deprecated Usar {@link #UserTag(String, String)} en su lugar
     */
    @Deprecated
    public UserTag(String name, String description, String createdBy) {
        this(name, createdBy);
    }

    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================

    /**
     * Incrementa el contador de uso cuando un usuario añade este tag.
     * Actualiza automáticamente la fecha de último uso.
     */
    public void incrementUsage() {
        this.usageCount++;
        this.lastUsed = LocalDateTime.now();
    }

    /**
     * Decrementa el contador de uso cuando un usuario remueve este tag.
     * No permite valores negativos.
     */
    public void decrementUsage() {
        if (this.usageCount > 0) {
            this.usageCount--;
        }
    }

    /**
     * Verifica si el tag debería ser eliminado por falta de uso.
     *
     * @return true si ningún usuario tiene este tag
     */
    public boolean shouldBeDeleted() {
        return this.usageCount == 0;
    }

    /**
     * Setter que normaliza automáticamente el nombre del tag a lowercase.
     *
     * @param name Nombre del tag a normalizar
     */
    public void setName(String name) {
        this.name = name != null ? name.toLowerCase().trim() : null;
    }

    /**
     * Obtiene el nombre del tag formateado para mostrar al usuario.
     * Capitaliza la primera letra de cada palabra.
     *
     * @return Nombre formateado (ej: "Amante Del Café")
     */
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

    /**
     * Marca el tag como trending (en tendencia).
     * Los tags trending se destacan en la interfaz de usuario para facilitar su descubrimiento.
     */
    public void markAsTrending() {
        this.trending = true;
    }

    /**
     * Desmarca el tag como trending.
     * Se ejecuta cuando el tag deja de cumplir los criterios de popularidad reciente.
     */
    public void unmarkAsTrending() {
        this.trending = false;
    }

    /**
     * Verifica si el tag está aprobado y puede ser usado por los usuarios.
     *
     * @return true si el estado de aprobación es APPROVED
     */
    public boolean isApproved() {
        return this.approvalStatus == TagApprovalStatus.APPROVED;
    }

    /**
     * Aprueba el tag y registra quién y cuándo lo aprobó.
     * Limpia cualquier razón de rechazo previa.
     *
     * @param approvedByEmail Email del administrador que aprobó el tag
     */
    public void approve(String approvedByEmail) {
        this.approvalStatus = TagApprovalStatus.APPROVED;
        this.approvedBy = approvedByEmail;
        this.approvedAt = LocalDateTime.now();
        this.rejectionReason = null; // Limpiar razón de rechazo si existía
    }

    /**
     * Rechaza el tag con una razón específica.
     * Limpia cualquier información de aprobación previa.
     *
     * @param rejectionReason Razón por la cual se rechaza el tag
     */
    public void reject(String rejectionReason) {
        this.approvalStatus = TagApprovalStatus.REJECTED;
        this.rejectionReason = rejectionReason;
        this.approvedBy = null;
        this.approvedAt = null;
    }

    /**
     * Verifica si el tag está pendiente de aprobación.
     *
     * @return true si el estado de aprobación es PENDING
     */
    public boolean isPendingApproval() {
        return this.approvalStatus == TagApprovalStatus.PENDING;
    }

    /**
     * Verifica si el tag fue rechazado por los administradores.
     *
     * @return true si el estado de aprobación es REJECTED
     */
    public boolean isRejected() {
        return this.approvalStatus == TagApprovalStatus.REJECTED;
    }

    /**
     * Compara dos tags por igualdad basándose en el nombre.
     * Dos tags son iguales si tienen el mismo nombre (normalizado).
     *
     * @param obj Objeto a comparar
     * @return true si los tags tienen el mismo nombre
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        UserTag userTag = (UserTag) obj;
        return name != null && name.equals(userTag.name);
    }

    /**
     * Genera el hash code basado en el nombre del tag.
     * Garantiza coherencia con el método equals().
     *
     * @return Hash code del nombre del tag
     */
    @Override
    public int hashCode() {
        return name != null ? name.hashCode() : 0;
    }

    /**
     * Representación en String del tag para debugging y logging.
     *
     * @return String con los campos principales del tag
     */
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
