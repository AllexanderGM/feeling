package com.feeling.packages.auth.domain.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Solicitud que inicia el chequeo de contraseñas comprometidas.
 * <p>
 * Transporta la contraseña en texto plano hacia la capa de dominio,
 * donde se compara contra fuentes externas (p. ej. Have I Been Pwned)
 * para alertar al usuario.
 *
 * @param password Contraseña que se quiere validar contra listas de brechas conocidas
 */
public record CompromisedCheckRequestDTO(
    @NotBlank(message = "La contraseña es obligatoria")
    String password
) {
}
