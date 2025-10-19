package com.feeling.packages.user.domain.services;

import com.feeling.packages.auth.domain.dto.auth.AuthRegisterRequestDTO;
import com.feeling.packages.auth.domain.dto.oauth.GoogleUserInfoDTO;
import com.feeling.packages.auth.domain.enums.AuthProvider;
import com.feeling.packages.auth.domain.services.GoogleOAuthService;
import com.feeling.packages.user.domain.enums.UserRoleList;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.entities.UserRole;
import com.feeling.packages.user.infrastructure.repositories.IUserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Factory para la creación de entidades User.
 * <p>
 * Centraliza la lógica de creación de usuarios desde diferentes fuentes
 * (registro local, OAuth providers, etc.) siguiendo el patrón Factory.
 * <p>
 * Beneficios:
 * - Encapsula la lógica compleja de construcción de usuarios
 * - Reutilizable entre diferentes servicios
 * - Fácil de testear de forma aislada
 * - Mantiene los valores por defecto centralizados
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Component
@RequiredArgsConstructor
public class UserFactory {

    private final IUserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoogleOAuthService googleOAuthService;

    /**
     * Crea un nuevo usuario desde registro local (email/password).
     *
     * @param registerData Datos del formulario de registro
     * @return Usuario creado con valores por defecto (sin guardar en BD)
     */
    public User createLocalUser(AuthRegisterRequestDTO registerData) {
        UserRole clientRole = getOrCreateClientRole();

        return User.builder()
            .name(registerData.name().trim())
            .lastName(registerData.lastName().trim())
            .email(registerData.email().toLowerCase().trim())
            .password(passwordEncoder.encode(registerData.password()))
            .userRole(clientRole)
            .userAuthProvider(AuthProvider.LOCAL)
            .verified(false)
            .profileComplete(false)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .allowNotifications(true)
            .showMeInSearch(true)
            .showAge(true)
            .showLocation(true)
            .showPhone(false)
            .availableAttempts(0)
            .totalAttemptsPurchased(0)
            .profileViews(0L)
            .likesReceived(0L)
            .matchesCount(0L)
            .popularityScore(0.0)
            .build();
    }

    /**
     * Crea un nuevo usuario desde información de Google OAuth.
     *
     * @param googleUser Información del usuario obtenida de Google
     * @return Usuario creado con valores por defecto (sin guardar en BD)
     */
    public User createFromGoogleOAuth(GoogleUserInfoDTO googleUser) {
        UserRole clientRole = getOrCreateClientRole();

        return User.builder()
            .name(googleUser.getFirstName())
            .lastName(googleUser.getLastName())
            .email(googleUser.email().toLowerCase().trim())
            .password(passwordEncoder.encode(
                googleOAuthService.generateOAuthPassword("GOOGLE", googleUser.sub())
            ))
            .userRole(clientRole)
            .userAuthProvider(AuthProvider.GOOGLE)
            .externalId(googleUser.sub())
            .externalAvatarUrl(googleUser.picture())
            .verified(true)  // Google users are pre-verified
            .profileComplete(false)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .lastExternalSync(LocalDateTime.now())
            .allowNotifications(true)
            .showMeInSearch(true)
            .showAge(true)
            .showLocation(true)
            .showPhone(false)
            .availableAttempts(0)
            .totalAttemptsPurchased(0)
            .profileViews(0L)
            .likesReceived(0L)
            .matchesCount(0L)
            .popularityScore(0.0)
            .build();
    }

    /**
     * Obtiene o crea el rol CLIENT.
     * Método privado helper para evitar duplicación.
     *
     * @return UserRole CLIENT
     */
    private UserRole getOrCreateClientRole() {
        return userRoleRepository.findByUserRoleList(UserRoleList.CLIENT)
            .orElseGet(() -> userRoleRepository.save(new UserRole(UserRoleList.CLIENT)));
    }
}
