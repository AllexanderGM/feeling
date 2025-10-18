package com.feeling.packages.user.domain.services;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.exception.NotFoundException;
import com.feeling.packages.user.domain.dto.analytics.*;
import com.feeling.packages.user.domain.dto.mapper.UserDTOMapper;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio especializado para analytics, métricas y estadísticas de usuarios.
 * <p>
 * Responsabilidades:
 * - Overview de métricas generales del sistema
 * - Métricas detalladas por usuario individual
 * - Distribución geográfica de usuarios
 * - Estadísticas de engagement y activación
 * - Rankings de top usuarios por diferentes criterios
 * - Estadísticas de crecimiento temporal
 * - Contadores de tabs/categorías
 * <p>
 * Este servicio centraliza toda la lógica de analytics y reporting,
 * separando las consultas de métricas de la lógica de negocio principal.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
public class UserAnalyticsService {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(UserAnalyticsService.class);

    private final IUserRepository userRepository;

    // ========================================
    // OVERVIEW Y MÉTRICAS GENERALES
    // ========================================

    /**
     * Genera overview completo de métricas de usuarios del sistema.
     * <p>
     * Retorna un snapshot del estado actual incluyendo:
     * - Total de usuarios registrados
     * - Usuarios activos (verificados + perfil completo + aprobados)
     * - Usuarios pendientes de aprobación
     * - Usuarios con perfil incompleto
     * - Usuarios no verificados
     * - Usuarios rechazados
     * - Usuarios con cuenta desactivada
     * <p>
     * Este método es utilizado principalmente por dashboards administrativos
     * para mostrar KPIs principales del sistema.
     *
     * @return DTO con overview completo de métricas de usuarios
     */
    @Transactional(readOnly = true)
    public UserAnalyticsResponseDTO getAnalyticsOverview() {
        logger.info("Generando overview de analytics de usuarios");

        UserAnalyticsResponseDTO overview = new UserAnalyticsResponseDTO(
            userRepository.count(),
            userRepository.countActiveUsers(),
            userRepository.countByPendingApproval(),
            userRepository.countByProfileCompleteFalse(),
            userRepository.countByVerifiedFalse(),
            userRepository.countByRejected(),
            userRepository.countDeactivatedUsers()
        );

        logger.info("Analytics overview generado exitosamente", Map.of(
            "total_users", overview.total(),
            "active_users", overview.active()
        ));

        return overview;
    }

