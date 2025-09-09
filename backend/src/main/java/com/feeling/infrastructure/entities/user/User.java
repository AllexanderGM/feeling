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
    @Column(name = "lastname")
    private String lastName;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    @Builder.Default
    private UserApprovalStatusList approvalStatus = UserApprovalStatusList.PENDING;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "last_active")
    private LocalDateTime lastActive;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private UserRole userRole;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserToken> userTokens = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserComplaint> complaints = new ArrayList<>();

    // ========================================
    // DATOS PERSONALES BÁSICOS
    // ========================================
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_images", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    private String document;

    @Pattern(regexp = "^$|^\\d{7,15}$", message = "El teléfono debe contener entre 7 y 15 dígitos")
    private String phone;

    @Pattern(regexp = "^$|^\\+\\d{1,4}$", message = "El código de país debe tener formato +XX")
    @Column(name = "phone_code")
    private String phoneCode;

    private LocalDate dateOfBirth;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ========================================
    // UBICACIÓN GEOGRÁFICA
    // ========================================
    private String country;
    private String city;
    private String department; // Estado/Provincia
    private String locality; // Localidad/Barrio específico

    // ========================================
    // CARACTERÍSTICAS
    // ========================================
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_interest_id")
    private UserCategoryInterest categoryInterest;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "gender_id")
    private UserAttribute gender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marital_status_id")
    private UserAttribute maritalStatus;

    @Column(name = "height_cm")
    private Integer height;

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
    @JoinColumn(name = "education_level_id")
    private UserAttribute education;

    private String profession;

    // ========================================
    // SISTEMA DE TAGS DINÁMICO
    // ========================================
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.MERGE})
    @JoinTable(
            name = "user_tag_relations",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private List<UserTag> tags = new ArrayList<>();

    // ========================================
    // DATOS PARA SPIRIT
    // ========================================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "church_id")
    private UserAttribute church;
    
    private String customChurch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "religion_id")
    private UserAttribute religion;

    @Column(columnDefinition = "TEXT")
    private String spiritualMoments;

    @Column(columnDefinition = "TEXT")
    private String spiritualPractices;

    // ========================================
    // DATOS PARA ROUSE
    // ========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sexual_role_id")
    private UserAttribute sexualRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relationship_type_id")
    private UserAttribute relationshipType;

    // ========================================
    // PREFERENCIAS DE MATCHING
    // ========================================
    @Column(name = "age_preference_min")
    private Integer agePreferenceMin;

    @Column(name = "age_preference_max")
    private Integer agePreferenceMax;

    @Column(name = "location_preference_radius_km")
    private Integer locationPreferenceRadius;

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
    // CONFIGURACIÓN EXTENDIDA DE PRIVACIDAD
    // ========================================
    @Column(name = "public_account")
    @Builder.Default
    private boolean publicAccount = true;

    @Column(name = "search_visibility")
    @Builder.Default
    private boolean searchVisibility = true;

    @Column(name = "location_public")
    @Builder.Default
    private boolean locationPublic = true;

    // ========================================
    // CONFIGURACIÓN DE NOTIFICACIONES
    // ========================================
    @Column(name = "notifications_email_enabled")
    @Builder.Default
    private boolean notificationsEmailEnabled = true;

    @Column(name = "notifications_phone_enabled")
    @Builder.Default
    private boolean notificationsPhoneEnabled = false;

    @Column(name = "notifications_matches_enabled")
    @Builder.Default
    private boolean notificationsMatchesEnabled = true;

    @Column(name = "notifications_events_enabled")
    @Builder.Default
    private boolean notificationsEventsEnabled = true;

    @Column(name = "notifications_login_enabled")
    @Builder.Default
    private boolean notificationsLoginEnabled = true;

    @Column(name = "notifications_payments_enabled")
    @Builder.Default
    private boolean notificationsPaymentsEnabled = true;

    // ========================================
    // GESTIÓN DE CUENTA
    // ========================================
    @Column(name = "account_deactivated")
    @Builder.Default
    private boolean accountDeactivated = false;

    @Column(name = "deactivation_date")
    private LocalDateTime deactivationDate;

    @Column(name = "deactivation_reason")
    private String deactivationReason;

    /**
     * Indica si el usuario está protegido contra eliminación accidental.
     * Usuarios como el administrador principal no deben ser eliminados.
     */
    @Column(name = "protected_user")
    @Builder.Default
    private Boolean protectedUser = false;

    /**
     * Método helper para verificar si el usuario está protegido
     * Maneja valores null de manera segura
     */
    public boolean isProtectedUser() {
        return protectedUser != null && protectedUser;
    }

    // ========================================
    // CAMPOS DE AUTENTICACIÓN MÚLTIPLE
    // ========================================

    /**
     * Proveedor de autenticación utilizado por este usuario
     */
    @Column(name = "auth_provider", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UserAuthProvider userAuthProvider = UserAuthProvider.LOCAL;

    /**
     * ID único del usuario en el proveedor externo (Google ID, Facebook ID, etc.)
     * Solo se usa para proveedores OAuth externos
     */
    @Column(name = "external_id")
    private String externalId;

    /**
     * URL del avatar proporcionado por el proveedor externo
     * Puede ser diferente de las imágenes del perfil que el usuario suba
     */
    @Column(name = "external_avatar_url")
    private String externalAvatarUrl;

    /**
     * Fecha de la última sincronización con el proveedor externo
     */
    @Column(name = "last_external_sync")
    private LocalDateTime lastExternalSync;

    // ========================================
    // MÉTODOS DE UTILIDAD PARA AUTENTICACIÓN
    // ========================================

    /**
     * Verifica si el usuario puede usar login tradicional con contraseña
     */
    public boolean canUseLocalPassword() {
        return userAuthProvider == UserAuthProvider.LOCAL && password != null;
    }

    /**
     * Verifica si el usuario se registró con un proveedor OAuth
     */
    public boolean isOAuthUser() {
        return userAuthProvider.isExternalOAuth();
    }

    /**
     * Obtiene el mensaje apropiado para mostrar al usuario cuando intenta
     * usar un método de login incorrecto
     */
    public String getAuthMethodMessage() {
        return switch (userAuthProvider) {
            case LOCAL -> "Inicia sesión con tu email y contraseña";
            case GOOGLE -> "Inicia sesión con tu cuenta de Google";
            case FACEBOOK -> "Inicia sesión con tu cuenta de Facebook";
            case APPLE -> "Inicia sesión con tu cuenta de Apple";
        };
    }

    /**
     * Actualiza la información desde un proveedor OAuth
     */
    public void updateFromOAuthProvider(String externalId, String name, String lastName,
                                        String email, String avatarUrl) {
        this.externalId = externalId;
        this.externalAvatarUrl = avatarUrl;
        this.lastExternalSync = LocalDateTime.now();

        // Actualizar información básica solo si no está establecida
        if (this.name == null || this.name.trim().isEmpty()) {
            this.name = name;
        }
        if (this.lastName == null || this.lastName.trim().isEmpty()) {
            this.lastName = lastName;
        }

        // NO añadir avatar externo a la lista de imágenes
        // El avatar externo se maneja por separado en externalAvatarUrl

        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Convierte un usuario OAuth a usuario local (permite login con contraseña)
     */
    public void enableLocalPassword(String hashedPassword) {
        if (this.userAuthProvider.isExternalOAuth()) {
            this.password = hashedPassword;
            // Mantener el proveedor original, pero ahora también puede usar contraseña
        }
    }

    // ========================================
    // MÉTODOS DE UserDetails
    // ========================================
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(userRole);
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public String getPassword() {
        return this.password;
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
        return verified && !accountDeactivated; // Deben verificar email y no estar desactivados
    }

    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================
    public Integer getAge() {
        if (dateOfBirth == null) return null;
        return LocalDate.now().getYear() - dateOfBirth.getYear();
    }

    /**
     * Getter para el campo profileComplete
     */
    public boolean getProfileComplete() {
        return this.profileComplete;
    }

    /**
     * Setter para el campo profileComplete
     */
    public void setProfileComplete(boolean profileComplete) {
        this.profileComplete = profileComplete;
    }

    /**
     * Calcula dinámicamente si el perfil está completo basándose en los esquemas de validación del frontend
     */
    public boolean isProfileComplete() {
        // STEP 1: Información básica - stepBasicInfoSchema
        boolean step1Complete = name != null && !name.trim().isEmpty() &&
                lastName != null && !lastName.trim().isEmpty() &&
                document != null && !document.trim().isEmpty() &&
                phone != null && !phone.trim().isEmpty() &&
                phoneCode != null && !phoneCode.trim().isEmpty() &&
                dateOfBirth != null &&
                country != null && !country.trim().isEmpty() &&
                city != null && !city.trim().isEmpty() &&
                images != null && !images.isEmpty();

        // STEP 2: Características - stepCharacteristicsSchema  
        boolean step2Complete = description != null && !description.trim().isEmpty() &&
                gender != null &&
                height != null && height > 0 &&
                getApprovedTags() != null && !getApprovedTags().isEmpty();

        // STEP 3: Preferencias - stepPreferencesSchema
        boolean step3Complete = categoryInterest != null &&
                agePreferenceMin != null && agePreferenceMin >= 18 &&
                agePreferenceMax != null && agePreferenceMax <= 80 &&
                locationPreferenceRadius != null && locationPreferenceRadius >= 5;

        // STEP 3: Validaciones condicionales según categoría
        boolean conditionalFieldsComplete = true;
        if (categoryInterest != null) {
            switch (categoryInterest.getCategoryInterestEnum()) {
                case SPIRIT:
                    // Para SPIRIT: religión es obligatoria
                    conditionalFieldsComplete = religion != null;
                    break;
                case ROUSE:
                    // Para ROUSE: rol sexual y tipo de relación son obligatorios
                    conditionalFieldsComplete = sexualRole != null && relationshipType != null;
                    break;
                case ESSENCE:
                    // Para ESSENCE: no hay campos adicionales obligatorios
                    break;
            }
        }

        return step1Complete && step2Complete && step3Complete && conditionalFieldsComplete;
    }

    /**
     * Calcula el porcentaje de completitud del perfil (0.0 - 100.0)
     */
    public Double getProfileCompletenessPercentage() {
        int totalFields = 0;
        int completedFields = 0;

        // ========================================
        // CAMPOS OBLIGATORIOS (STEP 1: Información básica)
        // ========================================
        totalFields += 9; // name, lastName, document, phone, phoneCode, dateOfBirth, country, city, images
        
        if (name != null && !name.trim().isEmpty()) completedFields++;
        if (lastName != null && !lastName.trim().isEmpty()) completedFields++;
        if (document != null && !document.trim().isEmpty()) completedFields++;
        if (phone != null && !phone.trim().isEmpty()) completedFields++;
        if (phoneCode != null && !phoneCode.trim().isEmpty()) completedFields++;
        if (dateOfBirth != null) completedFields++;
        if (country != null && !country.trim().isEmpty()) completedFields++;
        if (city != null && !city.trim().isEmpty()) completedFields++;
        if (images != null && !images.isEmpty()) completedFields++;

        // ========================================
        // CAMPOS OBLIGATORIOS (STEP 2: Características)
        // ========================================
        totalFields += 4; // description, gender, height, tags
        
        if (description != null && !description.trim().isEmpty()) completedFields++;
        if (gender != null) completedFields++;
        if (height != null && height > 0) completedFields++;
        if (getApprovedTags() != null && !getApprovedTags().isEmpty()) completedFields++;

        // ========================================
        // CAMPOS OBLIGATORIOS (STEP 3: Preferencias)
        // ========================================
        totalFields += 4; // categoryInterest, agePreferenceMin, agePreferenceMax, locationPreferenceRadius
        
        if (categoryInterest != null) completedFields++;
        if (agePreferenceMin != null && agePreferenceMin >= 18) completedFields++;
        if (agePreferenceMax != null && agePreferenceMax <= 80) completedFields++;
        if (locationPreferenceRadius != null && locationPreferenceRadius >= 5) completedFields++;

        // ========================================
        // CAMPOS CONDICIONALES SEGÚN CATEGORÍA
        // ========================================
        if (categoryInterest != null) {
            switch (categoryInterest.getCategoryInterestEnum()) {
                case SPIRIT:
                    totalFields += 1; // religión
                    if (religion != null) completedFields++;
                    break;
                case ROUSE:
                    totalFields += 2; // sexualRole, relationshipType
                    if (sexualRole != null) completedFields++;
                    if (relationshipType != null) completedFields++;
                    break;
                case ESSENCE:
                    // No hay campos adicionales obligatorios
                    break;
            }
        }

        // ========================================
        // CAMPOS OPCIONALES (contribuyen al porcentaje pero no son obligatorios)
        // ========================================
        totalFields += 6; // profession, eyeColor, hairColor, bodyType, maritalStatus, education
        
        if (profession != null && !profession.trim().isEmpty()) completedFields++;
        if (eyeColor != null) completedFields++;
        if (hairColor != null) completedFields++;
        if (bodyType != null) completedFields++;
        if (maritalStatus != null) completedFields++;
        if (education != null) completedFields++;

        // Calcular porcentaje
        if (totalFields == 0) return 0.0;
        return Math.round((double) completedFields / totalFields * 100.0 * 100.0) / 100.0; // Redondear a 2 decimales
    }

    /**
     * Obtiene la imagen principal del usuario
     * Prioriza las imágenes subidas por el usuario sobre la imagen externa de OAuth
     */
    public String getMainImage() {
        // Primero: imágenes subidas por el usuario
        if (images != null && !images.isEmpty()) {
            return images.get(0); // Primera imagen subida por el usuario
        }

        // Segundo: imagen externa de OAuth (Google, Facebook, etc.)
        if (externalAvatarUrl != null && !externalAvatarUrl.trim().isEmpty()) {
            return externalAvatarUrl;
        }

        // Sin imagen
        return null;
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
        return tags != null ? 
            tags.stream()
                .filter(UserTag::isApproved)
                .map(UserTag::getName)
                .collect(java.util.stream.Collectors.toList()) : new ArrayList<>();
    }

    public List<UserTag> getApprovedTags() {
        return tags != null ? 
            tags.stream()
                .filter(UserTag::isApproved)
                .collect(java.util.stream.Collectors.toList()) : new ArrayList<>();
    }

    public List<UserTag> getAllTags() {
        return tags != null ? new ArrayList<>(tags) : new ArrayList<>();
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
    // MÉTODOS DE CONVENIENCIA PARA APPROVAL STATUS
    // ========================================
    
    /**
     * Verifica si el usuario está aprobado
     */
    public boolean isApproved() {
        return approvalStatus != null && approvalStatus.isApproved();
    }
    
    /**
     * Verifica si el usuario está pendiente de aprobación
     */
    public boolean isPendingApproval() {
        return approvalStatus != null && approvalStatus.isPending();
    }
    
    /**
     * Verifica si el usuario está rechazado
     */
    public boolean isRejected() {
        return approvalStatus != null && approvalStatus.isRejected();
    }
    
    /**
     * Aprueba al usuario
     */
    public void approve() {
        this.approvalStatus = UserApprovalStatusList.APPROVED;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Rechaza al usuario
     */
    public void reject() {
        this.approvalStatus = UserApprovalStatusList.REJECTED;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Pone al usuario en estado pendiente
     */
    public void setPending() {
        this.approvalStatus = UserApprovalStatusList.PENDING;
        this.updatedAt = LocalDateTime.now();
    }

    // ========================================
    // GESTIÓN DE CUENTA
    // ========================================

    /**
     * Desactiva la cuenta del usuario
     */
    public void deactivateAccount(String reason) {
        this.accountDeactivated = true;
        this.deactivationDate = LocalDateTime.now();
        this.deactivationReason = reason;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Reactiva la cuenta del usuario
     */
    public void reactivateAccount() {
        this.accountDeactivated = false;
        this.deactivationDate = null;
        this.deactivationReason = null;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Verifica si el usuario puede recibir notificaciones por email
     */
    public boolean canReceiveEmailNotifications() {
        return notificationsEmailEnabled && !accountDeactivated;
    }

    /**
     * Verifica si el usuario puede recibir notificaciones por teléfono
     */
    public boolean canReceivePhoneNotifications() {
        return notificationsPhoneEnabled && phone != null && !phone.isEmpty() && !accountDeactivated;
    }

    /**
     * Verifica si el usuario puede recibir notificaciones de matches
     */
    public boolean canReceiveMatchNotifications() {
        return notificationsMatchesEnabled && !accountDeactivated;
    }

    /**
     * Verifica si el usuario puede recibir notificaciones de eventos
     */
    public boolean canReceiveEventNotifications() {
        return notificationsEventsEnabled && !accountDeactivated;
    }

    /**
     * Verifica si el usuario puede recibir notificaciones de login
     */
    public boolean canReceiveLoginNotifications() {
        return notificationsLoginEnabled && !accountDeactivated;
    }

    /**
     * Verifica si el usuario puede recibir notificaciones de pagos
     */
    public boolean canReceivePaymentNotifications() {
        return notificationsPaymentsEnabled && !accountDeactivated;
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
        if (otherUser == null || !otherUser.isEnabled() || !otherUser.showMeInSearch ||
                !otherUser.isApproved() || !otherUser.searchVisibility || !otherUser.publicAccount) {
            return false;
        }

        // Verificar categoría de interés
        if (this.categoryInterest != null && otherUser.categoryInterest != null) {
            if (!this.categoryInterest.equals(otherUser.categoryInterest)) {
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

        // Coincidencia en tags (peso: 40%) - solo tags aprobados
        List<UserTag> myApprovedTags = this.getApprovedTags();
        List<UserTag> otherApprovedTags = otherUser.getApprovedTags();
        if (!myApprovedTags.isEmpty() && !otherApprovedTags.isEmpty()) {
            long commonTags = myApprovedTags.stream()
                    .filter(tag -> otherApprovedTags.contains(tag))
                    .count();
            double tagScore = (double) commonTags / Math.max(myApprovedTags.size(), otherApprovedTags.size());
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
        if (this.categoryInterest != null &&
                "SPIRIT".equals(this.categoryInterest.getCategoryInterestEnum().name())) {
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
