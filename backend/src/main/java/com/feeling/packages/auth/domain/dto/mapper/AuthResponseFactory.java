package com.feeling.packages.auth.domain.dto.mapper;

import com.feeling.packages.auth.domain.dto.auth.*;
import com.feeling.packages.auth.domain.dto.verification.*;
import com.feeling.packages.auth.domain.enums.AuthProvider;
import com.feeling.packages.user.infrastructure.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Optional;
import java.util.Set;

/**
 * Factoría utilitaria para construir DTOs auxiliares del dominio de autenticación.
 * <p>
 * Centraliza la lógica de conversión desde entidades {@link User} hacia las distintas
 * respuestas expuestas por los controladores de autenticación, manteniendo mensajes y
 * estructuras consistentes en toda la capa de aplicación.
 */
@Component
@RequiredArgsConstructor
public class AuthResponseFactory {

    private static final String DEFAULT_REFRESH_MESSAGE = "Tokens refrescados exitosamente";

    private final IAuthUserMapper authUserMapper;

    public AuthLoginResponseDTO createAuthLoginResponse(TokenResponseDTO tokenResponseDTO, User user) {
        return authUserMapper.toAuthLoginResponse(tokenResponseDTO, user);
    }

    /**
     * Construye el DTO para correos sin registro previo.
     */
    public AuthMethodInfoDTO createAuthMethodInfoForUnregistered(String email, String message) {
        return new AuthMethodInfoDTO(
            email,
            null,
            false,
            message,
            defaultAvailableMethods()
        );
    }

    /**
     * Construye el DTO para correos ya registrados con un proveedor.
     */
    public AuthMethodInfoDTO createAuthMethodInfoForUser(User user, String customMessage) {
        AuthProvider provider = user.getUserAuthProvider();
        String message = customMessage != null ? customMessage : resolveAuthProviderMessage(provider);
        return new AuthMethodInfoDTO(
            user.getEmail(),
            provider,
            true,
            message,
            EnumSet.of(provider)
        );
    }

    /**
     * Determina la respuesta de método de autenticación según exista o no el usuario.
     */
    public AuthMethodInfoDTO resolveAuthMethodInfo(String email, Optional<User> userOpt, String customMessage, String unregisteredMessage) {
        return userOpt
            .map(user -> createAuthMethodInfoForUser(user, customMessage))
            .orElseGet(() -> createAuthMethodInfoForUnregistered(email, unregisteredMessage));
    }

    /**
     * Construye el DTO por defecto para errores al determinar el método de autenticación.
     */
    public AuthMethodInfoDTO createAuthMethodInfoError(String email, String message) {
        return new AuthMethodInfoDTO(email, null, false, message, EnumSet.noneOf(AuthProvider.class));
    }

    /**
     * Respuesta estandarizada cuando el email está disponible para registro.
     */
    public EmailAvailabilityDTO createEmailAvailable(String email, String statusMessage, String helperMessage) {
        return new EmailAvailabilityDTO(
            email,
            true,
            null,
            statusMessage,
            defaultAvailableMethods(),
            helperMessage
        );
    }

    /**
     * Respuesta cuando el email ya está asignado a un usuario existente.
     */
    public EmailAvailabilityDTO createEmailConflict(User user, String suggestion) {
        AuthProvider provider = user.getUserAuthProvider();
        String message = suggestion != null ? suggestion : resolveConflictMessage(provider);
        return new EmailAvailabilityDTO(
            user.getEmail(),
            false,
            provider,
            message,
            EnumSet.noneOf(AuthProvider.class),
            user.getAuthMethodMessage()
        );
    }

    /**
     * Respuesta estándar en caso de error al consultar la disponibilidad.
     */
    public EmailAvailabilityDTO createEmailAvailabilityError(String email, String message, String helperMessage) {
        return new EmailAvailabilityDTO(
            email,
            false,
            null,
            message,
            EnumSet.noneOf(AuthProvider.class),
            helperMessage
        );
    }

    /**
     * Construye un {@link AuthUserStatusDTO} combinando banderas y datos del usuario.
     */
    public AuthUserStatusDTO createAuthUserStatus(String email, boolean fullyRegistered, Optional<User> userOpt) {
        boolean verified = userOpt.map(User::isVerified).orElse(false);
        boolean profileComplete = userOpt.map(User::getProfileComplete).orElse(false);
        return new AuthUserStatusDTO(email, fullyRegistered, verified, profileComplete);
    }

    /**
     * Convierte un {@link AuthUserStatusDTO} en la respuesta extendida para verificación.
     */
    public UserVerificationStatusDTO createUserVerificationStatus(AuthUserStatusDTO status, AuthProvider authProvider, Long codeExpirationMinutes) {
        return new UserVerificationStatusDTO(
            status.email(),
            status.fullyRegistered(),
            status.verified(),
            status.profileComplete(),
            authProvider,
            codeExpirationMinutes
        );
    }

    /**
     * Construye el DTO de sesión a partir de la entidad usuario.
     */
    public SessionInfoDTO createSessionInfo(User user) {
        return new SessionInfoDTO(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getLastName(),
            user.getUserRole().getUserRoleList().name(),
            user.isVerified(),
            user.getProfileComplete(),
            user.getLastActive()
        );
    }

    /**
     * Construye la respuesta de validación de token.
     */
    public TokenValidationDTO createTokenValidation(boolean valid, String email, String message, Long minutesRemaining) {
        return new TokenValidationDTO(valid, email, message, minutesRemaining);
    }

    /**
     * Construye la respuesta del flujo de refresh token.
     */
    public RefreshTokenResponseDTO createRefreshTokenResponse(String accessToken, String refreshToken) {
        return new RefreshTokenResponseDTO(accessToken, refreshToken, DEFAULT_REFRESH_MESSAGE);
    }

    /**
     * Construye la respuesta de validación de códigos.
     */
    public CodeValidationDTO createCodeValidation(boolean isValid) {
        return new CodeValidationDTO(
            isValid,
            isValid ? "Código válido" : "Código inválido o expirado"
        );
    }

    private Set<AuthProvider> defaultAvailableMethods() {
        return EnumSet.of(AuthProvider.LOCAL, AuthProvider.GOOGLE);
    }

    private String resolveAuthProviderMessage(AuthProvider provider) {
        return switch (provider) {
            case GOOGLE -> "Esta cuenta está registrada con Google";
            case FACEBOOK -> "Esta cuenta está registrada con Facebook";
            case LOCAL -> "Esta cuenta está registrada con email y contraseña";
            case APPLE -> "Esta cuenta está registrada con Apple";
            case GUEST -> "Este correo se usó para reservar eventos. Completa tu registro creando una contraseña.";
        };
    }

    private String resolveConflictMessage(AuthProvider provider) {
        return switch (provider) {
            case LOCAL -> "Este email ya tiene una cuenta. Ve a 'Iniciar Sesión' y usa tu contraseña.";
            case GOOGLE ->
                "Este email ya tiene una cuenta con Google. Ve a 'Iniciar Sesión' y usa 'Continuar con Google'.";
            case FACEBOOK ->
                "Este email ya tiene una cuenta con Facebook. Ve a 'Iniciar Sesión' y usa 'Continuar con Facebook'.";
            case APPLE ->
                "Este email ya tiene una cuenta con Apple. Ve a 'Iniciar Sesión' y usa 'Continuar con Apple'.";
            case GUEST ->
                "Este email ya fue usado para registrarse a eventos. Completa tu registro para usar email y contraseña.";
        };
    }
}
