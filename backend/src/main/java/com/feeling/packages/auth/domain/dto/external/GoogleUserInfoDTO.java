package com.feeling.packages.auth.domain.dto.external;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO que representa la respuesta del endpoint {@code /userinfo} de Google OAuth.
 * <p>
 * Se utiliza para normalizar los datos del proveedor externo antes de crear
 * o actualizar usuarios dentro del dominio de autenticación.
 *
 * @param sub Identificador único del usuario en Google
 * @param name Nombre completo reportado por Google
 * @param givenName Nombre de pila del usuario
 * @param familyName Apellido del usuario
 * @param picture URL de la imagen de perfil
 * @param email Correo asociado a la cuenta de Google
 * @param emailVerified Indicador de verificación de correo en Google
 * @param locale Configuración regional del usuario
 */
public record GoogleUserInfoDTO(
    String sub,
    String name,

    @JsonProperty("given_name")
    String givenName,

    @JsonProperty("family_name")
    String familyName,

    String picture,
    String email,

    @JsonProperty("email_verified")
    Boolean emailVerified,

    String locale
) {
    /**
     * Obtiene el primer nombre, usando el nombre completo como respaldo.
     *
     * @return nombre sugerido para el usuario
     */
    public String getFirstName() {
        return givenName != null && !givenName.trim().isEmpty() ? givenName : name;
    }

    /**
     * Obtiene el apellido, retornando vacío si Google no lo proporciona.
     *
     * @return apellido normalizado
     */
    public String getLastName() {
        return familyName != null ? familyName : "";
    }

    /**
     * Indica si el email fue verificado por Google.
     *
     * @return {@code true} si Google marca el email como verificado
     */
    public boolean isEmailVerified() {
        return emailVerified != null && emailVerified;
    }
}
