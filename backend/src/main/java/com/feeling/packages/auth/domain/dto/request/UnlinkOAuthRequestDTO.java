package com.feeling.packages.auth.domain.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Solicitud para desvincular un proveedor OAuth de la cuenta local.
 * <p>
 * Requiere confirmación explícita para reducir errores accidentales y
 * habilita el dominio para validar la contraseña local antes de proceder.
 *
 * @param localPassword Contraseña local utilizada como verificación adicional
 * @param confirmationText Texto de confirmación que debe contener la palabra clave acordada
 */
public record UnlinkOAuthRequestDTO(
    @NotBlank(message = "Contraseña local es obligatoria")
    String localPassword,

    @NotBlank(message = "La confirmación es obligatoria")
    String confirmationText
) {
    public UnlinkOAuthRequestDTO {
        if (!"CONFIRMAR".equals(confirmationText)) {
            throw new IllegalArgumentException("Debe escribir 'CONFIRMAR' para desvincular la cuenta");
        }
    }
}
