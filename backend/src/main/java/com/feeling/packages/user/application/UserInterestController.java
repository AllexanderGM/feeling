package com.feeling.packages.user.application;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.user.domain.dto.UserCategoryInterestDTO;
import com.feeling.packages.user.domain.dto.request.UserCategoryInterestRequestDTO;
import com.feeling.packages.user.domain.services.UserCategoryInterestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador para gestión de categorías de interés de usuario.
 * <p>
 * Responsabilidades del cliente:
 * - Consulta de todas las categorías de interés activas
 * - Consulta de categoría específica por ID
 * <p>
 * Responsabilidades de admin:
 * - Creación de nuevas categorías de interés
 * - Actualización de categorías existentes
 * - Eliminación de categorías
 * - Consulta de todas las categorías (incluyendo inactivas)
 * - Activar/desactivar categorías (toggle complaintStatus)
 * <p>
 * Las categorías de interés representan los tipos de relación que buscan
 * los usuarios en la plataforma (ESSENCE, HARMONY, CONNECTION, etc.).
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/user-interests")
@RequiredArgsConstructor
@Tag(name = "User Interests", description = "Endpoints de gestión de intereses de usuario")
public class UserInterestController {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(UserInterestController.class);

    private final UserCategoryInterestService categoryService;

    // ========================================
    // CLIENT ENDPOINTS (AUTHENTICATED)
    // ========================================

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener todas las categorías de interés",
        description = "Obtiene todas las categorías de interés disponibles (usuarios autenticados)")
    public ResponseEntity<List<UserCategoryInterestDTO>> getAllInterests() {
        try {
            List<UserCategoryInterestDTO> categories = categoryService.getAllActiveCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            logger.error("Error obteniendo categorías de interés", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener categoría de interés por ID",
        description = "Obtiene una categoría de interés específica por ID (usuarios autenticados)")
    public ResponseEntity<UserCategoryInterestDTO> getInterestById(
        @Parameter(description = "ID del interés") @PathVariable Long id) {
        try {
            return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error obteniendo categoría de interés por ID", Map.of("id", id), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========================================
    // ADMIN ENDPOINTS
    // ========================================

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Crear nueva categoría de interés",
        description = "Agrega una nueva categoría de interés (solo admin)")
    public ResponseEntity<UserCategoryInterestDTO> createInterest(
        @Valid @RequestBody UserCategoryInterestRequestDTO categoryDTO) {
        try {
            UserCategoryInterestDTO createdCategory = categoryService.createCategory(categoryDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
        } catch (Exception e) {
            logger.error("Error creando categoría de interés", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{interestId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Actualizar categoría de interés",
        description = "Actualiza una categoría de interés existente (solo admin)")
    public ResponseEntity<UserCategoryInterestDTO> updateInterest(
        @Parameter(description = "ID del interés") @PathVariable Long interestId,
        @Valid @RequestBody UserCategoryInterestRequestDTO categoryDTO) {
        try {
            UserCategoryInterestDTO updated = categoryService.updateCategory(interestId, categoryDTO);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.error("Error actualizando categoría de interés", Map.of("interestId", interestId), e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error inesperado actualizando categoría de interés", Map.of("interestId", interestId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{interestId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Eliminar categoría de interés",
        description = "Elimina una categoría de interés existente (solo admin)")
    public ResponseEntity<MessageResponseDTO> deleteInterest(
        @Parameter(description = "ID del interés") @PathVariable Long interestId) {
        try {
            MessageResponseDTO response = categoryService.deleteCategory(interestId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Error eliminando categoría de interés", Map.of("interestId", interestId), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponseDTO("Categoría de interés no encontrada"));
        } catch (Exception e) {
            logger.error("Error inesperado eliminando categoría de interés", Map.of("interestId", interestId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al eliminar categoría de interés"));
        }
    }

    // ========================================
    // ADDITIONAL ADMIN ENDPOINTS
    // ========================================

    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener todas las categorías de interés (admin)",
        description = "Obtiene todas las categorías de interés incluyendo las inactivas (solo admin)")
    public ResponseEntity<List<UserCategoryInterestDTO>> getAllInterestsAdmin() {
        try {
            List<UserCategoryInterestDTO> categories = categoryService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            logger.error("Error obteniendo todas las categorías de interés (admin)", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PatchMapping("/{interestId}/toggle-status")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Alternar estado de categoría de interés",
        description = "Activa/desactiva una categoría de interés (solo admin)")
    public ResponseEntity<UserCategoryInterestDTO> toggleInterestStatus(
        @Parameter(description = "ID del interés") @PathVariable Long interestId) {
        try {
            UserCategoryInterestDTO updated = categoryService.toggleCategoryStatus(interestId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.error("Error cambiando estado de categoría de interés", Map.of("interestId", interestId), e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error inesperado cambiando estado de categoría", Map.of("interestId", interestId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
