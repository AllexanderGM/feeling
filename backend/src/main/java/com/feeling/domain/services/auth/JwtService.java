package com.feeling.domain.services.auth;

import com.feeling.infrastructure.entities.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private String accessTokenExpiration;

    @Value("${jwt.refresh.expiration}")
    private String refreshTokenExpiration;

    // ==============================
    // EXTRACCIÓN DE DATOS
    // ==============================

    public String extractUsername(final String token) {
        final Claims jwtToken = Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return jwtToken.getSubject();
    }

    public String extractTokenType(final String token) {
        final Claims jwtToken = Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return jwtToken.get("type", String.class);
    }

    // ==============================
    // GENERACIÓN DE TOKENS
    // ==============================

    /**
     * Genera un ACCESS TOKEN (corta duración)
     */
    public String generateToken(final User user) {
        return generateToken(user, accessTokenExpiration, "ACCESS");
    }

    /**
     * Genera un REFRESH TOKEN (larga duración)
     */
    public String generateRefreshToken(final User user) {
        return generateToken(user, refreshTokenExpiration, "REFRESH");
    }

    /**
     * Método interno para generar tokens con tipo específico
     */
    private String generateToken(final User user, String expiration, String tokenType) {
        return Jwts.builder()
                .id(user.getId().toString())
                .claim("name", user.getName())
                .claim("type", tokenType) // Importante: identificar el tipo
                .subject(user.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(Date.from(Instant.ofEpochMilli(System.currentTimeMillis() + Long.parseLong(expiration))))
                .signWith(getSecretKey())
                .compact();
    }

    // ==============================
    // VALIDACIONES
    // ==============================

    public boolean isTokenValid(final String token, final User user) {
        final String username = extractUsername(token);
        return (username.equals(user.getEmail()) && !isTokenExpired(token));
    }

    public boolean isAccessToken(final String token) {
        try {
            String tokenType = extractTokenType(token);
            return "ACCESS".equals(tokenType);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isRefreshToken(final String token) {
        try {
            String tokenType = extractTokenType(token);
            return "REFRESH".equals(tokenType);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isTokenExpired(final String token) {
        return extractExpiration(token).before(new Date());
    }

    // ==============================
    // MÉTODOS PRIVADOS
    // ==============================

    private Date extractExpiration(final String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
    }

    private SecretKey getSecretKey() {
        byte[] secretBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(secretBytes);
    }
}