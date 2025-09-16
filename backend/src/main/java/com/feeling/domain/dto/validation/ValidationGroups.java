package com.feeling.domain.dto.validation;

/**
 * Grupos de validación para diferentes operaciones de usuario
 * Phase 2.2: Validation DTOs Creation
 */
public class ValidationGroups {

    /**
     * Validación para creación de usuarios (registro)
     */
    public interface CreateUser {}

    /**
     * Validación para actualización de usuarios
     */
    public interface UpdateUser {}

    /**
     * Validación para operaciones de administrador
     */
    public interface AdminOperation {}

    /**
     * Validación para actualización de perfil básico
     */
    public interface UpdateProfile {}

    /**
     * Validación para actualización de preferencias
     */
    public interface UpdatePreferences {}

    /**
     * Validación para configuración de privacidad
     */
    public interface UpdatePrivacy {}

    /**
     * Validación para configuración de notificaciones
     */
    public interface UpdateNotifications {}

    /**
     * Validación para login/autenticación
     */
    public interface Login {}

    /**
     * Validación para operaciones públicas (sin autenticación)
     */
    public interface PublicOperation {}
}