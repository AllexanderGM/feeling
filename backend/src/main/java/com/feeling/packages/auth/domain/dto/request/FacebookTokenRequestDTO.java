package com.feeling.packages.auth.domain.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Solicitud para validar un token de Facebook OAuth en la capa de dominio.
 * <p>
 * Permite centralizar la estructura del token que eventualmente será intercambiado
 * por credenciales internas cuando la integración se habilite.
 *
 * @param accessToken Token de acceso emitido por Facebook para el usuario autenticado
 */
public record FacebookTokenRequestDTO(
    @NotBlank(message = "Token de Facebook es obligatorio")
    String accessToken
) {
}
