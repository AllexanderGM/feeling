package com.feeling.packages.auth.domain.dto.password;

import java.util.List;

/**
 * Resultado detallado del análisis de una contraseña.
 *
 * @param isValid           Indica si cumple los requisitos mínimos.
 * @param errors            Lista de errores encontrados durante la validación.
 * @param suggestions       Recomendaciones para mejorar la contraseña.
 * @param strength          Información sobre la fortaleza calculada.
 * @param isCompromised     Indica si la contraseña está comprometida.
 * @param securityWarnings  Advertencias adicionales relacionadas con la seguridad.
 */
public record PasswordValidationResponseDTO(
    boolean isValid,
    List<String> errors,
    List<String> suggestions,
    PasswordStrengthInfoDTO strength,
    boolean isCompromised,
    List<String> securityWarnings
) {
}
