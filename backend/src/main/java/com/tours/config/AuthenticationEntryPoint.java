package com.tours.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tours.domain.dto.response.FormatResponseDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class AuthenticationEntryPoint implements org.springframework.security.web.AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException, ServletException {

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        FormatResponseDTO errorResponse = new FormatResponseDTO(
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                "Acceso denegado: No tienes permisos para acceder a este recurso",
                false,
                null
        );

        ObjectMapper objectMapper = new ObjectMapper();
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
