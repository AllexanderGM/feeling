package com.feeling.packages.user.domain.services;

import com.feeling.packages.auth.domain.enums.AuthProvider;
import com.feeling.packages.booking.domain.dto.GuestBookingRequestDTO;
import com.feeling.packages.user.domain.enums.UserAccountType;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.entities.UserRole;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import com.feeling.packages.user.infrastructure.repositories.IUserRoleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import static com.feeling.packages.user.domain.enums.UserRoleList.CLIENT;

/**
 * Servicio encargado de resolver o crear usuarios invitados (EVENTS_ONLY) a partir de compras de eventos.
 * Centraliza la lógica de normalización y actualización de datos básicos.
 */
@Service
@RequiredArgsConstructor
public class GuestUserService {

    private final IUserRepository userRepository;
    private final IUserRoleRepository userRoleRepository;

    @Transactional
    public User resolveGuestUser(GuestBookingRequestDTO request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (user == null) {
            User newGuest = createGuestUser(request, normalizedEmail);
            return userRepository.save(newGuest);
        }

        if (UserAccountType.FULL_APP.equals(user.getAccountType())) {
            fillOptionalDataForFullUser(user, request);
            return userRepository.save(user);
        }

        updateGuestUserData(user, request);
        return userRepository.save(user);
    }

    private User createGuestUser(GuestBookingRequestDTO request, String normalizedEmail) {
        UserRole clientRole = userRoleRepository.findByUserRoleList(CLIENT)
            .orElseGet(() -> userRoleRepository.save(new UserRole(CLIENT)));

        return User.builder()
            .name(request.getName().trim())
            .lastName(request.getLastName().trim())
            .email(normalizedEmail)
            .document(request.getDocument().trim())
            .phone(request.getPhone().trim())
            .phoneCode(request.getPhoneCode().trim())
            .city(request.getCity() != null ? request.getCity().trim() : null)
            .country(request.getCountry() != null ? request.getCountry().trim() : null)
            .userRole(clientRole)
            .userAuthProvider(AuthProvider.GUEST)
            .accountType(UserAccountType.EVENTS_ONLY)
            .verified(false)
            .profileComplete(false)
            .configurationCompleted(false)
            .allowNotifications(true)
            .notificationsEmailEnabled(true)
            .notificationsEventsEnabled(true)
            .showMeInSearch(false)
            .searchVisibility(false)
            .publicAccount(false)
            .build();
    }

    private void updateGuestUserData(User user, GuestBookingRequestDTO request) {
        user.setName(request.getName().trim());
        user.setLastName(request.getLastName().trim());
        user.setDocument(request.getDocument().trim());
        user.setPhone(request.getPhone().trim());
        user.setPhoneCode(request.getPhoneCode().trim());
        user.setCity(request.getCity() != null ? request.getCity().trim() : null);
        user.setCountry(request.getCountry() != null ? request.getCountry().trim() : null);
        user.setUpdatedAt(LocalDateTime.now());
        user.setProfileComplete(false);
        user.setConfigurationCompleted(false);
        user.setShowMeInSearch(false);
        user.setSearchVisibility(false);
        user.setPublicAccount(false);

        if (user.getAccountType() == null) {
            user.setAccountType(UserAccountType.EVENTS_ONLY);
        }

        if (user.getUserAuthProvider() == null) {
            user.setUserAuthProvider(AuthProvider.GUEST);
        }

        if (user.getUserRole() == null) {
            UserRole clientRole = userRoleRepository.findByUserRoleList(CLIENT)
                .orElseGet(() -> userRoleRepository.save(new UserRole(CLIENT)));
            user.setUserRole(clientRole);
        }
    }

    private void fillOptionalDataForFullUser(User user, GuestBookingRequestDTO request) {
        if (user.getDocument() == null || user.getDocument().isBlank()) {
            user.setDocument(request.getDocument().trim());
        }
        if (user.getPhone() == null || user.getPhone().isBlank()) {
            user.setPhone(request.getPhone().trim());
        }
        if (user.getPhoneCode() == null || user.getPhoneCode().isBlank()) {
            user.setPhoneCode(request.getPhoneCode().trim());
        }
        if (user.getCity() == null || user.getCity().isBlank()) {
            user.setCity(request.getCity() != null ? request.getCity().trim() : null);
        }
        if (user.getCountry() == null || user.getCountry().isBlank()) {
            user.setCountry(request.getCountry() != null ? request.getCountry().trim() : null);
        }
        user.setUpdatedAt(LocalDateTime.now());
    }
}
