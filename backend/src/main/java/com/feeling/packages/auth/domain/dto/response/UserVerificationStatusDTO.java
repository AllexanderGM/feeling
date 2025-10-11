package com.feeling.packages.auth.domain.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Estado actual del proceso de verificación de un usuario específico.
 *
 * @param email Correo del usuario evaluado
 * @param exists Indica si el usuario existe en la plataforma
 * @param verified Indica si la cuenta ya fue verificada
 * @param profileComplete Indica si el perfil cumple los requisitos mínimos
 * @param authProvider Proveedor de autenticación asociado (si existe)
 * @param codeExpirationMinutes Minutos restantes para que caduque el código vigente
 */
public record UserVerificationStatusDTO(
    String email,
    boolean exists,
    boolean verified,
    boolean profileComplete,
    String authProvider,
    @Schema(description = "Tiempo restante para expiración del código en minutos")
    Long codeExpirationMinutes
) {
}
