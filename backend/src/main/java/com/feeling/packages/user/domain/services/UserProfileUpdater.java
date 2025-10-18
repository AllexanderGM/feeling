package com.feeling.packages.user.domain.services;

import com.feeling.packages.user.domain.dto.profile.request.UserRequestDTO;
import com.feeling.packages.user.domain.enums.UserCategoryInterestList;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserCategoryInterestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Aplica actualizaciones parciales de {@link UserRequestDTO} sobre entidades {@link User}.
 * <p>
 * Centraliza las reglas de negocio que se ejecutan durante un PATCH de perfil para
 * mantener los mappers enfocados únicamente en proyecciones.
 */
@Component
@RequiredArgsConstructor
public class UserProfileUpdater {

    private final UserAttributeService userAttributeService;
    private final IUserCategoryInterestRepository categoryInterestRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Aplica los cambios descritos en {@code request} sobre la entidad {@code user}.
     *
     * @param user    entidad que será modificada
     * @param request DTO con los campos a actualizar
     * @param isAdmin indica si quien realiza la modificación tiene privilegios de administrador
     */
    public void apply(User user, UserRequestDTO request, boolean isAdmin) {
        applyBasicInfo(user, request);
        applyCategoryInterest(user, request);
        applyDynamicAttributes(user, request, isAdmin);
        applyLocation(user, request);
        applyPreferences(user, request);
        applyPrivacy(user, request);
        applyNotifications(user, request);
        applySpiritualData(user, request);
        request.imageUrls().ifPresent(user::setImages);
        user.setUpdatedAt(LocalDateTime.now());
    }

    private void applyBasicInfo(User user, UserRequestDTO request) {
        request.name().ifPresent(user::setName);
        request.lastName().ifPresent(user::setLastName);
        request.email().ifPresent(user::setEmail);
        request.password().ifPresent(password -> user.setPassword(passwordEncoder.encode(password)));

        request.document().ifPresent(user::setDocument);
        request.phone().ifPresent(user::setPhone);
        request.phoneCode().ifPresent(user::setPhoneCode);
        request.dateOfBirth().ifPresent(user::setDateOfBirth);
        request.description().ifPresent(user::setDescription);
        request.profession().ifPresent(user::setProfession);
        request.height().ifPresent(user::setHeight);
    }

    private void applyCategoryInterest(User user, UserRequestDTO request) {
        request.categoryInterest().ifPresent(categoryName -> {
            try {
                UserCategoryInterestList categoryEnum = UserCategoryInterestList.valueOf(categoryName.toUpperCase());
                categoryInterestRepository.findByCategoryInterestEnum(categoryEnum)
                    .ifPresent(user::setCategoryInterest);
            } catch (IllegalArgumentException ignored) {
                // Ignore invalid category names to preserve previous state
            }
        });
    }

    private void applyDynamicAttributes(User user, UserRequestDTO request, boolean isAdmin) {
        request.genderId().ifPresent(id -> user.setGender(userAttributeService.findAttributeById(id, "Género")));
        request.maritalStatusId().ifPresent(id -> user.setMaritalStatus(userAttributeService.findAttributeById(id, "Estado civil")));
        request.educationLevelId().ifPresent(id -> user.setEducation(userAttributeService.findAttributeById(id, "Nivel educativo")));
        request.eyeColorId().ifPresent(id -> user.setEyeColor(userAttributeService.findAttributeById(id, "Color de ojos")));
        request.hairColorId().ifPresent(id -> user.setHairColor(userAttributeService.findAttributeById(id, "Color de cabello")));
        request.bodyTypeId().ifPresent(id -> user.setBodyType(userAttributeService.findAttributeById(id, "Tipo de cuerpo")));
        request.religionId().ifPresent(id -> user.setReligion(userAttributeService.findAttributeById(id, "Religión")));
        request.sexualRoleId().ifPresent(id -> user.setSexualRole(userAttributeService.findAttributeById(id, "Rol sexual")));
        request.relationshipTypeId().ifPresent(id -> user.setRelationshipType(userAttributeService.findAttributeById(id, "Tipo de relación")));

        request.churchId().ifPresent(churchId ->
            user.setChurch(userAttributeService.findAttributeById(churchId, "Iglesia"))
        );

        request.churchName().ifPresent(churchName -> {
            String trimmed = churchName.trim();
            if (!trimmed.isEmpty() && request.churchId().isEmpty()) {
                user.setChurch(userAttributeService.findOrCreateAttribute(trimmed, "CHURCH", isAdmin));
            }
        });
    }

    private void applyLocation(User user, UserRequestDTO request) {
        if (!request.hasLocationUpdates()) {
            return;
        }
        request.country().ifPresent(user::setCountry);
        request.department().ifPresent(user::setDepartment);
        request.city().ifPresent(user::setCity);
        request.locality().ifPresent(user::setLocality);
    }

    private void applyPreferences(User user, UserRequestDTO request) {
        if (!request.hasPreferenceUpdates()) {
            return;
        }
        request.agePreferenceMin().ifPresent(user::setAgePreferenceMin);
        request.agePreferenceMax().ifPresent(user::setAgePreferenceMax);
        request.locationPreferenceRadius().ifPresent(radius ->
            user.setLocationPreferenceRadius(radius.intValue())
        );
    }

    private void applyPrivacy(User user, UserRequestDTO request) {
        if (!request.hasPrivacyUpdates()) {
            return;
        }
        request.showAge().ifPresent(user::setShowAge);
        request.showLocation().ifPresent(user::setShowLocation);
        request.showPhone().ifPresent(user::setShowPhone);
        request.showMeInSearch().ifPresent(user::setShowMeInSearch);
        request.publicAccount().ifPresent(user::setPublicAccount);
        request.searchVisibility().ifPresent(user::setSearchVisibility);
        request.locationPublic().ifPresent(user::setLocationPublic);
    }

    private void applyNotifications(User user, UserRequestDTO request) {
        if (!request.hasNotificationUpdates()) {
            return;
        }
        request.notificationsEmailEnabled().ifPresent(user::setNotificationsEmailEnabled);
        request.notificationsPhoneEnabled().ifPresent(user::setNotificationsPhoneEnabled);
        request.notificationsMatchesEnabled().ifPresent(user::setNotificationsMatchesEnabled);
        request.notificationsEventsEnabled().ifPresent(user::setNotificationsEventsEnabled);
        request.notificationsLoginEnabled().ifPresent(user::setNotificationsLoginEnabled);
        request.notificationsPaymentsEnabled().ifPresent(user::setNotificationsPaymentsEnabled);
        request.allowNotifications().ifPresent(user::setAllowNotifications);
    }

    private void applySpiritualData(User user, UserRequestDTO request) {
        if (!request.hasSpiritualUpdates()) {
            return;
        }
        request.spiritualMoments().ifPresent(user::setSpiritualMoments);
        request.spiritualPractices().ifPresent(user::setSpiritualPractices);
    }
}
