package com.feeling.packages.auth.domain.dto.response;

/**
 * Respuesta que comunica conflictos entre métodos de autenticación.
 * <p>
 * Permite informar al cliente qué proveedor está actualmente vinculado y
 * qué acción correctiva debe sugerirse al usuario.
 *
 * @param email Correo asociado a la cuenta que generó el conflicto
 * @param currentAuthProvider Proveedor con el que la cuenta fue registrada
 * @param attemptedAuthProvider Proveedor con el que se intentó acceder
 * @param message Mensaje descriptivo para mostrar en la interfaz
 * @param suggestedAction Acción sugerida para resolver el conflicto
 */
public record AuthMethodConflictDTO(
        String email,
        String currentAuthProvider,
        String attemptedAuthProvider,
        String message,
        String suggestedAction
) {
    public static AuthMethodConflictDTO create(String email, String current, String attempted) {
        String message = String.format(
                "Esta cuenta está registrada con %s. Para acceder, utiliza %s.",
                current, current
        );

        String suggestedAction = switch (current.toUpperCase()) {
            case "GOOGLE" -> "Usa el botón 'Iniciar sesión con Google'";
            case "LOCAL" -> "Usa tu email y contraseña";
            case "FACEBOOK" -> "Usa el botón 'Iniciar sesión con Facebook'";
            default -> "Contacta soporte técnico";
        };

        return new AuthMethodConflictDTO(email, current, attempted, message, suggestedAction);
    }
}
