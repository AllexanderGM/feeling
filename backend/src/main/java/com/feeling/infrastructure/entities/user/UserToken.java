package com.feeling.infrastructure.entities.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_tokens")
public class UserToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "token", unique = true, length = 1000, nullable = false)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TokenType type;

    @Column(name = "revoked", nullable = false)
    @Builder.Default
    private boolean revoked = false;

    @Column(name = "expired", nullable = false)
    @Builder.Default
    private boolean expired = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public enum TokenType {
        ACCESS,
        REFRESH
    }
}