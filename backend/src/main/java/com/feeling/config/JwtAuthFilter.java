package com.feeling.config;

import com.feeling.domain.services.JwtService;
import com.feeling.infrastructure.entities.user.Token;
import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.repositories.user.ITokenRepository;
import com.feeling.infrastructure.repositories.user.IUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final ITokenRepository tokenRepository;
    private final IUserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NotNull HttpServletRequest request,
            @NotNull HttpServletResponse response,
            @NotNull FilterChain filterChain
    ) throws ServletException, IOException {

        logger.info(String.format("\uD83D\uDCCC Nueva petición a: %s", request.getServletPath()));

        if (request.getServletPath().contains("/auth")) {
            logger.info("🔹 Ruta pública, omitiendo filtro.");
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("❌ No se encontró un token válido en el Header.");
            filterChain.doFilter(request, response);
            return;
        }

        final String jwtToken = authHeader.substring(7);
        logger.info(String.format("\uD83D\uDD39 Token extraído: %s", jwtToken));

        final String userEmail = jwtService.extractUsername(jwtToken);
        logger.info(String.format("\uD83D\uDD39 Usuario extraído del token: %s", userEmail));

        if (userEmail == null || SecurityContextHolder.getContext().getAuthentication() != null) {
            logger.warn("❌ Usuario no encontrado o ya autenticado.");
            filterChain.doFilter(request, response);
            return;
        }

        final Token token = tokenRepository.findByToken(jwtToken).orElse(null);
        if (token == null) {
            logger.warn("❌ El token no est registrado en la base de datos.");
            filterChain.doFilter(request, response);
            return;
        }

        if (token.isExpired() || token.isRevoked()) {
            logger.warn("❌ El token está expirado o ha sido revocado.");
            filterChain.doFilter(request, response);
            return;
        }

        final Optional<User> userOptional = userRepository.findByEmail(userEmail);

        if (userOptional.isEmpty()) {
            logger.warn("❌ El usuario no existe en la base de datos.");
            filterChain.doFilter(request, response);
            return;
        }
        final User user = userOptional.get();

        final boolean isTokenValid = jwtService.isTokenValid(jwtToken, user);
        logger.info(String.format("\uD83D\uDD39 ¿Token válido?: %s", isTokenValid));

        if (!isTokenValid) {
            logger.warn("❌ Token inválido.");
            filterChain.doFilter(request, response);
            return;
        }

        final UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

        final var authToken = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );

        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
        logger.info(String.format("✅ Usuario autenticado correctamente: %s", userEmail));

        filterChain.doFilter(request, response);
    }
}
