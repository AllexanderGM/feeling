package com.feeling.packages.match.domain.services;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.packages.match.domain.dto.MatchCompatibilityDTO;
import com.feeling.packages.match.domain.dto.UserSuggestionDTO;
import com.feeling.packages.match.infrastructure.repositories.IMatchRepository;
import com.feeling.packages.match.infrastructure.repositories.IUserDismissedRepository;
import com.feeling.packages.match.infrastructure.repositories.IUserFavoriteRepository;
import com.feeling.packages.user.domain.dto.mapper.UserResponseFactory;
import com.feeling.packages.user.domain.dto.user.UserResponseDTO;
import com.feeling.packages.user.domain.enums.UserResponseLevel;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.entities.UserTag;
import com.feeling.packages.user.infrastructure.repositories.IUserMatchingRepository;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Servicio especializado para descubrimiento y recomendación de usuarios compatibles.
 * <p>
 * Responsabilidades:
 * - Generación de sugerencias personalizadas de usuarios
 * - Búsqueda de usuarios compatibles con filtros avanzados
 * - Matching por tags y categorías de interés
 * - Algoritmos de compatibilidad y scoring
 * - Recomendaciones basadas en proximidad geográfica
 * <p>
 * Este servicio centraliza toda la lógica de descubrimiento de matches,
 * implementando algoritmos de compatibilidad y recomendación personalizados.
 * <p>
 * Forma parte del bounded context de "Match" ya que su propósito es
 * descubrir candidatos potenciales para hacer matching, no gestionar
 * el ciclo de vida de los usuarios.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
public class MatchDiscoveryService {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(MatchDiscoveryService.class);

    private final IUserRepository userRepository;
    private final IUserMatchingRepository userMatchingRepository;
    private final IUserFavoriteRepository userFavoriteRepository;
    private final IUserDismissedRepository userDismissedRepository;
    private final IMatchRepository matchRepository;
    private final UserResponseFactory userResponseFactory;

    // ========================================
    // SUGERENCIAS PERSONALIZADAS
    // ========================================

