package com.feeling.domain.dto.user;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.domain.dto.auth.UserStatusDTO;
import com.feeling.domain.dto.auth.UserProfileDataDTO;
import com.feeling.domain.dto.views.UserViews;

/**
 * DTO extendido para respuestas que incluyen datos completos del usuario
 * con información adicional de privacidad, notificaciones, métricas, auth, estado de cuenta y matches
 * Usa JsonViews para controlar qué datos se exponen según el contexto
 */
public record UserExtendedResponseDTO(
        @JsonView({UserViews.Public.class, UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class})
        UserStatusDTO status,

        @JsonView({UserViews.Public.class, UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class})
        UserProfileDataDTO profile,

        @JsonView({UserViews.Internal.class, UserViews.Admin.class})
        UserPrivacyDTO privacy,

        @JsonView({UserViews.Internal.class, UserViews.Admin.class})
        UserNotificationDTO notifications,

        @JsonView({UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class, UserViews.Metrics.class})
        UserMetricsDTO metrics,

        @JsonView({UserViews.Standard.class, UserViews.Internal.class, UserViews.Admin.class})
        UserMatchesDTO matches,

        @JsonView({UserViews.Internal.class, UserViews.Admin.class})
        UserAuthDTO auth,

        @JsonView({UserViews.Admin.class})
        UserAccountStatusDTO account
) {
}