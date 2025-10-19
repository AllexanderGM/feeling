package com.feeling.packages.user.domain.dto.user;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.feeling.packages.auth.domain.dto.auth.AuthProviderInfoDTO;
import com.feeling.packages.user.domain.dto.analytics.UserPerformanceMetricsDTO;

/**
 * DTO de respuesta configurable para usuario
 */
public record UserResponseDTO(

    UserStatusDTO status,
    UserDataDTO user,

    // Secciones opcionales (null si no se requieren en el contexto)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserPrivacyDTO privacy,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserPerformanceMetricsDTO metrics,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserMatchesDTO matches,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    AuthProviderInfoDTO auth,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserNotificationDTO notifications

) {
}
