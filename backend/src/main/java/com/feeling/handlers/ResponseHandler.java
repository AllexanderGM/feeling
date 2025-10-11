package com.feeling.handlers;

import com.feeling.domain.dto.response.FormatResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

// Temporalmente deshabilitado para debugging de Swagger
// @Component
public class ResponseHandler implements ResponseBodyAdvice<Object> {

    private static final Logger log = LoggerFactory.getLogger(ResponseHandler.class);

    public ResponseHandler() {
        log.info("✅ ResponseHandler inicializado");
    }

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // Temporalmente deshabilitado - retornar false para no interceptar ninguna respuesta
        return false;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  org.springframework.http.server.ServerHttpRequest request,
                                  org.springframework.http.server.ServerHttpResponse response) {

        // Si el body ya es una instancia de ResponseWrapper, lo retornamos tal cual.
        if (body instanceof FormatResponseDTO) {
            return body;
        }

        // Excluir endpoints de documentación por URL
        String path = request.getURI().getPath();
        if (path.contains("/v3/api-docs") ||
            path.contains("/swagger-ui") ||
            path.contains("/swagger-config") ||
            path.contains("/api-docs")) {
            return body;
        }

        // Excluir respuestas de OpenAPI por contenido
        // SpringDoc puede devolver String, byte[], o Map con la especificación OpenAPI
        if (body instanceof String) {
            String bodyStr = (String) body;
            if (bodyStr.contains("\"openapi\"") || bodyStr.startsWith("{")) {
                return body;
            }
        }
        if (body instanceof byte[]) {
            return body;
        }
        if (body instanceof java.util.Map) {
            java.util.Map<?, ?> bodyMap = (java.util.Map<?, ?>) body;
            if (bodyMap.containsKey("openapi") || bodyMap.containsKey("swagger")) {
                return body;
            }
        }

        // Envolver la respuesta en ResponseWrapper con un mensaje por defecto
        return new FormatResponseDTO<>(
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                "Proceso exitoso",
                false,
                body
        );
    }

}
