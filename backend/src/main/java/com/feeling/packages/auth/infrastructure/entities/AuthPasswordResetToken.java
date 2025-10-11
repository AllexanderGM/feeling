package com.feeling.packages.auth.infrastructure.entities;

import jakarta.persistence.*;
import lombok.*;
import com.feeling.packages.user.infrastructure.entities.User;

import java.time.LocalDateTime;

/**
 * Entidad que representa tokens de restablecimiento de contraseña.
 * <p>
 * Gestiona el proceso de recuperación de contraseña permitiendo a los usuarios
 * solicitar un token único de un solo uso para restablecer su contraseña.
 * <p>
 * Características principales:
 * - Tokens únicos y de un solo uso
 * - Expiración automática configurable (típicamente 1-24 horas)
 * - Marcado automático como usado después del restablecimiento
 * - Relación lazy con usuario para optimización
 * - Auditoría de uso (created_at, used_at)
 * <p>
 * Flujo típico:
 * 1. Usuario solicita restablecimiento → se crea token
 * 2. Token se envía por email
 * 3. Usuario usa el token → se valida y marca como usado
 * 4. Se permite el cambio de contraseña
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Entity
@Table(name = "auth_password_reset_tokens")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthPasswordResetToken {
    /**
     * Identificador único del token en la base de datos.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Token único de restablecimiento de contraseña.
     * Generado aleatoriamente y enviado por email al usuario.
     */
    @Column(name = "token", nullable = false, unique = true, length = 255)
    private String token;

    /**
     * Usuario propietario del token de restablecimiento.
     * Relación lazy para optimizar consultas cuando solo se valida el token.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Fecha y hora de expiración del token.
     * Típicamente 1-24 horas después de la creación según configuración.
     */
    @Column(name = "expiration_time", nullable = false)
    private LocalDateTime expirationTime;

    /**
     * Indica si el token ya fue utilizado para restablecer la contraseña.
     * Un token usado no puede volver a utilizarse.
     */
    @Column(name = "used", nullable = false)
    @Builder.Default
    private boolean used = false;

    /**
     * Fecha y hora de creación del token.
     */
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Fecha y hora en que se utilizó el token.
     * Se establece automáticamente al marcar como usado.
     */
    @Column(name = "used_at")
    private LocalDateTime usedAt;

    // ========================================
    // MÉTODOS DE UTILIDAD PARA NEGOCIO
    // ========================================

    /**
     * Marca el token como usado y registra la fecha de uso.
     * Un token usado no puede volver a utilizarse.
     */
    public void markAsUsed() {
        this.used = true;
        this.usedAt = LocalDateTime.now();
    }

    /**
     * Verifica si el token ha expirado por tiempo.
     *
     * @return true si la fecha actual es posterior a la fecha de expiración
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expirationTime);
    }

    /**
     * Verifica si el token es válido para uso.
     * Un token es válido si no ha sido usado y no ha expirado.
     *
     * @return true si el token puede ser utilizado
     */
    public boolean isValid() {
        return !used && !isExpired();
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
