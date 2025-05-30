package com.feeling.domain.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GoogleUserInfoDTO(
        String sub,  // Google ID único
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
     * Obtiene el primer nombre, fallback al nombre completo
     */
    public String getFirstName() {
        return givenName != null && !givenName.trim().isEmpty() ? givenName : name;
    }

    /**
     * Obtiene el apellido, fallback a string vacío
     */
    public String getLastName() {
        return familyName != null ? familyName : "";
    }

    /**
     * Verifica si el email está verificado por Google
     */
    public boolean isEmailVerified() {
        return emailVerified != null && emailVerified;
    }
}
