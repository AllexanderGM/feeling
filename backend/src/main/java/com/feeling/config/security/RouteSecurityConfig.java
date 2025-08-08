package com.feeling.config.security;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Configuración centralizada de seguridad para todas las rutas de la aplicación.
 * Este componente define qué rutas son públicas, requieren autenticación, 
 * necesitan roles específicos o requieren auto-modificación.
 */
@Component
public class RouteSecurityConfig {

    // ========================================
    // RUTAS PÚBLICAS (sin autenticación)
    // ========================================
    
    private static final Set<String> PUBLIC_ROUTES = Set.of(
        // Sistema y documentación
        "/",
        "/system",
        "/health",
        "/favicon.ico",
        "/error",
        "/swagger-ui/**",
        "/v3/api-docs/**",
        "/swagger-ui.html"
    );

    private static final Map<HttpMethod, Set<String>> PUBLIC_ROUTES_BY_METHOD = Map.of(
        HttpMethod.GET, Set.of(
            // Datos de configuración (públicos para registro)
            "/geographic/**",
            "/user-attributes",
            "/user-attributes/**", 
            "/user-interests",
            "/user-interests/**",
            "/user-tags/popular",
            "/user-tags/popular/**",
            "/user-tags/search",
            "/user-tags/search/**", 
            "/user-tags/trending",
            "/user-tags/trending/**",
            // Eventos públicos
            "/events/**"
        ),
        
        HttpMethod.POST, Set.of(
            // Autenticación y registro
            "/auth/register",
            "/auth/login",
            "/auth/google/register", 
            "/auth/google/login",
            "/auth/verify-email",
            "/auth/resend-verification",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/auth/refresh-token"
        )
    );

    private static final Set<String> PUBLIC_AUTH_CHECK_ROUTES = Set.of(
        "/auth/check-email/**",
        "/auth/check-method/**", 
        "/auth/status/**"
    );

    // ========================================
    // RUTAS DE AUTENTICACIÓN (rate limiting)
    // ========================================
    
    private static final Set<String> AUTH_ENDPOINTS = Set.of(
        "/auth/login",
        "/auth/register", 
        "/auth/google/",
        "/auth/forgot-password",
        "/auth/reset-password"
    );

    // ========================================
    // RUTAS QUE REQUIEREN AUTO-MODIFICACIÓN
    // ========================================
    
    private static final List<Pattern> SELF_MODIFICATION_PATTERNS = List.of(
        Pattern.compile("^/user/([^/]+)/?$"), // PUT /user/{email}
        Pattern.compile("^/user/([^/]+)/.*$"), // PUT /user/{email}/anything
        Pattern.compile("^/support/my-complaints/([^/]+)/?$"), // Quejas específicas
        Pattern.compile("^/matches/favorites/([^/]+)/?$"), // Match favorites
        Pattern.compile("^/bookings/([^/]+)/?$"), // Booking cancellation
        Pattern.compile("^/event-registrations/([^/]+)/cancel/?$") // Event registration cancellation
    );

    private static final Set<HttpMethod> SELF_MODIFICATION_METHODS = Set.of(
        HttpMethod.PUT,
        HttpMethod.PATCH, 
        HttpMethod.DELETE
    );

    // ========================================
    // RUTAS ADMINISTRATIVAS
    // ========================================
    
    private static final Set<String> ADMIN_ROUTES = Set.of(
        // User admin endpoints
        "/user/pending-approval",
        "/user/all",
        "/user/incomplete-profiles",
        "/user-analytics/**",
        "/user-tags/cleanup",
        "/user-tags/update-metrics",
        // Event admin endpoints  
        "/events/dashboard/stats",
        "/events/all-admin",
        "/events/user/**",
        "/events/stats/revenue",
        "/events/stats/category",
        // Match admin endpoints
        "/matches/plans/admin/**",
        // Support admin routes
        "/support/admin/**"
    );

    private static final Map<String, Set<HttpMethod>> ADMIN_SPECIFIC_ROUTES = new HashMap<>() {{
        put("/user/*/approve", Set.of(HttpMethod.PUT));
        put("/user/*/reject", Set.of(HttpMethod.PUT));
        put("/user/*/pending", Set.of(HttpMethod.PUT));
        put("/user/*/assign-admin", Set.of(HttpMethod.PUT));
        put("/user/*/revoke-admin", Set.of(HttpMethod.PUT));
        put("/user/*/deactivate", Set.of(HttpMethod.PUT));
        put("/user/*/reactivate", Set.of(HttpMethod.PUT));
        put("/user/*/send-email", Set.of(HttpMethod.POST));
        put("/events/*/admin-toggle-status", Set.of(HttpMethod.PATCH));
        put("/events/*/force-delete", Set.of(HttpMethod.DELETE));
        put("/user/*-batch", Set.of(HttpMethod.POST));
        put("/user/*/delete-batch", Set.of(HttpMethod.DELETE));
        put("/user/*", Set.of(HttpMethod.DELETE));
    }};

    // ========================================
    // MÉTODOS PÚBLICOS DE VERIFICACIÓN
    // ========================================

    /**
     * Verifica si una ruta es completamente pública (no requiere autenticación)
     */
    public boolean isPublicRoute(String path) {
        return isPublicRoute(path, null);
    }

