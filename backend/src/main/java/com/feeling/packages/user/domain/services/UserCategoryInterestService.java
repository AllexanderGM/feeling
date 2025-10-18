package com.feeling.packages.user.domain.services;

import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.user.domain.dto.interest.UserInterestRequestDTO;
import com.feeling.packages.user.domain.dto.interest.UserInterestResponseDTO;
import com.feeling.packages.user.domain.dto.interest.UserInterestStatisticsResponseDTO;
import com.feeling.packages.user.domain.enums.UserCategoryInterestList;
import com.feeling.packages.user.infrastructure.entities.UserCategoryInterest;
import com.feeling.packages.user.infrastructure.repositories.IUserCategoryInterestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Servicio para gestión de categorías de interés de usuarios.
 * <p>
 * Responsabilidades:
 * - CRUD de categorías de interés (deportes, música, arte, tecnología, etc.)
 * - Gestión de estado activo/inactivo de categorías
 * - Ordenamiento por displayOrder
 * - Estadísticas de uso de categorías
 * - Mapeo seguro de entidades a DTOs con manejo de lazy loading
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserCategoryInterestService {

    private final IUserCategoryInterestRepository repository;

    /**
     * Obtiene todas las categorías activas ordenadas por displayOrder.
     *
     * @return Lista de categorías activas
     */
    @Transactional(readOnly = true)
    public List<UserInterestResponseDTO> getAllActiveCategories() {
        return repository.findByIsActiveTrueOrderByDisplayOrder()
            .stream()
            .map(this::mapToDTO)
            .toList();
    }

    /**
     * Obtiene todas las categorías (incluyendo inactivas) ordenadas por displayOrder.
     *
     * @return Lista de todas las categorías
     */
    @Transactional(readOnly = true)
    public List<UserInterestResponseDTO> getAllCategories() {
        return repository.findAllByOrderByDisplayOrder()
            .stream()
            .map(this::mapToDTO)
            .toList();
    }

    /**
     * Obtiene categoría por su enum.
     *
     * @param categoryEnum Enum de la categoría
     * @return Optional con la categoría si existe
     */
    @Transactional(readOnly = true)
    public Optional<UserInterestResponseDTO> getCategoryByEnum(UserCategoryInterestList categoryEnum) {
        return repository.findByCategoryInterestEnum(categoryEnum)
            .map(this::mapToDTO);
    }

    /**
     * Obtiene categoría por ID.
     *
     * @param id ID de la categoría
     * @return Optional con la categoría si existe
     */
    @Transactional(readOnly = true)
    public Optional<UserInterestResponseDTO> getCategoryById(Long id) {
        return repository.findById(id)
            .map(this::mapToDTO);
    }

    /**
     * Actualiza una categoría existente.
     *
     * @param id          ID de la categoría a actualizar
     * @param categoryDTO DTO con nuevos datos
     * @return DTO de la categoría actualizada
     * @throws RuntimeException Si la categoría no existe
     */
    @Transactional
    public UserInterestResponseDTO updateCategory(Long id, UserInterestRequestDTO categoryDTO) {
        UserCategoryInterest category = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada: " + id));

        // Actualización usando los métodos de acceso del record
        if (categoryDTO.interestEnum() != null) {
            category.setCategoryInterestEnum(parseCategoryEnum(categoryDTO.interestEnum()));
        }
        category.setName(categoryDTO.name());
        category.setDescription(categoryDTO.description());
        category.setIcon(categoryDTO.icon());
        category.setFullDescription(categoryDTO.fullDescription());
        category.setTargetAudience(categoryDTO.targetAudience());
        category.setFeatures(new java.util.ArrayList<>(categoryDTO.features()));
        category.setActive(Boolean.TRUE.equals(categoryDTO.active()));
        if (categoryDTO.displayOrder() != null) {
            category.setDisplayOrder(categoryDTO.displayOrder());
        }

        UserCategoryInterest saved = repository.save(category);
        return mapToDTO(saved);
    }

    /**
     * Activa o desactiva una categoría (toggle del estado).
     *
     * @param id ID de la categoría
     * @return DTO de la categoría con estado actualizado
     * @throws RuntimeException Si la categoría no existe
     */
    @Transactional
    public UserInterestResponseDTO toggleCategoryStatus(Long id) {
        UserCategoryInterest category = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada: " + id));

        category.setActive(!category.isActive());
        UserCategoryInterest saved = repository.save(category);
        return mapToDTO(saved);
    }

    /**
     * Crea una nueva categoría de interés.
     *
     * @param categoryDTO DTO con datos de la nueva categoría
     * @return DTO de la categoría creada
     * @throws RuntimeException Si hay error al crear la categoría
     */
    @Transactional
    public UserInterestResponseDTO createCategory(UserInterestRequestDTO categoryDTO) {
        try {
            UserCategoryInterest category = new UserCategoryInterest();
            category.setCategoryInterestEnum(parseCategoryEnum(categoryDTO.interestEnum()));
            category.setName(categoryDTO.name());
            category.setDescription(categoryDTO.description());
            category.setIcon(categoryDTO.icon());
            category.setFullDescription(categoryDTO.fullDescription());
            category.setTargetAudience(categoryDTO.targetAudience());
            category.setFeatures(new java.util.ArrayList<>(categoryDTO.features()));
            category.setActive(Boolean.TRUE.equals(categoryDTO.active()));
            Integer displayOrder = categoryDTO.displayOrder() != null
                ? categoryDTO.displayOrder()
                : getNextDisplayOrder();
            category.setDisplayOrder(displayOrder);

            UserCategoryInterest saved = repository.save(category);
            return mapToDTO(saved);
        } catch (Exception e) {
            log.error("Error creando categoría de interés", e);
            throw new RuntimeException("Error al crear categoría de interés");
        }
    }

    /**
     * Elimina una categoría de interés del sistema.
     *
     * @param id ID de la categoría a eliminar
     * @return Mensaje de confirmación
     * @throws RuntimeException Si la categoría no existe o hay error al eliminar
     */
    @Transactional
    public MessageResponseDTO deleteCategory(Long id) {
        try {
            UserCategoryInterest category = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada: " + id));

            repository.delete(category);
            return new MessageResponseDTO("Categoría eliminada exitosamente");
        } catch (Exception e) {
            log.error("Error eliminando categoría: {}", id, e);
            throw new RuntimeException("Error al eliminar categoría");
        }
    }

    /**
     * Obtiene estadísticas completas de las categorías de interés.
     * <p>
     * Incluye:
     * - Total de categorías (activas/inactivas)
     * - Distribución por audiencia objetivo
     * - Top 10 categorías más populares
     *
     * @return DTO con estadísticas detalladas
     */
    @Transactional(readOnly = true)
    public UserInterestStatisticsResponseDTO getInterestsStatistics() {
        try {
            // Obtener todas las categorías
            List<UserCategoryInterest> allCategories = repository.findAll();

            // Estadísticas generales
            int totalCategories = allCategories.size();
            int activeCategories = (int) allCategories.stream().filter(UserCategoryInterest::isActive).count();
            int inactiveCategories = totalCategories - activeCategories;

            // Distribución por audiencia objetivo
            Map<String, Long> distributionByAudience = allCategories.stream()
                .filter(cat -> cat.getTargetAudience() != null)
                .collect(Collectors.groupingBy(
                    UserCategoryInterest::getTargetAudience,
                    Collectors.counting()
                ));

            // Categorías activas por audiencia
            Map<String, Long> activeByAudience = allCategories.stream()
                .filter(UserCategoryInterest::isActive)
                .filter(cat -> cat.getTargetAudience() != null)
                .collect(Collectors.groupingBy(
                    UserCategoryInterest::getTargetAudience,
                    Collectors.counting()
                ));

            // Lista de categorías más populares (ordenadas por display order)
            List<String> popularCategories = allCategories.stream()
                .filter(UserCategoryInterest::isActive)
                .sorted((a, b) -> Integer.compare(a.getDisplayOrder(), b.getDisplayOrder()))
                .limit(10)
                .map(UserCategoryInterest::getName)
                .collect(Collectors.toList());

            return new UserInterestStatisticsResponseDTO(
                totalCategories,
                activeCategories,
                inactiveCategories,
                distributionByAudience,
                activeByAudience,
                popularCategories
            );

        } catch (Exception e) {
            log.error("Error obteniendo estadísticas de intereses", e);
            return new UserInterestStatisticsResponseDTO(0, 0, 0, Map.of(), Map.of(), List.of());
        }
    }

    /**
     * Obtiene el siguiente displayOrder disponible para una nueva categoría.
     *
     * @return Siguiente número de orden disponible
     */
    private Integer getNextDisplayOrder() {
        return repository.findAll()
            .stream()
            .mapToInt(UserCategoryInterest::getDisplayOrder)
            .max()
            .orElse(0) + 1;
    }

    /**
     * Mapea entidad a DTO usando constructor del record.
     * <p>
     * Maneja el lazy loading de la colección features de forma segura,
     * forzando su inicialización dentro de la sesión transaccional.
     *
     * @param entity Entidad a mapear
     * @return DTO mapeado con todos los datos
     */
    private UserInterestResponseDTO mapToDTO(UserCategoryInterest entity) {
        // Inicializar features dentro de la sesión transaccional
        List<String> features = null;
        try {
            // Forzar la inicialización de la colección lazy dentro de la sesión
            features = entity.getFeatures();
            if (features != null) {
                // Forzar la carga tocando la colección
                features.size();
            }
        } catch (Exception e) {
            log.warn("No se pudieron cargar las features para la categoría {}: {}", entity.getId(), e.getMessage());
            features = List.of(); // Lista vacía como fallback
        }

        return new UserInterestResponseDTO(
            entity.getId(),
            entity.getCategoryInterestEnum() != null ? entity.getCategoryInterestEnum().name() : null,
            entity.getName(),
            entity.getDescription(),
            entity.getIcon(),
            entity.getFullDescription(),
            entity.getTargetAudience(),
            features,
            entity.isActive(),
            entity.getDisplayOrder(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }

    private UserCategoryInterestList parseCategoryEnum(String enumValue) {
        if (enumValue == null || enumValue.isBlank()) {
            throw new IllegalArgumentException("El campo interestEnum es obligatorio");
        }

        try {
            return UserCategoryInterestList.valueOf(enumValue.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                "Valor inválido para interestEnum: " + enumValue +
                    ". Valores permitidos: " + java.util.Arrays.toString(UserCategoryInterestList.values()),
                ex
            );
        }
    }
}
