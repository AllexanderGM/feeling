package com.feeling.domain.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponseDTO(
        String error,
        String message,
        String code,
        Map<String, String> details,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime timestamp
) {
    public ErrorResponseDTO(String error, String message) {
        this(error, message, null, null, LocalDateTime.now());
    }

    public ErrorResponseDTO(String error, String message, String code) {
        this(error, message, code, null, LocalDateTime.now());
    }

    public ErrorResponseDTO(String error, String message, Map<String, String> details) {
        this(error, message, null, details, LocalDateTime.now());
    }

    public static ErrorResponseDTO badRequest(String message) {
        return new ErrorResponseDTO("BAD_REQUEST", message, "400");
    }

    public static ErrorResponseDTO unauthorized(String message) {
        return new ErrorResponseDTO("UNAUTHORIZED", message, "401");
    }

    public static ErrorResponseDTO forbidden(String message) {
        return new ErrorResponseDTO("FORBIDDEN", message, "403");
    }

    public static ErrorResponseDTO notFound(String message) {
        return new ErrorResponseDTO("NOT_FOUND", message, "404");
    }

    public static ErrorResponseDTO conflict(String message) {
        return new ErrorResponseDTO("CONFLICT", message, "409");
    }

    public static ErrorResponseDTO validation(String message, Map<String, String> details) {
        return new ErrorResponseDTO("VALIDATION_ERROR", message, "400", details, LocalDateTime.now());
    }

    public static ErrorResponseDTO internalServerError(String message) {
        return new ErrorResponseDTO("INTERNAL_SERVER_ERROR", message, "500");
    }
}