    /**
     * Verifica si una ruta es pública considerando el método HTTP
     */
    public boolean isPublicRoute(String path, HttpMethod method) {
        // Rutas públicas generales
        if (PUBLIC_ROUTES.stream().anyMatch(route -> 
            route.endsWith("/**") ? path.startsWith(route.replace("/**", "/")) : path.equals(route))) {
            return true;
        }

        // Rutas de verificación de auth
        if (PUBLIC_AUTH_CHECK_ROUTES.stream().anyMatch(route -> 
            path.startsWith(route.replace("/**", "/")))) {
            return true;
        }

        // Rutas públicas por método HTTP
        if (method != null && PUBLIC_ROUTES_BY_METHOD.containsKey(method)) {
            return PUBLIC_ROUTES_BY_METHOD.get(method).stream().anyMatch(route ->
                route.endsWith("/**") ? path.startsWith(route.replace("/**", "/")) : path.equals(route));
        }

        return false;
    }

    /**
     * Verifica si una ruta es un endpoint de autenticación (para rate limiting)
     */
    public boolean isAuthEndpoint(String path, HttpMethod method) {
        if (method != HttpMethod.POST) {
            return false;
        }
        
        return AUTH_ENDPOINTS.stream().anyMatch(endpoint ->
            endpoint.endsWith("/") ? path.startsWith(endpoint) : path.startsWith(endpoint + "/") || path.equals(endpoint));
    }

    /**
     * Verifica si una ruta requiere verificación de auto-modificación
     */
    public boolean requiresSelfModificationCheck(String path, HttpMethod method) {
        // Solo aplicar a métodos que modifican datos
        if (!SELF_MODIFICATION_METHODS.contains(method)) {
            return false;
        }

        // Verificar si la ruta coincide con algún patrón
        return SELF_MODIFICATION_PATTERNS.stream().anyMatch(pattern -> 
            pattern.matcher(path).matches());
    }

    /**
     * Extrae el identificador del recurso objetivo (email, userId) de la URI
     */
    public String extractTargetIdentifier(String path) {
        return SELF_MODIFICATION_PATTERNS.stream()
            .map(pattern -> pattern.matcher(path))
            .filter(matcher -> matcher.matches())
            .findFirst()
            .map(matcher -> matcher.group(1))
            .orElse(null);
    }

    /**
     * Verifica si una ruta requiere rol de administrador
     */
    public boolean requiresAdminRole(String path, HttpMethod method) {
        // Rutas administrativas generales
        if (ADMIN_ROUTES.stream().anyMatch(route -> 
            path.startsWith(route.replace("/**", "/")))) {
            return true;
        }

        // Rutas administrativas específicas
        return ADMIN_SPECIFIC_ROUTES.entrySet().stream().anyMatch(entry -> {
            String routePattern = entry.getKey();
            Set<HttpMethod> allowedMethods = entry.getValue();
            
            boolean pathMatches = routePattern.contains("*") ? 
                path.matches(routePattern.replace("*", "[^/]+")) : 
                path.equals(routePattern);
                
            return pathMatches && allowedMethods.contains(method);
        });
    }

    /**
     * Verifica si una ruta debe ser excluida de un filtro específico
     */
    public boolean shouldSkipFilter(String path, HttpMethod method, FilterType filterType) {
        switch (filterType) {
            case JWT_AUTH:
                return isPublicRoute(path, method);
                
            case SELF_MODIFICATION:
                // Excluir rutas administrativas (ya protegidas por roles)
                if (requiresAdminRole(path, method)) {
                    return true;
                }
                // Excluir rutas públicas
                if (isPublicRoute(path, method)) {
                    return true;
                }
                // Excluir métodos de solo lectura
                return method == HttpMethod.GET || method == HttpMethod.HEAD || method == HttpMethod.OPTIONS;
                
            case RATE_LIMITING:
                return false; // Rate limiting aplica a todas las rutas
                
            default:
                return false;
        }
    }

    /**
     * Tipos de filtros disponibles
     */
    public enum FilterType {
        JWT_AUTH,
        SELF_MODIFICATION, 
        RATE_LIMITING
    }

    // ========================================
    // MÉTODOS DE CONFIGURACIÓN PARA SPRING SECURITY
    // ========================================

    /**
     * Obtiene todas las rutas públicas para configurar en Spring Security
     */
    public List<String> getAllPublicRoutes() {
        return List.of(
            // Rutas generales
            "/", "/system", "/health", "/favicon.ico", "/error",
            "/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html",
            
            // Autenticación
            "/auth/register", "/auth/login", "/auth/google/**", 
            "/auth/verify-email", "/auth/resend-verification",
            "/auth/forgot-password", "/auth/reset-password", "/auth/refresh-token",
            "/auth/check-email/**", "/auth/check-method/**", "/auth/status/**",
            
            // Datos públicos
            "/geographic/**", "/user-attributes/**", "/user-interests/**",
            "/user-tags/popular/**", "/user-tags/search/**", "/user-tags/trending/**"
        );
    }

    /**
     * Obtiene todas las rutas administrativas para configurar en Spring Security
     */
    public List<String> getAllAdminRoutes() {
        List<String> adminRoutes = new ArrayList<>();
        adminRoutes.addAll(ADMIN_ROUTES);
        adminRoutes.addAll(ADMIN_SPECIFIC_ROUTES.keySet());
        return adminRoutes;
    }
}