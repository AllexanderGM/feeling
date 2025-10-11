package com.feeling.packages.common.domain.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validador para la anotación @ValidHexColor.
 * <p>
 * Valida que una cadena sea un código de color hexadecimal válido.
 * Acepta formatos:
 * - #RGB (3 caracteres hex)
 * - #RRGGBB (6 caracteres hex)
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public class HexColorValidator implements ConstraintValidator<ValidHexColor, String> {

    private static final String HEX_COLOR_PATTERN = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$";
    private boolean onlyIfStartsWithHash;

    @Override
    public void initialize(ValidHexColor constraintAnnotation) {
        this.onlyIfStartsWithHash = constraintAnnotation.onlyIfStartsWithHash();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // Null es válido (usar @NotNull para hacer obligatorio)
        if (value == null || value.isEmpty()) {
            return true;
        }

        // Si onlyIfStartsWithHash está activado y no comienza con '#', no validar
        if (onlyIfStartsWithHash && !value.startsWith("#")) {
            return true;
        }

        // Validar formato hexadecimal
        return value.matches(HEX_COLOR_PATTERN);
    }
}
