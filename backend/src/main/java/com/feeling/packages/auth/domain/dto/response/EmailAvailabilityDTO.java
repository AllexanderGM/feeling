package com.feeling.packages.auth.domain.dto.response;

import java.util.List;

/**
 * Respuesta que indica si un correo puede usarse para registro.
 * <p>
 * Incluye mensajes de ayuda tanto para nuevos registros como para usuarios existentes.
 *
 * @param email Correo consultado
 * @param available Indica si el correo está libre para registro
 * @param existingAuthProvider Proveedor actual cuando el correo ya está registrado
 * @param message Mensaje contextual para mostrar al usuario
 * @param availableRegistrationMethods Métodos disponibles para completar el registro
 * @param loginInstruction Instrucciones para iniciar sesión si el correo ya está en uso
 */
public record EmailAvailabilityDTO(
        String email,
        boolean available,
        String existingAuthProvider,
        String message,
        List<String> availableRegistrationMethods,
        String loginInstruction
) {
}
