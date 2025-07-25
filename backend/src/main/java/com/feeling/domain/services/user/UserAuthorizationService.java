package com.feeling.domain.services.user;

import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.repositories.user.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Servicio para validaciones de autorización de usuarios
 */
@Service
@RequiredArgsConstructor
public class UserAuthorizationService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserAuthorizationService.class);
    
    private final IUserRepository userRepository;

    /**
     * Verifica si un userId corresponde a un email específico
     * Útil para validar auto-modificación cuando el identificador es un ID numérico
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
     * Obtiene el email de un usuario por su ID
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
     * Obtiene el ID de un usuario por su email
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
     * Verifica si un usuario existe y está activo
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
     * Obtiene el usuario actual desde el contexto de autenticación
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