    /**
     * Obtiene métricas detalladas de un usuario específico.
     * <p>
     * Retorna métricas sociales y de engagement del usuario:
     * - Número de matches activos
     * - Visualizaciones de perfil recibidas
     * - Likes enviados y recibidos
     * - Favoritos agregados
     * - Score de popularidad calculado
     * - Estadísticas de actividad reciente
     * <p>
     * La conversión a DTO se realiza mediante {@link UserDTOMapper#toUserMetricsDTO}
     * que extrae y formatea todas las métricas relevantes del usuario.
     * <p>
     * Casos de uso:
     * - Perfil detallado de usuario para administradores
     * - Analytics personalizados por usuario
     * - Investigación de patrones de uso
     *
     * @param userId ID del usuario
     * @return DTO con métricas detalladas del usuario
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional(readOnly = true)
    public UserPerformanceMetricsDTO getUserDetailedMetrics(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + userId));

        logger.logUserOperation("user_metrics_retrieved", user.getEmail(),
            Map.of("userId", userId));

        return UserDTOMapper.toUserMetricsDTO(user);
    }

    // ========================================
    // DISTRIBUCIÓN GEOGRÁFICA
    // ========================================

    /**
     * Genera distribución geográfica de usuarios por país y ciudad.
     * <p>
     * Retorna dos mapas ordenados:
     * 1. Usuarios por país (todos los países con al menos 1 usuario)
     * 2. Usuarios por ciudad (todas las ciudades con al menos 1 usuario)
     * 3. Top 5 países con más usuarios
     * 4. Top 5 ciudades con más usuarios
     * <p>
     * Los mapas están ordenados por cantidad de usuarios (descendente).
     * <p>
     * Optimización:
     * - Usa queries GROUP BY optimizadas con índices en country y city
     * - Recolecta en LinkedHashMap para mantener orden
     * - Filtra top 5 con stream().limit(5)
     * <p>
     * Casos de uso:
     * - Visualización de mapas de calor
     * - Identificación de mercados principales
     * - Estrategias de expansión geográfica
     * - Marketing localizado
     *
     * @return DTO con distribución geográfica completa y tops
     */
    private UserLocationDistributionDTO getGeographicDistribution() {
        logger.info("Generando distribución geográfica de usuarios");

        // Distribución por países
        Map<String, Long> usersByCountry = userRepository.getUserCountByCountry().stream()
            .collect(Collectors.toMap(
                row -> (String) row[0],
                row -> (Long) row[1],
                (v1, v2) -> v1,
                LinkedHashMap::new
            ));

        // Distribución por ciudades
        Map<String, Long> usersByCity = userRepository.getUserCountByCity().stream()
            .collect(Collectors.toMap(
                row -> (String) row[0],
                row -> (Long) row[1],
                (v1, v2) -> v1,
                LinkedHashMap::new
            ));

        // Top 5 de cada categoría
        Map<String, Long> topCountries = usersByCountry.entrySet().stream()
            .limit(5)
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                Map.Entry::getValue,
                (v1, v2) -> v1,
                LinkedHashMap::new
            ));

        Map<String, Long> topCities = usersByCity.entrySet().stream()
            .limit(5)
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                Map.Entry::getValue,
                (v1, v2) -> v1,
                LinkedHashMap::new
            ));

        var topLocations = new UserLocationDistributionDTO.TopLocationsDTO(topCountries, topCities);
        var distribution = new UserLocationDistributionDTO(usersByCountry, usersByCity, topLocations);

        logger.info("Distribución geográfica generada", Map.of(
            "total_countries", usersByCountry.size(),
            "total_cities", usersByCity.size()
        ));

        return distribution;
    }

    // ========================================
    // ENGAGEMENT Y ACTIVACIÓN
    // ========================================

    /**
     * Genera estadísticas de engagement y activación de usuarios.
     * <p>
     * Calcula y retorna:
     * - Total de usuarios registrados
     * - Total de usuarios verificados
     * - Total de usuarios con perfil completo
     * - Tasa promedio de verificación de email (%)
     * - Tasa promedio de completitud de perfil (%)
     * <p>
     * Las tasas se calculan en {@link UserEngagementMetricsDTO#from} como porcentajes
     * redondeados con precisión de 2 decimales.
     * <p>
     * Casos de uso:
     * - KPIs de engagement para reporting ejecutivo
     * - Identificación de cuellos de botella en onboarding
     * - Monitoreo de tasas de conversión registro → usuario activo
     *
     * @return DTO con estadísticas de engagement y tasas calculadas
     */
    private UserEngagementMetricsDTO getEngagementStats() {
        logger.info("Generando estadísticas de engagement");

        Long totalUsers = userRepository.count();
        Long verifiedUsers = userRepository.countByVerifiedTrue();
        Long completeProfiles = userRepository.countByProfileCompleteTrue();

        UserEngagementMetricsDTO stats = UserEngagementMetricsDTO.from(totalUsers, verifiedUsers, completeProfiles);

        logger.info("Estadísticas de engagement generadas", Map.of(
            "total_users", totalUsers,
            "verification_rate", stats.averageVerificationRate() + "%",
            "completion_rate", stats.averageCompletionRate() + "%"
        ));

        return stats;
    }

    // ========================================
    // RANKINGS Y TOP USUARIOS
    // ========================================

    /**
     * Genera ranking de top usuarios según múltiples criterios.
     * <p>
     * Retorna tres rankings independientes:
     * 1. Top por popularityScore (score compuesto de métricas sociales)
     * 2. Top por matchesCount (mayor número de matches exitosos)
     * 3. Top por profileViews (perfiles más visitados)
     * <p>
     * Cada ranking incluye hasta `limit` usuarios (máximo 100, mínimo 1).
     * Los usuarios se ordenan descendentemente por su métrica respectiva.
     * <p>
     * Optimización:
     * - Carga todos los usuarios en memoria (⚠️ considerar para bases de datos grandes)
     * - Filtra solo usuarios con valores > 0 en la métrica
     * - Usa sorted + limit en streams para eficiencia
     * <p>
     * ⚠️ NOTA: Este método carga TODOS los usuarios. Para sistemas con millones
     * de usuarios, considerar implementación con queries nativas LIMIT.
     *
     * @param limit Número máximo de usuarios por ranking (validado entre 1-100)
     * @return DTO con tres rankings de top usuarios
     */
    @Transactional(readOnly = true)
    public UserTopResponseDTO getTopUsers(int limit) {
        logger.info("Generando ranking de top usuarios", Map.of("limit", limit));

        // Validar límite
        int validLimit = Math.max(1, Math.min(limit, 100));

        // Obtener todos los usuarios (⚠️ Optimización futura: query con LIMIT directo)
        List<User> allUsers = userRepository.findAll();

        // Top por popularityScore
        List<UserTopResponseDTO.TopUserDTO> topByPopularity = allUsers.stream()
            .filter(u -> u.getPopularityScore() > 0)
            .sorted((u1, u2) -> Double.compare(u2.getPopularityScore(), u1.getPopularityScore()))
            .limit(validLimit)
            .map(u -> new UserTopResponseDTO.TopUserDTO(
                u.getId(),
                u.getName() + " " + u.getLastName(),
                u.getEmail(),
                u.getPopularityScore().longValue(),
                u.getPopularityScore()
            ))
            .toList();

        // Top por matchesCount
        List<UserTopResponseDTO.TopUserDTO> topByMatches = allUsers.stream()
            .filter(u -> u.getMatchesCount() > 0)
            .sorted((u1, u2) -> Long.compare(u2.getMatchesCount(), u1.getMatchesCount()))
            .limit(validLimit)
            .map(u -> new UserTopResponseDTO.TopUserDTO(
                u.getId(),
                u.getName() + " " + u.getLastName(),
                u.getEmail(),
                u.getMatchesCount(),
                u.getPopularityScore()
            ))
            .toList();

        // Top por profileViews
        List<UserTopResponseDTO.TopUserDTO> topByViews = allUsers.stream()
            .filter(u -> u.getProfileViews() > 0)
            .sorted((u1, u2) -> Long.compare(u2.getProfileViews(), u1.getProfileViews()))
            .limit(validLimit)
            .map(u -> new UserTopResponseDTO.TopUserDTO(
                u.getId(),
                u.getName() + " " + u.getLastName(),
                u.getEmail(),
                u.getProfileViews(),
                u.getPopularityScore()
            ))
            .toList();

        logger.info("Rankings de top usuarios generados", Map.of(
            "top_by_popularity_count", topByPopularity.size(),
            "top_by_matches_count", topByMatches.size(),
            "top_by_views_count", topByViews.size()
        ));

        return new UserTopResponseDTO(topByPopularity, topByMatches, topByViews, validLimit);
    }

    // ========================================
    // ESTADÍSTICAS DE CRECIMIENTO
    // ========================================

    /**
     * Genera estadísticas de crecimiento y retención de usuarios.
     * <p>
     * Calcula métricas temporales de crecimiento:
     * - Nuevos usuarios en últimas 24 horas
     * - Nuevos usuarios en últimos 7 días
     * - Nuevos usuarios en últimos 30 días
     * - Usuarios activos en últimos 7 días
     * - Usuarios activos en últimos 30 días
     * - Tasas de retención calculadas (7 días y 30 días)
     * <p>
     * Retención se calcula como: (usuarios activos / usuarios totales) * 100
     * <p>
     * Optimización: Usa queries con filtro temporal optimizado con índice en created_at
     *
     * @param period Parámetro de período (actualmente no utilizado, reservado para futuro)
     * @return DTO con estadísticas de crecimiento y retención
     */
    private UserGrowthMetricsDTO getGrowthStats(String period) {
        logger.info("Generando estadísticas de crecimiento", Map.of("period", period != null ? period : "default"));

        LocalDateTime now = LocalDateTime.now();

        // Estadísticas de crecimiento
        Long usersLast24Hours = userRepository.countNewUsersSince(now.minusDays(1));
        Long usersLast7Days = userRepository.countNewUsersSince(now.minusDays(7));
        Long usersLast30Days = userRepository.countNewUsersSince(now.minusDays(30));

        // Retención
        Long activeUsersLast7Days = userRepository.countActiveUsersSince(now.minusDays(7));
        Long activeUsersLast30Days = userRepository.countActiveUsersSince(now.minusDays(30));

        Long totalUsers = userRepository.count();

        UserGrowthMetricsDTO stats = UserGrowthMetricsDTO.from(
            usersLast24Hours,
            usersLast7Days,
            usersLast30Days,
            activeUsersLast7Days,
            activeUsersLast30Days,
            totalUsers
        );

        logger.info("Estadísticas de crecimiento generadas", Map.of(
            "new_users_7d", usersLast7Days,
            "new_users_30d", usersLast30Days,
            "retention_7d", stats.retentionRate7Days() + "%",
            "retention_30d", stats.retentionRate30Days() + "%"
        ));

        return stats;
    }

    // ========================================
    // CONTADORES Y TABS
    // ========================================

    /**
     * Obtiene contadores de usuarios por estado para los tabs del panel administrativo.
     * <p>
     * Retorna contadores individuales de:
     * - Usuarios activos (verificados + perfil completo + aprobados)
     * - Usuarios pendientes de aprobación
     * - Usuarios con perfil incompleto
     * - Usuarios no verificados
     * - Usuarios no aprobados (rejected=false pero no aprobados)
     * - Usuarios rechazados
     * - Usuarios desactivados
     * - Total de usuarios
     * <p>
     * Casos de uso:
     * - Tabs del panel administrativo
     * - Filtros por estado de usuario
     * - KPIs de gestión de usuarios
     *
     * @return DTO con contadores individuales por estado
     */
    private UserStatusCountsDTO getUserTabsCount() {
        logger.info("Generando conteo de usuarios por tabs del panel");

        Long active = userRepository.countActiveUsers();
        Long pending = userRepository.countByPendingApproval();
        Long incomplete = userRepository.countByProfileCompleteFalse();
        Long unverified = userRepository.countByVerifiedFalse();
        Long nonApproved = userRepository.countNonApprovedUsers();
        Long rejected = userRepository.countByRejected();
        Long deactivated = userRepository.countDeactivatedUsers();
        Long total = userRepository.count();

        logger.info("Conteo de tabs generado", Map.of(
            "active", active,
            "pending", pending,
            "total", total
        ));

        return new UserStatusCountsDTO(active, pending, incomplete, unverified, nonApproved, rejected, deactivated, total);
    }

    /**
     * Obtiene métricas comprehensivas agregando todas las dimensiones de analytics.
     * <p>
     * Este método consolida múltiples métricas en un solo DTO para optimizar
     * la carga del dashboard principal del panel de administración:
     * - Conteo de usuarios por estado/pestaña (via {@link #getUserTabsCount()})
     * - Estadísticas de engagement (via {@link #getEngagementStats()})
     * - Estadísticas de crecimiento temporal (via {@link #getGrowthStats(String)})
     * - Distribución geográfica de usuarios (via {@link #getGeographicDistribution()})
     * <p>
     * Optimizado para reducir múltiples llamadas API a una sola request.
     *
     * @return DTO comprehensivo con todas las métricas agregadas
     */
    @Transactional(readOnly = true)
    public UserAnalyticsOverviewDTO getComprehensiveUserMetrics() {
        logger.info("Generando métricas comprehensivas de usuarios");

        return new UserAnalyticsOverviewDTO(
            getUserTabsCount(),
            getEngagementStats(),
            getGrowthStats("monthly"),
            getGeographicDistribution()
        );
    }
}
