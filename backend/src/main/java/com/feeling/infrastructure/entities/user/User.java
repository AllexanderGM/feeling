package com.feeling.infrastructure.entities.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========================================
    // DATOS BÁSICOS OBLIGATORIOS
    // ========================================
    @NotNull
    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @NotNull
    @NotBlank(message = "El apellido es obligatorio")
    private String lastname;

    @NotNull
    @Getter
    @Email(message = "El correo debe ser válido")
    @Column(unique = true, nullable = false)
    private String email;

    @NotNull
    @NotBlank(message = "La contraseña no puede estar vacía")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    @Column(nullable = false)
    @Builder.Default
    private boolean verified = false;

    @Column(name = "profile_complete")
    @Builder.Default
    private boolean profileComplete = false;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "last_active")
    private LocalDateTime lastActive;

    // ========================================
    // RELACIONES PRINCIPALES
    // ========================================
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private UserRole userRole;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserToken> userTokens = new ArrayList<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_interest_id")
    private UserCategoryInterest userCategoryInterest;

    // ========================================
    // DATOS PERSONALES BÁSICOS
    // ========================================
    @ElementCollection
    @CollectionTable(name = "user_images", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    private String document;

    @Pattern(regexp = "\\d{9,15}", message = "El teléfono debe tener entre 9 y 15 dígitos")
    private String phone;

    private LocalDate dateOfBirth;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ========================================
    // UBICACIÓN GEOGRÁFICA
    // ========================================
    private String country;
    private String department; // Estado/Provincia
    private String city;
    private String locality; // Localidad/Barrio específico

    // ========================================
    // CARACTERÍSTICAS DINÁMICAS (Reemplaza ENUMs)
    // ========================================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gender_id")
    private UserAttribute gender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marital_status_id")
    private UserAttribute maritalStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "eye_color_id")
    private UserAttribute eyeColor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hair_color_id")
    private UserAttribute hairColor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "body_type_id")
    private UserAttribute bodyType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "religion_id")
    private UserAttribute religion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sexual_role_id")
    private UserAttribute sexualRole; // Para ROUSE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relationship_type_id")
    private UserAttribute relationshipType; // Para ROUSE

    // ========================================
    // DATOS COMPLEMENTARIOS
    // ========================================
    private String profession;
    private String education;

    @Column(name = "height_cm")
    private Integer height; // Altura en centímetros

    // Información religiosa específica (Para SPIRIT)
    private String church;
    @Column(columnDefinition = "TEXT")
    private String spiritualMoments;
    @Column(columnDefinition = "TEXT")
    private String spiritualPractices;

    // ========================================
    // SISTEMA DE TAGS DINÁMICO
    // ========================================
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "user_tag_relations", // Nombre diferente para evitar conflictos
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private List<UserTag> tags = new ArrayList<>();

    // ========================================
    // PREFERENCIAS DE MATCHING
    // ========================================
    @Column(name = "age_preference_min")
    private Integer agePreferenceMin;

    @Column(name = "age_preference_max")
    private Integer agePreferenceMax;

    @Column(name = "location_preference_radius_km")
    private Integer locationPreferenceRadius; // Radio en kilómetros

    @Column(name = "show_me_in_search")
    @Builder.Default
    private boolean showMeInSearch = true;

    @Column(name = "allow_notifications")
    @Builder.Default
    private boolean allowNotifications = true;

    // ========================================
    // MÉTRICAS SOCIALES Y GAMIFICACIÓN
    // ========================================
    @Column(name = "profile_views")
    @Builder.Default
    private Long profileViews = 0L;

    @Column(name = "likes_received")
    @Builder.Default
    private Long likesReceived = 0L;

    @Column(name = "matches_count")
    @Builder.Default
    private Long matchesCount = 0L;

    @Column(name = "popularity_score")
    @Builder.Default
    private Double popularityScore = 0.0;

    // ========================================
    // SISTEMA DE INTENTOS/PINES (Del PPT)
    // ========================================
    @Column(name = "available_attempts")
    @Builder.Default
    private Integer availableAttempts = 0;

    @Column(name = "total_attempts_purchased")
    @Builder.Default
    private Integer totalAttemptsPurchased = 0;

    @Column(name = "attempts_expiry_date")
    private LocalDateTime attemptsExpiryDate; // Válidos solo el primer año

    // ========================================
    // CONFIGURACIÓN DE PRIVACIDAD
    // ========================================
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
    // MÉTODOS DE UserDetails
    // ========================================
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(userRole);
    }

    @Override
    public String getUsername() {
        return this.name + " " + this.lastname;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return verified;
    }

    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================
    public Integer getAge() {
        if (dateOfBirth == null) return null;
        return LocalDate.now().getYear() - dateOfBirth.getYear();
    }

    public boolean isProfileComplete() {
        return name != null && lastname != null &&
                dateOfBirth != null && gender != null &&
                userCategoryInterest != null &&
                images != null && !images.isEmpty() &&
                description != null && !description.trim().isEmpty();
    }

    public String getMainImage() {
        return images != null && !images.isEmpty() ? images.get(0) : null;
    }

    public boolean hasActiveAttempts() {
        return availableAttempts != null && availableAttempts > 0 &&
                (attemptsExpiryDate == null || attemptsExpiryDate.isAfter(LocalDateTime.now()));
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
    // GESTIÓN DE MÉTRICAS
    // ========================================
    public void incrementProfileViews() {
        this.profileViews++;
        updateLastActive();
    }

    public void incrementLikes() {
        this.likesReceived++;
        updatePopularityScore();
    }

    public void incrementMatches() {
        this.matchesCount++;
        updatePopularityScore();
    }

    public void useAttempt() {
        if (hasActiveAttempts()) {
            this.availableAttempts--;
        }
    }

    public void addAttempts(Integer attempts) {
        if (this.availableAttempts == null) {
            this.availableAttempts = 0;
        }
        this.availableAttempts += attempts;

        if (this.totalAttemptsPurchased == null) {
            this.totalAttemptsPurchased = 0;
        }
        this.totalAttemptsPurchased += attempts;

        // Establecer fecha de expiración (1 año desde la compra)
        if (this.attemptsExpiryDate == null) {
            this.attemptsExpiryDate = LocalDateTime.now().plusYears(1);
        }
    }

    private void updatePopularityScore() {
        // Algoritmo simple de popularidad
        double viewsWeight = 0.3;
        double likesWeight = 0.5;
        double matchesWeight = 0.2;

        this.popularityScore = (profileViews * viewsWeight) +
                (likesReceived * likesWeight) +
                (matchesCount * matchesWeight);
    }

    private void updateLastActive() {
        this.lastActive = LocalDateTime.now();
    }

    // ========================================
    // MÉTODOS DE ACTUALIZACIÓN
    // ========================================
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.profileComplete = isProfileComplete();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
        this.profileComplete = isProfileComplete();
    }

    // ========================================
    // MÉTODOS PARA MATCHING
    // ========================================
    public boolean isCompatibleWith(User otherUser) {
        // Lógica básica de compatibilidad
        if (otherUser == null || !otherUser.isEnabled() || !otherUser.showMeInSearch) {
            return false;
        }

        // Verificar categoría de interés
        if (this.userCategoryInterest != null && otherUser.userCategoryInterest != null) {
            if (!this.userCategoryInterest.equals(otherUser.userCategoryInterest)) {
                return false;
            }
        }

        // Verificar rango de edad
        Integer myAge = this.getAge();
        Integer otherAge = otherUser.getAge();

        if (myAge != null && this.agePreferenceMin != null && this.agePreferenceMax != null) {
            return otherAge >= this.agePreferenceMin && otherAge <= this.agePreferenceMax;
        }

        return true;
    }

    public double calculateCompatibilityScore(User otherUser) {
        if (!isCompatibleWith(otherUser)) {
            return 0.0;
        }

        double score = 0.0;
        int factors = 0;

        // Coincidencia en tags (peso: 40%)
        if (this.tags != null && otherUser.tags != null && !this.tags.isEmpty() && !otherUser.tags.isEmpty()) {
            long commonTags = this.tags.stream()
                    .filter(tag -> otherUser.tags.contains(tag))
                    .count();
            double tagScore = (double) commonTags / Math.max(this.tags.size(), otherUser.tags.size());
            score += tagScore * 0.4;
            factors++;
        }

        // Proximidad geográfica (peso: 30%)
        if (this.city != null && otherUser.city != null) {
            if (this.city.equalsIgnoreCase(otherUser.city)) {
                score += 0.3;
            } else if (this.department != null && otherUser.department != null &&
                    this.department.equalsIgnoreCase(otherUser.department)) {
                score += 0.15;
            }
            factors++;
        }

        // Compatibilidad religiosa para SPIRIT (peso: 20%)
        if (this.userCategoryInterest != null &&
                "SPIRIT".equals(this.userCategoryInterest.getCategoryInterest().name())) {
            if (this.religion != null && otherUser.religion != null &&
                    this.religion.equals(otherUser.religion)) {
                score += 0.2;
            }
            factors++;
        }

        // Otros factores (edad similar, etc.) (peso: 10%)
        Integer myAge = this.getAge();
        Integer otherAge = otherUser.getAge();
        if (myAge != null && otherAge != null) {
            int ageDiff = Math.abs(myAge - otherAge);
            if (ageDiff <= 5) {
                score += 0.1;
            } else if (ageDiff <= 10) {
                score += 0.05;
            }
            factors++;
        }

        return factors > 0 ? score : 0.0;
    }
}
