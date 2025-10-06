package com.feeling.packages.user.domain.dto;

import com.feeling.packages.auth.domain.dto.*;
import com.feeling.packages.user.domain.enums.UserCategoryInterestList;
import com.feeling.packages.user.domain.services.UserAttributeService;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserCategoryInterestRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

/**
 * Utilidad para mapear entidades User a DTOs estandarizados
 */
public class UserDTOMapper {

    /**
     * Convierte una entidad User a UserStatusDTO
     */
    public static UserStatusDTO toUserStatusDTO(User user) {
        return new UserStatusDTO(
            user.getId(),
            user.isVerified(),
            user.getProfileComplete(),
            user.isApproved(),
            user.getApprovalStatus().name(),
            user.getUserRole().getUserRoleList().name(),
            user.getAvailableAttempts(),
            user.getCreatedAt(),
            user.getLastActive()
        );
    }

    /**
     * Convierte una entidad User a UserProfileDataDTO
     */
    public static UserProfileDataDTO toUserProfileDataDTO(User user) {
        return new UserProfileDataDTO(
            user.getName(),
            user.getLastName(),
            user.getEmail(),
            user.getDateOfBirth(),
            user.getAge(),
            user.getDocument(),
            user.getPhone(),
            user.getPhoneCode(),
            user.getCountry(),
            user.getCity(),
            user.getDepartment(),
            user.getLocality(),
            user.getDescription(),
            user.getImages(),
            user.getMainImage(),
            user.getCategoryInterest() != null ?
                user.getCategoryInterest().getCategoryInterestEnum().name() : null,
            user.getGender() != null ? user.getGender().getName() : null,
            user.getTagNames(),
            // Campos de preferencias
            user.getAgePreferenceMin(),
            user.getAgePreferenceMax(),
            user.getLocationPreferenceRadius(),
            // Campos específicos para SPIRIT
            user.getChurch() != null ? user.getChurch().getName() : null,
            user.getCustomChurch()
        );
    }

    /**
     * Convierte una entidad User a UserResponseDTO (standard level)
     */
    public static UserResponseDTO toUserStandardResponseDTO(User user) {
        return new UserResponseDTO(
            toUserStatusDTO(user),
            toUserProfileDataDTO(user),
            null, null, null, null, null, null
        );
    }

    /**
     * Convierte una entidad User a UserResponseDTO (extended level)
     */
    public static UserResponseDTO toUserExtendedResponseDTO(User user) {
        return new UserResponseDTO(
            toUserStatusDTO(user),
            toUserProfileDataDTO(user),
            toUserPrivacyDTO(user),
            toUserMetricsDTO(user),
            null, // matches
            toAuthProviderInfoDTO(user),
            null, // account
            toUserNotificationDTO(user)
        );
    }

    /**
     * Convierte una entidad User a UserResponseDTO (con datos adicionales y métricas de matches)
     */
    public static UserResponseDTO toUserExtendedResponseDTO(User user, UserMatchesDTO matches) {
        return new UserResponseDTO(
            toUserStatusDTO(user),
            toUserProfileDataDTO(user),
            toUserPrivacyDTO(user),
            toUserMetricsDTO(user),
            matches, // matches
            toAuthProviderInfoDTO(user),
            null, // account
            toUserNotificationDTO(user)
        );
    }

    /**
     * Convierte una entidad User a UserResponseDTO (public level)
     */
    public static UserResponseDTO toUserPublicResponseDTO(User user) {
        return new UserResponseDTO(
            toUserStatusDTO(user),
            toUserProfileDataDTO(user),
            null, null, null, null, null, null
        );
    }


    /**
     * Convierte una entidad User a AuthLoginResponseDTO (para tests)
     */
    public static AuthLoginResponseDTO toAuthLoginResponseDTO(User user, String accessToken, String refreshToken) {
        return new AuthLoginResponseDTO(
            accessToken,
            refreshToken,
            toUserStatusDTO(user),
            toUserProfileDataDTO(user),
            toUserPrivacyDTO(user),
            toUserNotificationDTO(user),
            toUserMetricsDTO(user),
            toUserMatchesDTO(user),
            toAuthProviderInfoDTO(user),
            toUserAccountStatusDTO(user)
        );
    }

    /**
     * Convierte una entidad User a UserEssentialDTO
     */
    public static UserEssentialDTO toUserEssentialDTO(User user) {
        return new UserEssentialDTO(
            user.getId(),
            user.getName(),
            user.getLastName(),
            user.getEmail(),
            user.getUserRole().getUserRoleList().name(),
            user.isApproved(),
            user.getApprovalStatus().name(),
            user.getCategoryInterest() != null ?
                user.getCategoryInterest().getCategoryInterestEnum().name() : null,
            user.isProfileComplete()
        );
    }

