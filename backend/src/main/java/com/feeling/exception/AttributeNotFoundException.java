package com.feeling.exception;

import lombok.Getter;

/**
 * Excepción lanzada cuando no se encuentra un atributo solicitado.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Getter
public class AttributeNotFoundException extends RuntimeException {

    private final Long attributeId;
    private final String attributeName;

    public AttributeNotFoundException(String message, Long attributeId) {
        super(message);
        this.attributeId = attributeId;
        this.attributeName = null;
    }

    public AttributeNotFoundException(String message, String attributeName) {
        super(message);
        this.attributeId = null;
        this.attributeName = attributeName;
    }

}
