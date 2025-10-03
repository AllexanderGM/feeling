package com.feeling.packages.auth.infrastructure.entities;

import jakarta.persistence.*;
import lombok.*;
import com.feeling.packages.user.infrastructure.entities.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "auth_password_reset_tokens")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthPasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token", nullable = false, unique = true, length = 255)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "expiration_time", nullable = false)
    private LocalDateTime expirationTime;

    @Column(name = "used", nullable = false)
    @Builder.Default
    private boolean used = false;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    // Método para marcar como usado
    public void markAsUsed() {
        this.used = true;
        this.usedAt = LocalDateTime.now();
    }

    // Verificar si está expirado
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expirationTime);
    }

    // Verificar si es válido
    public boolean isValid() {
        return !used && !isExpired();
    }
}
