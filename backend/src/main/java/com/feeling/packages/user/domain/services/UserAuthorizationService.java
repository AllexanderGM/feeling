package com.feeling.packages.user.domain.services;

import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Servicio especializado para validaciones de autorización y mapeo de identidades de usuarios.
 * <p>
 * Responsabilidades:
 * - Validar correspondencia entre userId y email
 * - Mapeo bidireccional userId ↔ email (cacheado)
 * - Verificar estado activo de usuarios
 * - Obtener usuario actual desde contexto de autenticación
 * <p>
 * Todos los métodos de consulta están cacheados para optimizar performance
 * en validaciones de seguridad frecuentes.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class UserAuthorizationService {

    private static final Logger logger = LoggerFactory.getLogger(UserAuthorizationService.class);

    private final IUserRepository userRepository;

    /**
     * Verifica si un userId corresponde a un email específico.
     * <p>
     * Útil para validar auto-modificación cuando el identificador es un ID numérico.
     * Usado principalmente en filtros de seguridad para verificar que el usuario
     * solo pueda modificar sus propios datos.
     *
     * @param userId ID del usuario a verificar
     * @param email  Email a validar contra el usuario
     * @return true si el userId corresponde al email
     */
    @Cacheable(value = "user-id-email-mapping", key = "#userId + ':' + #email")
    public boolean isUserIdMatchesEmail(Long userId, String email) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);

            if (userOptional.isEmpty()) {
                logger.debug("Usuario con ID {} no encontrado", userId);
                return false;
            }

            boolean matches = userOptional.get().getEmail().equals(email);
            logger.debug("Verificación userId {} con email {}: {}", userId, email, matches);

            return matches;
        } catch (Exception e) {
            logger.error("Error verificando userId {} con email {}: {}", userId, email, e.getMessage());
            return false;
        }
    }

    /**
     * Obtiene el email de un usuario por su ID.
     * <p>
     * Útil para mapeo inverso en operaciones de autorización y auditoría.
     *
     * @param userId ID del usuario
     * @return Optional con el email del usuario, vacío si no existe
     */
    @Cacheable(value = "user-id-to-email", key = "#userId")
    public Optional<String> getEmailByUserId(Long userId) {
        try {
            return userRepository.findById(userId)
                    .map(User::getEmail);
        } catch (Exception e) {
            logger.error("Error obteniendo email para userId {}: {}", userId, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Obtiene el ID de un usuario por su email.
     * <p>
     * Útil para mapeo de identidad en operaciones que reciben email
     * y necesitan el ID numérico del usuario.
     *
     * @param email Email del usuario
     * @return Optional con el ID del usuario, vacío si no existe
     */
    @Cacheable(value = "user-email-to-id", key = "#email")
    public Optional<Long> getUserIdByEmail(String email) {
        try {
            return userRepository.findByEmail(email)
                    .map(User::getId);
        } catch (Exception e) {
            logger.error("Error obteniendo userId para email {}: {}", email, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Verifica si un usuario existe y está activo por su email.
     * <p>
     * Un usuario se considera activo si está habilitado (enabled=true)
     * y no está desactivado (accountDeactivated=false).
     *
     * @param email Email del usuario a verificar
     * @return true si el usuario existe y está activo
     */
    @Cacheable(value = "user-active-status", key = "#email")
    public boolean isUserActiveByEmail(String email) {
        try {
            return userRepository.findByEmail(email)
                    .map(user -> user.isEnabled() && !user.isAccountDeactivated())
                    .orElse(false);
        } catch (Exception e) {
            logger.error("Error verificando estado activo para email {}: {}", email, e.getMessage());
            return false;
        }
    }

    /**
     * Obtiene el usuario actual desde el contexto de autenticación Spring Security.
     * <p>
     * Extrae el email desde el Authentication principal (UserDetails o String)
     * y busca el usuario completo en la base de datos.
     *
     * @param authentication Contexto de autenticación de Spring Security
     * @return Usuario autenticado completo
     * @throws RuntimeException Si el usuario no está autenticado o no se encuentra en BD
     */
    public User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }

        String email;
        if (authentication.getPrincipal() instanceof UserDetails) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        } else {
            email = authentication.getName();
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
}