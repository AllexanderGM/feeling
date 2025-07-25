package com.feeling.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Excepción lanzada cuando un usuario intenta registrarse con un email que ya existe
 * pero que aún no ha sido verificado.
 */
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY) // 422
public class EmailNotVerifiedException extends RuntimeException {
    
    public EmailNotVerifiedException(String message) {
        super(message);
    }
    
    public EmailNotVerifiedException(String message, Throwable cause) {
        super(message, cause);
    }
}