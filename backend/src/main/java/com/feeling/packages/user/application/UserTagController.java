package com.feeling.packages.user.application;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.user.domain.dto.UserTagDTO;
import com.feeling.packages.user.domain.dto.request.UserTagRequestDTO;
import com.feeling.packages.user.domain.services.UserService;
import com.feeling.packages.user.domain.services.UserTagService;
import com.feeling.packages.user.infrastructure.entities.UserTag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador para gestión de tags de usuario.
 * <p>
 * Responsabilidades del cliente:
 * - Gestión personal de tags (obtener, añadir, reemplazar, eliminar)
 * - Búsqueda de tags por query
 * - Consulta de tags populares y trending
 * - Sugerencias personalizadas de tags
 * <p>
 * Responsabilidades de admin:
 * - Consulta de tags pendientes de aprobación
 * - Creación de tags
 * - Actualización de tags
 * - Aprobación/rechazo de tags (individual y batch)
 * - Limpieza de tags sin uso
 * <p>
 * Los tags son etiquetas personalizadas que los usuarios pueden agregar
 * a sus perfiles para mejor matching y descubrimiento.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/user-tags")
@RequiredArgsConstructor
@Tag(name = "User Tags", description = "Endpoints de gestión de tags de usuario")
public class UserTagController {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(UserTagController.class);

    private final UserTagService userTagService;
    private final UserService userService;

