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
public class Token {

    public enum TokenType {
        ACCESS,
    }

    @Id
    @GeneratedValue
    private Long id;

    public String token;

    @Enumerated(EnumType.STRING)
    public TokenType type = TokenType.ACCESS;

    public boolean revoked;

    public boolean expired;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    public User user;
}
