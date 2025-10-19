package com.feeling.packages.user.domain.dto.user;

import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * DTO para actualizaciones parciales del usuario usando PATCH operations
 * Phase 4.1: Partial Update Support - API Modernization
 * <p>
 * Usa Optional<T> para distinguir entre:
 * - Campo no enviado (Optional.empty())
 * - Campo enviado con valor null (Optional.of(null))
 * - Campo enviado con valor (Optional.of(valor))
 */
public record UserRequestDTO(

    // Datos básicos
    Optional<@Size(max = 50, message = "El nombre no puede superar 50 caracteres") String> name,
    Optional<@Size(max = 50, message = "El apellido no puede superar 50 caracteres") String> lastName,
    Optional<@Email(message = "El correo debe ser válido") String> email,
    Optional<@Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres") String> password,

    // Datos personales
    Optional<@Size(max = 20, message = "El documento no puede superar 20 caracteres") String> document,
    Optional<@Pattern(regexp = "^$|^\\d{7,15}$", message = "El teléfono debe contener entre 7 y 15 dígitos") String> phone,
    Optional<@Pattern(regexp = "^$|^\\+\\d{1,4}$", message = "El código de país debe tener formato +XX") String> phoneCode,
    Optional<@PastOrPresent(message = "La fecha de nacimiento no puede ser futura") LocalDate> dateOfBirth,
    Optional<@Size(max = 500, message = "La descripción no puede superar 500 caracteres") String> description,

    // Categoría e IDs de atributos
    Optional<String> categoryInterest,
    Optional<@Positive(message = "El ID de género debe ser positivo") Long> genderId,
    Optional<@Positive(message = "El ID de estado civil debe ser positivo") Long> maritalStatusId,
    Optional<@Positive(message = "El ID de color de ojos debe ser positivo") Long> eyeColorId,
    Optional<@Positive(message = "El ID de color de cabello debe ser positivo") Long> hairColorId,
    Optional<@Positive(message = "El ID de tipo de cuerpo debe ser positivo") Long> bodyTypeId,
    Optional<@Positive(message = "El ID de religión debe ser positivo") Long> religionId,
    Optional<@Positive(message = "El ID de rol sexual debe ser positivo") Long> sexualRoleId,
    Optional<@Positive(message = "El ID de tipo de relación debe ser positivo") Long> relationshipTypeId,
    Optional<@Positive(message = "El ID de nivel educativo debe ser positivo") Long> educationLevelId,
    Optional<@Size(max = 100, message = "La profesión no puede superar los 100 caracteres") String> profession,
    Optional<@Min(value = 140, message = "La estatura mínima es 140 cm") @Max(value = 220, message = "La estatura máxima es 220 cm") Integer> height,

    // Ubicación
    Optional<@Size(max = 50, message = "El país no puede superar 50 caracteres") String> country,
    Optional<@Size(max = 50, message = "El departamento no puede superar los 50 caracteres") String> department,
    Optional<@Size(max = 50, message = "La ciudad no puede superar 50 caracteres") String> city,
    Optional<@Size(max = 50, message = "La localidad no puede superar los 50 caracteres") String> locality,

    // Preferencias
    Optional<@Min(value = 18, message = "La edad mínima debe ser 18 años") @Max(value = 80, message = "La edad mínima no puede ser mayor a 80 años") Integer> agePreferenceMin,
    Optional<@Min(value = 18, message = "La edad máxima debe ser al menos 18 años") @Max(value = 80, message = "La edad máxima no puede ser mayor a 80 años") Integer> agePreferenceMax,
    Optional<@Min(value = 5, message = "El radio mínimo es 5 km") @Max(value = 200, message = "El radio máximo es 200 km") Long> locationPreferenceRadius,

    // Configuración de privacidad
    Optional<Boolean> publicAccount,
    Optional<Boolean> searchVisibility,
    Optional<Boolean> locationPublic,
    Optional<Boolean> showAge,
    Optional<Boolean> showLocation,
    Optional<Boolean> showPhone,
    Optional<Boolean> showMeInSearch,

    // Notificaciones
    Optional<Boolean> notificationsEmailEnabled,
    Optional<Boolean> notificationsPhoneEnabled,
    Optional<Boolean> notificationsMatchesEnabled,
    Optional<Boolean> notificationsEventsEnabled,
    Optional<Boolean> notificationsLoginEnabled,
    Optional<Boolean> notificationsPaymentsEnabled,
    Optional<Boolean> allowNotifications,

    // Información espiritual
    Optional<@Positive(message = "El ID de iglesia debe ser positivo") Long> churchId,
    Optional<@Size(max = 100, message = "El nombre de la iglesia no puede superar los 100 caracteres") String> churchName,
    Optional<@Size(max = 500, message = "Los momentos espirituales no pueden superar los 500 caracteres") String> spiritualMoments,
    Optional<@Size(max = 500, message = "Las prácticas espirituales no pueden superar los 500 caracteres") String> spiritualPractices,

    // Collections
    Optional<@Size(min = 1, max = 10, message = "Debes tener entre 1 y 10 tags") List<String>> tags,
    Optional<@Size(min = 1, max = 6, message = "Debes tener entre 1 y 6 imágenes") List<String>> imageUrls

) {

    private static <T> Optional<T> normalizeOptional(Optional<T> value) {
        return value;
    }

    private static Optional<String> sanitizeOptionalString(Optional<String> value) {
        if (value.isEmpty()) {
            return value == null ? Optional.empty() : value;
        }

        String raw = value.orElse(null);

        String trimmed = raw.trim();
        return trimmed.isEmpty() ? Optional.empty() : Optional.of(trimmed);
    }

    /**
     * Verifica si hay algún campo presente para actualizar
     */
    public boolean hasAnyUpdate() {
        return name.isPresent() || lastName.isPresent() || email.isPresent() || password.isPresent() ||
            document.isPresent() || phone.isPresent() || phoneCode.isPresent() || dateOfBirth.isPresent() || description.isPresent() ||
            categoryInterest.isPresent() || genderId.isPresent() || maritalStatusId.isPresent() ||
            eyeColorId.isPresent() || hairColorId.isPresent() || bodyTypeId.isPresent() ||
            religionId.isPresent() || sexualRoleId.isPresent() || relationshipTypeId.isPresent() ||
            educationLevelId.isPresent() || profession.isPresent() || height.isPresent() ||
            country.isPresent() || department.isPresent() || city.isPresent() || locality.isPresent() ||
            agePreferenceMin.isPresent() || agePreferenceMax.isPresent() || locationPreferenceRadius.isPresent() ||
            publicAccount.isPresent() || searchVisibility.isPresent() || locationPublic.isPresent() ||
            showAge.isPresent() || showLocation.isPresent() || showPhone.isPresent() || showMeInSearch.isPresent() ||
            notificationsEmailEnabled.isPresent() || notificationsPhoneEnabled.isPresent() ||
            notificationsMatchesEnabled.isPresent() || notificationsEventsEnabled.isPresent() ||
            notificationsLoginEnabled.isPresent() || notificationsPaymentsEnabled.isPresent() || allowNotifications.isPresent() ||
            churchId.isPresent() || churchName.isPresent() || spiritualMoments.isPresent() || spiritualPractices.isPresent() ||
            tags.isPresent() || imageUrls.isPresent();
    }

    /**
     * Verifica si hay actualizaciones de datos básicos
     */
    public boolean hasBasicUpdates() {
        return name.isPresent() || lastName.isPresent() || email.isPresent() || password.isPresent();
    }

    /**
     * Verifica si hay actualizaciones de configuración
     */
    public boolean hasConfigurationUpdates() {
        return agePreferenceMin.isPresent() || agePreferenceMax.isPresent() || locationPreferenceRadius.isPresent() ||
            publicAccount.isPresent() || searchVisibility.isPresent() || locationPublic.isPresent() ||
            showAge.isPresent() || showLocation.isPresent() || showPhone.isPresent() || showMeInSearch.isPresent() ||
            notificationsEmailEnabled.isPresent() || notificationsPhoneEnabled.isPresent() ||
            notificationsMatchesEnabled.isPresent() || notificationsEventsEnabled.isPresent() ||
            notificationsLoginEnabled.isPresent() || notificationsPaymentsEnabled.isPresent();
    }

    /**
     * Verifica si hay actualizaciones de perfil
     */
    public boolean hasProfileUpdates() {
        return document.isPresent() || phone.isPresent() || phoneCode.isPresent() || dateOfBirth.isPresent() || description.isPresent() ||
            categoryInterest.isPresent() || genderId.isPresent() || maritalStatusId.isPresent() ||
            eyeColorId.isPresent() || hairColorId.isPresent() || bodyTypeId.isPresent() ||
            religionId.isPresent() || sexualRoleId.isPresent() || relationshipTypeId.isPresent() ||
            educationLevelId.isPresent() || profession.isPresent() || height.isPresent() ||
            tags.isPresent() || imageUrls.isPresent() ||
            country.isPresent() || department.isPresent() || city.isPresent() || locality.isPresent();
    }

    /**
     * Verifica si hay actualizaciones específicas para SPIRIT
     */
    public boolean hasSpiritualUpdates() {
        return churchId.isPresent() || churchName.isPresent() || spiritualMoments.isPresent() ||
            spiritualPractices.isPresent() || (religionId.isPresent() && religionId.get() != null);
    }

    /**
     * Verifica si hay actualizaciones de ubicación
     */
    public boolean hasLocationUpdates() {
        return country.isPresent() || department.isPresent() || city.isPresent() || locality.isPresent();
    }

    /**
     * Verifica si hay actualizaciones de preferencias
     */
    public boolean hasPreferenceUpdates() {
        return agePreferenceMin.isPresent() || agePreferenceMax.isPresent() || locationPreferenceRadius.isPresent();
    }

    /**
     * Verifica si hay actualizaciones de privacidad
     */
    public boolean hasPrivacyUpdates() {
        return publicAccount.isPresent() || searchVisibility.isPresent() || locationPublic.isPresent() ||
            showAge.isPresent() || showLocation.isPresent() || showPhone.isPresent() || showMeInSearch.isPresent();
    }

    /**
     * Verifica si hay actualizaciones de notificaciones
     */
    public boolean hasNotificationUpdates() {
        return notificationsEmailEnabled.isPresent() || notificationsPhoneEnabled.isPresent() ||
            notificationsMatchesEnabled.isPresent() || notificationsEventsEnabled.isPresent() ||
            notificationsLoginEnabled.isPresent() || notificationsPaymentsEnabled.isPresent() ||
            allowNotifications.isPresent();
    }

    // ========================================
    // MÉTODOS DE AGRUPACIÓN PARA COMPATIBILIDAD
    // ========================================

    /**
     * Verifica si hay actualizaciones de ubicación
     */
    public boolean location() {
        return hasLocationUpdates();
    }

    /**
     * Verifica si hay actualizaciones de preferencias
     */
    public boolean preferences() {
        return hasPreferenceUpdates();
    }

    /**
     * Verifica si hay actualizaciones de privacidad
     */
    public boolean privacy() {
        return hasPrivacyUpdates();
    }

    /**
     * Verifica si hay actualizaciones de notificaciones
     */
    public boolean notifications() {
        return hasNotificationUpdates();
    }

    /**
     * Verifica si hay actualizaciones de privacidad extendida
     */
    public boolean privacyExtended() {
        return hasPrivacyUpdates();
    }

    /**
     * Verifica si hay actualizaciones espirituales
     */
    public boolean spiritual() {
        return hasSpiritualUpdates();
    }

    /**
     * Cuenta el número total de campos que se están actualizando
     * Útil para logging y auditoría
     */
    public int countUpdates() {
        int count = 0;

        // Datos básicos
        if (name.isPresent()) count++;
        if (lastName.isPresent()) count++;
        if (email.isPresent()) count++;
        if (password.isPresent()) count++;

        // Datos personales
        if (document.isPresent()) count++;
        if (phone.isPresent()) count++;
        if (phoneCode.isPresent()) count++;
        if (dateOfBirth.isPresent()) count++;
        if (description.isPresent()) count++;

        // Atributos
        if (categoryInterest.isPresent()) count++;
        if (genderId.isPresent()) count++;
        if (maritalStatusId.isPresent()) count++;
        if (eyeColorId.isPresent()) count++;
        if (hairColorId.isPresent()) count++;
        if (bodyTypeId.isPresent()) count++;
        if (religionId.isPresent()) count++;
        if (sexualRoleId.isPresent()) count++;
        if (relationshipTypeId.isPresent()) count++;
        if (educationLevelId.isPresent()) count++;
        if (profession.isPresent()) count++;
        if (height.isPresent()) count++;

        // Ubicación
        if (country.isPresent()) count++;
        if (department.isPresent()) count++;
        if (city.isPresent()) count++;
        if (locality.isPresent()) count++;

        // Preferencias
        if (agePreferenceMin.isPresent()) count++;
        if (agePreferenceMax.isPresent()) count++;
        if (locationPreferenceRadius.isPresent()) count++;

        // Privacidad
        if (publicAccount.isPresent()) count++;
        if (searchVisibility.isPresent()) count++;
        if (locationPublic.isPresent()) count++;
        if (showAge.isPresent()) count++;
        if (showLocation.isPresent()) count++;
        if (showPhone.isPresent()) count++;
        if (showMeInSearch.isPresent()) count++;

        // Notificaciones
        if (notificationsEmailEnabled.isPresent()) count++;
        if (notificationsPhoneEnabled.isPresent()) count++;
        if (notificationsMatchesEnabled.isPresent()) count++;
        if (notificationsEventsEnabled.isPresent()) count++;
        if (notificationsLoginEnabled.isPresent()) count++;
        if (notificationsPaymentsEnabled.isPresent()) count++;
        if (allowNotifications.isPresent()) count++;

        // Espirituales
        if (churchId.isPresent()) count++;
        if (churchName.isPresent()) count++;
        if (spiritualMoments.isPresent()) count++;
        if (spiritualPractices.isPresent()) count++;

        // Colecciones
        if (tags.isPresent()) count++;
        if (imageUrls.isPresent()) count++;

        return count;
    }
}
