package com.feeling.infrastructure.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = StrongPasswordValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface StrongPassword {

    String message() default "La contraseña no cumple con los requisitos de seguridad";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    /**
     * Permite especificar el email del usuario para validaciones adicionales
     */
    String emailField() default "";

    /**
     * Nivel mínimo de fuerza requerido
     */
    int minStrengthLevel() default 3; // FAIR por defecto
}