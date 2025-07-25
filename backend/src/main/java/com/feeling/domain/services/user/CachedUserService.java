package com.feeling.domain.services.user;

import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.repositories.user.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Servicio especializado para operaciones de usuario con cache optimizado para JWT
 * Separado del UserService principal para evitar contaminar el cache con operaciones complejas
 */
@Service
@RequiredArgsConstructor
public class CachedUserService {

    private static final Logger logger = LoggerFactory.getLogger(CachedUserService.class);
    
    private final IUserRepository userRepository;

    /**
     * Busca un usuario por email con cache optimizado para validación JWT
     * Cache: 10 minutos de escritura, 5 minutos de acceso
     */
    @Cacheable(value = "users", key = "#email", unless = "#result == null")
    public Optional<User> findByEmailCached(String email) {
        logger.debug("Cargando usuario desde BD (cache miss): {}", email);
        return userRepository.findByEmail(email);
    }

    /**
     * Verifica si un usuario existe y está habilitado (para validación JWT rápida)
     * Usa un cache separado para esta validación específica
     */
    @Cacheable(value = "user-validation", key = "#email")
    public Boolean isUserValidForAuth(String email) {
        logger.debug("Validando usuario desde BD (cache miss): {}", email);
        return userRepository.findByEmail(email)
                .map(user -> user.isEnabled() && user.isAccountNonLocked())
                .orElse(false);
    }

    /**
     * Verifica si un usuario puede completar su perfil (verificado pero no necesariamente aprobado)
     * Usa un cache separado para esta validación específica
     */
    @Cacheable(value = "user-profile-completion", key = "#email")
    public Boolean isUserValidForProfileCompletion(String email) {
        logger.debug("Validando usuario para completar perfil desde BD (cache miss): {}", email);
        return userRepository.findByEmail(email)
                .map(user -> user.isVerified() && !user.isAccountDeactivated() && user.isAccountNonLocked())
                .orElse(false);
    }

    /**
     * Obtiene información básica del usuario para el contexto de seguridad
     * Solo los datos necesarios para Spring Security
     */
    @Cacheable(value = "user-security-context", key = "#email")
    public UserSecurityInfo getUserSecurityInfo(String email) {
        logger.debug("Cargando contexto de seguridad desde BD (cache miss): {}", email);
        return userRepository.findByEmail(email)
                .map(user -> new UserSecurityInfo(
                        user.getEmail(),
                        user.getUserRole().getUserRoleList().name(),
                        user.isEnabled(),
                        user.isAccountNonLocked(),
                        user.isCredentialsNonExpired(),
                        user.isAccountNonExpired()
                ))
                .orElse(null);
    }

    /**
     * Invalida el cache cuando un usuario es modificado
     */
    @CacheEvict(value = {"users", "user-validation", "user-profile-completion", "user-security-context"}, key = "#email")
    public void evictUserCache(String email) {
        logger.debug("Invalidando cache para usuario: {}", email);
    }

    /**
     * Invalida todo el cache de usuarios (usar con precaución)
     */
    @CacheEvict(value = {"users", "user-validation", "user-profile-completion", "user-security-context"}, allEntries = true)
    public void evictAllUserCache() {
        logger.info("Invalidando todo el cache de usuarios");
    }

    /**
     * Actualiza lastActive sin invalidar cache (operación ligera)
     */
    public void updateLastActiveWithoutCacheEviction(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setLastActive(java.time.LocalDateTime.now());
            userRepository.save(user);
            // No invalidamos cache para esta operación menor
        });
    }

    /**
     * Record para información de seguridad del usuario (ligero)
     */
    public record UserSecurityInfo(
            String email,
            String role,
            boolean enabled,
            boolean accountNonLocked,
            boolean credentialsNonExpired,
            boolean accountNonExpired
    ) {}
}