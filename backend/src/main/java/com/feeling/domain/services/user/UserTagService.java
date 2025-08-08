package com.feeling.domain.services.user;

import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.UserTagDTO;
import com.feeling.domain.dto.user.UserTagStatisticsDTO;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.entities.user.UserCategoryInterestList;
import com.feeling.infrastructure.entities.user.UserRoleList;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import com.feeling.domain.dto.user.UserPublicResponseDTO;

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

        return userTagRepository.findSuggestedTagsExcluding(userTagNames)
                .stream()
                .limit(limit)
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

        if (user.getCategoryInterest() == null) {
            return getPopularTags(10);
        }

        String category = user.getCategoryInterest().getCategoryInterestEnum().name();
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
        if (user.getCategoryInterest() != null) {
            categoryFilter = user.getCategoryInterest().getCategoryInterestEnum().name();
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
                            .approved(false) // Los tags nuevos requieren aprobación (sistema general)
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
                            .approved(isAdmin) // Los admins auto-aprueban, otros necesitan aprobación
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
     * Obtiene tags pendientes de aprobación para administradores
     */
    public List<UserTagDTO> getPendingApprovalTags() {
        return userTagRepository.findByApprovedFalseOrApprovedIsNull()
                .stream()
                .map(UserTagDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Aprueba un tag específico
     */
    @Transactional
    public MessageResponseDTO approveTag(Long tagId, String adminEmail) {
        User admin = findUserByEmail(adminEmail);
        if (!isAdmin(admin)) {
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
     * Rechaza un tag con razón
     */
    @Transactional
    public MessageResponseDTO rejectTag(Long tagId, String rejectionReason, String adminEmail) {
        User admin = findUserByEmail(adminEmail);
        if (!isAdmin(admin)) {
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
        if (!isAdmin(admin)) {
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
        long pendingTags = userTagRepository.countPendingApprovalTags();
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
            return userTagRepository.findTopApprovedPopularTags(limit)
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
        return userTagRepository.findTopApprovedPopularTags(limit)
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
     * Agregar múltiples tags a un usuario
     */
    @Transactional
    public List<UserTagDTO> addTagsToUser(String userEmail, List<String> tagNames) {
        User user = findUserByEmail(userEmail);
        
        for (String tagName : tagNames) {
            if (user.getTags().size() >= MAX_TAGS_PER_USER) {
                break; // No agregar más si ya alcanzó el límite
            }
            addTagToUser(userEmail, tagName);
        }
        
        return getUserTags(userEmail);
    }

    /**
     * Remover tag de usuario por ID
     */
    @Transactional
    public MessageResponseDTO removeTagFromUser(String userEmail, Long tagId) {
        User user = findUserByEmail(userEmail);
        
        UserTag tagToRemove = user.getTags().stream()
                .filter(tag -> tag.getId().equals(tagId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Tag no encontrado en el perfil del usuario"));
                
        user.getTags().remove(tagToRemove);
        userRepository.save(user);
        
        return new MessageResponseDTO("Tag removido exitosamente");
    }

    /**
     * Buscar tags con paginación
     */
    public Page<UserTagDTO> searchTagsPaginated(String query, Pageable pageable) {
        List<UserTagDTO> allTags = searchTags(query, 1000); // Get a large number
        return createPageFromList(allTags, pageable);
    }

    /**
     * Obtener tags populares con paginación
     */
    public Page<UserTagDTO> getPopularTagsPaginated(Pageable pageable) {
        List<UserTagDTO> allTags = getPopularTags(1000);
        return createPageFromList(allTags, pageable);
    }

    /**
     * Obtener tags en tendencia con paginación
     */
    public Page<UserTagDTO> getTrendingTagsPaginated(Pageable pageable) {
        List<UserTagDTO> allTags = getTrendingTags(1000);
        return createPageFromList(allTags, pageable);
    }

    /**
     * Obtener sugerencias de tags para usuario con paginación
     */
    public Page<UserTagDTO> getSuggestedTagsForUserPaginated(String userEmail, Pageable pageable) {
        List<UserTagDTO> allTags = getSuggestedTagsForUser(userEmail, 1000);
        return createPageFromList(allTags, pageable);
    }

    /**
     * Obtener usuarios por tags con paginación
     */
    public Page<UserPublicResponseDTO> getUsersByTags(List<String> tags, Pageable pageable) {
        // For now, return empty page since we need UserService integration
        logger.warn("getUsersByTags not fully implemented - returning empty page");
        return Page.empty(pageable);
    }

    /**
     * Obtener tags pendientes de aprobación con paginación
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
