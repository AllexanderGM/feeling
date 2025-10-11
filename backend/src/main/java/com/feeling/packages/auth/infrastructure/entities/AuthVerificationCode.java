package com.feeling.packages.auth.infrastructure.entities;

import jakarta.persistence.*;
import lombok.*;
import com.feeling.packages.user.infrastructure.entities.User;

import java.time.LocalDateTime;

/**
 * Entidad que representa códigos de verificación para validación de email y autenticación de dos factores.
 * <p>
 * Gestiona códigos numéricos o alfanuméricos temporales que se envían a los usuarios
 * para verificar su identidad o confirmar su dirección de correo electrónico.
 * <p>
 * Características principales:
 * - Códigos únicos de corta duración (típicamente 5-15 minutos)
 * - Uso único (se marca como verificado después del uso)
 * - Relación uno a uno con usuario
 * - Expiración automática
 * <p>
 * Casos de uso:
 * - Verificación de email en registro de nuevos usuarios
 * - Autenticación de dos factores (2FA)
 * - Confirmación de cambios críticos en la cuenta
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Entity
@Table(name = "auth_verification_codes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthVerificationCode {

    /**
     * Identificador único del código de verificación en la base de datos.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Código de verificación enviado al usuario.
     * Puede ser numérico (6 dígitos) o alfanumérico según configuración.
     */
    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;

    /**
     * Fecha y hora de expiración del código.
     * Típicamente 5-15 minutos después de la creación.
     */
    @Column(name = "expiration_time", nullable = false)
    private LocalDateTime expirationTime;

    /**
     * Indica si el código ya fue utilizado para verificación.
     * Un código verificado no puede volver a utilizarse.
     */
    @Column(name = "verified", nullable = false)
    @Builder.Default
    private boolean verified = false;

    /**
     * Usuario asociado al código de verificación.
     * Relación lazy para optimizar consultas de validación.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Fecha y hora de creación del código.
     */
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Fecha y hora en que se verificó el código.
     */
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    // ========================================
    // MÉTODOS DE UTILIDAD PARA NEGOCIO
    // ========================================

    /**
     * Verifica si el código ha expirado por tiempo.
     *
     * @return true si la fecha actual es posterior a la fecha de expiración
     */
    public boolean isExpired() {
        return expirationTime != null && LocalDateTime.now().isAfter(expirationTime);
    }

    /**
     * Verifica si el código es válido para uso.
     * Un código es válido si no ha sido verificado y no ha expirado.
     *
     * @return true si el código puede ser utilizado
     */
    public boolean isValid() {
        return !verified && !isExpired();
    }

    /**
     * Marca el código como verificado y registra la fecha de verificación.
     * Un código verificado no puede volver a utilizarse.
     */
    public void markAsVerified() {
        this.verified = true;
        this.verifiedAt = LocalDateTime.now();
    }

    /**
     * Verifica si el código está próximo a expirar.
     * Un código está próximo a expirar si le quedan menos de 2 minutos.
     *
     * @return true si el código expirará en los próximos 2 minutos
     */
    public boolean isExpiringSoon() {
        if (expirationTime == null) return false;
        return expirationTime.isBefore(LocalDateTime.now().plusMinutes(2));
    }

    // ========================================
    // MÉTODOS DEL CICLO DE VIDA JPA
    // ========================================

    /**
     * Método ejecutado automáticamente antes de persistir el código.
     * Inicializa la fecha de creación si no está establecida.
     */
    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
