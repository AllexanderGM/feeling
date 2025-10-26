package com.feeling.packages.user.domain.dto.user;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.views.AuthViews;
import com.feeling.packages.user.domain.dto.views.AllUserViews;
import com.feeling.packages.user.domain.dto.views.UserViews;

import java.time.LocalDate;
import java.util.List;


/**
 * Información detallada del perfil de usuario expuesta durante la autenticación.
 * <p>
 * Incluye datos personales, de contacto, localización, preferencias y metadatos
 * utilizados por distintas vistas del ecosistema (public, standard, admin, etc.).
 */
public record UserDataDTO(
    @AllUserViews
    Long id,

    @AllUserViews
    String name,

    @AllUserViews
    String lastName,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Basic.class})
    String email,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Basic.class})
    LocalDate dateOfBirth,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, UserViews.Suggestions.class, AuthViews.Session.Basic.class})
    Integer age,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, UserViews.Suggestions.class, AuthViews.Session.Basic.class})
    String profession,

    // Document: NO mostrar en PUBLIC
    @JsonView({UserViews.Internal.class, AuthViews.Session.Basic.class})
    String document,

    // Phone: NO mostrar en PUBLIC
    @JsonView({UserViews.Matched.class, UserViews.Internal.class, AuthViews.Session.Basic.class})
    String phone,

    @JsonView({UserViews.Matched.class, UserViews.Internal.class, AuthViews.Session.Basic.class})
    String phoneCode,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, UserViews.Suggestions.class, AuthViews.Session.Basic.class})
    String country,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, UserViews.Suggestions.class, AuthViews.Session.Basic.class})
    String city,

    @JsonView({UserViews.Internal.class, UserViews.Suggestions.class, AuthViews.Session.Basic.class})
    String department,

    @JsonView({UserViews.Internal.class, UserViews.Suggestions.class, AuthViews.Session.Basic.class})
    String locality,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, UserViews.Suggestions.class, AuthViews.Session.Basic.class})
    String description,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, UserViews.Suggestions.class, AuthViews.Session.Basic.class})
    List<String> images,

    @JsonView({UserViews.Matched.class, UserViews.Internal.class, AuthViews.Session.Basic.class})
    String mainImage,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, UserViews.Suggestions.class, AuthViews.Session.Basic.class})
    String categoryInterest,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, UserViews.Suggestions.class, AuthViews.Session.Basic.class})
    String gender,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, UserViews.Suggestions.class, AuthViews.Session.Basic.class})
    List<String> tags,

    // Campos de preferencias que el frontend espera
    @JsonView({UserViews.Internal.class, AuthViews.Session.Basic.class})
    Integer agePreferenceMin,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Basic.class})
    Integer agePreferenceMax,

    @JsonView({UserViews.Internal.class, AuthViews.Session.Basic.class})
    Integer locationPreferenceRadius,

    // === CARACTERÍSTICAS FÍSICAS ===
    @JsonView({UserViews.Public.class, UserViews.Public.class, UserViews.Internal.class, AuthViews.Session.Basic.class})
    String maritalStatus,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, AuthViews.Session.Basic.class})
    Integer height,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, AuthViews.Session.Basic.class})
    String eyeColor,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, AuthViews.Session.Basic.class})
    String hairColor,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, AuthViews.Session.Basic.class})
    String bodyType,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, AuthViews.Session.Basic.class})
    String education,

    // === CAMPOS ESPIRITUALES ===
    @JsonView({UserViews.Public.class, UserViews.Internal.class, AuthViews.Session.Basic.class})
    String church,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, AuthViews.Session.Basic.class})
    String religion,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, AuthViews.Session.Basic.class})
    String spiritualMoments,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, AuthViews.Session.Basic.class})
    String spiritualPractices,

    // === CAMPOS DE RELACIÓN ===
    @JsonView({UserViews.Public.class, UserViews.Internal.class, AuthViews.Session.Basic.class})
    String sexualRole,

    @JsonView({UserViews.Public.class, UserViews.Internal.class, AuthViews.Session.Basic.class})
    String relationshipType
) {
}
