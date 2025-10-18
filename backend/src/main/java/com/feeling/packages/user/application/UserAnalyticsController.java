package com.feeling.packages.user.application;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.packages.user.domain.dto.analytics.UserAnalyticsOverviewDTO;
import com.feeling.packages.user.domain.dto.analytics.UserAnalyticsResponseDTO;
import com.feeling.packages.user.domain.dto.analytics.UserPerformanceMetricsDTO;
import com.feeling.packages.user.domain.dto.analytics.UserTopResponseDTO;
import com.feeling.packages.user.domain.dto.attributes.UserAttributeStatisticsResponseDTO;
import com.feeling.packages.user.domain.dto.interest.UserInterestStatisticsResponseDTO;
import com.feeling.packages.user.domain.dto.tags.UserTagStatisticsResponseDTO;
import com.feeling.packages.user.domain.services.UserAnalyticsService;
import com.feeling.packages.user.domain.services.UserAttributeService;
import com.feeling.packages.user.domain.services.UserCategoryInterestService;
import com.feeling.packages.user.domain.services.UserTagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controlador REST para analytics y métricas de usuarios.
 * <p>
 * Este controlador centraliza todos los endpoints de reporting y análisis
 * de datos de usuarios para el panel de administración. Proporciona:
 * <ul>
 *   <li>Overview general de analytics del sistema</li>
 *   <li>Métricas comprehensivas (contadores, engagement, crecimiento, geografía)</li>
 *   <li>Métricas detalladas por usuario individual</li>
 *   <li>Rankings de usuarios destacados (popularidad, matches, views)</li>
 *   <li>Estadísticas de atributos de usuario (género, edad, etc.)</li>
 *   <li>Estadísticas de intereses de usuario (categorías de relación)</li>
 *   <li>Estadísticas del sistema de tags (uso, popularidad, trending)</li>
 * </ul>
 * <p>
 * Arquitectura:
 * - Todos los endpoints requieren privilegios de administrador
 * - No contiene lógica de negocio (delegada a servicios especializados)
 * - Sigue principios DDD (Domain-Driven Design)
 * - Logging estructurado de todas las operaciones
 * - Manejo consistente de errores con ResponseEntity
 * <p>
 * Servicios utilizados:
 * - {@link UserAnalyticsService} para métricas y analytics generales
 * - {@link UserAttributeService} para estadísticas de atributos
 * - {@link UserCategoryInterestService} para estadísticas de intereses
 * - {@link UserTagService} para estadísticas de tags
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/user-analytics")
@RequiredArgsConstructor
@Tag(name = "User Analytics", description = "Endpoints de analíticas y métricas de usuarios para administradores")
public class UserAnalyticsController {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(UserAnalyticsController.class);

    private final UserAnalyticsService userAnalyticsService;
    private final UserAttributeService userAttributeService;
    private final UserCategoryInterestService userCategoryInterestService;
    private final UserTagService userTagService;

    // ========================================
    // ANALYTICS GENERALES
    // ========================================