    /**
     * Obtiene sugerencias personalizadas de usuarios compatibles con caching optimizado.
     * <p>
     * Este método implementa el algoritmo principal de matching de la plataforma, considerando:
     * - Categoría de interés (ESSENCE, ROUSE, SPIRIT) - debe coincidir
     * - Rango de edad según preferencias del usuario
     * - Proximidad geográfica (ciudad y departamento)
     * - Perfil completo y estado de aprobación
     * <p>
     * Características de seguridad y privacidad:
     * - Requiere perfil completo para ver sugerencias
     * - Nivel máximo de información: BASIC (respeta privacidad de sugeridos)
     * - Cache multinivel por usuario, nivel y paginación
     * <p>
     * Optimizaciones de rendimiento:
     * - Query optimizada con índices en categoría, edad y ubicación
     * - Paginación para evitar carga masiva de datos
     * - Cache estratificado con TTL configurado
     * <p>
     * Migrado desde: UserService.getUserSuggestions()
     *
     * @param userEmail    Email del usuario que solicita sugerencias
     * @param includeLevel Nivel de detalle solicitado (limitado a BASIC máximo)
     * @param pageable     Configuración de paginación
     * @return Página de usuarios sugeridos según compatibilidad
     * @throws NotFoundException   Si el usuario no existe
     * @throws BadRequestException Si el perfil del usuario no está completo
     */
    @Transactional(readOnly = true)
    // Cache deshabilitado para permitir variedad en las sugerencias
    // @Cacheable(
    //     value = "userSuggestions",
    //     key = "'user_suggestions_' + #userEmail + '_' + #includeLevel + '_' + #pageable.pageNumber + '_' + #pageable.pageSize",
    //     unless = "#result == null || #result.isEmpty()"
    // )
    public Page<UserSuggestionDTO> getUserSuggestions(String userEmail, String includeLevel, Pageable pageable) {
        User currentUser = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        if (!currentUser.isProfileComplete()) {
            throw new BadRequestException("Debes completar tu perfil antes de ver sugerencias");
        }

        // Obtener usuarios compatibles con paginación optimizada
        Page<User> suggestedUsers = userMatchingRepository.findCompatibleUsers(
            currentUser.getId(),
            currentUser.getCategoryInterest() != null ? currentUser.getCategoryInterest().getId() : null,
            currentUser.getAgePreferenceMin(),
            currentUser.getAgePreferenceMax(),
            currentUser.getCity(),
            currentUser.getDepartment(),
            pageable
        );

        logger.logMatching(userEmail, "suggestions", (int) suggestedUsers.getTotalElements(),
            Map.of("page", pageable.getPageNumber(), "level", includeLevel));

        // Calcular sets de interacción para priorizar usuarios sin historial con el solicitante
        Long currentUserId = currentUser.getId();
        Set<Long> favoriteUserIds = new HashSet<>(userFavoriteRepository.findFavoriteUserIds(currentUserId));
        Set<Long> dismissedSuggestionIds = new HashSet<>(userDismissedRepository.findDismissedUserIds(currentUserId));
        Set<Long> rejectedUserIds = new HashSet<>(matchRepository.findRejectedUserIds(currentUserId));
        Set<Long> likedUserIds = new HashSet<>(matchRepository.findPendingInitiatedUserIds(currentUserId));
        Set<Long> matchedUserIds = new HashSet<>(matchRepository.findAcceptedUserIds(currentUserId));

        List<User> freshUsers = new ArrayList<>();
        List<User> dismissedUsers = new ArrayList<>();
        List<User> likedOrFavoriteUsers = new ArrayList<>();
        List<User> matchedUsers = new ArrayList<>();

        for (User candidate : suggestedUsers.getContent()) {
            Long candidateId = candidate.getId();
            if (candidateId == null) {
                freshUsers.add(candidate);
                continue;
            }

            if (matchedUserIds.contains(candidateId)) {
                matchedUsers.add(candidate);
                continue;
            }

            boolean isDismissed = dismissedSuggestionIds.contains(candidateId) || rejectedUserIds.contains(candidateId);
            boolean isLiked = likedUserIds.contains(candidateId);
            boolean isFavorite = favoriteUserIds.contains(candidateId);

            if (!isDismissed && !isLiked && !isFavorite) {
                freshUsers.add(candidate);
            } else if (isDismissed) {
                dismissedUsers.add(candidate);
            } else {
                likedOrFavoriteUsers.add(candidate);
            }
        }

        // Mezclar aleatoriamente TODOS los grupos para mayor variedad
        Collections.shuffle(freshUsers, ThreadLocalRandom.current());
        Collections.shuffle(dismissedUsers, ThreadLocalRandom.current());
        Collections.shuffle(likedOrFavoriteUsers, ThreadLocalRandom.current());
        Collections.shuffle(matchedUsers, ThreadLocalRandom.current());

        // Mezclar rechazados con favoritos/gustados de forma aleatoria
        List<User> mixedPool = new ArrayList<>(dismissedUsers.size() + likedOrFavoriteUsers.size());
        if (!dismissedUsers.isEmpty()) {
            mixedPool.add(dismissedUsers.remove(0));
        }

        while (!dismissedUsers.isEmpty() || !likedOrFavoriteUsers.isEmpty()) {
            if (dismissedUsers.isEmpty()) {
                mixedPool.add(likedOrFavoriteUsers.remove(0));
            } else if (likedOrFavoriteUsers.isEmpty()) {
                mixedPool.add(dismissedUsers.remove(0));
            } else if (ThreadLocalRandom.current().nextBoolean()) {
                mixedPool.add(dismissedUsers.remove(0));
            } else {
                mixedPool.add(likedOrFavoriteUsers.remove(0));
            }
        }

        // Orden final: usuarios frescos primero (ya mezclados aleatoriamente),
        // luego pool mixto, finalmente usuarios con matches confirmados
        List<User> orderedUsers = new ArrayList<>(freshUsers.size() + mixedPool.size() + matchedUsers.size());
        orderedUsers.addAll(freshUsers);
        orderedUsers.addAll(mixedPool);
        orderedUsers.addAll(matchedUsers);

        // Determinar nivel apropiado para sugerencias (máximo BASIC por seguridad)
        UserResponseLevel level = UserResponseLevel.fromString(includeLevel, UserResponseLevel.PUBLIC);
        if (level.ordinal() > UserResponseLevel.BASIC.ordinal()) {
            level = UserResponseLevel.BASIC;
        }

        final UserResponseLevel finalLevel = level;
        final String currentUserEmailFinal = currentUser.getEmail();

        List<UserSuggestionDTO> dtoContent = orderedUsers.stream()
            .map(user -> {
                Long candidateId = user.getId();
                boolean isFavorite = candidateId != null && favoriteUserIds.contains(candidateId);
                boolean hasPendingMatch = candidateId != null && likedUserIds.contains(candidateId);
                boolean hasAcceptedMatch = candidateId != null && matchedUserIds.contains(candidateId);
                boolean isDismissed = candidateId != null && (dismissedSuggestionIds.contains(candidateId) || rejectedUserIds.contains(candidateId));

                // Calcular compatibilidad entre el usuario actual y el candidato
                MatchCompatibilityDTO compatibility = calculateUserCompatibility(currentUserEmailFinal, user.getEmail());

                UserResponseDTO responseDTO = userResponseFactory.create(user, finalLevel);
                return new UserSuggestionDTO(responseDTO, compatibility, isFavorite, hasPendingMatch, hasAcceptedMatch, isDismissed);
            })
            .toList();

        return new PageImpl<>(dtoContent, pageable, suggestedUsers.getTotalElements());
    }

