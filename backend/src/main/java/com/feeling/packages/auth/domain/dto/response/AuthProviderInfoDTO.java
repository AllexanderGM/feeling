package com.feeling.packages.auth.domain.dto.response;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.enums.AuthProvider;
import com.feeling.packages.user.domain.dto.views.UserViews;

import java.time.LocalDateTime;

/**
 * Información asociada al proveedor de autenticación externo del usuario.
 * <p>
 * Expone metadatos útiles para la interfaz, como identificadores externos,
 * avatar y fecha de la última sincronización.
 *
 * @param userAuthProvider  Proveedor OAuth asociado a la cuenta
 * @param externalId        Identificador otorgado por el proveedor externo
 * @param externalAvatarUrl URL del avatar definido en el proveedor (si aplica)
 * @param lastExternalSync  Fecha de la última sincronización con el proveedor
 */
public record AuthProviderInfoDTO(
    @JsonView({UserViews.Internal.class})
    AuthProvider userAuthProvider,

    @JsonView({UserViews.Internal.class})
    String externalId,

    @JsonView({UserViews.Internal.class})
    String externalAvatarUrl,

    @JsonView({UserViews.Internal.class})
    LocalDateTime lastExternalSync
) {
}
