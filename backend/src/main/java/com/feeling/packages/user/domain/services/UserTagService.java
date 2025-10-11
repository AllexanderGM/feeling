package com.feeling.packages.user.domain.services;

import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.user.domain.dto.UserTagDTO;
import com.feeling.packages.user.domain.dto.tags.UserTagStatisticsResponseDTO;
import com.feeling.packages.user.domain.enums.UserCategoryInterestList;
import com.feeling.packages.user.domain.enums.UserRoleList;
import com.feeling.packages.user.domain.enums.UserTagApprovalStatus;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.entities.UserTag;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import com.feeling.packages.user.infrastructure.repositories.IUserTagRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión completa del sistema de tags dinámicos de usuarios en la plataforma Feeling.
 * <p>
 * Este servicio proporciona funcionalidades para:
 * - Gestión de tags por usuario (añadir, remover, reemplazar)
 * - Sistema de aprobación administrativa de tags
 * - Búsqueda y descubrimiento de tags
 * - Análisis de compatibilidad entre usuarios basado en tags
 * - Estadísticas y métricas del sistema de tags
 * - Limpieza automática de tags sin uso
 * - Sugerencias inteligentes para usuarios
 * <p>
 * Características principales:
 * - Límite configurable de tags por usuario (actualmente 10)
 * - Normalización automática de nombres de tags
 * - Sistema de trending para tags populares
 * - Validación de contenido y palabras prohibidas
 * - Integración con sistema de matching
 * - Soporte para diferentes categorías de interés
 * - Métricas de uso y popularidad
 * - Tareas programadas para mantenimiento
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
public class UserTagService {

    private static final Logger logger = LoggerFactory.getLogger(UserTagService.class);

    /**
     * Límite máximo de tags que un usuario puede tener en su perfil.
     * Este límite ayuda a mantener perfiles concisos y mejorar la UX.
     */
    private static final int MAX_TAGS_PER_USER = 10;

    private final IUserTagRepository userTagRepository;
    private final IUserRepository userRepository;

    // ========================================
    // GESTIÓN DE TAGS POR USUARIOS
    // ========================================

    /**
     * Añade un tag al perfil de un usuario, creándolo si no existe previamente.
     * <p>
     * Funcionalidades incluidas:
     * - Validación del límite máximo de tags por usuario
     * - Normalización automática del nombre del tag
     * - Verificación de duplicados en el perfil del usuario
     * - Creación automática de tags nuevos (pendientes de aprobación)
     * - Incremento automático del contador de uso
     * - Logging para auditoría
     *
     * @param userEmail Email del usuario al que se añadirá el tag
     * @param tagName   Nombre del tag a añadir (será normalizado automáticamente)
     * @return El tag añadido (nuevo o existente)
     * @throws IllegalArgumentException Si se excede el límite de tags, el tag ya existe en el perfil o es inválido
     * @throws NotFoundException        Si el usuario no existe
     */
    @Transactional
    public UserTag addTagToUser(String userEmail, String tagName) {
        User user = findUserByEmail(userEmail);

        // Validar límite de tags por usuario
        if (user.getTags() != null && user.getTags().size() >= MAX_TAGS_PER_USER) {
            throw new IllegalArgumentException(
                String.format("No puedes tener más de %d tags en tu perfil", MAX_TAGS_PER_USER)
            );
        }

        // Normalizar y validar el nombre del tag
        String normalizedTagName = normalizeTagName(tagName);
        validateTagName(normalizedTagName);

        // Buscar si el tag ya existe
        Optional<UserTag> existingTag = userTagRepository.findByNameIgnoreCase(normalizedTagName);

        UserTag tag;
        if (existingTag.isPresent()) {
            tag = existingTag.get();

            // Verificar si el usuario ya tiene este tag
            if (user.getTags() != null && user.getTags().contains(tag)) {
                throw new IllegalArgumentException("Ya tienes este tag en tu perfil");
            }
        } else {
            // Crear un nuevo tag
            tag = UserTag.builder()
                .name(normalizedTagName)
                .createdBy(userEmail)
                .createdAt(LocalDateTime.now())
                .usageCount(0L)
                .lastUsed(LocalDateTime.now())
                .build();

            tag = userTagRepository.save(tag);
            logger.info("Nuevo tag creado: '{}' por usuario {}", normalizedTagName, userEmail);
        }

        // Añadir el tag al usuario
        user.addTag(tag);
        tag.incrementUsage(); // Incrementar contador de uso
        userRepository.save(user);

        logger.info("Tag '{}' añadido al usuario {}", normalizedTagName, userEmail);
        return tag;
    }

