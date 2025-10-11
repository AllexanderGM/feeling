package com.feeling.packages.user.domain.services;

import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Servicio especializado para operaciones de usuario con cache optimizado para JWT.
 * <p>
 * Separado del UserService principal para evitar contaminar el cache con operaciones complejas.
 * Proporciona métodos cacheados para validación de autenticación y contexto de seguridad.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class UserCachedService {

    private static final Logger logger = LoggerFactory.getLogger(UserCachedService.class);

    private final IUserRepository userRepository;

    /**
     * Busca un usuario por email con cache optimizado para validación JWT.
     * <p>
     * Cache: 10 minutos de escritura, 5 minutos de acceso
     *
     * @param email Email del usuario a buscar
     * @return Optional con el usuario si existe
     */
    @Cacheable(value = "users", key = "#email", unless = "#result == null")
    public Optional<User> findByEmailCached(String email) {
        logger.debug("Cargando usuario desde BD (cache miss): {}", email);
        return userRepository.findByEmail(email);
    }

    /**
     * Verifica si un usuario existe y está habilitado (para validación JWT rápida).
     * <p>
     * Usa un cache separado para esta validación específica.
     *
     * @param email Email del usuario a validar
     * @return true si el usuario existe, está habilitado y no bloqueado
     */
    @Cacheable(value = "user-validation", key = "#email")
    public Boolean isUserValidForAuth(String email) {
        logger.debug("Validando usuario desde BD (cache miss): {}", email);
        return userRepository.findByEmail(email)
            .map(user -> user.isEnabled() && user.isAccountNonLocked())
            .orElse(false);
    }

    /**
     * Verifica si un usuario puede completar su perfil (verificado pero no necesariamente aprobado).
     * <p>
     * Usa un cache separado para esta validación específica.
     *
     * @param email Email del usuario a validar
     * @return true si el usuario está verificado, activo y no bloqueado
     */
    @Cacheable(value = "user-profile-completion", key = "#email")
    public Boolean isUserValidForProfileCompletion(String email) {
        logger.debug("Validando usuario para completar perfil desde BD (cache miss): {}", email);
        return userRepository.findByEmail(email)
            .map(user -> user.isVerified() && !user.isAccountDeactivated() && user.isAccountNonLocked())
            .orElse(false);
    }

    /**
     * Obtiene información básica del usuario para el contexto de seguridad.
     * <p>
     * Solo los datos necesarios para Spring Security.
     *
     * @param email Email del usuario
     * @return Información de seguridad del usuario, null si no existe
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
     * Invalida el cache cuando un usuario es modificado.
     *
     * @param email Email del usuario cuyo cache se debe invalidar
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
     * Actualiza lastActive sin invalidar cache (operación ligera).
     * <p>
     * No invalida cache ya que esta información no afecta autenticación o seguridad.
     *
     * @param email Email del usuario a actualizar
     */
    public void updateLastActiveWithoutCacheEviction(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setLastActive(LocalDateTime.now());
            userRepository.save(user);
            // No invalidamos cache para esta operación menor
        });
    }

    /**
     * Record para información de seguridad del usuario (ligero).
     *
     * @param email                 Email del usuario
     * @param role                  Rol del usuario
     * @param enabled               Si la cuenta está habilitada
     * @param accountNonLocked      Si la cuenta no está bloqueada
     * @param credentialsNonExpired Si las credenciales no han expirado
     * @param accountNonExpired     Si la cuenta no ha expirado
     */
    public record UserSecurityInfo(
        String email,
        String role,
        boolean enabled,
        boolean accountNonLocked,
        boolean credentialsNonExpired,
        boolean accountNonExpired
    ) {
    }
}
