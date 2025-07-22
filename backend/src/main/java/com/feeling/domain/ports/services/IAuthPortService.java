package com.feeling.domain.ports.services;

import com.feeling.domain.dto.auth.*;
import com.feeling.domain.dto.response.MessageResponseDTO;

/**
 * Port para operaciones de autenticación según Clean Architecture
 * Define los casos de uso de autenticación que debe implementar el dominio
 */
public interface IAuthPortService {

    // ========================================
    // REGISTRO Y VERIFICACIÓN
    // ========================================
    
    /**
     * Registra un nuevo usuario
     */
    MessageResponseDTO registerUser(AuthRegisterRequestDTO registerRequest);
    
    /**
     * Verifica el código de registro por email
     */
    MessageResponseDTO verifyRegistrationCode(AuthVerifyCodeDTO verifyCodeDTO);
    
    /**
     * Reenvía código de verificación
     */
    MessageResponseDTO resendVerificationCode(AuthResendCodeRequestDTO resendRequest);
    
    /**
     * Verifica si un email está disponible
     */
    EmailAvailabilityDTO checkEmailAvailability(String email);

    // ========================================
    // LOGIN Y LOGOUT
    // ========================================
    
    /**
     * Autentica un usuario con email y contraseña
     */
    AuthLoginResponseDTO loginUser(AuthLoginRequestDTO loginRequest);
    
    /**
     * Cierra sesión de un usuario
     */
    MessageResponseDTO logoutUser(String email, String token);
    
    /**
     * Cierra todas las sesiones de un usuario
     */
    MessageResponseDTO logoutAllSessions(String email);

    // ========================================
    // GESTIÓN DE TOKENS
    // ========================================
    
    /**
     * Refresca un token JWT
     */
    RefreshTokenResponseDTO refreshToken(RefreshTokenRequestDTO refreshRequest);
    
    /**
     * Valida un token JWT
     */
    TokenValidationDTO validateToken(String token);
    
    /**
     * Revoca un token específico
     */
    MessageResponseDTO revokeToken(String token);

    // ========================================
    // RECUPERACIÓN DE CONTRASEÑA
    // ========================================
    
    /**
     * Solicita recuperación de contraseña
     */
    MessageResponseDTO requestPasswordReset(ForgotPasswordRequestDTO forgotPasswordRequest);
    
    /**
     * Reestablece la contraseña con token
     */
    MessageResponseDTO resetPassword(ResetPasswordRequestDTO resetPasswordRequest);
    
    /**
     * Valida token de recuperación de contraseña
     */
    MessageResponseDTO validatePasswordResetToken(String token);

    // ========================================
    // AUTENTICACIÓN OAUTH
    // ========================================
    
    /**
     * Autentica usuario con Google OAuth
     */
    AuthLoginResponseDTO authenticateWithGoogle(GoogleTokenRequestDTO googleTokenRequest);
    
    /**
     * Vincula cuenta de Google a usuario existente
     */
    MessageResponseDTO linkGoogleAccount(String email, String googleToken);
    
    /**
     * Desvincula cuenta de Google
     */
    MessageResponseDTO unlinkGoogleAccount(String email);

    // ========================================
    // GESTIÓN DE CUENTA
    // ========================================
    
    /**
     * Cambia la contraseña del usuario
     */
    MessageResponseDTO changePassword(String email, String currentPassword, String newPassword);
    
    /**
     * Obtiene información del método de autenticación
     */
    AuthMethodInfoDTO getAuthMethodInfo(String email);
    
    /**
     * Obtiene el estado del usuario (verificado, activo, etc.)
     */
    AuthUserStatusDTO getUserStatus(String email);

    // ========================================
    // VERIFICACIONES Y VALIDACIONES
    // ========================================
    
    /**
     * Verifica si hay conflicto de métodos de autenticación
     */
    AuthMethodConflictDTO checkAuthMethodConflict(String email);
    
    /**
     * Valida las credenciales sin generar token (para verificaciones)
     */
    boolean validateCredentials(String email, String password);
}