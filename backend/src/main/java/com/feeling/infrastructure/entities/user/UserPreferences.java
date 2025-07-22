package com.feeling.infrastructure.entities.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_preferences")
public class UserPreferences {
    
    @Id
    private Long userId; // Mismo ID que User para relación 1:1
    
    // ========================================
    // CATEGORÍA DE INTERÉS Y TAGS
    // ========================================
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_interest_id")
    private UserCategoryInterest userCategoryInterest;
    
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "user_preferences_tags",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private List<UserTag> tags = new ArrayList<>();
    
    // ========================================
    // PREFERENCIAS DE MATCHING
    // ========================================
    
    @Min(value = 18, message = "La edad mínima debe ser 18 años")
    @Max(value = 80, message = "La edad máxima debe ser 80 años")
    @Column(name = "age_preference_min")
    private Integer agePreferenceMin;
    
    @Min(value = 18, message = "La edad mínima debe ser 18 años")
    @Max(value = 80, message = "La edad máxima debe ser 80 años")
    @Column(name = "age_preference_max")
    private Integer agePreferenceMax;
    
    @Min(value = 5, message = "El radio mínimo es 5 km")
    @Max(value = 1000, message = "El radio máximo es 1000 km")
    @Column(name = "location_preference_radius_km")
    private Integer locationPreferenceRadius;
    
    // ========================================
    // DATOS ESPECÍFICOS POR CATEGORÍA
    // ========================================
    
    // SPIRIT - Datos espirituales
    @Size(max = 100, message = "El nombre de la iglesia no puede exceder 100 caracteres")
    private String church;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "religion_id")
    private UserAttribute religion;
    
    @Size(max = 1000, message = "Los momentos espirituales no pueden exceder 1000 caracteres")
    @Column(name = "spiritual_moments", columnDefinition = "TEXT")
    private String spiritualMoments;
    
    @Size(max = 1000, message = "Las prácticas espirituales no pueden exceder 1000 caracteres")
    @Column(name = "spiritual_practices", columnDefinition = "TEXT")
    private String spiritualPractices;
    
    // ROUSE - Datos de relaciones
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sexual_role_id")
    private UserAttribute sexualRole;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relationship_type_id")
    private UserAttribute relationshipType;
    
    // ========================================
    // CONFIGURACIÓN DE PRIVACIDAD
    // ========================================
    
    @Column(name = "show_me_in_search")
    @Builder.Default
    private boolean showMeInSearch = true;
    
    @Column(name = "allow_notifications")
    @Builder.Default
    private boolean allowNotifications = true;
    
    @Column(name = "show_age")
    @Builder.Default
    private boolean showAge = true;
    
    @Column(name = "show_location")
    @Builder.Default
    private boolean showLocation = true;
    
    @Column(name = "show_phone")
    @Builder.Default
    private boolean showPhone = false;
    
    // ========================================
    // CAMPOS DE AUDITORIA
    // ========================================
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // ========================================
    // RELACIÓN CON USER
    // ========================================
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
    
    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================
    
    public boolean hasCompletePreferences() {
        return userCategoryInterest != null &&
               agePreferenceMin != null && agePreferenceMax != null &&
               locationPreferenceRadius != null &&
               tags != null && !tags.isEmpty();
    }
    
    public boolean hasValidAgeRange() {
        return agePreferenceMin != null && agePreferenceMax != null &&
               agePreferenceMin <= agePreferenceMax;
    }
    
    public boolean hasRequiredFieldsForCategory() {
        if (userCategoryInterest == null) return false;
        
        return switch (userCategoryInterest.getCategoryInterestEnum()) {
            case SPIRIT -> religion != null;
            case ROUSE -> sexualRole != null && relationshipType != null;
            case ESSENCE -> true; // No campos adicionales requeridos
        };
    }
    
    // ========================================
    // GESTIÓN DE TAGS
    // ========================================
    
    public void addTag(UserTag tag) {
        if (tags == null) {
            tags = new ArrayList<>();
        }
        if (!tags.contains(tag)) {
            tags.add(tag);
            tag.incrementUsage();
        }
    }
    
    public void removeTag(UserTag tag) {
        if (tags != null && tags.contains(tag)) {
            tags.remove(tag);
            tag.decrementUsage();
        }
    }
    
    public List<String> getTagNames() {
        return tags != null ? tags.stream().map(UserTag::getName).toList() : new ArrayList<>();
    }
    
    // ========================================
    // MÉTODOS DE ACTUALIZACIÓN
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