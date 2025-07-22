package com.feeling.infrastructure.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validador personalizado para verificar que la edad esté en un rango válido
 */
@Documented
@Constraint(validatedBy = ValidAgeValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidAge {
    
    String message() default "La edad debe estar entre {min} y {max} años";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * Edad mínima permitida
     */
    int min() default 18;
    
    /**
     * Edad máxima permitida
     */
    int max() default 100;
    
    /**
     * Permitir valores nulos
     */
    boolean allowNull() default true;
}