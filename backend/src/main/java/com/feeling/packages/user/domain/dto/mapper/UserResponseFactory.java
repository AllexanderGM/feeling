package com.feeling.packages.user.domain.dto.mapper;

import com.feeling.packages.user.domain.dto.user.UserResponseDTO;
import com.feeling.packages.user.domain.enums.UserResponseLevel;
import com.feeling.packages.user.infrastructure.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Factory para crear UserResponseDTO con diferentes niveles de inclusión
 * Phase 4.2: Query Parameters for Response Control - API Modernization
 */
@Component
@RequiredArgsConstructor
public class UserResponseFactory {

    private final IUserResponseMapper userResponseMapper;

    /**
     * Crea UserResponseDTO según el nivel de inclusión especificado
     */
    public UserResponseDTO create(User user, UserResponseLevel level) {
        return switch (level) {
            case PUBLIC -> createPublicResponse(user);
            case BASIC -> createBasicResponse(user);
            case STANDARD -> createStandardResponse(user);
            case EXTENDED -> createExtendedResponse(user);
            case FULL -> createFullResponse(user);
            case ADMIN -> createAdminResponse(user);
        };
    }

    /**
     * Crea UserResponseDTO según el nivel de inclusión especificado (string)
     */
    public UserResponseDTO create(User user, String includeLevel, UserResponseLevel defaultLevel) {
        UserResponseLevel level = UserResponseLevel.fromString(includeLevel, defaultLevel);
        return create(user, level);
    }

    /**
     * Vista pública: solo información básica (sin datos sensibles)
     */
    private UserResponseDTO createPublicResponse(User user) {
        return userResponseMapper.toPublicResponse(user);
    }

    /**
     * Vista básica: datos del perfil con métricas básicas para sugerencias
     */
    private UserResponseDTO createBasicResponse(User user) {
        return userResponseMapper.toStandardResponse(user);
    }

    /**
     * Vista estándar: incluye métricas básicas
     */
    private UserResponseDTO createStandardResponse(User user) {
        return userResponseMapper.toStandardResponse(user);
    }

    /**
     * Vista extendida: incluye privacidad, métricas, matches, notificaciones
     */
    private UserResponseDTO createExtendedResponse(User user) {
        return userResponseMapper.toExtendedResponse(user);
    }

    /**
     * Vista completa: todos los datos incluyendo auth y account complaintStatus
     */
    private UserResponseDTO createFullResponse(User user) {
        return userResponseMapper.toFullResponse(user);
    }

    /**
     * Vista administrativa: todos los datos + campos de admin
     */
    private UserResponseDTO createAdminResponse(User user) {
        // Para admin, devolvemos la vista completa (ya incluye todos los campos necesarios)
        return createFullResponse(user);
    }

    /**
     * Determina el nivel apropiado basado en el contexto del usuario
     */
    public UserResponseLevel determineAppropriateLevel(User currentUser, User targetUser, String requestedLevel) {
        UserResponseLevel requested = UserResponseLevel.fromString(requestedLevel, UserResponseLevel.BASIC);

        // Si no hay usuario logueado, solo público
        if (currentUser == null) {
            return UserResponseLevel.PUBLIC;
        }

        // Si es admin, puede ver cualquier nivel incluyendo ADMIN
        if (isAdmin(currentUser)) {
            return requested;
        }

        // Si está viendo su propio perfil, puede usar EXTENDED o FULL
        if (currentUser.getId().equals(targetUser.getId())) {
            // Usuarios normales no pueden ver nivel admin
            return requested == UserResponseLevel.ADMIN ? UserResponseLevel.FULL : requested;
        }

        // Si está viendo otro perfil, máximo STANDARD
        return switch (requested) {
            case EXTENDED, FULL, ADMIN -> UserResponseLevel.STANDARD;
            default -> requested;
        };
    }

    private boolean isAdmin(User user) {
        return user.getUserRole() != null &&
            ("ADMIN".equals(user.getUserRole().getAuthority()) || "SUPER_ADMIN".equals(user.getUserRole().getAuthority()));
    }
}
