package com.feeling.packages.auth.infrastructure.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import com.feeling.packages.user.infrastructure.entities.User;

/**
 * Entidad que representa tokens JWT asociados a usuarios para autenticación y autorización.
 * Gestiona tokens de acceso y refresh tokens con estado de validez.
 * <p>
 * Esta entidad maneja:
 * - Tokens de acceso (ACCESS) para autenticación en peticiones
 * - Tokens de renovación (REFRESH) para obtener nuevos tokens de acceso
 * - Estado de validez (expirado, revocado)
 * - Relación con el usuario propietario
 * <p>
 * Características principales:
 * - Soporte para revocación manual de tokens
 * - Control de expiración automática
 * - Relación lazy con usuario para optimización
 * - Tokens únicos en el sistema
 * - Longitud extendida para almacenar JWT largos
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "auth_tokens")
public class AuthToken {

    /**
     * Identificador único del token en la base de datos.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * Token JWT completo almacenado como string.
     * Debe ser único en el sistema y puede ser de hasta 1000 caracteres.
     */
    @Column(name = "token", unique = true, length = 1000, nullable = false)
    private String token;

    /**
     * Tipo de token que determina su propósito:
     * - ACCESS: Para autenticación en peticiones (vida corta)
     * - REFRESH: Para renovar tokens de acceso (vida larga)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TokenType type;

    /**
     * Indica si el token ha sido revocado manualmente.
     * Los tokens revocados no pueden ser utilizados aunque no hayan expirado.
     */
    @Column(name = "revoked", nullable = false)
    @Builder.Default
    private boolean revoked = false;

    /**
     * Indica si el token ha expirado por tiempo.
     * Los tokens expirados no pueden ser utilizados.
     */
    @Column(name = "expired", nullable = false)
    @Builder.Default
    private boolean expired = false;

    /**
     * Usuario propietario del token.
     * Relación lazy para optimizar consultas cuando solo se necesita validar el token.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Fecha y hora de creación del token.
     */
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Fecha y hora de expiración natural del token.
     * Calculada en base al tipo de token y configuración del sistema.
     */
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    /**
     * Fecha y hora de la última vez que se utilizó el token.
     * Útil para auditoría y detección de tokens sin uso.
     */
    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    // ========================================
    // ENUMERACIÓN DE TIPOS DE TOKEN
    // ========================================

    /**
     * Tipos de token disponibles en el sistema.
     */
    public enum TokenType {
        /**
         * Token de acceso para autenticación en peticiones.
         * Vida corta (típicamente 15-30 minutos).
         */
        ACCESS,

        /**
         * Token de renovación para obtener nuevos tokens de acceso.
         * Vida larga (típicamente 7-30 días).
         */
        REFRESH
    }

    // ========================================
    // MÉTODOS DE UTILIDAD PARA NEGOCIO
    // ========================================

    /**
     * Verifica si el token es válido para uso.
     * Un token es válido si no está revocado, no ha expirado y no ha pasado su fecha de expiración.
     *
     * @return true si el token puede ser utilizado
     */
    public boolean isValid() {
        return !revoked && !expired && (expiresAt == null || expiresAt.isAfter(LocalDateTime.now()));
    }

    /**
     * Revoca el token, invalidándolo inmediatamente.
     * Un token revocado no puede volver a activarse.
     */
    public void revoke() {
        this.revoked = true;
    }

    /**
     * Marca el token como expirado.
     * Normalmente se ejecuta automáticamente cuando se detecta la expiración.
     */
    public void markAsExpired() {
        this.expired = true;
    }

    /**
     * Actualiza la fecha de último uso del token.
     * Útil para auditoría y estadísticas de uso.
     */
    public void updateLastUsed() {
        this.lastUsedAt = LocalDateTime.now();
    }

    /**
     * Verifica si es un token de acceso.
     *
     * @return true si es un token ACCESS
     */
    public boolean isAccessToken() {
        return TokenType.ACCESS.equals(this.type);
    }

    /**
     * Verifica si es un token de renovación.
     *
     * @return true si es un token REFRESH
     */
    public boolean isRefreshToken() {
        return TokenType.REFRESH.equals(this.type);
    }

    /**
     * Verifica si el token está próximo a expirar.
     * Un token está próximo a expirar si le quedan menos de 5 minutos.
     *
     * @return true si el token expirará en los próximos 5 minutos
     */
    public boolean isExpiringSoon() {
        if (expiresAt == null) return false;
        return expiresAt.isBefore(LocalDateTime.now().plusMinutes(5));
    }

    // ========================================
    // MÉTODOS DEL CICLO DE VIDA JPA
    // ========================================

    /**
     * Método ejecutado automáticamente antes de persistir el token.
     * Inicializa la fecha de creación si no está establecida.
     */
    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}