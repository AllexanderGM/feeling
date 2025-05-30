package com.feeling.domain.dto.auth;

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
