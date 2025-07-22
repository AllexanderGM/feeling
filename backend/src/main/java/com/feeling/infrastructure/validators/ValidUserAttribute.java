package com.feeling.infrastructure.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validador personalizado para atributos de usuario (color de ojos, cabello, etc.)
 */
@Documented
@Constraint(validatedBy = ValidUserAttributeValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidUserAttribute {
    
    String message() default "Atributo de usuario no válido";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * Tipo de atributo a validar
     */
    String attributeType();
    
    /**
     * Permitir valores nulos
     */
    boolean allowNull() default true;
    
    /**
     * Validar que el atributo esté activo
     */
    boolean requireActive() default true;
}