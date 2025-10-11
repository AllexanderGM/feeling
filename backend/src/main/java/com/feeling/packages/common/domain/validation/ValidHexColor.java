package com.feeling.packages.common.domain.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Anotación de validación para códigos de color hexadecimal.
 * <p>
 * Valida que el valor sea un color hexadecimal válido en formato:
 * - #RGB (formato corto, ej: #F00)
 * - #RRGGBB (formato largo, ej: #FF0000)
 * <p>
 * Por defecto, acepta valores nulos. Para hacer el campo obligatorio,
 * usar en conjunto con @NotNull o @NotBlank.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = HexColorValidator.class)
@Documented
public @interface ValidHexColor {

    String message() default "El código de color no es válido. Debe ser formato hexadecimal (#RGB o #RRGGBB)";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    /**
     * Si es true, valida solo si el valor comienza con '#'.
     * Si no comienza con '#', no valida (útil cuando el campo puede ser texto o color).
     */
    boolean onlyIfStartsWithHash() default false;
}
