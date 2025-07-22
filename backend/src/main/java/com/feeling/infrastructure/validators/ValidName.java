package com.feeling.infrastructure.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validador personalizado para nombres y apellidos
 */
@Documented
@Constraint(validatedBy = ValidNameValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidName {
    
    String message() default "El nombre contiene caracteres no válidos";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * Longitud mínima del nombre
     */
    int minLength() default 2;
    
    /**
     * Longitud máxima del nombre
     */
    int maxLength() default 50;
    
    /**
     * Permitir espacios en el nombre
     */
    boolean allowSpaces() default true;
    
    /**
     * Permitir valores nulos
     */
    boolean allowNull() default false;
}