    /**
     * Remueve un tag del perfil de un usuario por nombre.
     * <p>
     * Decrementa el contador de uso del tag y lo elimina automáticamente
     * si ya no tiene usuarios asociados.
     *
     * @param userEmail Email del usuario
     * @param tagName   Nombre del tag a remover
     * @return Mensaje de confirmación
     * @throws NotFoundException        Si el usuario o tag no existen
     * @throws IllegalArgumentException Si el usuario no tiene ese tag
     */
    @Transactional
    public MessageResponseDTO removeTagFromUser(String userEmail, String tagName) {
        User user = findUserByEmail(userEmail);
        String normalizedTagName = normalizeTagName(tagName);

        UserTag tag = userTagRepository.findByNameIgnoreCase(normalizedTagName)
            .orElseThrow(() -> new NotFoundException("Tag no encontrado"));

        // Verificar si el usuario tiene este tag
        if (user.getTags() == null || !user.getTags().contains(tag)) {
            throw new IllegalArgumentException("No tienes este tag en tu perfil");
        }

        // Remover el tag del usuario
        user.removeTag(tag);
        tag.decrementUsage(); // Decrementar contador de uso
        userRepository.save(user);

        // Si el tag no tiene usuarios, eliminarlo
        if (tag.shouldBeDeleted()) {
            userTagRepository.delete(tag);
            logger.info("Tag '{}' eliminado por falta de uso", normalizedTagName);
        }

        logger.info("Tag '{}' removido del usuario {}", normalizedTagName, userEmail);
        return new MessageResponseDTO("Tag removido correctamente");
    }

    /**
     * Obtiene todos los tags de un usuario.
     *
     * @param userEmail Email del usuario
     * @return Lista de tags del usuario (vacía si no tiene tags)
     * @throws NotFoundException Si el usuario no existe
     */
    public List<UserTagDTO> getUserTags(String userEmail) {
        User user = findUserByEmail(userEmail);
        return user.getTags() != null ?
            user.getTags().stream()
                .map(UserTagDTO::new)
                .collect(Collectors.toList()) :
            List.of();
    }

    /**
     * Reemplaza todos los tags de un usuario con una nueva lista.
     * Decrementa el contador de uso de los tags antiguos e incrementa el de los nuevos.
     *
     * @param userEmail Email del usuario
     * @param tagNames  Lista de nombres de tags nuevos
     * @return Lista de tags actuales del usuario
     * @throws IllegalArgumentException si se excede el límite de tags
     * @throws NotFoundException        si el usuario no existe
     */
    @Transactional
    public List<UserTagDTO> replaceUserTags(String userEmail, List<String> tagNames) {
        User user = findUserByEmail(userEmail);

        // Validar límite
        if (tagNames.size() > MAX_TAGS_PER_USER) {
            throw new IllegalArgumentException(
                String.format("No puedes tener más de %d tags", MAX_TAGS_PER_USER)
            );
        }

        // Limpiar tags existentes
        if (user.getTags() != null) {
            List<UserTag> oldTags = List.copyOf(user.getTags());
            user.getTags().clear();

            // Decrementar el uso de los tags antiguos
            oldTags.forEach(tag -> {
                tag.decrementUsage();
                if (tag.shouldBeDeleted()) {
                    userTagRepository.delete(tag);
                    logger.debug("Tag '{}' eliminado por falta de uso", tag.getName());
                } else {
                    userTagRepository.save(tag);
                }
            });
        }

        // Añadir nuevos tags
        for (String tagName : tagNames) {
            String normalizedTagName = normalizeTagName(tagName);
            validateTagName(normalizedTagName);

            UserTag tag = userTagRepository.findByNameIgnoreCase(normalizedTagName)
                .orElseGet(() -> {
                    UserTag newTag = UserTag.builder()
                        .name(normalizedTagName)
                        .createdBy(userEmail)
                        .createdAt(LocalDateTime.now())
                        .usageCount(0L)
                        .lastUsed(LocalDateTime.now())
                        .build();
                    return userTagRepository.save(newTag);
                });

            user.addTag(tag);
            tag.incrementUsage(); // Incrementar contador de uso
            userTagRepository.save(tag);
        }

        User savedUser = userRepository.save(user);
        logger.info("Tags reemplazados para usuario {}: {}", userEmail, tagNames);

        return savedUser.getTags().stream()
            .map(UserTagDTO::new)
            .collect(Collectors.toList());
    }

    // ========================================
    // BÚSQUEDA Y DESCUBRIMIENTO DE TAGS
    // ========================================

