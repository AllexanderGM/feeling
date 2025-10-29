package com.feeling.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Excepción lanzada cuando un usuario intenta realizar acciones que requieren aprobación
 * pero su cuenta aún no ha sido aprobada por un administrador.
 *
 * Acciones que requieren aprobación:
 * - Enviar solicitudes de match
 * - Aceptar/rechazar matches
 * - Comprar planes de match
 */
@ResponseStatus(HttpStatus.FORBIDDEN) // 403
public class UserNotApprovedException extends RuntimeException {

    public UserNotApprovedException(String message) {
        super(message);
    }

    public UserNotApprovedException(String message, Throwable cause) {
        super(message, cause);
    }
}
