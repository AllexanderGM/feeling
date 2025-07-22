package com.feeling.infrastructure.logging;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Filtro para logging automático de todas las requests HTTP
 * Captura información de requests, responses y performance
 * Registrado manualmente en SecurityConfiguration para control del orden
 */
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RequestLoggingFilter implements Filter {

    private static final StructuredLoggerFactory.StructuredLogger logger = 
            StructuredLoggerFactory.create(RequestLoggingFilter.class);

    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String REQUEST_ID_ATTRIBUTE = "requestId";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        if (!(request instanceof HttpServletRequest) || !(response instanceof HttpServletResponse)) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Generar ID único para la request
        String requestId = generateRequestId();
        httpRequest.setAttribute(REQUEST_ID_ATTRIBUTE, requestId);
        httpResponse.addHeader(REQUEST_ID_HEADER, requestId);

        // Wrappear request y response para capturar contenido
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(httpRequest);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(httpResponse);

        long startTime = System.currentTimeMillis();

        try {
            // Log de inicio de request
            logRequestStart(wrappedRequest, requestId);

            // Procesar la request
            chain.doFilter(wrappedRequest, wrappedResponse);

        } finally {
            long duration = System.currentTimeMillis() - startTime;
            
            // Log de finalización de request
            logRequestEnd(wrappedRequest, wrappedResponse, requestId, duration);
            
            // Importante: copiar el contenido de vuelta al response original
            wrappedResponse.copyBodyToResponse();
        }
    }

    /**
     * Log del inicio de una request HTTP
     */
    private void logRequestStart(HttpServletRequest request, String requestId) {
        if (shouldSkipLogging(request)) {
            return;
        }

        Map<String, Object> context = new HashMap<>();
        context.put("requestId", requestId);
        context.put("method", request.getMethod());
        context.put("uri", request.getRequestURI());
        context.put("queryString", request.getQueryString());
        context.put("remoteAddr", getClientIpAddress(request));
        context.put("userAgent", request.getHeader("User-Agent"));
        context.put("category", "HTTP_REQUEST");
        context.put("phase", "START");

        // Agregar headers importantes (sin información sensible)
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", request.getHeader("Content-Type"));
        headers.put("Accept", request.getHeader("Accept"));
        headers.put("Authorization", request.getHeader("Authorization") != null ? "Bearer ***" : null);
        context.put("headers", headers);

        logger.info("HTTP request started", context);
    }

    /**
     * Log del final de una request HTTP
     */
    private void logRequestEnd(HttpServletRequest request, HttpServletResponse response, 
                               String requestId, long duration) {
        if (shouldSkipLogging(request)) {
            return;
        }

        Map<String, Object> context = new HashMap<>();
        context.put("requestId", requestId);
        context.put("method", request.getMethod());
        context.put("uri", request.getRequestURI());
        context.put("status", response.getStatus());
        context.put("duration", duration);
        context.put("category", "HTTP_REQUEST");
        context.put("phase", "END");

        // Agregar información del response
        context.put("contentType", response.getContentType());
        // Obtener content length del header en lugar del método deprecado
        String contentLength = response.getHeader("Content-Length");
        context.put("contentLength", contentLength != null ? contentLength : "unknown");

        // Determinar nivel de log basado en status y duración
        if (response.getStatus() >= 500) {
            logger.error("HTTP request completed with server error", context);
        } else if (response.getStatus() >= 400) {
            logger.warn("HTTP request completed with client error", context);
        } else if (duration > 5000) {
            logger.warn("HTTP request completed slowly", context);
        } else if (duration > 2000) {
            logger.info("HTTP request completed", context);
        } else {
            logger.debug("HTTP request completed", context);
        }

        // Log de performance si es lento
        if (duration > 1000) {
            Map<String, Object> perfMetrics = new HashMap<>();
            perfMetrics.put("endpoint", request.getMethod() + " " + request.getRequestURI());
            perfMetrics.put("statusCode", response.getStatus());
            logger.logPerformance("HTTP Request", duration, perfMetrics);
        }
    }

    /**
     * Determina si una request debe ser loggeada o no
     */
    private boolean shouldSkipLogging(HttpServletRequest request) {
        String uri = request.getRequestURI();
        
        // Skipear requests de health check y actuator
        if (uri.contains("/actuator") || 
            uri.contains("/health") ||
            uri.contains("/metrics") ||
            uri.contains("/favicon.ico") ||
            uri.contains("/swagger") ||
            uri.contains("/api-docs")) {
            return true;
        }

        // Skipear requests de recursos estáticos
        if (uri.endsWith(".css") || 
            uri.endsWith(".js") || 
            uri.endsWith(".jpg") || 
            uri.endsWith(".png") ||
            uri.endsWith(".gif") ||
            uri.endsWith(".ico")) {
            return true;
        }

        return false;
    }

    /**
     * Obtiene la IP real del cliente considerando proxies
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    /**
     * Genera un ID único para la request
     */
    private String generateRequestId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}