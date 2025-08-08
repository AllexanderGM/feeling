package com.feeling.application.controllers.user;

import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.UserPublicResponseDTO;
import com.feeling.domain.dto.user.UserTagDTO;
import com.feeling.domain.dto.user.UserTagRequestDTO;
import com.feeling.domain.dto.user.UserTagUpdateRequestDTO;
import com.feeling.domain.services.user.UserTagService;
import com.feeling.domain.services.user.UserService;
import com.feeling.infrastructure.entities.user.UserTag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-tags")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Tags", description = "User tags management endpoints")
public class UserTagController {

    private final UserTagService userTagService;
    private final UserService userService;

    // ========================================
    // CLIENT ENDPOINTS - PERSONAL TAG MANAGEMENT
    // ========================================

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user tags", 
               description = "Get all tags of the current authenticated user")
    public ResponseEntity<List<UserTagDTO>> getMyTags(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<UserTagDTO> tags = userTagService.getUserTags(userEmail);
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            log.error("Error obteniendo tags del usuario", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add tags to current user", 
               description = "Add new tags to the current user's profile")
    public ResponseEntity<List<UserTagDTO>> addTagsToMe(
            @Valid @RequestBody UserTagUpdateRequestDTO request,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<UserTagDTO> updatedTags = userTagService.addTagsToUser(userEmail, request.tags());
            return ResponseEntity.ok(updatedTags);
        } catch (Exception e) {
            log.error("Error añadiendo tags al usuario", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/me/{tagId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Replace user tags", 
               description = "Replace all current user tags with new ones")
    public ResponseEntity<List<UserTagDTO>> replaceMyTags(
            @Parameter(description = "Tag ID (not used, kept for URL structure)") @PathVariable Long tagId,
            @Valid @RequestBody UserTagUpdateRequestDTO request,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<UserTagDTO> updatedTags = userTagService.replaceUserTags(userEmail, request.tags());
            return ResponseEntity.ok(updatedTags);
        } catch (Exception e) {
            log.error("Error reemplazando tags del usuario", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/me/{tagId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Remove tag from current user", 
               description = "Remove a specific tag from current user's profile")
    public ResponseEntity<MessageResponseDTO> removeTagFromMe(
            @Parameter(description = "Tag ID") @PathVariable Long tagId,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            MessageResponseDTO response = userTagService.removeTagFromUser(userEmail, tagId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error removiendo tag del usuario", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDTO("Error al remover tag"));
        }
    }

    // ========================================
    // CLIENT ENDPOINTS - SEARCH AND DISCOVERY
    // ========================================

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Search tags", 
               description = "Search for tags by name or query")
    public ResponseEntity<Page<UserTagDTO>> searchTags(
            @RequestParam(required = false) String query,
            @PageableDefault(size = 20) Pageable pageable) {
        try {
            Page<UserTagDTO> tags = userTagService.searchTagsPaginated(query, pageable);
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            log.error("Error buscando tags", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/popular")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get popular tags", 
               description = "Get most popular tags in the system")
    public ResponseEntity<Page<UserTagDTO>> getPopularTags(
            @PageableDefault(size = 20) Pageable pageable) {
        try {
            Page<UserTagDTO> tags = userTagService.getPopularTagsPaginated(pageable);
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            log.error("Error obteniendo tags populares", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/trending")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get trending tags", 
               description = "Get trending tags in the system")
    public ResponseEntity<Page<UserTagDTO>> getTrendingTags(
            @PageableDefault(size = 15) Pageable pageable) {
        try {
            Page<UserTagDTO> tags = userTagService.getTrendingTagsPaginated(pageable);
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            log.error("Error obteniendo tags en tendencia", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/suggestions")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get personalized tag suggestions", 
               description = "Get personalized tag suggestions for the current user")
    public ResponseEntity<Page<UserTagDTO>> getTagSuggestions(
            @PageableDefault(size = 10) Pageable pageable,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Page<UserTagDTO> suggestions = userTagService.getSuggestedTagsForUserPaginated(userEmail, pageable);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            log.error("Error obteniendo sugerencias de tags", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/users")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get users filtered by tags", 
               description = "Get users with matching profile format filtered by list of tags")
    public ResponseEntity<Page<UserPublicResponseDTO>> getUsersByTags(
            @RequestParam List<String> tags,
            @PageableDefault(size = 20) Pageable pageable) {
        try {
            Page<UserPublicResponseDTO> users = userTagService.getUsersByTags(tags, pageable);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error obteniendo usuarios por tags", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========================================
    // ADMIN ENDPOINTS
    // ========================================

    @GetMapping("/pending-approval")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get pending approval tags", 
               description = "Get tags pending approval (admin only)")
    public ResponseEntity<Page<UserTagDTO>> getPendingApprovalTags(
            @PageableDefault(size = 20) Pageable pageable) {
        try {
            Page<UserTagDTO> pendingTags = userTagService.getPendingApprovalTagsPaginated(pageable);
            return ResponseEntity.ok(pendingTags);
        } catch (Exception e) {
            log.error("Error obteniendo tags pendientes de aprobación", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Create new tag", 
               description = "Create a new tag (admin only)")
    public ResponseEntity<UserTagDTO> createTag(
            @Valid @RequestBody UserTagRequestDTO request,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            UserTag tag = userTagService.createTag(request.name(), adminEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(new UserTagDTO(tag));
        } catch (Exception e) {
            log.error("Error creando tag", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{tagId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Update tag", 
               description = "Update an existing tag (admin only)")
    public ResponseEntity<UserTagDTO> updateTag(
            @Parameter(description = "Tag ID") @PathVariable Long tagId,
            @Valid @RequestBody UserTagRequestDTO request) {
        try {
            UserTagDTO updatedTag = userTagService.updateTag(tagId, request.name());
            return ResponseEntity.ok(updatedTag);
        } catch (Exception e) {
            log.error("Error actualizando tag: {}", tagId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/cleanup")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Cleanup unused tags", 
               description = "Remove unused tags from the system (admin only)")
    public ResponseEntity<MessageResponseDTO> cleanupUnusedTags(Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            MessageResponseDTO response = userTagService.cleanupUnusedTagsManually(adminEmail);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error limpiando tags sin uso", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDTO("Error al limpiar tags sin uso"));
        }
    }

    @PostMapping("/{tagId}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Approve tag", 
               description = "Approve a pending tag (admin only)")
    public ResponseEntity<MessageResponseDTO> approveTag(
            @Parameter(description = "Tag ID") @PathVariable Long tagId,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            MessageResponseDTO response = userTagService.approveTag(tagId, adminEmail);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error aprobando tag: {}", tagId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDTO("Error al aprobar tag"));
        }
    }

    @PostMapping("/{tagId}/reject")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Reject tag", 
               description = "Reject a pending tag with reason (admin only)")
    public ResponseEntity<MessageResponseDTO> rejectTag(
            @Parameter(description = "Tag ID") @PathVariable Long tagId,
            @RequestParam(required = false, defaultValue = "Tag no apropiado para la plataforma") String reason,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            MessageResponseDTO response = userTagService.rejectTag(tagId, reason, adminEmail);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error rechazando tag: {}", tagId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDTO("Error al rechazar tag"));
        }
    }

    @PostMapping("/approve-batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Approve tags in batch", 
               description = "Approve multiple tags at once (admin only)")
    public ResponseEntity<MessageResponseDTO> approveBatchTags(
            @RequestBody List<Long> tagIds,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            MessageResponseDTO response = userTagService.approveBatchTags(tagIds, adminEmail);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error aprobando tags en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDTO("Error al aprobar tags en lote"));
        }
    }
}