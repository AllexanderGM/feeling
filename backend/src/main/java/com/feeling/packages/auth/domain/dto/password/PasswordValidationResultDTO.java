package com.feeling.packages.auth.domain.dto.password;

import com.feeling.packages.auth.domain.enums.PasswordStrength;

import java.util.List;

/**
 * Resultado interno de la validación de contraseñas ejecutada en {@link com.feeling.packages.auth.domain.services.PasswordService}.
 * <p>
 * Este DTO no se expone directamente a la capa de aplicación; sirve como estructura intermedia
 * para construir las respuestas públicas {@code PasswordValidationResponseDTO}.
 *
 * @param isValid     Indica si la contraseña cumple las políticas internas
 * @param errors      Lista de errores detectados durante la evaluación
 * @param suggestions Recomendaciones para mejorar la contraseña
 * @param strength    Nivel de fuerza clasificado
 */
public record PasswordValidationResultDTO(
    boolean isValid,
    List<String> errors,
    List<String> suggestions,
    PasswordStrength strength
) {
    /**
     * Indica la fortaleza de la contraseña en porcentaje para consumo interno.
     *
     * @return porcentaje de fuerza basado en el nivel reportado
     */
    public double strengthPercentage() {
        return (strength.getLevel() / 6.0) * 100;
    }
}
