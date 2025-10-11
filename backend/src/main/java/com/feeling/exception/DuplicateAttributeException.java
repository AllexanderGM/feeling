package com.feeling.exception;

import lombok.Getter;

/**
 * Excepción lanzada cuando se intenta crear un atributo duplicado.
 * <p>
 * Se considera duplicado cuando existe otro atributo con:
 * - El mismo código para el mismo tipo de atributo
 * - El mismo nombre (case-insensitive) para el mismo tipo de atributo
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Getter
public class DuplicateAttributeException extends RuntimeException {

    private final String attributeType;
    private final String identifier;

    public DuplicateAttributeException(String message, String attributeType, String identifier) {
        super(message);
        this.attributeType = attributeType;
        this.identifier = identifier;
    }

}
