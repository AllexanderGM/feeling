package com.feeling.application.controllers.user;

import com.feeling.domain.dto.user.UserCategoryInterestDTO;
import com.feeling.domain.services.user.UserCategoryInterestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category-interests")
@RequiredArgsConstructor
public class UserCategoryInterestController {

    private final UserCategoryInterestService categoryService;

    /**
     * Obtiene todas las categorías activas para el frontend
     * GET /category-interests
     */
    @GetMapping
    public ResponseEntity<List<UserCategoryInterestDTO>> getActiveCategories() {
        List<UserCategoryInterestDTO> categories = categoryService.getAllActiveCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Obtiene todas las categorías (para admin)
     * GET /category-interests/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<UserCategoryInterestDTO>> getAllCategories() {
        List<UserCategoryInterestDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Obtiene categoría por ID
     * GET /category-interests/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserCategoryInterestDTO> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Actualiza una categoría (solo admin)
     * PUT /category-interests/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserCategoryInterestDTO> updateCategory(
            @PathVariable Long id,
            @RequestBody UserCategoryInterestDTO categoryDTO) {

        UserCategoryInterestDTO updated = categoryService.updateCategory(id, categoryDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * Activa/Desactiva una categoría (solo admin)
     * PATCH /category-interests/{id}/toggle-status
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<UserCategoryInterestDTO> toggleCategoryStatus(@PathVariable Long id) {
        UserCategoryInterestDTO updated = categoryService.toggleCategoryStatus(id);
        return ResponseEntity.ok(updated);
    }
}
