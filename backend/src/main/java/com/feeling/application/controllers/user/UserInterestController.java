package com.feeling.application.controllers.user;

import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.UserCategoryInterestDTO;
import com.feeling.domain.services.user.UserCategoryInterestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-interests")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Interests", description = "User interests management endpoints")
public class UserInterestController {

    private final UserCategoryInterestService categoryService;

    // ========================================
    // CLIENT ENDPOINTS (AUTHENTICATED)
    // ========================================

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all interest categories", 
               description = "Get all available interest categories (authenticated users)")
    public ResponseEntity<List<UserCategoryInterestDTO>> getAllInterests() {
        try {
            List<UserCategoryInterestDTO> categories = categoryService.getAllActiveCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("Error obteniendo categorías de interés", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get interest category by ID", 
               description = "Get specific interest category by ID (authenticated users)")
    public ResponseEntity<UserCategoryInterestDTO> getInterestById(
            @Parameter(description = "Interest ID") @PathVariable Long id) {
        try {
            return categoryService.getCategoryById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error obteniendo categoría de interés por ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========================================
    // ADMIN ENDPOINTS
    // ========================================

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Create new interest category", 
               description = "Add a new interest category (admin only)")
    public ResponseEntity<UserCategoryInterestDTO> createInterest(
            @Valid @RequestBody UserCategoryInterestDTO categoryDTO) {
        try {
            UserCategoryInterestDTO createdCategory = categoryService.createCategory(categoryDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
        } catch (Exception e) {
            log.error("Error creando categoría de interés", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{interestId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Update interest category", 
               description = "Update an existing interest category (admin only)")
    public ResponseEntity<UserCategoryInterestDTO> updateInterest(
            @Parameter(description = "Interest ID") @PathVariable Long interestId,
            @Valid @RequestBody UserCategoryInterestDTO categoryDTO) {
        try {
            UserCategoryInterestDTO updated = categoryService.updateCategory(interestId, categoryDTO);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            log.error("Error actualizando categoría de interés: {}", interestId, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error inesperado actualizando categoría de interés: {}", interestId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{interestId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Delete interest category", 
               description = "Delete an existing interest category (admin only)")
    public ResponseEntity<MessageResponseDTO> deleteInterest(
            @Parameter(description = "Interest ID") @PathVariable Long interestId) {
        try {
            MessageResponseDTO response = categoryService.deleteCategory(interestId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error eliminando categoría de interés: {}", interestId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponseDTO("Categoría de interés no encontrada"));
        } catch (Exception e) {
            log.error("Error inesperado eliminando categoría de interés: {}", interestId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDTO("Error al eliminar categoría de interés"));
        }
    }

    // ========================================
    // ADDITIONAL ADMIN ENDPOINTS
    // ========================================

    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get all interest categories (admin)", 
               description = "Get all interest categories including inactive ones (admin only)")
    public ResponseEntity<List<UserCategoryInterestDTO>> getAllInterestsAdmin() {
        try {
            List<UserCategoryInterestDTO> categories = categoryService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("Error obteniendo todas las categorías de interés (admin)", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PatchMapping("/{interestId}/toggle-status")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Toggle interest category status", 
               description = "Activate/deactivate an interest category (admin only)")
    public ResponseEntity<UserCategoryInterestDTO> toggleInterestStatus(
            @Parameter(description = "Interest ID") @PathVariable Long interestId) {
        try {
            UserCategoryInterestDTO updated = categoryService.toggleCategoryStatus(interestId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            log.error("Error cambiando estado de categoría de interés: {}", interestId, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error inesperado cambiando estado de categoría: {}", interestId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}