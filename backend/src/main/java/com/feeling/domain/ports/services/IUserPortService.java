package com.feeling.domain.ports.services;

import com.feeling.domain.dto.user.UserModifyDTO;
import com.feeling.domain.dto.user.UserProfileRequestDTO;
import com.feeling.domain.dto.user.UserResponseDTO;
import com.feeling.domain.dto.response.MessageResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Port para operaciones de servicio de usuario según Clean Architecture
 * Define los casos de uso que debe implementar el dominio
 */
public interface IUserPortService {

    // ========================================
    // OPERACIONES BÁSICAS DE USUARIO
    // ========================================
    
    /**
     * Obtiene un usuario por email
     */
    UserResponseDTO getUserByEmail(String email);
    
    /**
     * Obtiene todos los usuarios (para administración)
     */
    List<UserResponseDTO> getAllUsers();
    
    /**
     * Busca usuarios con paginación
     */
    Page<UserResponseDTO> searchUsers(String searchTerm, Pageable pageable);

    // ========================================
    // GESTIÓN DE PERFIL
    // ========================================
    
    /**
     * Actualiza el perfil de un usuario
     */
    MessageResponseDTO updateUserProfile(String email, UserModifyDTO userModifyDTO);
    
    /**
     * Completa el perfil de un usuario
     */
    MessageResponseDTO completeProfile(String email, UserProfileRequestDTO userProfileRequestDTO);
    
    /**
     * Sube imagen de perfil
     */
    MessageResponseDTO uploadProfileImage(String email, MultipartFile file) throws IOException;
    
    /**
     * Elimina imagen de perfil
     */
    MessageResponseDTO deleteProfileImage(String email);

    // ========================================
    // MATCHING Y SUGERENCIAS
    // ========================================
    
    /**
     * Obtiene sugerencias de usuarios para matching
     */
    List<UserResponseDTO> getUserSuggestions(String email, int page, int size);
    
    /**
     * Obtiene usuarios compatibles por criterios
     */
    List<UserResponseDTO> getCompatibleUsers(String email, String city, Integer minAge, Integer maxAge);

    // ========================================
    // GESTIÓN ADMINISTRATIVA
    // ========================================
    
    /**
     * Elimina un usuario (administrador)
     */
    MessageResponseDTO deleteUser(String adminEmail, String targetEmail);
    
    /**
     * Banea/Desbanea un usuario
     */
    MessageResponseDTO toggleUserBan(String adminEmail, String targetEmail);
    
    /**
     * Cambia el rol de un usuario
     */
    MessageResponseDTO changeUserRole(String adminEmail, String targetEmail, String newRole);

    // ========================================
    // MÉTRICAS Y ESTADÍSTICAS
    // ========================================
    
    /**
     * Obtiene estadísticas de usuarios
     */
    Object getUserStatistics();
    
    /**
     * Actualiza métricas de usuario (views, likes, etc.)
     */
    void updateUserMetrics(String email, String metricType, int value);

    // ========================================
    // CONFIGURACIÓN Y PRIVACIDAD
    // ========================================
    
    /**
     * Actualiza configuración de privacidad
     */
    MessageResponseDTO updatePrivacySettings(String email, boolean showInSearch, boolean showLastActive);
    
    /**
     * Actualiza preferencias de notificaciones
     */
    MessageResponseDTO updateNotificationPreferences(String email, boolean emailNotifications, boolean pushNotifications);
}