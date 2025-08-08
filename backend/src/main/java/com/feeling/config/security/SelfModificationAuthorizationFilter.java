package com.feeling.config.security;

import com.feeling.config.security.RouteSecurityConfig;
import org.springframework.http.HttpMethod;

import com.feeling.domain.services.auth.JwtService;
import com.feeling.domain.services.user.UserAuthorizationService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Filtro que verifica que los usuarios solo puedan modificar sus propios datos
 * a menos que sean administradores
 */
@Component
@RequiredArgsConstructor
public class SelfModificationAuthorizationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(SelfModificationAuthorizationFilter.class);
    
    private final JwtService jwtService;
    private final UserAuthorizationService userAuthorizationService;
    private final RouteSecurityConfig routeSecurityConfig;


    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            String requestURI = request.getRequestURI();
            String method = request.getMethod();

            HttpMethod httpMethod = HttpMethod.valueOf(method);
            
            // Solo aplicar el filtro a rutas que requieren auto-autorización
            if (!routeSecurityConfig.requiresSelfModificationCheck(requestURI, httpMethod)) {
                filterChain.doFilter(request, response);
                return;
            }
            
            String targetIdentifier = routeSecurityConfig.extractTargetIdentifier(requestURI);
            if (targetIdentifier == null) {
                filterChain.doFilter(request, response);
                return;
            }

            // Verificar autorización
            if (!isAuthorizedForModification(targetIdentifier, request)) {
                logger.warn("❌ Intento de modificación no autorizada: {} {} por usuario: {}", 
                    method, requestURI, getCurrentUserEmail());
                
                setErrorResponse(response, "No tienes permisos para modificar este recurso");
                return;
            }

            logger.debug("✅ Autorización de auto-modificación válida para: {} {}", method, requestURI);
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            logger.error("❌ Error en filtro de autorización de auto-modificación: {}", e.getMessage(), e);
            setErrorResponse(response, "Error en verificación de autorización");
        }
    }


    /**
     * Verifica si el usuario actual está autorizado para modificar el recurso objetivo
     */
    private boolean isAuthorizedForModification(String targetIdentifier, HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        // Si es administrador, permitir todo
        if (hasAdminRole(authentication)) {
            logger.debug("✅ Acceso de administrador permitido");
            return true;
        }

        // Obtener email del usuario actual
        String currentUserEmail = getCurrentUserEmail();
        if (currentUserEmail == null) {
            return false;
        }

        // Verificar si está intentando modificar sus propios datos
        boolean isSelfModification = targetIdentifier.equals(currentUserEmail) || 
                                   isUserIdMatch(targetIdentifier, currentUserEmail, request);
        
        logger.debug("Verificando autorización: targetIdentifier={}, currentUserEmail={}, isSelfModification={}", 
                    targetIdentifier, currentUserEmail, isSelfModification);

        if (!isSelfModification) {
            logger.warn("❌ Usuario {} intentó modificar recurso de {}", currentUserEmail, targetIdentifier);
        }

        return isSelfModification;
    }

    /**
     * Verifica si el usuario tiene rol de administrador
     */
    private boolean hasAdminRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> 
                    grantedAuthority.getAuthority().equals("ADMIN"));
    }

    /**
     * Obtiene el email del usuario actual del contexto de seguridad
     */
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            return userDetails.getUsername(); // En nuestro caso, username es el email
        }
        
        return null;
    }

    /**
     * Verifica si el targetIdentifier (que podría ser un userId) corresponde al usuario actual
     */
    private boolean isUserIdMatch(String targetIdentifier, String currentUserEmail, HttpServletRequest request) {
        // Si el targetIdentifier es numérico, es un userId
        if (isNumeric(targetIdentifier)) {
            try {
                Long userId = Long.parseLong(targetIdentifier);
                return userAuthorizationService.isUserIdMatchesEmail(userId, currentUserEmail);
            } catch (NumberFormatException e) {
                logger.warn("Error parsing userId {}: {}", targetIdentifier, e.getMessage());
                return false;
            }
        }
        
        // Si no es numérico, comparar como email
        return targetIdentifier.equals(currentUserEmail);
    }
    
    /**
     * Verifica si una cadena es completamente numérica
     */
    private boolean isNumeric(String str) {
        if (str == null || str.trim().isEmpty()) {
            return false;
        }
        return str.matches("^\\d+$");
    }

    /**
     * Establece respuesta de error en formato JSON
     */
    private void setErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String jsonResponse = String.format(
                "{\"error\": \"%s\", \"status\": 403, \"timestamp\": \"%s\"}",
                message,
                java.time.Instant.now().toString()
        );

        response.getWriter().write(jsonResponse);
    }

    /**
     * Determina si este filtro debe aplicarse a la request actual
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String requestURI = request.getRequestURI();
        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        return routeSecurityConfig.shouldSkipFilter(requestURI, method, RouteSecurityConfig.FilterType.SELF_MODIFICATION);
    }
}