    /**
     * Convierte una entidad User a AuthLoginEssentialResponseDTO
     */
    public static AuthLoginEssentialResponseDTO toAuthLoginEssentialResponseDTO(User user, String accessToken, String refreshToken) {
        return new AuthLoginEssentialResponseDTO(
            accessToken,
            refreshToken,
            toUserEssentialDTO(user)
        );
    }

    /**
     * Convierte una entidad User a UserNotificationDTO
     */
    public static UserNotificationDTO toUserNotificationDTO(User user) {
        return new UserNotificationDTO(
            user.isNotificationsEmailEnabled(),
            user.isNotificationsPhoneEnabled(),
            user.isNotificationsMatchesEnabled(),
            user.isNotificationsEventsEnabled(),
            user.isNotificationsLoginEnabled(),
            user.isNotificationsPaymentsEnabled()
        );
    }

    /**
     * Convierte una entidad User a UserPrivacyDTO
     */
    public static UserPrivacyDTO toUserPrivacyDTO(User user) {
        return new UserPrivacyDTO(
            user.isPublicAccount(),
            user.isSearchVisibility(),
            user.isLocationPublic(),
            user.isShowAge(),
            user.isShowLocation(),
            user.isShowPhone(),
            user.isShowMeInSearch()
        );
    }

    /**
     * Convierte una entidad User a UserMetricsDTO
     */
    public static UserMetricsDTO toUserMetricsDTO(User user) {
        return new UserMetricsDTO(
            user.getProfileViews(),
            user.getLikesReceived(),
            user.getMatchesCount(),
            user.getPopularityScore(),
            user.getProfileCompletenessPercentage()
        );
    }

    /**
     * Convierte una entidad User a UserMatchesDTO
     */
    public static UserMatchesDTO toUserMatchesDTO(User user) {
        return new UserMatchesDTO(
            user.getAvailableAttempts(),
            0, // todayMatches - TODO: implementar lógica
            user.getMatchesCount() != null ? user.getMatchesCount().intValue() : 0,
            10, // maxDailyAttempts - TODO: obtener de configuración
            0L, // pendingSent
            0L, // pendingReceived
            0L, // accepted
            0L  // favorites
        );
    }

    /**
     * Convierte una entidad User a AuthProviderInfoDTO
     */
    public static AuthProviderInfoDTO toAuthProviderInfoDTO(User user) {
        return new AuthProviderInfoDTO(
            user.getUserAuthProvider(),
            user.getExternalId(),
            user.getExternalAvatarUrl(),
            user.getLastExternalSync()
        );
    }

    /**
     * Convierte una entidad User a UserAccountStatusDTO
     */
    public static UserAccountStatusDTO toUserAccountStatusDTO(User user) {
        return new UserAccountStatusDTO(
            user.isAccountDeactivated(),
            user.getDeactivationDate(),
            user.getDeactivationReason()
        );
    }

    /**
     * Convierte una entidad User a UserStatusDTO público (sin datos sensibles)
     */
    public static UserStatusDTO toUserPublicStatusDTO(User user) {
        return new UserStatusDTO(
            user.getId(),
            user.isVerified(),
            user.getProfileComplete(),
            user.isApproved(),
            user.getApprovalStatus().name(),
            user.getUserRole().getUserRoleList().name(),
            null, // availableAttempts - no mostrar en vista pública
            user.getCreatedAt(),
            user.getLastActive()
        );
    }

