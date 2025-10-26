package com.feeling.packages.user.infrastructure.entities;

import com.feeling.packages.auth.domain.enums.AuthProvider;
import com.feeling.packages.auth.infrastructure.entities.AuthToken;
import com.feeling.packages.complaint.infrastructure.entities.Complaint;
import com.feeling.packages.user.domain.enums.UserApprovalStatus;
import com.feeling.packages.user.domain.enums.UserCategoryInterestList;
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

/**
 * Entidad principal que representa un usuario en la plataforma Feeling.
 * Implementa UserDetails para integración con Spring Security.
 * <p>
 * Esta entidad maneja toda la información del usuario incluyendo:
 * - Datos básicos obligatorios (nombre, email, contraseña)
 * - Información personal (descripción, imágenes, ubicación)
 * - Características físicas y atributos
 * - Sistema de tags dinámico
 * - Preferencias de matching
 * - Métricas sociales y gamificación
 * - Configuración de privacidad y notificaciones
 * - Gestión de cuenta
 * - Autenticación múltiple (OAuth y local)
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
@Table(name = "users")
public class User implements UserDetails {
    /**
     * Identificador único del usuario en la base de datos.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========================================
    // DATOS BÁSICOS OBLIGATORIOS
    // ========================================
    /**
     * Nombre del usuario. Campo obligatorio para el registro.
     */
    @NotNull
    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    /**
     * Apellido del usuario. Campo obligatorio para el registro.
     */
    @NotNull
    @NotBlank(message = "El apellido es obligatorio")
    @Column(name = "lastname")
    private String lastName;

    /**
     * Dirección de correo electrónico del usuario.
     * Debe ser única en el sistema y se utiliza para autenticación.
     */
    @NotNull
    @Getter
    @Email(message = "El correo debe ser válido")
    @Column(unique = true, nullable = false)
    private String email;

    /**
     * Contraseña del usuario para autenticación local.
     * Puede ser null para usuarios que solo usan OAuth.
     */
    @NotNull
    @NotBlank(message = "La contraseña no puede estar vacía")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    /**
     * Indica si el usuario ha verificado su dirección de email.
     * Los usuarios deben verificar su email para poder usar la plataforma.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean verified = false;

    /**
     * Indica si el perfil del usuario está completo.
     * Se calcula automáticamente basado en los campos obligatorios.
     */
    @Column(name = "profile_complete")
    @Builder.Default
    private boolean profileComplete = false;

    /**
     * Indica si el usuario completó la configuración final (privacidad/notificaciones).
     * Se utiliza para forzar el paso por el último step del onboarding.
     */
    @Column(name = "configuration_completed")
    @Builder.Default
    private boolean configurationCompleted = false;

    /**
     * Estado de aprobación del usuario por parte de los administradores.
     * Los usuarios deben ser aprobados para poder usar la plataforma completamente.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    @Builder.Default
    private UserApprovalStatus userApprovalStatus = UserApprovalStatus.PENDING;

    /**
     * Fecha y hora de creación del usuario.
     */
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Fecha y hora de la última actualización del usuario.
     * Se actualiza automáticamente con @PreUpdate.
     */
    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    /**
     * Fecha y hora de la última actividad del usuario en la plataforma.
     * Se actualiza cuando el usuario realiza acciones significativas.
     */
    @Column(name = "last_active")
    private LocalDateTime lastActive;

    /**
     * Rol del usuario en el sistema (ADMIN, USER, etc.).
     * Define los permisos y funcionalidades disponibles.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private UserRole userRole;

    /**
     * Lista de tokens JWT asociados al usuario.
     * Incluye tokens de acceso y refresh tokens para autenticación.
     */
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AuthToken> authTokens = new ArrayList<>();

    /**
     * Lista de quejas y reportes enviados por este usuario.
     * Incluye consultas de soporte, reportes de bugs y sugerencias.
     */
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Complaint> complaints = new ArrayList<>();

    // ========================================
    // DATOS PERSONALES BÁSICOS
    // ========================================

    /**
     * Lista de URLs de imágenes del perfil del usuario.
     * Los usuarios pueden subir múltiples fotos para mostrar en su perfil.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_images", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    /**
     * Número de documento de identidad del usuario.
     * Campo obligatorio para verificación y cumplimiento legal.
     */
    private String document;

    /**
     * Número de teléfono del usuario (sin código de país).
     * Debe contener entre 7 y 15 dígitos.
     */
    @Pattern(regexp = "^$|^\\d{7,15}$", message = "El teléfono debe contener entre 7 y 15 dígitos")
    private String phone;

    /**
     * Código de país del teléfono (ej: +57, +1, +34).
     * Formato: + seguido de 1 a 4 dígitos.
     */
    @Pattern(regexp = "^$|^\\+\\d{1,4}$", message = "El código de país debe tener formato +XX")
    @Column(name = "phone_code")
    private String phoneCode;

    /**
     * Fecha de nacimiento del usuario.
     * Utilizada para calcular la edad y validar preferencias de edad.
     */
    private LocalDate dateOfBirth;

    /**
     * Descripción personal del usuario para su perfil.
     * Texto libre donde el usuario se describe a sí mismo.
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    // ========================================
    // UBICACIÓN GEOGRÁFICA
    // ========================================

    /**
     * País de residencia del usuario.
     * Campo obligatorio para matching geográfico y localización.
     */
    private String country;

    /**
     * Ciudad de residencia del usuario.
     * Campo obligatorio para matching local y cálculo de distancias.
     */
    private String city;

    /**
     * Departamento, estado o provincia del usuario.
     * Nivel administrativo intermedio para mejor localización.
     */
    private String department;

    /**
     * Localidad, barrio o zona específica del usuario.
     * Nivel de detalle adicional para matching ultra-local.
     */
    private String locality;

    // ========================================
    // CARACTERÍSTICAS
    // ========================================

    /**
     * Categoría de interés del usuario (ESSENCE, ROUSE, SPIRIT).
     * Determina el tipo de experiencia y conexión que busca el usuario.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_interest_id")
    private UserCategoryInterest categoryInterest;

    /**
     * Género del usuario.
     * Campo obligatorio para matching y preferencias de búsqueda.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "gender_id")
    private UserAttribute gender;

    /**
     * Estado civil del usuario (soltero, casado, divorciado, etc.).
     * Campo opcional que puede influir en las preferencias de matching.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marital_status_id")
    private UserAttribute maritalStatus;

    /**
     * Altura del usuario en centímetros.
     * Campo obligatorio utilizado para matching por preferencias físicas.
     */
    @Column(name = "height_cm")
    private Integer height;

    /**
     * Color de ojos del usuario.
     * Campo opcional que añade detalle al perfil físico.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "eye_color_id")
    private UserAttribute eyeColor;

    /**
     * Color de cabello del usuario.
     * Campo opcional que añade detalle al perfil físico.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hair_color_id")
    private UserAttribute hairColor;

    /**
     * Tipo de cuerpo del usuario (atlético, delgado, promedio, etc.).
     * Campo opcional que puede influir en las preferencias de matching.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "body_type_id")
    private UserAttribute bodyType;

    /**
     * Nivel educativo del usuario (primaria, secundaria, universitario, etc.).
     * Campo opcional que añade información al perfil.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "education_level_id")
    private UserAttribute education;

    /**
     * Profesión u ocupación del usuario.
     * Campo opcional de texto libre para describir el trabajo.
     */
    private String profession;

    // ========================================
    // SISTEMA DE TAGS DINÁMICO
    // ========================================

    /**
     * Lista de tags personalizados del usuario.
     * Los usuarios pueden añadir hasta 10 tags para describir sus intereses y personalidad.
     * Los tags son dinámicos y pueden ser creados por los usuarios (requieren aprobación).
     */
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

    /**
     * Iglesia o institución religiosa del usuario.
     * Campo específico para usuarios de categoría SPIRIT.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "church_id")
    private UserAttribute church;

    /**
     * Religión o creencia espiritual del usuario.
     * Campo obligatorio para usuarios de categoría SPIRIT.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "religion_id")
    private UserAttribute religion;

    /**
     * Descripción de momentos espirituales significativos del usuario.
     * Campo opcional para usuarios SPIRIT que quieren compartir experiencias.
     */
    @Column(columnDefinition = "TEXT")
    private String spiritualMoments;

    /**
     * Descripción de prácticas espirituales del usuario.
     * Campo opcional para usuarios SPIRIT (oración, meditación, etc.).
     */
    @Column(columnDefinition = "TEXT")
    private String spiritualPractices;

    // ========================================
    // DATOS PARA ROUSE
    // ========================================

    /**
     * Rol sexual preferido del usuario en encuentros íntimos.
     * Campo obligatorio para usuarios de categoría ROUSE.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sexual_role_id")
    private UserAttribute sexualRole;

    /**
     * Tipo de relación que busca el usuario.
     * Campo obligatorio para usuarios de categoría ROUSE (casual, estable, etc.).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relationship_type_id")
    private UserAttribute relationshipType;

    // ========================================
    // PREFERENCIAS DE MATCHING
    // ========================================

    /**
     * Edad mínima de las personas que el usuario quiere conocer.
     * Campo obligatorio para el algoritmo de matching (mínimo 18 años).
     */
    @Column(name = "age_preference_min")
    private Integer agePreferenceMin;

    /**
     * Edad máxima de las personas que el usuario quiere conocer.
     * Campo obligatorio para el algoritmo de matching (máximo 80 años).
     */
    @Column(name = "age_preference_max")
    private Integer agePreferenceMax;

    /**
     * Radio de búsqueda en kilómetros para matching geográfico.
     * Campo obligatorio que determina qué tan lejos buscar posibles matches.
     */
    @Column(name = "location_preference_radius_km")
    private Integer locationPreferenceRadius;

    /**
     * Indica si el usuario quiere aparecer en las búsquedas de otros usuarios.
     * Permite al usuario controlar su visibilidad en la plataforma.
     */
    @Column(name = "show_me_in_search")
    @Builder.Default
    private boolean showMeInSearch = true;

    /**
     * Indica si el usuario permite recibir notificaciones push.
     * Controla el envío de notificaciones de matches, mensajes, etc.
     */
    @Column(name = "allow_notifications")
    @Builder.Default
    private boolean allowNotifications = true;

    // ========================================
    // MÉTRICAS SOCIALES Y GAMIFICACIÓN
    // ========================================

    /**
     * Número total de veces que otros usuarios han visto el perfil.
     * Métrica de popularidad utilizada para algoritmos de recomendación.
     */
    @Column(name = "profile_views")
    @Builder.Default
    private Long profileViews = 0L;

    /**
     * Número total de likes recibidos de otros usuarios.
     * Métrica clave para el cálculo del score de popularidad.
     */
    @Column(name = "likes_received")
    @Builder.Default
    private Long likesReceived = 0L;

    /**
     * Número total de matches exitosos realizados.
     * Indica el éxito del usuario en la plataforma.
     */
    @Column(name = "matches_count")
    @Builder.Default
    private Long matchesCount = 0L;

    /**
     * Score calculado de popularidad del usuario.
     * Se basa en visualizaciones (30%), likes (50%) y matches (20%).
     */
    @Column(name = "popularity_score")
    @Builder.Default
    private Double popularityScore = 0.0;

    // ========================================
    // SISTEMA DE INTENTOS/PINES
    // ========================================

    /**
     * Número de intentos disponibles para enviar likes o pines.
     * Los intentos se consumen con cada acción y pueden comprarse.
     */
    @Column(name = "available_attempts")
    @Builder.Default
    private Integer availableAttempts = 0;

    /**
     * Número total de intentos que el usuario ha comprado históricamente.
     * Métrica para análisis de monetización y comportamiento de usuario.
     */
    @Column(name = "total_attempts_purchased")
    @Builder.Default
    private Integer totalAttemptsPurchased = 0;

    /**
     * Fecha de expiración de los intentos comprados.
     * Los intentos son válidos por un año desde la primera compra.
     */
    @Column(name = "attempts_expiry_date")
    private LocalDateTime attemptsExpiryDate;

    // ========================================
    // CONFIGURACIÓN DE PRIVACIDAD
    // ========================================

    /**
     * Indica si el usuario permite mostrar su edad en el perfil.
     * Control de privacidad para información personal básica.
     */
    @Column(name = "show_age")
    @Builder.Default
    private boolean showAge = true;

    /**
     * Indica si el usuario permite mostrar su ubicación aproximada.
     * Control de privacidad para información geográfica.
     */
    @Column(name = "show_location")
    @Builder.Default
    private boolean showLocation = true;

    /**
     * Indica si el usuario permite mostrar su número de teléfono.
     * Por defecto desactivado por seguridad y privacidad.
     */
    @Column(name = "show_phone")
    @Builder.Default
    private boolean showPhone = false;

    // ========================================
    // CONFIGURACIÓN EXTENDIDA DE PRIVACIDAD
    // ========================================

    /**
     * Indica si la cuenta del usuario es pública.
     * Las cuentas públicas son más visibles en búsquedas y recomendaciones.
     */
    @Column(name = "public_account")
    @Builder.Default
    private boolean publicAccount = true;

    /**
     * Indica si el usuario aparece en resultados de búsqueda.
     * Control granular de visibilidad en la plataforma.
     */
    @Column(name = "search_visibility")
    @Builder.Default
    private boolean searchVisibility = true;

    /**
     * Indica si la ubicación del usuario es completamente pública.
     * Control adicional de privacidad geográfica.
     */
    @Column(name = "location_public")
    @Builder.Default
    private boolean locationPublic = true;

    // ========================================
    // CONFIGURACIÓN DE NOTIFICACIONES
    // ========================================

    /**
     * Indica si el usuario permite recibir notificaciones por email.
     * Control de comunicación externa de la plataforma.
     */
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
    private AuthProvider userAuthProvider = AuthProvider.LOCAL;

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
        return userAuthProvider == AuthProvider.LOCAL && password != null;
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

    /**
     * Calcula la edad del usuario basado en su fecha de nacimiento.
     *
     * @return La edad del usuario en años, o null si no tiene fecha de nacimiento
     */
    public Integer getAge() {
        if (dateOfBirth == null) return null;
        return LocalDate.now().getYear() - dateOfBirth.getYear();
    }

    /**
     * Getter para el campo profileComplete.
     *
     * @return true si el perfil está marcado como completo
     */
    public boolean getProfileComplete() {
        return this.profileComplete;
    }

    /**
     * Calcula dinámicamente si el perfil del usuario está completo.
     * <p>
     * Valida que todos los campos obligatorios estén presentes:
     * - Información personal básica (nombre, apellido, documento, teléfono, fecha de nacimiento)
     * - Ubicación (país, ciudad)
     * - Imágenes de perfil (al menos una)
     * - Características físicas (descripción, género, altura)
     * - Tags aprobados (al menos uno)
     * - Preferencias de matching (categoría de interés, rango de edad, radio de ubicación)
     * <p>
     * Campos condicionales según la categoría de interés:
     * - SPIRIT: Religión obligatoria
     * - ROUSE: Rol sexual y tipo de relación obligatorios
     * - ESSENCE: Sin campos adicionales requeridos
     *
     * @return true si el perfil cumple con todos los requisitos obligatorios
     */
    public boolean isProfileComplete() {
        // Información personal básica
        boolean basicInfoComplete = name != null && !name.trim().isEmpty() &&
            lastName != null && !lastName.trim().isEmpty() &&
            document != null && !document.trim().isEmpty() &&
            phone != null && !phone.trim().isEmpty() &&
            phoneCode != null && !phoneCode.trim().isEmpty() &&
            dateOfBirth != null;

        // Ubicación
        boolean locationComplete = country != null && !country.trim().isEmpty() &&
            city != null && !city.trim().isEmpty();

        // Imágenes de perfil
        boolean hasImages = images != null && !images.isEmpty();

        // Características
        boolean characteristicsComplete = description != null && !description.trim().isEmpty() &&
            gender != null &&
            height != null && height > 0 &&
            getApprovedTags() != null && !getApprovedTags().isEmpty();

        // Preferencias de matching
        boolean preferencesComplete = categoryInterest != null &&
            agePreferenceMin != null && agePreferenceMin >= 18 &&
            agePreferenceMax != null && agePreferenceMax <= 80 &&
            locationPreferenceRadius != null && locationPreferenceRadius >= 5;

        // Campos condicionales según categoría de interés
        boolean conditionalFieldsComplete = categoryInterest == null ||
            switch (categoryInterest.getCategoryInterestEnum()) {
                case UserCategoryInterestList.SPIRIT -> religion != null;
                case UserCategoryInterestList.ROUSE -> sexualRole != null && relationshipType != null;
                case UserCategoryInterestList.ESSENCE -> true; // Sin campos adicionales requeridos
            };

        return basicInfoComplete && locationComplete && hasImages &&
            characteristicsComplete && preferencesComplete && conditionalFieldsComplete;
    }

    /**
     * Calcula el porcentaje de completitud del perfil (0.0 - 100.0).
     * Incluye campos obligatorios y opcionales para brindar una visión completa del progreso.
     *
     * @return Porcentaje de completitud redondeado a 2 decimales
     */
    public Double getProfileCompletenessPercentage() {
        int totalFields = 0;
        int completedFields = 0;

        // ========================================
        // CAMPOS OBLIGATORIOS - INFORMACIÓN PERSONAL BÁSICA
        // ========================================
        totalFields += 6; // name, lastName, document, phone, phoneCode, dateOfBirth

        if (name != null && !name.trim().isEmpty()) completedFields++;
        if (lastName != null && !lastName.trim().isEmpty()) completedFields++;
        if (document != null && !document.trim().isEmpty()) completedFields++;
        if (phone != null && !phone.trim().isEmpty()) completedFields++;
        if (phoneCode != null && !phoneCode.trim().isEmpty()) completedFields++;
        if (dateOfBirth != null) completedFields++;

        // ========================================
        // CAMPOS OBLIGATORIOS - UBICACIÓN
        // ========================================
        totalFields += 2; // country, city

        if (country != null && !country.trim().isEmpty()) completedFields++;
        if (city != null && !city.trim().isEmpty()) completedFields++;

        // ========================================
        // CAMPOS OBLIGATORIOS - IMÁGENES Y CARACTERÍSTICAS
        // ========================================
        totalFields += 4; // images, description, gender, height

        if (images != null && !images.isEmpty()) completedFields++;
        if (description != null && !description.trim().isEmpty()) completedFields++;
        if (gender != null) completedFields++;
        if (height != null && height > 0) completedFields++;

        // ========================================
        // CAMPOS OBLIGATORIOS - TAGS Y PREFERENCIAS
        // ========================================
        totalFields += 5; // tags, categoryInterest, agePreferenceMin, agePreferenceMax, locationPreferenceRadius

        if (getApprovedTags() != null && !getApprovedTags().isEmpty()) completedFields++;
        if (categoryInterest != null) completedFields++;
        if (agePreferenceMin != null && agePreferenceMin >= 18) completedFields++;
        if (agePreferenceMax != null && agePreferenceMax <= 80) completedFields++;
        if (locationPreferenceRadius != null && locationPreferenceRadius >= 5) completedFields++;

        // ========================================
        // CAMPOS CONDICIONALES SEGÚN CATEGORÍA DE INTERÉS
        // ========================================
        if (categoryInterest != null) {
            var categoryType = categoryInterest.getCategoryInterestEnum();

            // Contar campos adicionales según categoría
            totalFields += switch (categoryType) {
                case UserCategoryInterestList.SPIRIT -> 1; // religion
                case UserCategoryInterestList.ROUSE -> 2; // sexualRole, relationshipType
                case UserCategoryInterestList.ESSENCE -> 0; // sin campos adicionales
            };

            // Contar campos completados según categoría
            completedFields += switch (categoryType) {
                case UserCategoryInterestList.SPIRIT -> (religion != null) ? 1 : 0;
                case UserCategoryInterestList.ROUSE ->
                    ((sexualRole != null) ? 1 : 0) + ((relationshipType != null) ? 1 : 0);
                case UserCategoryInterestList.ESSENCE -> 0; // sin campos adicionales
            };
        }

        // ========================================
        // CAMPOS OPCIONALES (mejoran el porcentaje pero no son obligatorios)
        // ========================================
        totalFields += 6; // profession, eyeColor, hairColor, bodyType, maritalStatus, education

        if (profession != null && !profession.trim().isEmpty()) completedFields++;
        if (eyeColor != null) completedFields++;
        if (hairColor != null) completedFields++;
        if (bodyType != null) completedFields++;
        if (maritalStatus != null) completedFields++;
        if (education != null) completedFields++;

        // Calcular porcentaje
        return Math.round((double) completedFields / totalFields * 100.0 * 100.0) / 100.0;
    }

    /**
     * Obtiene la imagen principal del usuario.
     * Prioriza las imágenes subidas por el usuario sobre la imagen externa de OAuth.
     *
     * @return URL de la imagen principal, o null si no tiene imágenes
     */
    public String getMainImage() {
        // Primero: imágenes subidas por el usuario
        if (images != null && !images.isEmpty()) {
            return images.getFirst(); // Primera imagen subida por el usuario
        }

        // Segundo: imagen externa de OAuth (Google, Facebook, etc.)
        if (externalAvatarUrl != null && !externalAvatarUrl.trim().isEmpty()) {
            return externalAvatarUrl;
        }

        // Sin imagen
        return null;
    }

    /**
     * Verifica si el usuario tiene intentos (pines) activos disponibles.
     *
     * @return true si tiene intentos disponibles y no han expirado
     */
    public boolean hasActiveAttempts() {
        return availableAttempts != null && availableAttempts > 0 &&
            (attemptsExpiryDate == null || attemptsExpiryDate.isAfter(LocalDateTime.now()));
    }

    // ========================================
    // GESTIÓN DE TAGS
    // ========================================

    /**
     * Añade un tag al usuario si no lo tiene ya.
     * Incrementa el contador de uso del tag automáticamente.
     *
     * @param tag El tag a añadir
     */
    public void addTag(UserTag tag) {
        if (tags == null) {
            tags = new ArrayList<>();
        }
        if (!tags.contains(tag)) {
            tags.add(tag);
            tag.incrementUsage();
        }
    }

    /**
     * Remueve un tag del usuario si lo tiene.
     * Decrementa el contador de uso del tag automáticamente.
     *
     * @param tag El tag a remover
     */
    public void removeTag(UserTag tag) {
        if (tags != null && tags.contains(tag)) {
            tags.remove(tag);
            tag.decrementUsage();
        }
    }

    /**
     * Obtiene la lista de nombres de los tags aprobados del usuario.
     *
     * @return Lista de nombres de tags aprobados
     */
    public List<String> getTagNames() {
        try {
            return tags != null ?
                tags.stream()
                    .filter(UserTag::isApproved)
                    .map(UserTag::getName)
                    .collect(java.util.stream.Collectors.toList()) : new ArrayList<>();
        } catch (org.hibernate.LazyInitializationException e) {
            // Si los tags no se cargaron, retornar lista vacía
            return new ArrayList<>();
        }
    }

    /**
     * Obtiene la lista de tags aprobados del usuario.
     * Solo incluye tags que han sido aprobados por los administradores.
     *
     * @return Lista de tags aprobados
     */
    public List<UserTag> getApprovedTags() {
        try {
            return tags != null ?
                tags.stream()
                    .filter(UserTag::isApproved)
                    .collect(java.util.stream.Collectors.toList()) : new ArrayList<>();
        } catch (org.hibernate.LazyInitializationException e) {
            // Si los tags no se cargaron, retornar lista vacía
            return new ArrayList<>();
        }
    }

    public List<UserTag> getAllTags() {
        try {
            return tags != null ? new ArrayList<>(tags) : new ArrayList<>();
        } catch (org.hibernate.LazyInitializationException e) {
            return new ArrayList<>();
        }
    }

    // ========================================
    // GESTIÓN DE MÉTRICAS
    // ========================================

    /**
     * Incrementa el contador de visualizaciones del perfil.
     * También actualiza la fecha de última actividad.
     */
    public void incrementProfileViews() {
        this.profileViews++;
        updateLastActive();
    }

    /**
     * Incrementa el contador de likes recibidos.
     * Actualiza automáticamente el score de popularidad.
     */
    public void incrementLikes() {
        this.likesReceived++;
        updatePopularityScore();
    }

    /**
     * Incrementa el contador de matches.
     * Actualiza automáticamente el score de popularidad.
     */
    public void incrementMatches() {
        this.matchesCount++;
        updatePopularityScore();
    }

    /**
     * Consume un intento disponible del usuario.
     * Solo decrementa si el usuario tiene intentos activos disponibles.
     * Utilizado cuando el usuario realiza acciones como enviar likes o pines.
     */
    public void useAttempt() {
        if (hasActiveAttempts()) {
            this.availableAttempts--;
        }
    }

    /**
     * Añade intentos al balance del usuario (compra o regalo).
     * <p>
     * Funcionalidades incluidas:
     * - Inicializa contadores si son nulos
     * - Incrementa intentos disponibles y total comprado
     * - Establece fecha de expiración (1 año desde la primera compra)
     * - Solo establece fecha de expiración en la primera compra
     *
     * @param attempts Número de intentos a añadir (debe ser positivo)
     */
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

    /**
     * Actualiza el score de popularidad del usuario basado en métricas sociales.
     * <p>
     * Algoritmo de cálculo:
     * - Visualizaciones de perfil: 30% del peso
     * - Likes recibidos: 50% del peso
     * - Matches realizados: 20% del peso
     * <p>
     * El score se recalcula automáticamente cuando cambian las métricas sociales.
     */
    private void updatePopularityScore() {
        // Algoritmo simple de popularidad
        double viewsWeight = 0.3;
        double likesWeight = 0.5;
        double matchesWeight = 0.2;

        this.popularityScore = (profileViews * viewsWeight) +
            (likesReceived * likesWeight) +
            (matchesCount * matchesWeight);
    }

    /**
     * Actualiza la fecha y hora de última actividad del usuario.
     * Se llama automáticamente cuando el usuario realiza acciones en la plataforma.
     */
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
        return userApprovalStatus != null && userApprovalStatus.isApproved();
    }

    /**
     * Verifica si el usuario está pendiente de aprobación
     */
    public boolean isPendingApproval() {
        return userApprovalStatus != null && userApprovalStatus.isPending();
    }

    /**
     * Verifica si el usuario está rechazado
     */
    public boolean isRejected() {
        return userApprovalStatus != null && userApprovalStatus.isRejected();
    }

    /**
     * Aprueba al usuario
     */
    public void approve() {
        this.userApprovalStatus = UserApprovalStatus.APPROVED;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Rechaza al usuario
     */
    public void reject() {
        this.userApprovalStatus = UserApprovalStatus.REJECTED;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Pone al usuario en estado pendiente
     */
    public void setPending() {
        this.userApprovalStatus = UserApprovalStatus.PENDING;
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

    /**
     * Verifica si este usuario es compatible con otro usuario para matching.
     * Considera factores como categoría de interés, edad, estado de aprobación y visibilidad.
     *
     * @param otherUser El otro usuario a evaluar
     * @return true si son compatibles para matching
     */
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

    /**
     * Calcula un score de compatibilidad con otro usuario (0.0 - 1.0).
     * Considera múltiples factores con diferentes pesos:
     * - Coincidencia en tags aprobados (40%)
     * - Proximidad geográfica (30%)
     * - Compatibilidad religiosa para SPIRIT (20%)
     * - Otros factores como edad similar (10%)
     *
     * @param otherUser El otro usuario a evaluar
     * @return Score de compatibilidad entre 0.0 y 1.0
     */
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
                .filter(otherApprovedTags::contains)
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
