package com.feeling.config.security;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.packages.auth.domain.enums.AuthTokenType;
import com.feeling.packages.auth.domain.services.JwtService;
import com.feeling.packages.auth.infrastructure.entities.AuthToken;
import com.feeling.packages.auth.infrastructure.repositories.IAuthTokenRepository;
import com.feeling.packages.user.domain.enums.UserApprovalStatus;
import com.feeling.packages.user.domain.services.UserCachedService;
import com.feeling.packages.user.infrastructure.entities.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
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
    private final IAuthTokenRepository tokenRepository;
    private final UserCachedService userCachedService;
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
            Optional<AuthToken> storedTokenOptional = tokenRepository.findTopByTokenOrderByCreatedAtDesc(jwtToken);
            if (storedTokenOptional.isEmpty()) {
                logger.warn("❌ Token no encontrado en base de datos para usuario: " + userEmail);
                setErrorResponse(response, "Token inválido");
                return;
            }

            AuthToken storedToken = storedTokenOptional.get();
            if (storedToken.isExpired() || storedToken.isRevoked()) {
                logger.warn("❌ Token expirado o revocado para usuario: " + userEmail);
                setErrorResponse(response, "Token expirado o revocado");
                return;
            }

            // Verificar que es un ACCESS token en la BD también
            if (storedToken.getType() != AuthTokenType.ACCESS) {
                logger.warn("❌ Token en BD no es de tipo ACCESS para usuario: " + userEmail);
                setErrorResponse(response, "Token inválido - tipo incorrecto");
                return;
            }

            // OPTIMIZACIÓN: Verificar que el usuario existe y está habilitado usando cache
            // Para rutas de completar perfil, permitir usuarios verificados pero no aprobados
            Optional<User> userOptional = userCachedService.findByEmailCached(userEmail);
            if (userOptional.isEmpty()) {
                logger.warn("❌ Usuario no encontrado en cache: " + userEmail);
                setErrorResponse(response, "Usuario no encontrado", "USER_NOT_FOUND");
                return;
            }

            User user = userOptional.get();

            if (user.isAccountDeactivated()) {
                logger.warn("❌ Usuario con cuenta desactivada: " + userEmail);
                setErrorResponse(response, "Tu cuenta fue desactivada por el equipo de Feeling. Si crees que se trata de un error, contáctanos.", "ACCOUNT_DEACTIVATED");
                return;
            }

            if (!user.isVerified()) {
                logger.warn("❌ Usuario no verificado: " + userEmail);
                setErrorResponse(response, "Debes verificar tu correo electrónico para continuar.", "USER_NOT_VERIFIED");
                return;
            }

            if (user.getUserApprovalStatus() == UserApprovalStatus.REJECTED) {
                logger.warn("❌ Usuario rechazado: " + userEmail);
                setErrorResponse(response, "Tu cuenta fue rechazada. Contáctanos si necesitas ayuda adicional.", "ACCOUNT_REJECTED");
                return;
            }

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
        setErrorResponse(response, message, "UNAUTHORIZED");
    }

    private void setErrorResponse(HttpServletResponse response, String message, String code) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String sanitizedMessage = (message != null ? message : "").replace('"', '\'');
        String sanitizedCode = (code != null ? code : "UNAUTHORIZED").replace('"', '\'');

        String jsonResponse = String.format(
            "{\"error\": \"%s\", \"message\": \"%s\", \"code\": \"%s\", \"complaintStatus\": 401, \"timestamp\": \"%s\"}",
            sanitizedMessage,
            sanitizedMessage,
            sanitizedCode,
            java.time.Instant.now().toString()
        );

        response.getWriter().write(jsonResponse);
    }
}
