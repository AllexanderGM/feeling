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
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserCategoryInterestService {

    private final IUserCategoryInterestRepository repository;

    /**
     * Obtiene todas las categorías activas
     */
    public List<UserCategoryInterestDTO> getAllActiveCategories() {
        return repository.findByIsActiveTrueOrderByDisplayOrder()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    /**
     * Obtiene todas las categorías (incluyendo inactivas)
     */
    public List<UserCategoryInterestDTO> getAllCategories() {
        return repository.findAllByOrderByDisplayOrder()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    /**
     * Obtiene categoría por enum
     */
    public Optional<UserCategoryInterestDTO> getCategoryByEnum(UserCategoryInterestList categoryEnum) {
        return repository.findByCategoryInterestEnum(categoryEnum)
                .map(this::mapToDTO);
    }

    /**
     * Obtiene categoría por ID
     */
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
     * Mapea entidad a DTO usando constructor del record
     */
    private UserCategoryInterestDTO mapToDTO(UserCategoryInterest entity) {
        return new UserCategoryInterestDTO(
                entity.getId(),
                entity.getCategoryInterestEnum().name(),
                entity.getName(),
                entity.getDescription(),
                entity.getIcon(),
                entity.getFullDescription(),
                entity.getTargetAudience(),
                entity.getFeatures(),
                entity.isActive(),
                entity.getDisplayOrder(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}