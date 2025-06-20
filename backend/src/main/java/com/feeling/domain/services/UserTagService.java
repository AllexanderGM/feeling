package com.feeling.domain.services;

import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.UserTagDTO;
import com.feeling.domain.dto.user.UserTagStatisticsDTO;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.entities.user.UserCategoryInterestList;
import com.feeling.infrastructure.entities.user.UserTag;
import com.feeling.infrastructure.repositories.user.IUserRepository;
import com.feeling.infrastructure.repositories.user.IUserTagRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserTagService {

    private static final Logger logger = LoggerFactory.getLogger(UserTagService.class);
    private static final int MAX_TAGS_PER_USER = 10; // Límite máximo de tags por usuario

    private final IUserTagRepository userTagRepository;
    private final IUserRepository userRepository;

    // ========================================
    // GESTIÓN DE TAGS POR USUARIOS
    // ========================================

    /**
     * Añade un tag al perfil de un usuario. Si el tag no existe, lo crea.
     * Valida que el usuario no exceda el límite máximo de tags.
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
        userRepository.save(user);

        logger.info("Tag '{}' añadido al usuario {}", normalizedTagName, userEmail);
        return tag;
    }

    /**
     * Remueve un tag del perfil de un usuario
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
     * Obtiene todos los tags de un usuario
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
     * Reemplaza todos los tags de un usuario con una nueva lista
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
     * Busca tags por nombre
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
     * Obtiene los tags más populares
     */
    public List<UserTagDTO> getPopularTags(int limit) {
        return userTagRepository.findTopPopularTags(limit)
                .stream()
                .map(UserTagDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene los tags en tendencia (usados recientemente)
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
     * Obtiene sugerencias de tags para un usuario basadas en lo que no tiene
     * y en tags populares de usuarios similares
     */
    public List<UserTagDTO> getSuggestedTagsForUser(String userEmail, int limit) {
        User user = findUserByEmail(userEmail);

        // Obtener tags que el usuario no tiene pero que son populares
        List<String> userTagNames = user.getTagNames();

        return userTagRepository.findSuggestedTagsExcluding(userTagNames, limit)
                .stream()
                .map(UserTagDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Encuentra usuarios que comparten tags similares para matching
     */
    public List<String> findUsersWithSimilarTags(String userEmail, int limit) {
        User user = findUserByEmail(userEmail);

        if (user.getTags() == null || user.getTags().isEmpty()) {
            return List.of();
        }

        List<String> userTagNames = user.getTagNames();

        return userTagRepository.findUsersWithSimilarTags(userTagNames, userEmail, limit);
    }

    // ========================================
    // ESTADÍSTICAS Y ANÁLISIS
    // ========================================

    /**
     * Obtiene estadísticas generales de los tags del sistema
     */
    public UserTagStatisticsDTO getTagStatistics() {
        long totalTags = userTagRepository.count();
        long activeTags = userTagRepository.countActiveTags();
        long uniqueUsersWithTags = userTagRepository.countUniqueUsersWithTags();
        Double averageTagsPerUser = userTagRepository.getAverageTagsPerUser();
        Double averageUsageCount = userTagRepository.getAverageUsageCount();

        return UserTagStatisticsDTO.builder()
                .totalTags(totalTags)
                .activeTags(activeTags)
                .unusedTags(totalTags - activeTags)
                .uniqueUsersWithTags(uniqueUsersWithTags)
                .averageTagsPerUser(averageTagsPerUser != null ? averageTagsPerUser : 0.0)
                .averageUsageCount(averageUsageCount != null ? averageUsageCount : 0.0)
                .build();
    }

    /**
     * Obtiene tags populares por categoría de interés
     * Útil para SINGLES, ROUSE, SPIRIT
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
     * Limpia tags sin uso automáticamente (ejecutado por scheduler)
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
     * Actualiza las métricas de popularidad de los tags
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
     * Limpieza manual de tags (solo para administradores)
     */
    @Transactional
    public MessageResponseDTO cleanupUnusedTagsManually(String adminEmail) {
        User admin = findUserByEmail(adminEmail);

        if (!isAdmin(admin)) {
            throw new UnauthorizedException("Solo los administradores pueden realizar esta acción");
        }

        int deletedCount = userTagRepository.deleteAllUnusedTags();

        logger.info("Limpieza manual ejecutada por {}: {} tags eliminados", adminEmail, deletedCount);
        return new MessageResponseDTO(String.format("Se eliminaron %d tags sin uso", deletedCount));
    }

    // ========================================
    // MÉTODOS DE VALIDACIÓN Y UTILIDAD
    // ========================================

    /**
     * Normaliza el nombre de un tag
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
     * Valida que el nombre del tag cumple con las reglas
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
     * Busca un usuario por email
     */
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    /**
     * Verifica si un usuario es administrador
     */
    private boolean isAdmin(User user) {
        return user.getUserRole() != null &&
                "ADMIN".equals(user.getUserRole().getUserRoleList().name());
    }

    // ========================================
    // MÉTODOS ESPECÍFICOS PARA FEELING
    // ========================================

    /**
     * Obtiene tags sugeridos basados en la categoría de interés del usuario
     * Útil para SINGLES, ROUSE, SPIRIT
     */
    public List<UserTagDTO> getTagsSuggestedByCategory(String userEmail) {
        User user = findUserByEmail(userEmail);

        if (user.getUserCategoryInterest() == null) {
            return getPopularTags(10);
        }

        String category = user.getUserCategoryInterest().getCategoryInterest().name();
        return getPopularTagsByCategory(category, 15);
    }

    /**
     * Calcula la compatibilidad entre dos usuarios basada en tags compartidos
     * Útil para el algoritmo de matching
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
     * Obtiene recomendaciones de usuarios para matching basadas en tags
     * Específico para el sistema de matching de Feeling
     */
    public List<String> getMatchRecommendationsByTags(String userEmail, int limit) {
        User user = findUserByEmail(userEmail);

        if (user.getTags() == null || user.getTags().isEmpty()) {
            return List.of();
        }

        // Filtrar por categoría de interés si existe
        String categoryFilter = null;
        if (user.getUserCategoryInterest() != null) {
            categoryFilter = user.getUserCategoryInterest().getCategoryInterest().name();
        }

        return userTagRepository.findMatchCandidatesByTags(
                user.getTagNames(),
                userEmail,
                categoryFilter,
                limit
        );
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

    public UserTag findOrCreateTag(String lowerCase) {
        // Busca un tag por nombre, ignorando mayúsculas y minúsculas
        return userTagRepository.findByNameIgnoreCase(lowerCase)
                .orElseGet(() -> {
                    UserTag newTag = UserTag.builder()
                            .name(lowerCase)
                            .createdBy("system") // Asignar un creador por defecto
                            .createdAt(LocalDateTime.now())
                            .usageCount(0L)
                            .lastUsed(LocalDateTime.now())
                            .build();
                    return userTagRepository.save(newTag);
                });
    }
}