    // ========================================
    // CLIENT ENDPOINTS - PERSONAL TAG MANAGEMENT
    // ========================================

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener tags del usuario actual",
        description = "Obtiene todos los tags del usuario autenticado actual")
    public ResponseEntity<List<UserTagDTO>> getMyTags(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<UserTagDTO> tags = userTagService.getUserTags(userEmail);
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            logger.error("Error obteniendo tags del usuario", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Agregar tags al usuario actual",
        description = "Agrega nuevos tags al perfil del usuario actual")
    public ResponseEntity<List<UserTagDTO>> addTagsToMe(
        @Valid @RequestBody UserTagRequestDTO request,
        Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<UserTagDTO> updatedTags = userTagService.addTagsToUser(userEmail, request.tags());
            return ResponseEntity.ok(updatedTags);
        } catch (Exception e) {
            logger.error("Error añadiendo tags al usuario", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/me/{tagId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Reemplazar tags de usuario",
        description = "Reemplaza todos los tags actuales del usuario con nuevos")
    public ResponseEntity<List<UserTagDTO>> replaceMyTags(
        @Parameter(description = "ID del tag (no usado, mantenido por estructura de URL)") @PathVariable Long tagId,
        @Valid @RequestBody UserTagRequestDTO request,
        Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<UserTagDTO> updatedTags = userTagService.replaceUserTags(userEmail, request.tags());
            return ResponseEntity.ok(updatedTags);
        } catch (Exception e) {
            logger.error("Error reemplazando tags del usuario", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/me/{tagId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Eliminar tag del usuario actual",
        description = "Elimina un tag específico del perfil del usuario actual")
    public ResponseEntity<MessageResponseDTO> removeTagFromMe(
        @Parameter(description = "ID del tag") @PathVariable Long tagId,
        Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            MessageResponseDTO response = userTagService.removeTagFromUser(userEmail, tagId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error removiendo tag del usuario", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al remover tag"));
        }
    }

    // ========================================
    // CLIENT ENDPOINTS - SEARCH AND DISCOVERY
    // ========================================

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Buscar tags",
        description = "Busca tags por nombre o query")
    public ResponseEntity<Page<UserTagDTO>> searchTags(
        @RequestParam(required = false) String query,
        @PageableDefault(size = 20) Pageable pageable) {
        try {
            Page<UserTagDTO> tags = userTagService.searchTagsPaginated(query, pageable);
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            logger.error("Error buscando tags", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/popular")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener tags populares",
        description = "Obtiene los tags más populares del sistema")
    public ResponseEntity<Page<UserTagDTO>> getPopularTags(
        @PageableDefault(size = 20) Pageable pageable) {
        try {
            Page<UserTagDTO> tags = userTagService.getPopularTagsPaginated(pageable);
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            logger.error("Error obteniendo tags populares", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/trending")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener tags en tendencia",
        description = "Obtiene los tags en tendencia del sistema")
    public ResponseEntity<Page<UserTagDTO>> getTrendingTags(
        @PageableDefault(size = 15) Pageable pageable) {
        try {
            Page<UserTagDTO> tags = userTagService.getTrendingTagsPaginated(pageable);
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            logger.error("Error obteniendo tags en tendencia", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/suggestions")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener sugerencias de tags personalizadas",
        description = "Obtiene sugerencias de tags personalizadas para el usuario actual")
    public ResponseEntity<Page<UserTagDTO>> getTagSuggestions(
        @PageableDefault(size = 10) Pageable pageable,
        Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Page<UserTagDTO> suggestions = userTagService.getSuggestedTagsForUserPaginated(userEmail, pageable);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            logger.error("Error obteniendo sugerencias de tags", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========================================
    // ADMIN ENDPOINTS
    // ========================================

    @GetMapping("/pending-approval")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener tags pendientes de aprobación",
        description = "Obtiene tags pendientes de aprobación (solo admin)")
    public ResponseEntity<Page<UserTagDTO>> getPendingApprovalTags(
        @PageableDefault(size = 20) Pageable pageable) {
        try {
            Page<UserTagDTO> pendingTags = userTagService.getPendingApprovalTagsPaginated(pageable);
            return ResponseEntity.ok(pendingTags);
        } catch (Exception e) {
            logger.error("Error obteniendo tags pendientes de aprobación", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Crear nuevo tag",
        description = "Crea un nuevo tag (solo admin)")
    public ResponseEntity<UserTagDTO> createTag(
        @Valid @RequestBody UserTagRequestDTO request,
        Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            UserTag tag = userTagService.createTag(request.name(), adminEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(new UserTagDTO(tag));
        } catch (Exception e) {
            logger.error("Error creando tag", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{tagId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Actualizar tag",
        description = "Actualiza un tag existente (solo admin)")
    public ResponseEntity<UserTagDTO> updateTag(
        @Parameter(description = "ID del tag") @PathVariable Long tagId,
        @Valid @RequestBody UserTagRequestDTO request) {
        try {
            UserTagDTO updatedTag = userTagService.updateTag(tagId, request.name());
            return ResponseEntity.ok(updatedTag);
        } catch (Exception e) {
            logger.error("Error actualizando tag", Map.of("tagId", tagId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/cleanup")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Limpiar tags sin uso",
        description = "Elimina tags sin uso del sistema (solo admin)")
    public ResponseEntity<MessageResponseDTO> cleanupUnusedTags(Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            MessageResponseDTO response = userTagService.cleanupUnusedTagsManually(adminEmail);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error limpiando tags sin uso", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al limpiar tags sin uso"));
        }
    }

    @PostMapping("/{tagId}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Aprobar tag",
        description = "Aprueba un tag pendiente (solo admin)")
    public ResponseEntity<MessageResponseDTO> approveTag(
        @Parameter(description = "ID del tag") @PathVariable Long tagId,
        Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            MessageResponseDTO response = userTagService.approveTag(tagId, adminEmail);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error aprobando tag", Map.of("tagId", tagId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al aprobar tag"));
        }
    }

    @PostMapping("/{tagId}/reject")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Rechazar tag",
        description = "Rechaza un tag pendiente con razón (solo admin)")
    public ResponseEntity<MessageResponseDTO> rejectTag(
        @Parameter(description = "ID del tag") @PathVariable Long tagId,
        @RequestParam(required = false, defaultValue = "Tag no apropiado para la plataforma") String reason,
        Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            MessageResponseDTO response = userTagService.rejectTag(tagId, reason, adminEmail);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error rechazando tag", Map.of("tagId", tagId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al rechazar tag"));
        }
    }

    @PostMapping("/approve-batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Aprobar tags en lote",
        description = "Aprueba múltiples tags a la vez (solo admin)")
    public ResponseEntity<MessageResponseDTO> approveBatchTags(
        @RequestBody List<Long> tagIds,
        Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            MessageResponseDTO response = userTagService.approveBatchTags(tagIds, adminEmail);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error aprobando tags en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al aprobar tags en lote"));
        }
    }
}
