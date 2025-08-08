package com.feeling.domain.services.user;

import com.feeling.domain.dto.user.UserCategoryInterestDTO;
import com.feeling.infrastructure.entities.user.UserCategoryInterest;
import com.feeling.infrastructure.entities.user.UserCategoryInterestList;
import com.feeling.infrastructure.repositories.user.IUserCategoryInterestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Collectors;
import com.feeling.domain.dto.response.MessageResponseDTO;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserCategoryInterestService {

    private final IUserCategoryInterestRepository repository;

    /**
     * Obtiene todas las categorías activas
     */
    @Transactional(readOnly = true)
    public List<UserCategoryInterestDTO> getAllActiveCategories() {
        return repository.findByIsActiveTrueOrderByDisplayOrder()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    /**
     * Obtiene todas las categorías (incluyendo inactivas)
     */
    @Transactional(readOnly = true)
    public List<UserCategoryInterestDTO> getAllCategories() {
        return repository.findAllByOrderByDisplayOrder()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    /**
     * Obtiene categoría por enum
     */
    @Transactional(readOnly = true)
    public Optional<UserCategoryInterestDTO> getCategoryByEnum(UserCategoryInterestList categoryEnum) {
        return repository.findByCategoryInterestEnum(categoryEnum)
                .map(this::mapToDTO);
    }

    /**
     * Obtiene categoría por ID
     */
    @Transactional(readOnly = true)
    public Optional<UserCategoryInterestDTO> getCategoryById(Long id) {
        return repository.findById(id)
                .map(this::mapToDTO);
    }

    /**
     * Actualiza una categoría
     */
    @Transactional
    public UserCategoryInterestDTO updateCategory(Long id, UserCategoryInterestDTO categoryDTO) {
        UserCategoryInterest category = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada: " + id));

        // Actualización usando los métodos de acceso del record
        category.setName(categoryDTO.name());
        category.setDescription(categoryDTO.description());
        category.setIcon(categoryDTO.icon());
        category.setFullDescription(categoryDTO.fullDescription());
        category.setTargetAudience(categoryDTO.targetAudience());
        category.setFeatures(categoryDTO.features());
        category.setActive(categoryDTO.isActive());
        category.setDisplayOrder(categoryDTO.displayOrder());

        UserCategoryInterest saved = repository.save(category);
        return mapToDTO(saved);
    }

    /**
     * Activar/Desactivar categoría
     */
    @Transactional
    public UserCategoryInterestDTO toggleCategoryStatus(Long id) {
        UserCategoryInterest category = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada: " + id));

        category.setActive(!category.isActive());
        UserCategoryInterest saved = repository.save(category);
        return mapToDTO(saved);
    }

    /**
     * Crea una nueva categoría de interés
     */
    @Transactional
    public UserCategoryInterestDTO createCategory(UserCategoryInterestDTO categoryDTO) {
        try {
            UserCategoryInterest category = new UserCategoryInterest();
            category.setName(categoryDTO.name());
            category.setDescription(categoryDTO.description());
            category.setIcon(categoryDTO.icon());
            category.setFullDescription(categoryDTO.fullDescription());
            category.setTargetAudience(categoryDTO.targetAudience());
            category.setActive(categoryDTO.isActive());
            category.setDisplayOrder(getNextDisplayOrder());
            
            UserCategoryInterest saved = repository.save(category);
            return mapToDTO(saved);
        } catch (Exception e) {
            log.error("Error creando categoría de interés", e);
            throw new RuntimeException("Error al crear categoría de interés");
        }
    }

    /**
     * Elimina una categoría de interés
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
     * Obtiene estadísticas completas de las categorías de interés
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getInterestsStatistics() {
        try {
            Map<String, Object> statistics = new HashMap<>();
            
            // Obtener todas las categorías
            List<UserCategoryInterest> allCategories = repository.findAll();
            
            // Estadísticas generales
            statistics.put("totalCategories", allCategories.size());
            statistics.put("activeCategories", allCategories.stream().mapToInt(cat -> cat.isActive() ? 1 : 0).sum());
            statistics.put("inactiveCategories", allCategories.stream().mapToInt(cat -> !cat.isActive() ? 1 : 0).sum());
            
            // Distribución por audiencia objetivo
            Map<String, Long> distributionByAudience = allCategories.stream()
                    .filter(cat -> cat.getTargetAudience() != null)
                    .collect(Collectors.groupingBy(
                            UserCategoryInterest::getTargetAudience,
                            Collectors.counting()
                    ));
            statistics.put("distributionByTargetAudience", distributionByAudience);
            
            // Categorías activas por audiencia
            Map<String, Long> activeByAudience = allCategories.stream()
                    .filter(UserCategoryInterest::isActive)
                    .filter(cat -> cat.getTargetAudience() != null)
                    .collect(Collectors.groupingBy(
                            UserCategoryInterest::getTargetAudience,
                            Collectors.counting()
                    ));
            statistics.put("activeByTargetAudience", activeByAudience);
            
            // Lista de categorías más populares (ordenadas por display order)
            List<String> popularCategories = allCategories.stream()
                    .filter(UserCategoryInterest::isActive)
                    .sorted((a, b) -> Integer.compare(a.getDisplayOrder(), b.getDisplayOrder()))
                    .limit(10)
                    .map(UserCategoryInterest::getName)
                    .collect(Collectors.toList());
            statistics.put("topCategories", popularCategories);
            
            return statistics;
            
        } catch (Exception e) {
            log.error("Error obteniendo estadísticas de intereses", e);
            return Map.of(
                    "error", "Error al obtener estadísticas",
                    "message", e.getMessage()
            );
        }
    }

    /**
     * Obtiene el siguiente displayOrder disponible
     */
    private Integer getNextDisplayOrder() {
        return repository.findAll()
                .stream()
                .mapToInt(UserCategoryInterest::getDisplayOrder)
                .max()
                .orElse(0) + 1;
    }

    /**
     * Mapea entidad a DTO usando constructor del record
     */
    private UserCategoryInterestDTO mapToDTO(UserCategoryInterest entity) {
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
        
        return new UserCategoryInterestDTO(
                entity.getId(),
                entity.getCategoryInterestEnum().name(),
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
}