    /**
     * Obtiene un resumen general de analytics de usuarios.
     * <p>
     * Retorna contadores básicos de usuarios agrupados por estado
     * (total, active, pending, incomplete, unverified, rejected, deactivated).
     * <p>
     * Usado en la vista principal del dashboard administrativo para
     * proporcionar un overview rápido del estado de la plataforma.
     *
     * @return ResponseEntity con UserAnalyticsResponseDTO conteniendo contadores por estado
     */
    @GetMapping("/overview")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener resumen de analíticas",
        description = "Obtiene contadores de usuarios agrupados por estado (activos, pendientes, incompletos, etc.)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Analytics obtenidas exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado o sin permisos de administrador"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<UserAnalyticsResponseDTO> getAnalyticsOverview() {
        try {
            UserAnalyticsResponseDTO analytics = userAnalyticsService.getAnalyticsOverview();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            logger.error("Error al obtener overview de analytics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene métricas comprehensivas de usuarios en un solo endpoint.
     * <p>
     * Agrega múltiples dimensiones de analytics:
     * - Conteo de usuarios por estado/pestaña del panel
     * - Estadísticas de engagement (verificación, completitud)
     * - Estadísticas de crecimiento y retención temporal
     * - Distribución geográfica de usuarios
     * <p>
     * Optimizado para cargar el dashboard principal con una sola llamada API.
     *
     * @return ResponseEntity con UserAnalyticsOverviewDTO agregando todas las métricas
     */
    @GetMapping("/user-metrics")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener métricas comprehensivas de usuarios",
        description = "Obtiene todas las métricas clave en un solo endpoint: conteo por estado, engagement, crecimiento y distribución geográfica")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Métricas obtenidas exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado o sin permisos de administrador"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<UserAnalyticsOverviewDTO> getComprehensiveUserMetrics() {
        try {
            UserAnalyticsOverviewDTO comprehensiveMetrics = userAnalyticsService.getComprehensiveUserMetrics();
            return ResponseEntity.ok(comprehensiveMetrics);
        } catch (Exception e) {
            logger.error("Error al obtener métricas comprehensivas de usuarios", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========================================
    // MÉTRICAS POR USUARIO
    // ========================================

    /**
     * Obtiene métricas detalladas de un usuario específico.
     * <p>
     * Retorna métricas individuales incluyendo:
     * - Visualizaciones de perfil
     * - Likes recibidos
     * - Cantidad de matches
     * - Puntuación de popularidad
     * - Porcentaje de completitud del perfil
     * <p>
     * Usado en vistas de detalle de usuario en el panel administrativo.
     *
     * @param userId ID del usuario a consultar
     * @return ResponseEntity con UserPerformanceMetricsDTO conteniendo métricas del usuario
     */
    @GetMapping("/metrics/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener métricas detalladas de usuario",
        description = "Obtiene métricas individuales de un usuario específico (views, likes, matches, popularidad, completitud)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Métricas obtenidas exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado o sin permisos de administrador"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<UserPerformanceMetricsDTO> getUserDetailedMetrics(
        @Parameter(description = "ID del usuario") @PathVariable Long userId) {
        try {
            UserPerformanceMetricsDTO metrics = userAnalyticsService.getUserDetailedMetrics(userId);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            logger.error("Error al obtener métricas detalladas del usuario", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========================================
    // RANKINGS Y TOP USERS
    // ========================================

    /**
     * Obtiene rankings de usuarios destacados en diferentes categorías.
     * <p>
     * Retorna tres rankings simultáneos:
     * - Top usuarios por popularidad (popularity score)
     * - Top usuarios por cantidad de matches
     * - Top usuarios por visualizaciones de perfil
     * <p>
     * Cada ranking está limitado al número especificado (default: 10).
     * Usado para identificar usuarios más exitosos y activos en la plataforma.
     *
     * @param limit Cantidad máxima de usuarios por ranking (default: 10)
     * @return ResponseEntity con UserTopResponseDTO conteniendo los tres rankings
     */
    @GetMapping("/top-users")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener rankings de usuarios destacados",
        description = "Obtiene top usuarios organizados por popularidad, matches y visualizaciones de perfil")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Rankings obtenidos exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado o sin permisos de administrador"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<UserTopResponseDTO> getTopUsers(
        @Parameter(description = "Límite de usuarios por ranking") @RequestParam(defaultValue = "10") int limit) {
        try {
            UserTopResponseDTO topUsers = userAnalyticsService.getTopUsers(limit);
            return ResponseEntity.ok(topUsers);
        } catch (Exception e) {
            logger.error("Error al obtener top users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========================================
    // ESTADÍSTICAS DE ATRIBUTOS E INTERESES
    // ========================================

    /**
     * Obtiene estadísticas de uso de atributos de usuario.
     * <p>
     * Retorna métricas sobre la distribución y uso de atributos del sistema
     * (género, edad, estado civil, iglesia, etc.).
     * <p>
     * Usado para análisis de demografía y patrones de uso de la plataforma.
     *
     * @return ResponseEntity con DTO de estadísticas de atributos
     */
    @GetMapping("/attribute-statistics")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener estadísticas de atributos de usuario",
        description = "Obtiene métricas de distribución y uso de atributos del sistema (género, edad, estado civil, etc.)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Estadísticas obtenidas exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado o sin permisos de administrador"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<UserAttributeStatisticsResponseDTO> getAttributeStatistics() {
        try {
            UserAttributeStatisticsResponseDTO attributeStats = userAttributeService.getAttributeStatistics();
            return ResponseEntity.ok(attributeStats);
        } catch (Exception e) {
            logger.error("Error al obtener estadísticas de atributos", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene estadísticas de intereses de usuario.
     * <p>
     * Retorna métricas sobre la distribución de categorías de interés
     * (ESSENCE, HARMONY, CONNECTION, etc.) entre los usuarios.
     * <p>
     * Usado para análisis de patrones de búsqueda y matching en la plataforma.
     *
     * @return ResponseEntity con DTO de estadísticas de intereses
     */
    @GetMapping("/interests-statistics")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener estadísticas de intereses de usuario",
        description = "Obtiene métricas de distribución de categorías de interés entre usuarios (ESSENCE, HARMONY, CONNECTION, etc.)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Estadísticas obtenidas exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado o sin permisos de administrador"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<UserInterestStatisticsResponseDTO> getInterestsStatistics() {
        try {
            UserInterestStatisticsResponseDTO interestsStats = userCategoryInterestService.getInterestsStatistics();
            return ResponseEntity.ok(interestsStats);
        } catch (Exception e) {
            logger.error("Error al obtener estadísticas de intereses", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========================================
    // ESTADÍSTICAS DE TAGS
    // ========================================

    /**
     * Obtiene estadísticas comprehensivas del sistema de tags.
     * <p>
     * Retorna métricas sobre:
     * - Tags más populares y trending
     * - Distribución de uso de tags
     * - Tags pendientes de aprobación
     * - Estadísticas de creación y aprobación
     * <p>
     * Usado para moderar y analizar el sistema de etiquetado de usuarios.
     *
     * @return ResponseEntity con UserTagStatisticsResponseDTO conteniendo estadísticas de tags
     */
    @GetMapping("/tags-statistics")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener estadísticas de tags de usuario",
        description = "Obtiene métricas comprehensivas del sistema de tags (popularidad, trending, aprobaciones, distribución)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Estadísticas obtenidas exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado o sin permisos de administrador"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<UserTagStatisticsResponseDTO> getTagsStatistics() {
        try {
            UserTagStatisticsResponseDTO tagStats = userTagService.getTagStatistics();
            return ResponseEntity.ok(tagStats);
        } catch (Exception e) {
            logger.error("Error al obtener estadísticas de tags", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
