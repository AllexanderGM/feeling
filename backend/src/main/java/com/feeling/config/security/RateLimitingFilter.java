package com.feeling.config.security;

import com.feeling.config.security.RouteSecurityConfig;
import org.springframework.http.HttpMethod;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.feeling.domain.dto.response.ErrorResponseDTO;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitingFilter.class);
    
    private final RateLimitingService rateLimitingService;
    private final ObjectMapper objectMapper;
    private final RouteSecurityConfig routeSecurityConfig;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String clientIp = getClientIpAddress(request);
        String requestPath = request.getRequestURI();
        String method = request.getMethod();

        // Verificar rate limiting para rutas de autenticación
        HttpMethod httpMethod = HttpMethod.valueOf(method);
        if (routeSecurityConfig.isAuthEndpoint(requestPath, httpMethod)) {
            if (!rateLimitingService.allowAuthAction(clientIp)) {
                handleRateLimitExceeded(response, "AUTH", clientIp, requestPath);
                return;
            }
            
            // Agregar headers informativos
            long remaining = rateLimitingService.getAuthTokensRemaining(clientIp);
            response.setHeader("X-RateLimit-Limit-Auth", "5");
            response.setHeader("X-RateLimit-Remaining-Auth", String.valueOf(remaining));
        }

        // Verificar rate limiting general para API
        if (!rateLimitingService.allowApiAction(clientIp)) {
            handleRateLimitExceeded(response, "API", clientIp, requestPath);
            return;
        }

        // Agregar headers informativos para rate limit general
        long apiRemaining = rateLimitingService.getApiTokensRemaining(clientIp);
        response.setHeader("X-RateLimit-Limit", "100");
        response.setHeader("X-RateLimit-Remaining", String.valueOf(apiRemaining));

        filterChain.doFilter(request, response);
    }


    private void handleRateLimitExceeded(HttpServletResponse response, 
                                       String limitType, 
                                       String clientIp, 
                                       String requestPath) throws IOException {
        
        logger.warn("Rate limit exceeded for {} - IP: {}, Path: {}", limitType, clientIp, requestPath);
        
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        
        String message = limitType.equals("AUTH") 
            ? "Demasiados intentos de autenticación. Intenta de nuevo en 1 minuto."
            : "Demasiadas peticiones. Intenta de nuevo en 1 minuto.";
            
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
            "RATE_LIMIT_EXCEEDED",
            message,
            "429"
        );
        
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }

    private String getClientIpAddress(HttpServletRequest request) {
        // Verificar headers comunes de proxy/load balancer
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }

        // Si X-Forwarded-For contiene múltiples IPs, tomar la primera
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }

        return ipAddress != null ? ipAddress : "0.0.0.0";
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        
        // No aplicar rate limiting a:
        return path.startsWith("/swagger-ui/") ||
               path.startsWith("/v3/api-docs/") ||
               path.equals("/favicon.ico") ||
               path.equals("/error") ||
               path.equals("/health") ||
               path.equals("/");
    }
}