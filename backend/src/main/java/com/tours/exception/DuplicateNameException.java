package com.tours.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class DuplicateNameException extends RuntimeException {
    public DuplicateNameException(String mensaje) {
        super(mensaje);
    }
}
