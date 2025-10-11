package com.feeling.packages.auth.domain.dto.response;

import java.util.List;

/**
 * Respuesta que describe el estado de autenticación de un correo.
 * <p>
 * Facilita al cliente saber si la cuenta existe, qué proveedor usa y
 * qué métodos alternativos están disponibles.
 *
 * @param email Correo consultado
 * @param currentAuthProvider Proveedor actualmente vinculado (puede ser {@code null})
 * @param isRegistered Indica si existe una cuenta asociada al correo
 * @param message Mensaje informativo dirigido al usuario
 * @param availableMethods Métodos de autenticación habilitados para el correo
 */
public record AuthMethodInfoDTO(
        String email,
        String currentAuthProvider,
        boolean isRegistered,
        String message,
        List<String> availableMethods
) {
}
