package com.feeling.config.security;

import org.springframework.http.HttpMethod;

import com.feeling.domain.services.auth.JwtService;
import com.feeling.domain.services.user.CachedUserService;
import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.entities.user.UserToken;
import com.feeling.infrastructure.repositories.user.IUserRepository;
import com.feeling.infrastructure.repositories.user.IUserTokenRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import com.feeling.infrastructure.logging.StructuredLoggerFactory;
import org.springframework.lang.NonNull;
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

    private static final StructuredLoggerFactory.StructuredLogger logger = 
            StructuredLoggerFactory.create(JwtAuthFilter.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final IUserTokenRepository tokenRepository;
    private final CachedUserService cachedUserService;
    private final RouteSecurityConfig routeSecurityConfig;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            // Obtener path de la petición para logging
            final String requestPath = request.getRequestURI();


            // Extraer token del header Authorization
            final String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                // Solo log si no es ruta pública común
                if (!routeSecurityConfig.isPublicRoute(requestPath)) {
                    logger.debug("No Authorization token for: " + requestPath);
                }
                filterChain.doFilter(request, response);
                return;
            }

            final String jwtToken = authHeader.substring(7);

            // Validaciones básicas del token
            if (jwtToken.isEmpty()) {
                logger.warn("❌ Token vacío");
                filterChain.doFilter(request, response);
                return;
            }

            // Extraer email del token
            final String userEmail;
            try {
                userEmail = jwtService.extractUsername(jwtToken);
            } catch (Exception e) {
                logger.warn("❌ Error al extraer username del token: " + e.getMessage());
                filterChain.doFilter(request, response);
                return;
            }

            if (userEmail == null || userEmail.isEmpty()) {
                logger.warn("❌ No se pudo extraer email del token");
                filterChain.doFilter(request, response);
                return;
            }

            // Si ya hay autenticación en el contexto, continuar
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                logger.debug("✅ Usuario ya autenticado en contexto: " + userEmail);
                filterChain.doFilter(request, response);
                return;
            }

            // Verificar que es un ACCESS token (no REFRESH)
            try {
                if (!jwtService.isAccessToken(jwtToken)) {
                    logger.warn("❌ Token no es de tipo ACCESS para usuario: " + userEmail);
                    setErrorResponse(response, "Token inválido - se requiere access token");
                    return;
                }
            } catch (Exception e) {
                logger.warn("❌ Error al verificar tipo de token: " + e.getMessage());
                setErrorResponse(response, "Token malformado");
                return;
            }

            // Verificar que el token existe en la base de datos y no está revocado
            Optional<UserToken> storedTokenOptional = tokenRepository.findByToken(jwtToken);
            if (storedTokenOptional.isEmpty()) {
                logger.warn("❌ Token no encontrado en base de datos para usuario: " + userEmail);
                setErrorResponse(response, "Token inválido");
                return;
            }

            UserToken storedToken = storedTokenOptional.get();
            if (storedToken.isExpired() || storedToken.isRevoked()) {
                logger.warn("❌ Token expirado o revocado para usuario: " + userEmail);
                setErrorResponse(response, "Token expirado o revocado");
                return;
            }

            // Verificar que es un ACCESS token en la BD también
            if (storedToken.getType() != UserToken.TokenType.ACCESS) {
                logger.warn("❌ Token en BD no es de tipo ACCESS para usuario: " + userEmail);
                setErrorResponse(response, "Token inválido - tipo incorrecto");
                return;
            }

            // OPTIMIZACIÓN: Verificar que el usuario existe y está habilitado usando cache
            // Para rutas de completar perfil, permitir usuarios verificados pero no aprobados
            boolean isProfileCompletionRoute = requestPath.equals("/users/complete-profile");
            Boolean isUserValid = isProfileCompletionRoute ? 
                cachedUserService.isUserValidForProfileCompletion(userEmail) : 
                cachedUserService.isUserValidForAuth(userEmail);
            
            if (!isUserValid) {
                logger.warn("❌ Usuario no encontrado o deshabilitado: " + userEmail);
                setErrorResponse(response, "Usuario no válido");
                return;
            }

            // Solo cargar el usuario completo si es necesario para validación del token
            Optional<User> userOptional = cachedUserService.findByEmailCached(userEmail);
            if (userOptional.isEmpty()) {
                logger.warn("❌ Usuario no encontrado en cache: " + userEmail);
                setErrorResponse(response, "Usuario no encontrado");
                return;
            }

            User user = userOptional.get();

            // Verificar que el token es válido para el usuario
            try {
                if (!jwtService.isTokenValid(jwtToken, user)) {
                    logger.warn("❌ Token inválido para usuario: " + userEmail);
                    setErrorResponse(response, "Token inválido");
                    return;
                }
            } catch (Exception e) {
                logger.warn("❌ Error al validar token: " + e.getMessage());
                setErrorResponse(response, "Error en validación de token");
                return;
            }

            // Verificar que el usuario está verificado (email confirmado)
            if (!user.isVerified()) {
                logger.warn("❌ Usuario no verificado: " + userEmail);
                setErrorResponse(response, "Usuario no verificado");
                return;
            }

            // Verificar que la cuenta no esté desactivada
            if (user.isAccountDeactivated()) {
                logger.warn("❌ Usuario con cuenta desactivada: " + userEmail);
                setErrorResponse(response, "Cuenta desactivada");
                return;
            }

            // Verificación de aprobación removida para permitir login completo
            // La aprobación ahora solo controla funciones específicas (matching, eventos)
            // El usuario puede navegar normalmente sin estar aprobado

            // Cargar detalles del usuario para Spring Security
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

            // Crear token de autenticación para Spring Security
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
            );
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // Establecer autenticación en el contexto de seguridad
            SecurityContextHolder.getContext().setAuthentication(authToken);

            logger.debug("✅ Usuario autenticado exitosamente: " + userEmail);

            // Continuar con la cadena de filtros
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            logger.error("❌ Error inesperado en JwtAuthFilter: " + e.getMessage());
            setErrorResponse(response, "Error interno del servidor");
        }
    }

    /**
     * Verifica si es una ruta pública para reducir logs innecesarios
     */

    /**
     * Determina si este filtro debe aplicarse a la request actual
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String requestURI = request.getRequestURI();
        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        return routeSecurityConfig.shouldSkipFilter(requestURI, method, RouteSecurityConfig.FilterType.JWT_AUTH);
    }

    /**
     * Establecer respuesta de error en formato JSON
     */
    private void setErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String jsonResponse = String.format(
                "{\"error\": \"%s\", \"status\": 401, \"timestamp\": \"%s\"}",
                message,
                java.time.Instant.now().toString()
        );

        response.getWriter().write(jsonResponse);
    }
}