package com.feeling.packages.auth.domain.dto.response;

import java.util.List;

/**
 * Detalle de la política vigente para creación y actualización de contraseñas.
 *
 * @param minLength Longitud mínima permitida
 * @param maxLength Longitud máxima permitida
 * @param requiresLowercase Indica si se requiere al menos una letra minúscula
 * @param requiresUppercase Indica si se requiere al menos una letra mayúscula
 * @param requiresNumbers Indica si se requiere al menos un dígito
 * @param requiresSymbols Indica si se requiere al menos un símbolo
 * @param allowedSymbols Lista de símbolos aceptados por la plataforma
 * @param rules Lista human-readable de reglas adicionales
 */
public record PasswordPolicyResponseDTO(
    int minLength,
    int maxLength,
    boolean requiresLowercase,
    boolean requiresUppercase,
    boolean requiresNumbers,
    boolean requiresSymbols,
    List<String> allowedSymbols,
    List<String> rules
) {
}
