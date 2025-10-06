package com.feeling.packages.user.domain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * DTO para actualizaciones parciales del usuario usando PATCH operations
 * Phase 4.1: Partial Update Support - API Modernization
 *
 * Usa Optional<T> para distinguir entre:
 * - Campo no enviado (Optional.empty())
 * - Campo enviado con valor null (Optional.of(null))
 * - Campo enviado con valor (Optional.of(valor))
 */
public record UserPartialUpdateDTO(

        // Datos básicos
        Optional<@Size(max = 50, message = "El nombre no puede superar los 50 caracteres") String> name,
        Optional<@Size(max = 50, message = "El apellido no puede superar los 50 caracteres") String> lastName,
        Optional<@Email(message = "El correo debe ser válido") String> email,
        Optional<@Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres") String> password,

        // Datos personales
        Optional<@Size(max = 20, message = "El documento no puede superar los 20 caracteres") String> document,
        Optional<String> phone,
        Optional<String> phoneCode,
        Optional<LocalDate> dateOfBirth,
        Optional<@Size(max = 500, message = "La descripción no puede superar los 500 caracteres") String> description,

        // Categoría e IDs de atributos
        Optional<String> categoryInterest,
        Optional<Long> genderId,
        Optional<Long> maritalStatusId,
        Optional<Long> eyeColorId,
        Optional<Long> hairColorId,
        Optional<Long> bodyTypeId,
        Optional<Long> religionId,
        Optional<Long> sexualRoleId,
        Optional<Long> relationshipTypeId,
        Optional<Long> educationLevelId,
        Optional<String> profession,
        Optional<Integer> height,

        // Ubicación
        Optional<String> country,
        Optional<String> department,
        Optional<String> city,
        Optional<String> locality,

        // Preferencias
        Optional<Integer> agePreferenceMin,
        Optional<Integer> agePreferenceMax,
        Optional<Long> locationPreferenceRadius,

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
        Optional<Long> churchId,
        Optional<@Size(max = 100, message = "El nombre de la iglesia personalizada no puede superar los 100 caracteres") String> customChurch,
        Optional<@Size(max = 500, message = "Los momentos espirituales no pueden superar los 500 caracteres") String> spiritualMoments,
        Optional<@Size(max = 500, message = "Las prácticas espirituales no pueden superar los 500 caracteres") String> spiritualPractices,

        // Collections
        Optional<List<String>> tags,
        Optional<List<String>> imageUrls

) {

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
                churchId.isPresent() || customChurch.isPresent() || spiritualMoments.isPresent() || spiritualPractices.isPresent() ||
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
        return churchId.isPresent() || customChurch.isPresent() || spiritualMoments.isPresent() ||
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
        if (customChurch.isPresent()) count++;
        if (spiritualMoments.isPresent()) count++;
        if (spiritualPractices.isPresent()) count++;

        // Colecciones
        if (tags.isPresent()) count++;
        if (imageUrls.isPresent()) count++;

        return count;
    }
}