package com.feeling.packages.auth.domain.dto.response;

/**
 * Información detallada de la fortaleza estimada de una contraseña.
 *
 * @param level Nombre del nivel de seguridad calculado
 * @param description Descripción orientada al usuario final
 * @param color Código de color sugerido para la UI
 * @param numericLevel Valor numérico de la fuerza en escala discreta
 * @param percentage Valor porcentual normalizado de la fuerza
 */
public record PasswordStrengthInfoDTO(
    String level,
    String description,
    String color,
    int numericLevel,
    double percentage
) {
}
