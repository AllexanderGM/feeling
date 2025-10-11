package com.feeling.packages.auth.domain.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Solicitud utilizada para evaluar la fortaleza de una contraseña.
 * <p>
 * Permite al dominio considerar contexto adicional (correo) para aplicar
 * reglas dinámicas o verificaciones de compromiso personalizadas.
 *
 * @param password Contraseña en texto plano que debe ser evaluada
 * @param email Correo asociado al usuario para aplicar reglas contextuales (opcional)
 */
public record PasswordValidationRequestDTO(
    @NotBlank(message = "La contraseña es obligatoria")
    String password,

    String email
) {
}
