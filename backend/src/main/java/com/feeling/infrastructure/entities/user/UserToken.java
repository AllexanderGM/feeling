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
    @GeneratedValue
    private Long id;

    public String token;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    public TokenType type = TokenType.ACCESS;

    @Builder.Default
    public boolean revoked = false;

    @Builder.Default
    public boolean expired = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    public User user;

    public enum TokenType {
        ACCESS,
    }
}