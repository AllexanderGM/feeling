package com.tours.application.handlers;

import com.tours.domain.dto.response.FormatResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@AllArgsConstructor
@Component
public class ResponseHandler implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // Aplica a todas las respuestas excepto las que ya están envueltas en ResponseWrapper
        return !returnType.getParameterType().equals(FormatResponseDTO.class);
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

        // Envolver la respuesta en ResponseWrapper con un mensaje por defecto
        return new FormatResponseDTO<>(
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                "Proceso exitoso",
                false,
                body
        );
    }

}
