package com.feeling.packages.auth.domain.dto.response;

import java.util.List;

/**
 * Sugerencias automáticas de contraseñas y consejos de buenas prácticas.
 *
 * @param suggestions Lista de contraseñas ejemplo generadas por el sistema
 * @param tips Lista de recomendaciones textuales para reforzar la seguridad
 */
public record PasswordSuggestionsResponseDTO(
    List<String> suggestions,
    List<String> tips
) {
}
