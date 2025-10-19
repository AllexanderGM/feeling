package com.feeling.packages.auth.domain.dto.password;

import java.util.List;

/**
 * Resultado de la verificación de contraseñas comprometidas.
 *
 * @param isCompromised   Indica si la contraseña apareció en brechas conocidas.
 * @param message         Mensaje explicativo para el usuario.
 * @param recommendations Lista de pasos recomendados para mitigar el riesgo.
 */
public record CompromisedCheckResponseDTO(
    boolean isCompromised,
    String message,
    List<String> recommendations
) {
}
