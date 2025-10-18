package com.feeling.packages.user.domain.dto.analytics;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.user.domain.dto.views.UserViews;

/**
 * DTO para métricas individuales de un usuario específico.
 * <p>
 * Proporciona métricas de actividad, popularidad y completitud del perfil
 * de un usuario individual, usadas en dashboards administrativos para
 * análisis detallado de usuarios específicos.
 *
 * @param profileViews        Cantidad de veces que el perfil ha sido visualizado
 * @param likesReceived       Cantidad de likes/me gusta recibidos
 * @param matchesCount        Cantidad de matches realizados
 * @param popularityScore     Puntuación de popularidad calculada (0.0 - 100.0)
 * @param profileCompleteness Porcentaje de completitud del perfil (0.0 - 100.0)
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public record UserPerformanceMetricsDTO(
    @JsonView({UserViews.Internal.class})
    Long profileViews,

    @JsonView({UserViews.Internal.class})
    Long likesReceived,

    @JsonView({UserViews.Internal.class})
    Long matchesCount,

    @JsonView({UserViews.Internal.class})
    Double popularityScore,

    @JsonView({UserViews.Internal.class})
    Double profileCompleteness
) {
}
