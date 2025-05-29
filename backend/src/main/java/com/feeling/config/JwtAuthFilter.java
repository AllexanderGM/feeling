package com.feeling.config;

import com.feeling.domain.services.JwtService;
import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.entities.user.UserToken;
import com.feeling.infrastructure.repositories.user.IUserRepository;
import com.feeling.infrastructure.repositories.user.IUserTokenRepository;
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
    private final IUserTokenRepository tokenRepository;
    private final IUserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NotNull HttpServletRequest request,
            @NotNull HttpServletResponse response,
            @NotNull FilterChain filterChain
    ) throws ServletException, IOException {

        logger.debug("🔍 Procesando petición a: {}", request.getServletPath());

        // Omitir filtro para rutas de autenticación
        if (isAuthPath(request.getServletPath())) {
            logger.debug("🔹 Ruta pública, omitiendo filtro JWT");
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("❌ No se encontró token Bearer válido");
            filterChain.doFilter(request, response);
            return;
        }

        final String jwtToken = authHeader.substring(7);
        logger.debug("🔑 Token extraído: {}...", jwtToken.substring(0, Math.min(20, jwtToken.length())));

        try {
            final String userEmail = jwtService.extractUsername(jwtToken);
            logger.debug("👤 Usuario extraído del token: {}", userEmail);

            if (userEmail == null || SecurityContextHolder.getContext().getAuthentication() != null) {
                logger.debug("⚠️ Usuario no encontrado en token o ya autenticado");
                filterChain.doFilter(request, response);
                return;
            }

            // Verificar que el token existe en la base de datos
            final Optional<UserToken> tokenOptional = tokenRepository.findByToken(jwtToken);
            if (tokenOptional.isEmpty()) {
                logger.warn("❌ Token no encontrado en base de datos");
                filterChain.doFilter(request, response);
                return;
            }

            UserToken userToken = tokenOptional.get();
            if (userToken.isExpired() || userToken.isRevoked()) {
                logger.warn("❌ Token expirado o revocado");
                filterChain.doFilter(request, response);
                return;
            }

            // Verificar que el usuario existe
            final Optional<User> userOptional = userRepository.findByEmail(userEmail);
            if (userOptional.isEmpty()) {
                logger.warn("❌ Usuario no encontrado: {}", userEmail);
                filterChain.doFilter(request, response);
                return;
            }

            User user = userOptional.get();

            // Verificar que el token es válido para el usuario
            if (!jwtService.isTokenValid(jwtToken, user)) {
                logger.warn("❌ Token inválido para usuario: {}", userEmail);
                filterChain.doFilter(request, response);
                return;
            }

            // Verificar que el usuario está verificado
            if (!user.isVerified()) {
                logger.warn("❌ Usuario no verificado: {}", userEmail);
                filterChain.doFilter(request, response);
                return;
            }

            // Cargar detalles del usuario y crear contexto de autenticación
            final UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            final UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
            );

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);

            logger.debug("✅ Usuario autenticado correctamente: {}", userEmail);

        } catch (Exception e) {
            logger.error("💥 Error procesando token JWT: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Verifica si la ruta es pública (no requiere autenticación)
     */
    private boolean isAuthPath(String path) {
        return path.startsWith("/auth/") ||
                path.equals("/") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/user-attributes") ||
                path.equals("/category-interests") ||
                path.startsWith("/tags/popular") ||
                path.startsWith("/tags/search") ||
                path.equals("/favicon.ico") ||
                path.equals("/error");
    }
}