    // ========================================
    // MATCHING POR TAGS
    // ========================================

    /**
     * Encuentra usuarios que comparten tags similares para recomendaciones de matching.
     * <p>
     * Este método busca usuarios verificados y visibles que comparten al menos
     * un tag con el usuario especificado, utilizando el score de popularidad
     * para ordenar los resultados.
     * <p>
     * Criterios de búsqueda:
     * - Usuarios verificados (verified = true)
     * - Visibles en búsqueda (showMeInSearch = true)
     * - Que comparten al menos 1 tag con el usuario
     * - Ordenados por popularityScore descendente
     * <p>
     * Optimización:
     * - Query nativa con JOIN optimizado
     * - LIMIT aplicado en base de datos
     * <p>
     * Migrado desde: UserTagService.findUsersWithSimilarTags()
     *
     * @param userEmail Email del usuario para el cual buscar matches
     * @param limit     Número máximo de emails a retornar
     * @return Lista de emails de usuarios con tags similares
     */
    @Transactional(readOnly = true)
    public List<String> findUsersWithSimilarTags(String userEmail, int limit) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        if (user.getTags() == null || user.getTags().isEmpty()) {
            logger.info("Usuario no tiene tags, retornando lista vacía", Map.of("email", userEmail));
            return List.of();
        }

        List<String> userTagNames = user.getTagNames();

        List<String> matchedEmails = userMatchingRepository.findUsersWithSimilarTags(
            userTagNames,
            userEmail,
            limit
        );

        logger.info("Usuarios con tags similares encontrados", Map.of(
            "email", userEmail,
            "matches_found", matchedEmails.size()
        ));

