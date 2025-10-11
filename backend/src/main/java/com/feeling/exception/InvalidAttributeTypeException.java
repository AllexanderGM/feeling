package com.feeling.exception;

import lombok.Getter;

import java.util.Set;

/**
 * Excepción lanzada cuando se proporciona un tipo de atributo no válido.
 * <p>
 * Los tipos de atributo válidos están definidos en el servicio de atributos
 * y solo pueden ser aquellos configurados en el sistema.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Getter
public class InvalidAttributeTypeException extends IllegalArgumentException {

    private final String providedType;
    private final Set<String> validTypes;

    public InvalidAttributeTypeException(String message, String providedType, Set<String> validTypes) {
        super(message);
        this.providedType = providedType;
        this.validTypes = validTypes;
    }

}
