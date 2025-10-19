package com.feeling.exception;

import com.feeling.domain.dto.response.ErrorResponseDTO;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;

import javax.naming.AuthenticationNotSupportedException;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ========================================
    // EXCEPCIONES DE DOMINIO ESPECÍFICAS
    // ========================================

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleNotFoundException(NotFoundException ex) {
        logger.warn("Recurso no encontrado: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponseDTO.notFound(ex.getMessage()));
    }

    @ExceptionHandler(AttributeNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleAttributeNotFoundException(AttributeNotFoundException ex) {
        logger.warn("Atributo no encontrado: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponseDTO.notFound(ex.getMessage()));
    }

    @ExceptionHandler(DuplicateAttributeException.class)
    public ResponseEntity<ErrorResponseDTO> handleDuplicateAttributeException(DuplicateAttributeException ex) {
        logger.warn("Atributo duplicado: tipo={}, identificador={}", ex.getAttributeType(), ex.getIdentifier());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponseDTO.conflict(ex.getMessage()));
    }

    @ExceptionHandler(InvalidAttributeTypeException.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidAttributeTypeException(InvalidAttributeTypeException ex) {
        logger.warn("Tipo de atributo inválido: {}", ex.getProvidedType());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponseDTO.badRequest(ex.getMessage()));
    }

    @ExceptionHandler(DuplicateNameException.class)
    public ResponseEntity<ErrorResponseDTO> handleDuplicateNameException(DuplicateNameException ex) {
        logger.warn("Nombre duplicado: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponseDTO.conflict(ex.getMessage()));
    }

    @ExceptionHandler(ExistEmailException.class)
    public ResponseEntity<ErrorResponseDTO> handleExistEmailException(ExistEmailException ex) {
        // Extraer información adicional del mensaje si está disponible
        String logMessage = String.format("Business validation - Email conflict: %s", ex.getMessage());
        logger.warn(logMessage);

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponseDTO.conflict(ex.getMessage()));
    }

    @ExceptionHandler(EmailNotVerifiedException.class)
    public ResponseEntity<ErrorResponseDTO> handleEmailNotVerifiedException(EmailNotVerifiedException ex) {
        logger.warn("Email existe pero no verificado: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(new ErrorResponseDTO("EMAIL_NOT_VERIFIED", ex.getMessage(), "422"));
    }

    @ExceptionHandler(TooManyRequestsException.class)
    public ResponseEntity<ErrorResponseDTO> handleTooManyRequestsException(TooManyRequestsException ex) {
        logger.warn("Demasiadas solicitudes: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(new ErrorResponseDTO("TOO_MANY_REQUESTS", ex.getMessage(), "429"));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponseDTO> handleBadRequestException(BadRequestException ex) {
        logger.warn("Solicitud incorrecta: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponseDTO.badRequest(ex.getMessage()));
    }

    // ========================================
    // EXCEPCIONES DE SEGURIDAD
    // ========================================

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponseDTO> handleUnauthorizedException(UnauthorizedException ex) {
        logger.warn("Acceso no autorizado: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponseDTO.unauthorized(ex.getMessage()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponseDTO> handleAuthenticationException(AuthenticationException ex) {
        logger.warn("Error de autenticación: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponseDTO.unauthorized("Credenciales inválidas"));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponseDTO> handleBadCredentialsException(BadCredentialsException ex) {
        logger.warn("Credenciales incorrectas: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponseDTO.unauthorized("Usuario o contraseña incorrectos"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDTO> handleAccessDeniedException(AccessDeniedException ex) {
        logger.warn("Acceso denegado: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ErrorResponseDTO.forbidden("No tienes permisos para acceder a este recurso"));
    }

    // ========================================
    // EXCEPCIONES DE VALIDACIÓN
    // ========================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });

        logger.warn("Errores de validación: {}", fieldErrors);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponseDTO.validation("Errores de validación en los datos enviados", fieldErrors));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalArgumentException(IllegalArgumentException ex) {
        logger.warn("Argumento ilegal: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponseDTO.badRequest(ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalStateException(IllegalStateException ex) {
        logger.warn("Estado ilegal: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponseDTO.badRequest(ex.getMessage()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponseDTO> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String detailedMessage = "Error al procesar la solicitud JSON";

        // Extraer información más específica del error
        if (ex.getCause() != null) {
            String causeMessage = ex.getCause().getMessage();
            if (causeMessage != null) {
                if (causeMessage.contains("Cannot deserialize")) {
                    detailedMessage = "Formato JSON inválido: verifique que los datos enviados coincidan con el formato esperado";
                } else if (causeMessage.contains("Unexpected character")) {
                    detailedMessage = "JSON mal formado: caracteres inesperados en la solicitud";
                }
            }
        }

        logger.warn("Error de deserialización JSON: {}. Causa: {}",
                    detailedMessage,
                    ex.getCause() != null ? ex.getCause().getMessage() : "desconocida");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponseDTO.badRequest(detailedMessage));
    }

    /**
     * Maneja errores de validación de Jakarta Validation directos
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponseDTO> handleConstraintViolation(ConstraintViolationException ex) {
        String validationErrors = ex.getConstraintViolations().stream()
            .map(ConstraintViolation::getMessage)
            .collect(Collectors.joining(", "));

        logger.warn("Errores de validación Jakarta: {}", validationErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponseDTO.badRequest(validationErrors));
    }

    /**
     * Maneja errores de transacción que contienen validaciones anidadas.
     * Esto ocurre cuando las validaciones en la entidad JPA fallan durante el commit.
     */
    @ExceptionHandler(TransactionSystemException.class)
    public ResponseEntity<ErrorResponseDTO> handleTransactionSystemException(TransactionSystemException ex) {
        // Intentar extraer ConstraintViolationException anidada
        Throwable cause = ex.getCause();
        if (cause instanceof jakarta.persistence.RollbackException rollbackEx) {
            Throwable validationCause = rollbackEx.getCause();
            if (validationCause instanceof ConstraintViolationException constraintEx) {
                String validationMessages = constraintEx.getConstraintViolations().stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining(", "));

                logger.warn("Errores de validación durante transacción: {}", validationMessages);

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ErrorResponseDTO.badRequest(validationMessages));
            }
        }

        // Si no es una validación, retornar error genérico
        logger.error("Error de transacción no relacionado con validación: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponseDTO.internalServerError("Error al procesar la transacción"));
    }

    // ========================================
    // EXCEPCIONES DE ARCHIVOS
    // ========================================

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponseDTO> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex) {
        // LOG DETALLADO del error
        logger.warn("⚠️ Archivo demasiado grande - DETALLES:");
        logger.warn("   Mensaje: {}", ex.getMessage());
        logger.warn("   Tamaño máximo configurado: {} bytes ({} MB)",
            ex.getMaxUploadSize(),
            ex.getMaxUploadSize() > 0 ? String.format("%.2f", ex.getMaxUploadSize() / (1024.0 * 1024.0)) : "unknown"
        );

        // Intentar extraer el tamaño real del archivo si está disponible
        if (ex.getRootCause() != null) {
            logger.warn("   Causa raíz: {}", ex.getRootCause().getMessage());
        }

        String message = "La solicitud excede el tamaño máximo permitido.";

        // Extraer información específica del error si está disponible
        if (ex.getMaxUploadSize() > 0) {
            long maxSizeMB = ex.getMaxUploadSize() / (1024 * 1024);
            message = String.format(
                "La solicitud excede el tamaño máximo permitido de %dMB. " +
                "Verifica: 1) Cada imagen debe ser máximo 5MB. " +
                "2) Total de imágenes no debe exceder 25MB. " +
                "3) El JSON de datos no debe ser excesivamente grande.",
                maxSizeMB
            );
        }

        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(new ErrorResponseDTO("FILE_TOO_LARGE", message, "413"));
    }

    // ========================================
    // EXCEPCIONES DE BASE DE DATOS
    // ========================================

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponseDTO> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        logger.error("Violación de integridad de datos: {}", ex.getMessage());
        
        String message = "Error de integridad en los datos";
        if (ex.getMessage().contains("Duplicate entry")) {
            message = "Ya existe un registro con esos datos";
        } else if (ex.getMessage().contains("foreign key constraint")) {
            message = "No se puede completar la operación debido a dependencias de datos";
        }
        
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponseDTO.conflict(message));
    }

    // ========================================
    // EXCEPCIONES GENERALES
    // ========================================

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleNoHandlerFoundException(NoHandlerFoundException ex) {
        logger.warn("Endpoint no encontrado: {} {}", ex.getHttpMethod(), ex.getRequestURL());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponseDTO.notFound("Endpoint no encontrado: " + ex.getRequestURL()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponseDTO> handleRuntimeException(RuntimeException ex) {
        logger.error("Error de runtime no controlado: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponseDTO.internalServerError("Error interno del servidor"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGenericException(Exception ex) {
        logger.error("Error no controlado: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponseDTO.internalServerError("Error interno del servidor"));
    }
}