        return matchedEmails;
    }

    /**
     * Encuentra usuarios con tags similares y retorna DTOs completos.
     * <p>
     * Versión mejorada de {@link #findUsersWithSimilarTags} que retorna
     * DTOs completos en lugar de solo emails, permitiendo mostrar
     * información del usuario directamente.
     *
     * @param userId ID del usuario para el cual buscar matches
     * @param limit  Número máximo de resultados a retornar
     * @param level  Nivel de detalle del DTO de respuesta
     * @return Lista de DTOs de usuarios con tags similares
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional(readOnly = true)
    public List<UserResponseDTO> findUsersWithSimilarTagsDTO(Long userId, int limit, UserResponseLevel level) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + userId));

        if (user.getTags() == null || user.getTags().isEmpty()) {
            logger.info("Usuario no tiene tags, retornando lista vacía", Map.of("userId", userId));
            return List.of();
        }

        List<String> tagNames = user.getTags().stream()
            .map(UserTag::getName)
            .toList();

        List<String> matchedEmails = userMatchingRepository.findUsersWithSimilarTags(
            tagNames,
            user.getEmail(),
            limit
        );

        // Convertir emails a usuarios y luego a DTOs
        List<UserResponseDTO> matches = matchedEmails.stream()
            .map(email -> userRepository.findByEmail(email).orElse(null))
            .filter(u -> u != null)
            .map(u -> userResponseFactory.create(u, level))
            .toList();

        logger.info("Usuarios con tags similares encontrados (DTO)", Map.of(
            "userId", userId,
            "matches_found", matches.size()
        ));

        return matches;
    }

    /**
     * Encuentra candidatos para matching basado en tags y categoría de interés opcional.
     * <p>
     * Permite filtrar adicionalmente por categoría de interés para matching más específico.
     * <p>
     * Casos de uso:
     * - Matching dentro de una categoría específica (ej: solo usuarios de "Deportes")
     * - Recomendaciones cruzadas entre categorías (categoryFilter = null)
     * - Búsqueda personalizada con múltiples criterios
     *
     * @param userId         ID del usuario para el cual buscar matches
     * @param categoryFilter Categoría de interés opcional (puede ser null para todas)
     * @param limit          Número máximo de resultados
     * @param level          Nivel de detalle del DTO de respuesta
     * @return Lista de DTOs de usuarios candidatos
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional(readOnly = true)
    public List<UserResponseDTO> findMatchCandidatesByTags(
        Long userId,
        String categoryFilter,
        int limit,
        UserResponseLevel level) {

        logger.info("Buscando candidatos de matching por tags", Map.of(
            "userId", userId,
            "categoryFilter", categoryFilter != null ? categoryFilter : "ALL",
            "limit", limit
        ));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + userId));

        if (user.getTags() == null || user.getTags().isEmpty()) {
            logger.info("Usuario no tiene tags, retornando lista vacía", Map.of("userId", userId));
            return List.of();
        }

        List<String> tagNames = user.getTags().stream()
            .map(UserTag::getName)
            .toList();

        List<String> matchedEmails = userMatchingRepository.findMatchCandidatesByTags(
            tagNames,
            user.getEmail(),
            categoryFilter,
            limit
        );

        List<UserResponseDTO> candidates = matchedEmails.stream()
            .map(email -> userRepository.findByEmail(email).orElse(null))
            .filter(u -> u != null)
            .map(u -> userResponseFactory.create(u, level))
            .toList();

        logger.info("Candidatos de matching encontrados", Map.of(
            "userId", userId,
            "candidates_found", candidates.size()
        ));

        return candidates;
    }

    // ========================================
    // MATCHING AVANZADO CON FILTROS
    // ========================================

    /**
     * Busca usuarios compatibles utilizando filtros avanzados múltiples.
     * <p>
     * Este es el método más completo de matching, que combina:
     * - Filtros demográficos (edad)
     * - Filtros geográficos (ciudad, departamento)
     * - Filtros de intereses (categoría)
     * - Ordenamiento por proximidad geográfica
     * - Ordenamiento por popularidad
     * <p>
     * Algoritmo de priorización:
     * 1. Usuarios de la misma ciudad (prioridad 1)
     * 2. Usuarios del mismo departamento (prioridad 2)
     * 3. Otros usuarios ordenados por popularityScore (prioridad 3)
     * <p>
     * Todos los filtros son opcionales (pueden ser null), permitiendo
     * búsquedas desde muy específicas hasta muy amplias.
     * <p>
     * Optimización:
     * - FETCH JOIN para evitar N+1 queries
     * - Paginación nativa de JPA
     * - Índices en campos de filtrado
     *
     * @param userId             ID del usuario para el cual buscar matches
     * @param categoryInterestId ID de categoría de interés (null = cualquiera)
     * @param minAge             Edad mínima (null = sin mínimo)
     * @param maxAge             Edad máxima (null = sin máximo)
     * @param city               Ciudad preferida (null = cualquiera)
     * @param department         Departamento preferido (null = cualquiera)
     * @param pageable           Configuración de paginación y ordenamiento
     * @param level              Nivel de detalle del DTO de respuesta
     * @return Página de DTOs de usuarios compatibles
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> findCompatibleUsers(
        Long userId,
        Long categoryInterestId,
        Integer minAge,
        Integer maxAge,
        String city,
        String department,
        Pageable pageable,
        UserResponseLevel level) {

        logger.info("Buscando usuarios compatibles con filtros avanzados", Map.of(
            "userId", userId,
            "categoryInterestId", categoryInterestId != null ? categoryInterestId : "ANY",
            "minAge", minAge != null ? minAge : "N/A",
            "maxAge", maxAge != null ? maxAge : "N/A",
            "city", city != null ? city : "N/A",
            "department", department != null ? department : "N/A",
            "page", pageable.getPageNumber(),
            "size", pageable.getPageSize()
        ));

        // Validar que el usuario existe
        if (!userRepository.existsById(userId)) {
            throw new NotFoundException("Usuario no encontrado con ID: " + userId);
        }

        // Buscar usuarios compatibles con filtros
        Page<User> compatibleUsers = userMatchingRepository.findCompatibleUsers(
            userId,
            categoryInterestId,
            minAge,
            maxAge,
            city,
            department,
            pageable
        );

        // Convertir a DTOs
        Page<UserResponseDTO> result = compatibleUsers.map(user ->
            userResponseFactory.create(user, level)
        );

        logger.info("Usuarios compatibles encontrados", Map.of(
            "userId", userId,
            "total_results", result.getTotalElements(),
            "page_results", result.getNumberOfElements(),
            "total_pages", result.getTotalPages()
        ));

        return result;
    }

    /**
     * Busca usuarios compatibles utilizando solo los datos del usuario solicitante.
     * <p>
     * Este método es una versión simplificada de {@link #findCompatibleUsers} que
     * extrae automáticamente los criterios de búsqueda del perfil del usuario:
     * - Usa la categoría de interés del usuario
     * - Usa la ciudad del usuario como preferencia
     * - Usa el departamento del usuario como preferencia
     * - Usa las preferencias de edad del usuario
     * <p>
     * Casos de uso:
     * - Recomendaciones automáticas sin entrada del usuario
     * - Feed de usuarios sugeridos en página principal
     * - Matching rápido sin configuración
     *
     * @param userId   ID del usuario para el cual buscar matches
     * @param pageable Configuración de paginación
     * @param level    Nivel de detalle del DTO de respuesta
     * @return Página de DTOs de usuarios compatibles
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> findCompatibleUsersForUser(
        Long userId,
        Pageable pageable,
        UserResponseLevel level) {

        logger.info("Buscando usuarios compatibles basados en perfil", Map.of(
            "userId", userId,
            "page", pageable.getPageNumber(),
            "size", pageable.getPageSize()
        ));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + userId));

        Long categoryInterestId = user.getCategoryInterest() != null
            ? user.getCategoryInterest().getId()
            : null;

        return findCompatibleUsers(
            userId,
            categoryInterestId,
            user.getAgePreferenceMin(),
            user.getAgePreferenceMax(),
            user.getCity(),
            user.getDepartment(),
            pageable,
            level
        );
    }

    // ========================================
    // UTILIDADES Y SCORING
    // ========================================

    /**
     * Valida si dos usuarios son compatibles según criterios básicos.
     * <p>
     * Criterios de compatibilidad:
     * - Ambos usuarios están verificados
     * - Ambos usuarios están aprobados
     * - Ambos tienen perfiles completos
     * - Ambos tienen cuentas activas
     * - Ambos son visibles en búsqueda
     * <p>
     * Este método es útil antes de procesar matching o enviar notificaciones.
     *
     * @param userId1 ID del primer usuario
     * @param userId2 ID del segundo usuario
     * @return true si son compatibles según criterios básicos
     * @throws NotFoundException Si alguno de los usuarios no existe
     */
    @Transactional(readOnly = true)
    public boolean areUsersCompatible(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + userId1));

        User user2 = userRepository.findById(userId2)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + userId2));

        boolean compatible = user1.isVerified()
            && user2.isVerified()
            && "APPROVED".equals(user1.getUserApprovalStatus())
            && "APPROVED".equals(user2.getUserApprovalStatus())
            && user1.isProfileComplete()
            && user2.isProfileComplete()
            && !user1.isAccountDeactivated()
            && !user2.isAccountDeactivated()
            && user1.isShowMeInSearch()
            && user2.isShowMeInSearch();

        logger.logUserOperation("users_compatibility_checked", user1.getEmail(), Map.of(
            "user1_id", userId1,
            "user2_id", userId2,
            "compatible", compatible
        ));

        return compatible;
    }

    /**
     * Calcula un score de compatibilidad entre dos usuarios basado en tags compartidos.
     * <p>
     * El score se calcula usando el coeficiente de Jaccard:
     * - Porcentaje de tags compartidos respecto al total de tags de ambos usuarios
     * - Valor entre 0.0 (sin tags compartidos) y 1.0 (100% de tags compartidos)
     * <p>
     * Fórmula: score = (tags_compartidos * 2) / (tags_usuario1 + tags_usuario2)
     * <p>
     * Casos de uso:
     * - Ordenamiento de matches por compatibilidad
     * - Filtrado de matches con score mínimo
     * - Visualización de porcentaje de compatibilidad en UI
     *
     * @param userId1 ID del primer usuario
     * @param userId2 ID del segundo usuario
     * @return Score de compatibilidad entre 0.0 y 1.0
     * @throws NotFoundException Si alguno de los usuarios no existe
     */
    @Transactional(readOnly = true)
    public double calculateCompatibilityScore(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + userId1));

        User user2 = userRepository.findById(userId2)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + userId2));

        if (user1.getTags() == null || user1.getTags().isEmpty() ||
            user2.getTags() == null || user2.getTags().isEmpty()) {
            return 0.0;
        }

        // Obtener nombres de tags
        List<String> tags1 = user1.getTags().stream().map(UserTag::getName).toList();
        List<String> tags2 = user2.getTags().stream().map(UserTag::getName).toList();

        // Calcular tags compartidos
        long sharedTags = tags1.stream()
            .filter(tags2::contains)
            .count();

        // Calcular score (Jaccard similarity)
        double score = (sharedTags * 2.0) / (tags1.size() + tags2.size());

        logger.info("Score de compatibilidad calculado", Map.of(
            "user1_id", userId1,
            "user2_id", userId2,
            "shared_tags", sharedTags,
            "score", String.format("%.2f", score * 100) + "%"
        ));

        return score;
    }

    // ========================================
    // CÁLCULO DE COMPATIBILIDAD DETALLADA
    // ========================================

    /**
     * Calcula compatibilidad detallada entre dos usuarios con algoritmo ponderado multi-factor.
     * <p>
     * Algoritmo de compatibilidad con 4 factores ponderados:
     * 1. Categoría de interés (40%): Debe coincidir exactamente
     * 2. Edad (20%): Menor diferencia = mayor score
     * - Excelente: ≤2 años diferencia (100%)
     * - Buena: 3-5 años diferencia (75%)
     * - Aceptable: 6-10 años diferencia (50%)
     * - Baja: >10 años diferencia (0%)
     * 3. Ubicación (20%):
     * - Misma ciudad: 100%
     * - Mismo país: 50%
     * - Diferente país: 0%
     * 4. Tags comunes (20%): Basado en similaridad de Jaccard
     * <p>
     * Score total = suma de factores ponderados, máximo 1.0 (100%)
     * <p>
     * Retorna desglose completo con score por factor y match description.
     * <p>
     * Migrado desde: UserService.calculateUserCompatibility()
     *
     * @param currentUserEmail Email del usuario que solicita el cálculo
     * @param otherUserEmail   Email del usuario objetivo
     * @return DTO con compatibilidad total, porcentaje y desglose por factores
     * @throws NotFoundException Si alguno de los usuarios no existe
     */
    @Transactional(readOnly = true)
    public MatchCompatibilityDTO calculateUserCompatibility(String currentUserEmail, String otherUserEmail) {
        logger.info("Calculando compatibilidad entre usuarios", Map.of(
            "current_user", currentUserEmail,
            "other_user", otherUserEmail
        ));

        User currentUser = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new NotFoundException("Usuario actual no encontrado"));
        User otherUser = userRepository.findByEmail(otherUserEmail)
            .orElseThrow(() -> new NotFoundException("Otro usuario no encontrado"));

        // Pesos de compatibilidad (constantes)
        final double CATEGORY_WEIGHT = 0.4;
        final double AGE_WEIGHT = 0.2;
        final double LOCATION_WEIGHT = 0.2;
        final double TAGS_WEIGHT = 0.2;

        double totalCompatibility = 0.0;
        double categoryScore = 0.0;
        double ageScore = 0.0;
        double locationScore = 0.0;
        double tagsScore = 0.0;

        String categoryMatch = "Sin coincidencia";
        String ageMatch = "Sin coincidencia";
        String locationMatch = "Sin coincidencia";
        String tagsMatch = "Sin coincidencia";

        // Factor 1: Misma categoría de interés (40%)
        if (currentUser.getCategoryInterest() != null && otherUser.getCategoryInterest() != null) {
            if (currentUser.getCategoryInterest().equals(otherUser.getCategoryInterest())) {
                categoryScore = CATEGORY_WEIGHT;
                categoryMatch = "Coincidencia perfecta - " + currentUser.getCategoryInterest().getName();
            }
        }

        // Factor 2: Rango de edad similar (20%)
        if (currentUser.getDateOfBirth() != null && otherUser.getDateOfBirth() != null) {
            int ageDifference = Math.abs(currentUser.getAge() - otherUser.getAge());

            if (ageDifference <= 2) {
                ageScore = AGE_WEIGHT;
                ageMatch = "Excelente - " + ageDifference + (ageDifference == 1 ? " año de diferencia" : " años de diferencia");
            } else if (ageDifference <= 5) {
                ageScore = AGE_WEIGHT * 0.75;
                ageMatch = "Buena - " + ageDifference + " años de diferencia";
            } else if (ageDifference <= 10) {
                ageScore = AGE_WEIGHT * 0.5;
                ageMatch = "Aceptable - " + ageDifference + " años de diferencia";
            } else {
                ageMatch = "Baja - " + ageDifference + " años de diferencia";
            }
        }

        // Factor 3: Ubicación (20%)
        if (currentUser.getCity() != null && otherUser.getCity() != null) {
            if (currentUser.getCity().equals(otherUser.getCity())) {
                locationScore = LOCATION_WEIGHT;
                locationMatch = "Misma ciudad - " + currentUser.getCity();
            } else if (currentUser.getCountry() != null && otherUser.getCountry() != null &&
                currentUser.getCountry().equals(otherUser.getCountry())) {
                locationScore = LOCATION_WEIGHT * 0.5;
                locationMatch = "Mismo país - " + currentUser.getCountry();
            } else if (currentUser.getCountry() != null && otherUser.getCountry() != null) {
                locationMatch = "Diferente país";
            }
        }

        // Factor 4: Tags comunes (20%) - Usar Jaccard similarity
        if (currentUser.getTags() != null && !currentUser.getTags().isEmpty() &&
            otherUser.getTags() != null && !otherUser.getTags().isEmpty()) {

            List<String> tags1 = currentUser.getTags().stream().map(UserTag::getName).toList();
            List<String> tags2 = otherUser.getTags().stream().map(UserTag::getName).toList();

            long sharedTags = tags1.stream().filter(tags2::contains).count();

            if (sharedTags > 0) {
                // Jaccard similarity
                tagsScore = TAGS_WEIGHT * ((sharedTags * 2.0) / (tags1.size() + tags2.size()));
                tagsMatch = String.format("Coincidencia parcial - %d tags compartidos", sharedTags);
            }
        }

        // Total
        totalCompatibility = categoryScore + ageScore + locationScore + tagsScore;
        totalCompatibility = Math.min(1.0, totalCompatibility);

        MatchCompatibilityDTO result = MatchCompatibilityDTO.from(
            totalCompatibility,
            categoryScore,
            ageScore,
            locationScore,
            tagsScore,
            categoryMatch,
            ageMatch,
            locationMatch,
            tagsMatch
        );

        logger.info("Compatibilidad calculada", Map.of(
            "current_user", currentUserEmail,
            "other_user", otherUserEmail,
            "total_percentage", result.totalPercentage() + "%",
            "category", String.format("%.0f%%", categoryScore * 100),
            "age", String.format("%.0f%%", ageScore * 100),
            "location", String.format("%.0f%%", locationScore * 100),
            "tags", String.format("%.0f%%", tagsScore * 100)
        ));

        return result;
    }
}
