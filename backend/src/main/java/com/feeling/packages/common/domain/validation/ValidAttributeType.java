package com.feeling.packages.common.domain.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Anotación de validación para tipos de atributos de usuario.
 * <p>
 * Valida que el tipo de atributo sea uno de los tipos válidos definidos
 * en el sistema (GENDER, EYE_COLOR, HAIR_COLOR, BODY_TYPE, etc.).
 * <p>
 * Esta validación es case-insensitive (convierte a mayúsculas antes de validar).
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = AttributeTypeValidator.class)
@Documented
public @interface ValidAttributeType {

    String message() default "Tipo de atributo no válido";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