    /**
     * Aplica actualizaciones parciales de un DTO a una entidad User
     * Centraliza la lógica de actualización para evitar código repetitivo
     */
    public static void applyPartialUpdate(User user, UserPartialUpdateDTO partialUpdate,
                                          UserAttributeService userAttributeService,
                                          IUserCategoryInterestRepository categoryInterestRepository,
                                          PasswordEncoder passwordEncoder) {
        // Datos básicos
        partialUpdate.name().ifPresent(user::setName);
        partialUpdate.lastName().ifPresent(user::setLastName);
        partialUpdate.email().ifPresent(user::setEmail);
        partialUpdate.password().ifPresent(password ->
            user.setPassword(passwordEncoder.encode(password)));

        // Datos personales
        partialUpdate.document().ifPresent(user::setDocument);
        partialUpdate.phone().ifPresent(user::setPhone);
        partialUpdate.phoneCode().ifPresent(user::setPhoneCode);
        partialUpdate.dateOfBirth().ifPresent(user::setDateOfBirth);
        partialUpdate.description().ifPresent(user::setDescription);
        partialUpdate.profession().ifPresent(user::setProfession);
        partialUpdate.height().ifPresent(user::setHeight);

        // Categoría de interés - Buscar registro existente en lugar de crear uno nuevo
        partialUpdate.categoryInterest().ifPresent(categoryName -> {
            try {
                UserCategoryInterestList categoryEnum = UserCategoryInterestList.valueOf(categoryName.toUpperCase());
                // Buscar la categoría existente en la base de datos y asignarla al usuario
                categoryInterestRepository.findByCategoryInterestEnum(categoryEnum)
                    .ifPresent(user::setCategoryInterest);
            } catch (IllegalArgumentException e) {
                // Categoría inválida, ignorar
            }
        });

        // Atributos dinámicos con validación (ahora usa el servicio)
        partialUpdate.genderId().ifPresent(id ->
            user.setGender(userAttributeService.findAttributeById(id, "Género")));
        partialUpdate.maritalStatusId().ifPresent(id ->
            user.setMaritalStatus(userAttributeService.findAttributeById(id, "Estado civil")));
        partialUpdate.educationLevelId().ifPresent(id ->
            user.setEducation(userAttributeService.findAttributeById(id, "Nivel educativo")));
        partialUpdate.eyeColorId().ifPresent(id ->
            user.setEyeColor(userAttributeService.findAttributeById(id, "Color de ojos")));
        partialUpdate.hairColorId().ifPresent(id ->
            user.setHairColor(userAttributeService.findAttributeById(id, "Color de cabello")));
        partialUpdate.bodyTypeId().ifPresent(id ->
            user.setBodyType(userAttributeService.findAttributeById(id, "Tipo de cuerpo")));
        partialUpdate.religionId().ifPresent(id ->
            user.setReligion(userAttributeService.findAttributeById(id, "Religión")));
        partialUpdate.sexualRoleId().ifPresent(id ->
            user.setSexualRole(userAttributeService.findAttributeById(id, "Rol sexual")));
        partialUpdate.relationshipTypeId().ifPresent(id ->
            user.setRelationshipType(userAttributeService.findAttributeById(id, "Tipo de relación")));
        partialUpdate.churchId().ifPresent(id ->
            user.setChurch(userAttributeService.findAttributeById(id, "Iglesia")));

        // Ubicación
        if (partialUpdate.hasLocationUpdates()) {
            partialUpdate.country().ifPresent(user::setCountry);
            partialUpdate.department().ifPresent(user::setDepartment);
            partialUpdate.city().ifPresent(user::setCity);
            partialUpdate.locality().ifPresent(user::setLocality);
        }

        // Preferencias
        if (partialUpdate.hasPreferenceUpdates()) {
            partialUpdate.agePreferenceMin().ifPresent(user::setAgePreferenceMin);
            partialUpdate.agePreferenceMax().ifPresent(user::setAgePreferenceMax);
            partialUpdate.locationPreferenceRadius().ifPresent(radius ->
                user.setLocationPreferenceRadius(radius.intValue()));
        }

        // Privacidad
        if (partialUpdate.hasPrivacyUpdates()) {
            partialUpdate.showAge().ifPresent(user::setShowAge);
            partialUpdate.showLocation().ifPresent(user::setShowLocation);
            partialUpdate.showPhone().ifPresent(user::setShowPhone);
            partialUpdate.showMeInSearch().ifPresent(user::setShowMeInSearch);
            partialUpdate.publicAccount().ifPresent(user::setPublicAccount);
            partialUpdate.searchVisibility().ifPresent(user::setSearchVisibility);
            partialUpdate.locationPublic().ifPresent(user::setLocationPublic);
        }

        // Notificaciones
        if (partialUpdate.hasNotificationUpdates()) {
            partialUpdate.notificationsEmailEnabled().ifPresent(user::setNotificationsEmailEnabled);
            partialUpdate.notificationsPhoneEnabled().ifPresent(user::setNotificationsPhoneEnabled);
            partialUpdate.notificationsMatchesEnabled().ifPresent(user::setNotificationsMatchesEnabled);
            partialUpdate.notificationsEventsEnabled().ifPresent(user::setNotificationsEventsEnabled);
            partialUpdate.notificationsLoginEnabled().ifPresent(user::setNotificationsLoginEnabled);
            partialUpdate.notificationsPaymentsEnabled().ifPresent(user::setNotificationsPaymentsEnabled);
            partialUpdate.allowNotifications().ifPresent(user::setAllowNotifications);
        }

        // Campos espirituales
        if (partialUpdate.hasSpiritualUpdates()) {
            partialUpdate.customChurch().ifPresent(user::setCustomChurch);
            partialUpdate.spiritualMoments().ifPresent(user::setSpiritualMoments);
            partialUpdate.spiritualPractices().ifPresent(user::setSpiritualPractices);
        }

        // Colecciones
        // Note: tags are managed through UserTagService, not directly set here
        partialUpdate.imageUrls().ifPresent(imageUrls ->
            user.setImages(imageUrls));

        // Actualizar timestamp
        user.setUpdatedAt(LocalDateTime.now());
    }
}
