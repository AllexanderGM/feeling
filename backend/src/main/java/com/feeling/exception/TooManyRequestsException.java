package com.feeling.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Excepción lanzada cuando un usuario hace demasiadas solicitudes en poco tiempo.
 * Específicamente usada para casos de rate limiting como reenvío de códigos.
 */
@ResponseStatus(HttpStatus.TOO_MANY_REQUESTS) // 429
public class TooManyRequestsException extends RuntimeException {
    
    public TooManyRequestsException(String message) {
        super(message);
    }
    
    public TooManyRequestsException(String message, Throwable cause) {
        super(message, cause);
    }
}