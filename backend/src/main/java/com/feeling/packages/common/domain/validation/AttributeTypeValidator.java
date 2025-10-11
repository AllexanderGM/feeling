package com.feeling.packages.common.domain.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Set;

/**
 * Validador para la anotación @ValidAttributeType.
 * <p>
 * Valida que el tipo de atributo proporcionado sea uno de los tipos
 * válidos configurados en el sistema.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public class AttributeTypeValidator implements ConstraintValidator<ValidAttributeType, String> {

    private static final Set<String> VALID_ATTRIBUTE_TYPES = Set.of(
        "GENDER", "EYE_COLOR", "HAIR_COLOR", "BODY_TYPE", "RELIGION",
        "MARITAL_STATUS", "EDUCATION_LEVEL", "RELATIONSHIP_TYPE", "SEXUAL_ROLE", "CHURCH"
    );

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // Null no es válido para tipos de atributo
        if (value == null || value.isEmpty()) {
            return false;
        }

        // Validar que el tipo esté en la lista de tipos válidos (case-insensitive)
        boolean isValid = VALID_ATTRIBUTE_TYPES.contains(value.toUpperCase());

        // Personalizar mensaje de error con lista de tipos válidos
        if (!isValid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                String.format("Tipo de atributo no válido: '%s'. Tipos válidos: %s",
                    value, String.join(", ", VALID_ATTRIBUTE_TYPES))
            ).addConstraintViolation();
        }

        return isValid;
    }
}
