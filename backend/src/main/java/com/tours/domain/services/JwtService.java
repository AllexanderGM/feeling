package com.tours.domain.services;

import com.tours.infrastructure.entities.user.User;
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
    private String expiration;

    public String extractUsername(final String token) {
        final Claims jwtToken = Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return jwtToken.getSubject();
    }

    public String generateToken(final User user) {
        return generateToken(user, expiration);
    }

    private String generateToken(final User user, String expiration) {
        return Jwts.builder()
                .id(user.getId().toString())
                .claim("name", user.getName())
                .subject(user.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(Date.from(Instant.ofEpochMilli(System.currentTimeMillis() + Long.parseLong(expiration))))
                .signWith(getSecretKey())
                .compact();
    }

    public boolean isTokenValid(final String token, final User user) {
        final String username = extractUsername(token);
        return (username.equals(user.getEmail()) && !isTokenExpired(token));
    }

    public boolean isTokenExpired(final String token) {
        return extractExpiration(token).before(new Date());
    }

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