    /**
     * Busca tags por nombre (parcial o completo).
     * <p>
     * Si no se proporciona término de búsqueda, retorna los tags más populares.
     *
     * @param searchTerm Término de búsqueda (puede ser null o vacío)
     * @param limit      Número máximo de resultados
     * @return Lista de tags que coinciden con la búsqueda
     */
    public List<UserTagDTO> searchTags(String searchTerm, int limit) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return userTagRepository.findMostPopularTags()
                .stream()
                .limit(limit)
                .map(UserTagDTO::new)
                .collect(Collectors.toList());
        }

        return userTagRepository.searchByNameContaining(searchTerm.trim())
            .stream()
            .limit(limit)
            .map(UserTagDTO::new)
            .collect(Collectors.toList());
    }

    /**
     * Obtiene los tags más populares ordenados por usageCount.
     *
     * @param limit Número máximo de tags a retornar
     * @return Lista de tags más populares
     */
    public List<UserTagDTO> getPopularTags(int limit) {
        return userTagRepository.findTopPopularTags(limit)
            .stream()
            .map(UserTagDTO::new)
            .collect(Collectors.toList());
    }

    /**
     * Obtiene los tags en tendencia (usados en la última semana).
     *
     * @param limit Número máximo de tags a retornar
     * @return Lista de tags en tendencia
     */
    public List<UserTagDTO> getTrendingTags(int limit) {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        return userTagRepository.findTrendingTags(oneWeekAgo)
            .stream()
            .limit(limit)
            .map(UserTagDTO::new)
            .collect(Collectors.toList());
    }

    /**
     * Obtiene sugerencias personalizadas de tags para un usuario específico.
     * <p>
     * El algoritmo de sugerencias considera:
     * - Tags populares que el usuario no tiene actualmente
     * - Tags populares en la misma categoría de interés
     * - Tags utilizados por usuarios con perfiles similares
     * - Exclusión de tags que el usuario ya posee
     * <p>
     * Las sugerencias están ordenadas por popularidad y relevancia.
     *
     * @param userEmail Email del usuario para el que se generan sugerencias
     * @param limit     Número máximo de sugerencias a retornar
     * @return Lista de tags sugeridos ordenados por relevancia
     * @throws NotFoundException Si el usuario no existe
     */
    public List<UserTagDTO> getSuggestedTagsForUser(String userEmail, int limit) {
        User user = findUserByEmail(userEmail);

        // Obtener tags que el usuario no tiene pero que son populares
        List<String> userTagNames = user.getTagNames();

        return userTagRepository.findSuggestedTagsExcluding(userTagNames)
            .stream()
            .limit(limit)
            .map(UserTagDTO::new)
            .collect(Collectors.toList());
    }

    // ========================================
    // ESTADÍSTICAS Y ANÁLISIS
    // ========================================

    /**
     * Obtiene estadísticas generales de los tags del sistema.
     * <p>
     * Incluye: total de tags, tags activos, tags sin uso, usuarios con tags,
     * promedio de tags por usuario y promedio de uso de tags.
     *
     * @return DTO con estadísticas completas del sistema de tags
     */
    public UserTagStatisticsResponseDTO getTagStatistics() {
        long totalTags = userTagRepository.count();
        long activeTags = userTagRepository.countActiveTags();
        long uniqueUsersWithTags = userRepository.countUniqueUsersWithTags();
        Double averageTagsPerUser = userRepository.getAverageTagsPerUser();
        Double averageUsageCount = userTagRepository.getAverageUsageCount();

        return UserTagStatisticsResponseDTO.builder()
            .totalTags(totalTags)
            .activeTags(activeTags)
            .unusedTags(totalTags - activeTags)
            .uniqueUsersWithTags(uniqueUsersWithTags)
            .averageTagsPerUser(averageTagsPerUser != null ? averageTagsPerUser : 0.0)
            .averageUsageCount(averageUsageCount != null ? averageUsageCount : 0.0)
            .build();
    }

    /**
     * Obtiene tags populares filtrados por categoría de interés.
     * <p>
     * Útil para SINGLES, ROUSE, SPIRIT.
     * Si la categoría es inválida, retorna tags populares generales como fallback.
     *
     * @param category Categoría de interés (SINGLES, ROUSE, SPIRIT)
     * @param limit    Número máximo de tags a retornar
     * @return Lista de tags populares en esa categoría
     */
    public List<UserTagDTO> getPopularTagsByCategory(String category, int limit) {
        // Validar que la categoría existe
        try {
            UserCategoryInterestList.valueOf(category.toUpperCase());
        } catch (IllegalArgumentException e) {
            logger.warn("Categoría inválida proporcionada: {}", category);
            return getPopularTags(limit); // Retornar tags populares generales como fallback
        }

        return userTagRepository.findPopularTagsByCategory(category.toUpperCase(), limit)
            .stream()
            .map(UserTagDTO::new)
            .collect(Collectors.toList());
    }

    // ========================================
    // MANTENIMIENTO Y LIMPIEZA
    // ========================================

    /**
     * Limpia tags sin uso automáticamente (ejecutado por scheduler).
     * <p>
     * Elimina tags que no han sido usados en las últimas 2 semanas.
     * Ejecutado diariamente a las 2 AM.
     */
    @Scheduled(cron = "0 0 2 * * *") // Todos los días a las 2 AM
    @Transactional
    public void cleanupUnusedTags() {
        LocalDateTime twoWeeksAgo = LocalDateTime.now().minusWeeks(2);

        int deletedCount = userTagRepository.deleteUnusedTagsOlderThan(twoWeeksAgo);

        if (deletedCount > 0) {
            logger.info("Limpieza automática: {} tags sin uso eliminados", deletedCount);
        }
    }

    /**
     * Actualiza las métricas de popularidad de los tags.
     * <p>
     * Actualiza contadores de uso y marca tags como activos/inactivos.
     * Ejecutado diariamente a las 1:30 AM.
     */
    @Scheduled(cron = "0 30 1 * * *") // Todos los días a la 1:30 AM
    @Transactional
    public void updateTagMetrics() {
        // Actualizar contadores de uso
        userTagRepository.updateUsageCounts();

        // Marcar tags activos/inactivos
        userTagRepository.updateActiveStatus();

        logger.info("Métricas de tags actualizadas correctamente");
    }

    /**
     * Limpieza manual de tags (solo para administradores).
     * <p>
     * Elimina todos los tags que no están siendo usados por ningún usuario.
     *
     * @param adminEmail Email del administrador que ejecuta la limpieza
     * @return Mensaje con cantidad de tags eliminados
     * @throws UnauthorizedException Si el usuario no es administrador
     * @throws NotFoundException     Si el usuario no existe
     */
    @Transactional
    public MessageResponseDTO cleanupUnusedTagsManually(String adminEmail) {
        User admin = findUserByEmail(adminEmail);

        if (isNotAdmin(admin)) {
            throw new UnauthorizedException("Solo los administradores pueden realizar esta acción");
        }

        int deletedCount = userTagRepository.deleteUnusedTags();

        logger.info("Limpieza manual ejecutada por {}: {} tags eliminados", adminEmail, deletedCount);
        return new MessageResponseDTO(String.format("Se eliminaron %d tags sin uso", deletedCount));
    }

    // ========================================
    // MÉTODOS DE VALIDACIÓN Y UTILIDAD
    // ========================================

    /**
     * Normaliza el nombre de un tag.
     * <p>
     * - Convierte a minúsculas
     * - Elimina espacios extras
     * - Remueve caracteres especiales (mantiene solo letras, números y espacios)
     *
     * @param tagName Nombre del tag a normalizar
     * @return Nombre normalizado
     * @throws IllegalArgumentException Si el nombre es null
     */
    private String normalizeTagName(String tagName) {
        if (tagName == null) {
            throw new IllegalArgumentException("El nombre del tag no puede ser nulo");
        }

        return tagName.toLowerCase()
            .trim()
            .replaceAll("\\s+", " ") // Reemplazar múltiples espacios por uno solo
            .replaceAll("[^a-záéíóúñü0-9\\s]", ""); // Mantener solo letras, números y espacios
    }

    /**
     * Valida que el nombre del tag cumple con las reglas del sistema.
     * <p>
     * Reglas:
     * - Mínimo 2 caracteres
     * - Máximo 30 caracteres
     * - No puede ser solo números
     * - No puede ser una palabra prohibida
     *
     * @param tagName Nombre normalizado del tag a validar
     * @throws IllegalArgumentException Si el tag no cumple con las reglas
     */
    private void validateTagName(String tagName) {
        if (tagName.isEmpty()) {
            throw new IllegalArgumentException("El tag no puede estar vacío");
        }

        if (tagName.length() < 2) {
            throw new IllegalArgumentException("El tag debe tener al menos 2 caracteres");
        }

        if (tagName.length() > 30) {
            throw new IllegalArgumentException("El tag no puede tener más de 30 caracteres");
        }

        // Validar que no sea solo números
        if (tagName.matches("^\\d+$")) {
            throw new IllegalArgumentException("El tag no puede ser solo números");
        }

        // Lista de palabras prohibidas (personalízala según tus necesidades)
        List<String> prohibitedWords = List.of("admin", "test", "spam", "fake");
        if (prohibitedWords.contains(tagName)) {
            throw new IllegalArgumentException("Este tag no está permitido");
        }
    }

    /**
     * Busca un usuario por email con manejo de error.
     *
     * @param email Email del usuario
     * @return Usuario encontrado
     * @throws NotFoundException Si el usuario no existe
     */
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    /**
     * Verifica si un usuario NO es administrador.
     *
     * @param user Usuario a verificar
     * @return true si el usuario NO es administrador
     */
    private boolean isNotAdmin(User user) {
        return !(user.getUserRole() != null && "ADMIN".equals(user.getUserRole().getUserRoleList().name()));
    }

    // ========================================
    // MÉTODOS ESPECÍFICOS PARA FEELING
    // ========================================

    /**
     * Obtiene tags sugeridos basados en la categoría de interés del usuario.
     * <p>
     * Útil para SINGLES, ROUSE, SPIRIT.
     * Si el usuario no tiene categoría, retorna tags populares generales.
     *
     * @param userEmail Email del usuario
     * @return Lista de tags sugeridos según su categoría de interés
     * @throws NotFoundException Si el usuario no existe
     */
    public List<UserTagDTO> getTagsSuggestedByCategory(String userEmail) {
        User user = findUserByEmail(userEmail);

        if (user.getCategoryInterest() == null) {
            return getPopularTags(10);
        }

        String category = user.getCategoryInterest().getCategoryInterestEnum().name();
        return getPopularTagsByCategory(category, 15);
    }

    /**
     * Calcula la compatibilidad entre dos usuarios basada en sus tags compartidos.
     * <p>
     * Utiliza el índice de Jaccard para medir similitud:
     * - Compatibilidad = (tags_comunes) / (total_tags_únicos)
     * - Resultado entre 0.0 (sin compatibilidad) y 1.0 (máxima compatibilidad)
     * <p>
     * Este método es fundamental para el algoritmo de matching de la plataforma,
     * permitiendo encontrar usuarios con intereses similares para mejorar
     * la calidad de las sugerencias y conexiones.
     *
     * @param userEmail1 Email del primer usuario
     * @param userEmail2 Email del segundo usuario
     * @return Puntuación de compatibilidad (0.0 - 1.0), donde:
     * - 0.0 = Sin tags en común o uno no tiene tags
     * - 1.0 = Todos los tags son idénticos
     * @throws NotFoundException Si alguno de los usuarios no existe
     */
    public double calculateTagCompatibility(String userEmail1, String userEmail2) {
        User user1 = findUserByEmail(userEmail1);
        User user2 = findUserByEmail(userEmail2);

        if (user1.getTags() == null || user1.getTags().isEmpty() ||
            user2.getTags() == null || user2.getTags().isEmpty()) {
            return 0.0;
        }

        List<UserTag> tags1 = user1.getTags();
        List<UserTag> tags2 = user2.getTags();

        // Contar tags en común
        long commonTags = tags1.stream()
            .filter(tags2::contains)
            .count();

        // Calcular índice de Jaccard: intersección / unión
        double union = tags1.size() + tags2.size() - commonTags;
        return union > 0 ? commonTags / union : 0.0;
    }

    /**
     * Método de utilidad para verificar que las tablas de relación existen
     * Solo usar durante la migración inicial
     */
    @Transactional
    public void verifyDatabaseStructure() {
        try {
            // Verificar que la tabla de relación user_tags_relation existe
            // Si no existe, crear los datos básicos necesarios
            long tagCount = userTagRepository.count();
            logger.info("Total de tags en la base de datos: {}", tagCount);

            if (tagCount == 0) {
                logger.info("No se encontraron tags. Inicializando tags básicos...");
                // Aquí podrías llamar a un método para crear tags iniciales
            }
        } catch (Exception e) {
            logger.error("Error verificando estructura de base de datos: {}", e.getMessage());
        }
    }

    public UserTag findOrCreateTag(String tagName) {
        // Busca un tag por nombre, ignorando mayúsculas y minúsculas
        return userTagRepository.findByNameIgnoreCase(tagName)
            .orElseGet(() -> {
                UserTag newTag = UserTag.builder()
                    .name(tagName.toLowerCase().trim())
                    .createdBy("system") // Asignar un creador por defecto
                    .createdAt(LocalDateTime.now())
                    .usageCount(0L)
                    .lastUsed(LocalDateTime.now())
                    .approvalStatus(UserTagApprovalStatus.PENDING) // Los tags nuevos requieren aprobación (sistema general)
                    .build();
                logger.info("Nuevo tag creado pendiente de aprobación: '{}'", tagName);
                return userTagRepository.save(newTag);
            });
    }

    /**
     * Método específico para complete-profile que crea tags pendientes de aprobación
     */
    public UserTag findOrCreateTagForProfile(String tagName, String userEmail) {
        return userTagRepository.findByNameIgnoreCase(tagName)
            .orElseGet(() -> {
                // Verificar si el usuario es admin para auto-aprobar sus tags
                boolean isAdmin = isUserAdmin(userEmail);

                UserTag newTag = UserTag.builder()
                    .name(tagName.toLowerCase().trim())
                    .createdBy(userEmail) // Usuario que creó el tag
                    .createdAt(LocalDateTime.now())
                    .usageCount(1L) // Empieza con 1 porque el usuario lo está usando
                    .lastUsed(LocalDateTime.now())
                    .approvalStatus(isAdmin ? UserTagApprovalStatus.APPROVED : UserTagApprovalStatus.PENDING) // Los admins auto-aprueban, otros necesitan aprobación
                    .build();

                // Si es admin, agregar información de aprobación
                if (isAdmin) {
                    newTag.setApprovedBy(userEmail);
                    newTag.setApprovedAt(LocalDateTime.now());
                    logger.info("Tag creado y auto-aprobado por administrador '{}': '{}'", userEmail, tagName);
                } else {
                    logger.info("Tag creado por usuario '{}' pendiente de aprobación: '{}'", userEmail, tagName);
                }

                return userTagRepository.save(newTag);
            });
    }

    // ========================================
    // ADMINISTRACIÓN DE TAGS
    // ========================================

    /**
     * Obtiene tags pendientes de aprobación para administradores.
     *
     * @return Lista de tags con estado PENDING
     */
    public List<UserTagDTO> getPendingApprovalTags() {
        return userTagRepository.findPendingApprovalTags()
            .stream()
            .map(UserTagDTO::new)
            .collect(Collectors.toList());
    }

    /**
     * Aprueba un tag específico.
     *
     * @param tagId      ID del tag a aprobar
     * @param adminEmail Email del administrador que aprueba
     * @return Mensaje de confirmación
     * @throws UnauthorizedException Si el usuario no es administrador
     * @throws NotFoundException     Si el tag no existe
     */
    @Transactional
    public MessageResponseDTO approveTag(Long tagId, String adminEmail) {
        User admin = findUserByEmail(adminEmail);
        if (isNotAdmin(admin)) {
            throw new UnauthorizedException("Solo los administradores pueden aprobar tags");
        }

        UserTag tag = userTagRepository.findById(tagId)
            .orElseThrow(() -> new NotFoundException("Tag no encontrado"));

        tag.approve(adminEmail);
        userTagRepository.save(tag);

        logger.info("Tag '{}' aprobado por administrador {}", tag.getName(), adminEmail);
        return new MessageResponseDTO("Tag aprobado correctamente");
    }

    /**
     * Rechaza un tag con razón.
     *
     * @param tagId           ID del tag a rechazar
     * @param rejectionReason Razón del rechazo
     * @param adminEmail      Email del administrador que rechaza
     * @return Mensaje de confirmación
     * @throws UnauthorizedException Si el usuario no es administrador
     * @throws NotFoundException     Si el tag no existe
     */
    @Transactional
    public MessageResponseDTO rejectTag(Long tagId, String rejectionReason, String adminEmail) {
        User admin = findUserByEmail(adminEmail);
        if (isNotAdmin(admin)) {
            throw new UnauthorizedException("Solo los administradores pueden rechazar tags");
        }

        UserTag tag = userTagRepository.findById(tagId)
            .orElseThrow(() -> new NotFoundException("Tag no encontrado"));

        tag.reject(rejectionReason);
        userTagRepository.save(tag);

        logger.info("Tag '{}' rechazado por administrador {}: {}", tag.getName(), adminEmail, rejectionReason);
        return new MessageResponseDTO("Tag rechazado correctamente");
    }

    /**
     * Aprueba múltiples tags en lote
     */
    @Transactional
    public MessageResponseDTO approveBatchTags(List<Long> tagIds, String adminEmail) {
        User admin = findUserByEmail(adminEmail);
        if (isNotAdmin(admin)) {
            throw new UnauthorizedException("Solo los administradores pueden aprobar tags");
        }

        int approvedCount = 0;
        for (Long tagId : tagIds) {
            try {
                UserTag tag = userTagRepository.findById(tagId).orElse(null);
                if (tag != null && !tag.isApproved()) {
                    tag.approve(adminEmail);
                    userTagRepository.save(tag);
                    approvedCount++;
                }
            } catch (Exception e) {
                logger.warn("Error aprobando tag con ID {}: {}", tagId, e.getMessage());
            }
        }

        logger.info("{} tags aprobados en lote por administrador {}", approvedCount, adminEmail);
        return new MessageResponseDTO(String.format("%d tags aprobados correctamente", approvedCount));
    }

    /**
     * Obtiene estadísticas de aprobación de tags
     */
    public Map<String, Object> getTagApprovalStatistics() {
        Map<String, Object> stats = new HashMap<>();

        long totalTags = userTagRepository.count();
        long pendingTags = userTagRepository.countByApprovalStatus(UserTagApprovalStatus.PENDING);
        long approvedTags = totalTags - pendingTags;

        stats.put("totalTags", totalTags);
        stats.put("approvedTags", approvedTags);
        stats.put("pendingTags", pendingTags);
        stats.put("approvalRate", totalTags > 0 ? Math.round((double) approvedTags / totalTags * 100) : 0);

        return stats;
    }

    /**
     * Búsqueda de tags aprobados solamente
     */
    public List<UserTagDTO> searchApprovedTags(String searchTerm, int limit) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return userTagRepository.findTopApprovedPopularTags(
                    org.springframework.data.domain.PageRequest.of(0, limit)
                )
                .stream()
                .map(UserTagDTO::new)
                .collect(Collectors.toList());
        }

        return userTagRepository.searchApprovedTagsByName(searchTerm.trim())
            .stream()
            .limit(limit)
            .map(UserTagDTO::new)
            .collect(Collectors.toList());
    }

    /**
     * Tags populares aprobados solamente
     */
    public List<UserTagDTO> getPopularApprovedTags(int limit) {
        return userTagRepository.findTopApprovedPopularTags(
                org.springframework.data.domain.PageRequest.of(0, limit)
            )
            .stream()
            .map(UserTagDTO::new)
            .collect(Collectors.toList());
    }

    /**
     * Verifica si un usuario es administrador por su email
     */
    private boolean isUserAdmin(String userEmail) {
        try {
            return userRepository.findByEmail(userEmail)
                .map(user -> user.getUserRole().getUserRoleList() == UserRoleList.ADMIN)
                .orElse(false);
        } catch (Exception e) {
            logger.warn("Error al verificar rol de administrador para {}: {}", userEmail, e.getMessage());
            return false;
        }
    }

    // ========================================
    // MISSING PAGINATED METHODS FOR CONTROLLER
    // ========================================

    /**
     * Agregar múltiples tags a un usuario.
     * Optimizado para evitar N+1 queries.
     *
     * @param userEmail Email del usuario
     * @param tagNames  Lista de nombres de tags a agregar
     * @return Lista de tags actuales del usuario después de la operación
     * @throws NotFoundException        si el usuario no existe
     * @throws IllegalArgumentException si se excede el límite de tags permitidos
     */
    @Transactional
    public List<UserTagDTO> addTagsToUser(String userEmail, List<String> tagNames) {
        User user = findUserByEmail(userEmail);

        // Validar que no se agreguen más tags de los permitidos
        int currentTagCount = user.getTags().size();
        int tagsToAddCount = tagNames.size();
        int availableSlots = MAX_TAGS_PER_USER - currentTagCount;

        if (availableSlots <= 0) {
            logger.warn("Usuario {} ya tiene el máximo de tags permitidos ({}/{})",
                userEmail, currentTagCount, MAX_TAGS_PER_USER);
            return getUserTags(userEmail);
        }

        if (tagsToAddCount > availableSlots) {
            logger.warn("Usuario {} intentó agregar {} tags pero solo tiene {} espacios disponibles",
                userEmail, tagsToAddCount, availableSlots);
        }

        // Normalizar nombres de tags y eliminar duplicados
        List<String> normalizedTagNames = tagNames.stream()
            .limit(availableSlots) // Limitar a espacios disponibles
            .map(name -> name.toLowerCase().trim())
            .distinct()
            .toList();

        // Obtener tags existentes del usuario para evitar duplicados
        Set<String> existingTagNames = user.getTags().stream()
            .map(tag -> tag.getName().toLowerCase())
            .collect(Collectors.toSet());

        int addedCount = 0;
        int skippedCount = 0;

        for (String tagName : normalizedTagNames) {
            if (user.getTags().size() >= MAX_TAGS_PER_USER) {
                break;
            }

            // Validar que el tag no esté vacío
            if (tagName.isEmpty()) {
                logger.warn("Tag vacío ignorado para usuario {}", userEmail);
                skippedCount++;
                continue;
            }

            // Verificar que el usuario no tenga ya este tag
            if (existingTagNames.contains(tagName)) {
                logger.debug("Usuario {} ya tiene el tag '{}'", userEmail, tagName);
                skippedCount++;
                continue;
            }

            // Buscar o crear el tag
            UserTag tag = userTagRepository.findByNameIgnoreCase(tagName)
                .orElseGet(() -> {
                    UserTag newTag = new UserTag(tagName, userEmail);
                    logger.info("Nuevo tag creado: '{}' por usuario {}", tagName, userEmail);
                    return userTagRepository.save(newTag);
                });

            // Verificar que el tag esté aprobado (excepto si es el creador)
            if (!tag.isApproved() && !tag.getCreatedBy().equals(userEmail)) {
                logger.warn("Tag '{}' no está aprobado y fue rechazado para usuario {}", tagName, userEmail);
                skippedCount++;
                continue;
            }

            // Agregar tag al usuario
            user.addTag(tag);
            tag.incrementUsage();
            userTagRepository.save(tag);
            existingTagNames.add(tagName); // Actualizar set para evitar duplicados en el mismo lote
            addedCount++;

            logger.debug("Tag '{}' agregado al usuario {}", tagName, userEmail);
        }

        userRepository.save(user);

        logger.info("Operación addTagsToUser completada para {}: {} agregados, {} omitidos",
            userEmail, addedCount, skippedCount);

        // Retornar tags del usuario ya guardado (sin query adicional)
        return user.getTags().stream()
            .map(UserTagDTO::new)
            .collect(Collectors.toList());
    }

    /**
     * Remover tag de usuario por ID.
     * Decrementa el contador de uso y elimina el tag si ya no está en uso.
     *
     * @param userEmail Email del usuario
     * @param tagId     ID del tag a remover
     * @return Mensaje de confirmación
     * @throws NotFoundException si el usuario o tag no existen
     */
    @Transactional
    public MessageResponseDTO removeTagFromUser(String userEmail, Long tagId) {
        User user = findUserByEmail(userEmail);

        UserTag tagToRemove = user.getTags().stream()
            .filter(tag -> tag.getId().equals(tagId))
            .findFirst()
            .orElseThrow(() -> new NotFoundException("Tag no encontrado en el perfil del usuario"));

        user.getTags().remove(tagToRemove);
        tagToRemove.decrementUsage(); // Decrementar contador de uso
        userRepository.save(user);

        // Si el tag no tiene usuarios, eliminarlo
        if (tagToRemove.shouldBeDeleted()) {
            userTagRepository.delete(tagToRemove);
            logger.info("Tag '{}' eliminado por falta de uso", tagToRemove.getName());
        } else {
            userTagRepository.save(tagToRemove);
        }

        logger.debug("Tag '{}' removido del usuario {}", tagToRemove.getName(), userEmail);
        return new MessageResponseDTO("Tag removido exitosamente");
    }

    // ========================================
    // BÚSQUEDA CON PAGINACIÓN
    // ========================================

    /**
     * Busca tags con paginación.
     *
     * @param query    Término de búsqueda
     * @param pageable Configuración de paginación
     * @return Página de tags que coinciden con la búsqueda
     */
    public Page<UserTagDTO> searchTagsPaginated(String query, Pageable pageable) {
        List<UserTagDTO> allTags = searchTags(query, 1000);
        return createPageFromList(allTags, pageable);
    }

    /**
     * Obtiene tags populares con paginación.
     *
     * @param pageable Configuración de paginación
     * @return Página de tags más populares
     */
    public Page<UserTagDTO> getPopularTagsPaginated(Pageable pageable) {
        List<UserTagDTO> allTags = getPopularTags(1000);
        return createPageFromList(allTags, pageable);
    }

    /**
     * Obtiene tags en tendencia con paginación.
     *
     * @param pageable Configuración de paginación
     * @return Página de tags en tendencia
     */
    public Page<UserTagDTO> getTrendingTagsPaginated(Pageable pageable) {
        List<UserTagDTO> allTags = getTrendingTags(1000);
        return createPageFromList(allTags, pageable);
    }

    /**
     * Obtiene sugerencias de tags para usuario con paginación.
     *
     * @param userEmail Email del usuario
     * @param pageable  Configuración de paginación
     * @return Página de tags sugeridos
     * @throws NotFoundException Si el usuario no existe
     */
    public Page<UserTagDTO> getSuggestedTagsForUserPaginated(String userEmail, Pageable pageable) {
        List<UserTagDTO> allTags = getSuggestedTagsForUser(userEmail, 1000);
        return createPageFromList(allTags, pageable);
    }

    /**
     * Obtiene tags pendientes de aprobación con paginación.
     *
     * @param pageable Configuración de paginación
     * @return Página de tags pendientes de aprobación
     */
    public Page<UserTagDTO> getPendingApprovalTagsPaginated(Pageable pageable) {
        List<UserTagDTO> allTags = getPendingApprovalTags();
        return createPageFromList(allTags, pageable);
    }

    /**
     * Crear un nuevo tag (para admin)
     */
    @Transactional
    public UserTag createTag(String tagName, String adminEmail) {
        if (!isUserAdmin(adminEmail)) {
            throw new UnauthorizedException("Solo los administradores pueden crear tags");
        }

        return findOrCreateTag(tagName);
    }

    /**
     * Actualizar un tag existente
     */
    @Transactional
    public UserTagDTO updateTag(Long tagId, String newName) {
        UserTag tag = userTagRepository.findById(tagId)
            .orElseThrow(() -> new NotFoundException("Tag no encontrado"));

        tag.setName(newName.trim().toLowerCase());
        // Note: UserTag entity doesn't have updatedAt field

        UserTag saved = userTagRepository.save(tag);
        return new UserTagDTO(saved);
    }

    /**
     * Crear página a partir de lista
     */
    private Page<UserTagDTO> createPageFromList(List<UserTagDTO> list, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());

        if (start > list.size()) {
            return new PageImpl<>(List.of(), pageable, list.size());
        }

        List<UserTagDTO> subList = list.subList(start, end);
        return new PageImpl<>(subList, pageable, list.size());
    }
}
