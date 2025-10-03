package com.feeling.packages.user.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.feeling.exception.UnauthorizedException;
import com.feeling.packages.auth.domain.services.JwtService;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.user.domain.dto.UserCompatibilityDTO;
import com.feeling.packages.user.domain.dto.UserPartialUpdateDTO;
import com.feeling.packages.user.domain.dto.UserResponseDTO;
import com.feeling.packages.user.domain.dto.UserResponseLevel;
import com.feeling.packages.user.domain.services.UserAttributeService;
import com.feeling.packages.user.domain.services.UserService;
import com.feeling.packages.user.domain.services.UserTagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Management", description = "User management endpoints for clients and administrators")
public class UserController {

    private final UserService userService;
    private final UserTagService userTagService;
    private final UserAttributeService userAttributeService;
    private final Validator validator;
    private final JwtService jwtService;

    // ========================================
    // CLIENT ENDPOINTS (AUTHENTICATED)
    // ========================================

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user profile",
        description = "Get the current authenticated user's complete profile")
    @Deprecated(since = "1.8", forRemoval = true)
    public ResponseEntity<UserResponseDTO> getCurrentUser(Authentication authentication) {
        try {
            String email = authentication.getName();
            UserResponseDTO user = userService.get(email, email, "extended");
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Error obteniendo usuario actual", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Get user profile with configurable data inclusion",
        description = "Retrieve user profile with granular control over included data sections. " +
            "If no email is provided, returns current user's profile. " +
            "If email is provided, returns other user's profile with appropriate security restrictions. " +
            "Use include parameter to specify data level needed to optimize payload size.",
        tags = {"User Profile Management"}
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Profile retrieved successfully",
            content = @io.swagger.v3.oas.annotations.media.Content(
                schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = UserResponseDTO.class),
                examples = {
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Extended Profile",
                        summary = "Profile with extended information",
                        description = "Includes basic profile, privacy settings, metrics, and notifications"
                    )
                }
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid include level specified"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "User not authenticated"
        )
    })
    public ResponseEntity<UserResponseDTO> getCurrentUserProfile(
        @Parameter(
            description = "Data inclusion level - controls which data sections are included in response",
            schema = @io.swagger.v3.oas.annotations.media.Schema(
                type = "string",
                allowableValues = {"basic", "standard", "extended", "full", "admin"},
                defaultValue = "extended"
            ),
            examples = {
                @io.swagger.v3.oas.annotations.media.ExampleObject(name = "basic", description = "Status + Profile only"),
                @io.swagger.v3.oas.annotations.media.ExampleObject(name = "standard", description = "Basic + Metrics"),
                @io.swagger.v3.oas.annotations.media.ExampleObject(name = "extended", description = "Standard + Privacy + Matches + Notifications"),
                @io.swagger.v3.oas.annotations.media.ExampleObject(name = "full", description = "All data including auth and account status"),
                @io.swagger.v3.oas.annotations.media.ExampleObject(name = "admin", description = "Full data + admin-only fields (admin only)")
            }
        )
        @RequestParam(name = "include", defaultValue = "extended") String includeLevel,
        @Parameter(
            description = "Target user email - if not provided, returns current user's profile",
            required = false
        )
        @RequestParam(name = "email", required = false) String targetEmail,
        Authentication authentication) {
        try {
            // Validar nivel de inclusión
            if (!UserResponseLevel.isValidLevel(includeLevel)) {
                return ResponseEntity.badRequest().build();
            }

            String currentUserEmail = authentication.getName();
            String requestedUserEmail = targetEmail != null ? targetEmail : currentUserEmail;

            // Usar el servicio unificado que maneja la lógica de seguridad y niveles apropiados
            UserResponseDTO user = userService.get(requestedUserEmail, currentUserEmail, includeLevel);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Error obteniendo perfil del usuario con email: {} y nivel: {}",
                targetEmail != null ? targetEmail : "current", includeLevel, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{email}/public")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user public profile",
        description = "Get user public profile for matching (without phone number)")
    @Deprecated(since = "1.8", forRemoval = true)
    public ResponseEntity<UserResponseDTO> getUserPublicProfile(
        @Parameter(description = "User email") @PathVariable String email) {
        try {
            UserResponseDTO user = userService.get(null, email, "public");
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Error obteniendo perfil público del usuario: {}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{email}/complete")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user complete profile",
        description = "Get user complete profile for matched users (with phone number)")
    @Deprecated(since = "1.8", forRemoval = true)
    public ResponseEntity<UserResponseDTO> getUserCompleteProfile(
        @Parameter(description = "User email") @PathVariable String email,
        Authentication authentication) {
        try {
            String currentUserEmail = authentication.getName();
            UserResponseDTO user = userService.get(currentUserEmail, email, "standard");
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Error obteniendo perfil completo del usuario: {}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/compatibility/{otherUserEmail}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Calculate user compatibility",
        description = "Calculate detailed compatibility score with breakdown by factors (category, age, location, tags)")
    public ResponseEntity<UserCompatibilityDTO> calculateCompatibility(
        @Parameter(description = "Other user email") @PathVariable String otherUserEmail,
        Authentication authentication) {
        try {
            String currentUserEmail = authentication.getName();
            UserCompatibilityDTO compatibility = userService.calculateUserCompatibility(currentUserEmail, otherUserEmail);
            return ResponseEntity.ok(compatibility);
        } catch (Exception e) {
            log.error("Error calculando compatibilidad entre {} y {}", authentication.getName(), otherUserEmail, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/suggestions")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user suggestions",
        description = "Get user suggestions for matching")
    public ResponseEntity<Page<UserResponseDTO>> getUserSuggestions(
        @PageableDefault(size = 10) Pageable pageable,
        Authentication authentication) {
        try {
            String currentUserEmail = authentication.getName();
            Page<UserResponseDTO> suggestions = userService.getUserSuggestions(currentUserEmail, "standard", pageable);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            log.error("Error obteniendo sugerencias para el usuario: {}", authentication.getName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/suggestions/v2")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Get user suggestions with optimized response control",
        description = "Retrieve paginated user suggestions with configurable data inclusion levels. " +
            "Optimized endpoint that replaces /suggestions with better performance and flexible data control. " +
            "Results are cached automatically for improved performance.",
        tags = {"User Matching"}
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Suggestions retrieved successfully",
            content = @io.swagger.v3.oas.annotations.media.Content(
                schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = org.springframework.data.domain.Page.class),
                examples = {
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Paginated Suggestions",
                        summary = "Page of user suggestions",
                        description = "Paginated response with suggested users based on preferences and compatibility"
                    )
                }
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid include level or pagination parameters"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "User not authenticated"
        )
    })
    public ResponseEntity<Page<UserResponseDTO>> getUserSuggestionsV2(
        @Parameter(
            description = "Data inclusion level for suggestions - controls privacy and payload size",
            schema = @io.swagger.v3.oas.annotations.media.Schema(
                type = "string",
                allowableValues = {"public", "basic"},
                defaultValue = "public"
            ),
            examples = {
                @io.swagger.v3.oas.annotations.media.ExampleObject(name = "public", description = "Public profile data only (recommended for suggestions)"),
                @io.swagger.v3.oas.annotations.media.ExampleObject(name = "basic", description = "Basic profile data without sensitive information")
            }
        )
        @RequestParam(name = "include", defaultValue = "public") String includeLevel,
        @PageableDefault(size = 10) Pageable pageable,
        Authentication authentication) {
        try {
            // Validar nivel de inclusión
            if (!UserResponseLevel.isValidLevel(includeLevel)) {
                return ResponseEntity.badRequest().build();
            }

            String currentUserEmail = authentication.getName();
            Page<UserResponseDTO> suggestions = userService.getUserSuggestions(currentUserEmail, includeLevel, pageable);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            log.error("Error obteniendo sugerencias v2 para el usuario: {} con nivel: {}",
                authentication.getName(), includeLevel, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update current user profile",
        description = "Update current user profile with images")
    public ResponseEntity<?> updateCurrentUser(
        @RequestParam("profileData") String profileDataJson,
        @RequestParam(value = "profileImages", required = false) List<MultipartFile> profileImages,
        Authentication authentication) throws IOException {
        try {
            String userEmail = authentication.getName();

            // Parsear y validar datos
            UserPartialUpdateDTO profileRequest = parseProfileData(profileDataJson);
            String validationErrors = validateProfileRequest(profileRequest);
            if (validationErrors != null) {
                return ResponseEntity.badRequest().body(new MessageResponseDTO(validationErrors));
            }

            // Orquestación: actualizar datos y/o imágenes
            UserResponseDTO updatedUser = null;

            // Actualizar datos si hay cambios
            if (profileRequest.hasAnyUpdate()) {
                updatedUser = userService.update(userEmail, profileRequest);
            }

            // Subir imágenes si se proporcionan
            if (profileImages != null && !profileImages.isEmpty()) {
                updatedUser = userService.uploadImages(userEmail, profileImages);
            }

            // Si no se actualizó nada, retornar error
            if (updatedUser == null) {
                return ResponseEntity.badRequest().body(new MessageResponseDTO("No se enviaron campos para actualizar"));
            }

            return ResponseEntity.ok(updatedUser);

        } catch (Exception e) {
            log.error("Error actualizando perfil del usuario", e);
            return ResponseEntity.badRequest().body(new MessageResponseDTO("Error al actualizar perfil: " + e.getMessage()));
        }
    }

    @PatchMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Partially update user profile",
        description = "Update specific fields of user profile using PATCH operation. " +
            "Only provided fields will be updated. Use Optional fields to distinguish between " +
            "null values and fields not sent. Supports nested updates for location, preferences, privacy, etc.",
        tags = {"User Profile Management"}
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Profile updated successfully",
            content = @io.swagger.v3.oas.annotations.media.Content(
                schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = UserResponseDTO.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid input data or no fields provided for update"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "User not authenticated"
        )
    })
    public ResponseEntity<?> partialUpdateProfile(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Partial update data with Optional fields. Only include fields you want to update.",
            content = @io.swagger.v3.oas.annotations.media.Content(
                schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = UserPartialUpdateDTO.class),
                examples = {
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Basic Info Update",
                        summary = "Update basic user information",
                        value = """
                            {
                              "name": "New Name",
                              "description": "Updated description"
                            }
                            """
                    ),
                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Location Update",
                        summary = "Update user location",
                        value = """
                            {
                              "location": {
                                "country": "Colombia",
                                "city": "Bogotá"
                              }
                            }
                            """
                    )
                }
            )
        )
        @Valid @RequestBody UserPartialUpdateDTO partialUpdate,
        Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            UserResponseDTO updatedUser = userService.update(userEmail, partialUpdate);
            return ResponseEntity.ok(updatedUser);
        } catch (UnauthorizedException e) {
            log.error("Usuario no autorizado para actualización parcial: {}", authentication.getName(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponseDTO("No autorizado para actualizar perfil"));
        } catch (Exception e) {
            log.error("Error en actualización parcial del perfil del usuario: {}", authentication.getName(), e);
            return ResponseEntity.badRequest()
                .body(new MessageResponseDTO("Error al actualizar perfil: " + e.getMessage()));
        }
    }

    @PutMapping("/deactivate")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Deactivate current user account",
        description = "Deactivate the current user's account")
    public ResponseEntity<MessageResponseDTO> deactivateCurrentAccount(
        @RequestParam(required = false) String reason,
        Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            MessageResponseDTO response = userService.deactivateOwnAccount(userEmail, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error desactivando cuenta del usuario: {}", authentication.getName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al desactivar cuenta"));
        }
    }

    // ========================================
    // ADMIN ENDPOINTS
    // ========================================

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get all users",
        description = "Get all users with pagination and search")
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
        @RequestParam(required = false) String search,
        @PageableDefault(size = 20) Pageable pageable) {
        try {
            Page<UserResponseDTO> users;
            if (search != null && !search.trim().isEmpty()) {
                users = userService.searchUsers(search, pageable);
            } else {
                users = userService.getListPaginated(pageable);
            }
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error obteniendo todos los usuarios", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{email}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get user by email (admin)",
        description = "Get complete user information by email (admin only)")
    @Deprecated(since = "1.8", forRemoval = true)
    public ResponseEntity<UserResponseDTO> getUserByEmail(
        @Parameter(description = "User email") @PathVariable String email,
        Authentication authentication) {
        try {
            String currentUserEmail = authentication.getName();
            UserResponseDTO user = userService.get(email, currentUserEmail, "complete");
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Error obteniendo usuario por email: {}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get users by status",
        description = "Get users filtered by status (active, pending-approval, unverified, non-approved, deactivated, incomplete-profiles)")
    public ResponseEntity<Page<UserResponseDTO>> getUsersByStatus(
        @Parameter(description = "User status") @PathVariable String status,
        @RequestParam(required = false) String search,
        @PageableDefault(size = 20) Pageable pageable) {
        try {
            Page<UserResponseDTO> users = userService.getUsersByStatus(status, search, pageable);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error obteniendo usuarios por estado: {}", status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Update user profile (admin)",
        description = "Update user profile with images (admin only)")
    public ResponseEntity<?> updateUserProfile(
        @Parameter(description = "User ID") @PathVariable String userId,
        @RequestParam("profileData") String profileDataJson,
        @RequestParam(value = "profileImages", required = false) List<MultipartFile> profileImages) throws IOException {
        try {
            // Parsear y validar datos
            UserPartialUpdateDTO profileRequest = parseProfileData(profileDataJson);
            String validationErrors = validateProfileRequest(profileRequest);
            if (validationErrors != null) {
                return ResponseEntity.badRequest().body(new MessageResponseDTO(validationErrors));
            }

            // Obtener email del usuario
            String userEmail = userService.getUserEmailById(userId);

            // Orquestación: actualizar datos y/o imágenes
            UserResponseDTO updatedUser = null;

            // Actualizar datos si hay cambios
            if (profileRequest.hasAnyUpdate()) {
                updatedUser = userService.update(userEmail, profileRequest);
            }

            // Subir imágenes si se proporcionan
            if (profileImages != null && !profileImages.isEmpty()) {
                updatedUser = userService.uploadImages(userEmail, profileImages);
            }

            // Si no se actualizó nada, retornar error
            if (updatedUser == null) {
                return ResponseEntity.badRequest().body(new MessageResponseDTO("No se enviaron campos para actualizar"));
            }

            return ResponseEntity.ok(updatedUser);

        } catch (Exception e) {
            log.error("Error actualizando perfil del usuario {}", userId, e);
            return ResponseEntity.badRequest().body(new MessageResponseDTO("Error al actualizar perfil: " + e.getMessage()));
        }
    }

    @PutMapping("/{userId}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Approve user",
        description = "Approve a user to allow them to use the platform")
    public ResponseEntity<MessageResponseDTO> approveUser(
        @Parameter(description = "User ID") @PathVariable String userId) {
        try {
            MessageResponseDTO response = userService.approveUser(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error aprobando usuario: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al aprobar usuario"));
        }
    }

    @PostMapping("/approve-batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Approve users in batch",
        description = "Approve multiple users at once")
    public ResponseEntity<MessageResponseDTO> approveUsersBatch(
        @RequestBody List<String> userIds) {
        try {
            MessageResponseDTO response = userService.approveUsersBatch(userIds);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error aprobando usuarios en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al aprobar usuarios en lote"));
        }
    }

    @PutMapping("/{userId}/reject")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Reject user",
        description = "Reject a user, preventing them from using the platform")
    public ResponseEntity<MessageResponseDTO> rejectUser(
        @Parameter(description = "User ID") @PathVariable String userId) {
        try {
            MessageResponseDTO response = userService.revokeUserApproval(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error rechazando usuario: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al rechazar usuario"));
        }
    }

    @PostMapping("/reject-batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Reject users in batch",
        description = "Reject multiple users at once")
    public ResponseEntity<MessageResponseDTO> rejectUsersBatch(
        @RequestBody List<String> userIds) {
        try {
            MessageResponseDTO response = userService.rejectUsersBatch(userIds);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error rechazando usuarios en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al rechazar usuarios en lote"));
        }
    }

    @PutMapping("/{userId}/pending")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Reset user to pending status",
        description = "Reset user approval status to pending")
    public ResponseEntity<MessageResponseDTO> resetUserToPending(
        @Parameter(description = "User ID") @PathVariable String userId) {
        try {
            MessageResponseDTO response = userService.resetUserApprovalToPending(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error reseteando usuario a pendiente: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al resetear usuario"));
        }
    }

    @PutMapping("/{userId}/assign-admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Assign admin role",
        description = "Grant admin role to a user")
    public ResponseEntity<MessageResponseDTO> assignAdminRole(
        @Parameter(description = "User ID") @PathVariable String userId,
        Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            MessageResponseDTO response = userService.grantAdminRole(adminEmail, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error asignando rol admin al usuario: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al asignar rol admin"));
        }
    }

    @PostMapping("/assign-admin-batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Assign admin role in batch",
        description = "Grant admin role to multiple users at once")
    public ResponseEntity<MessageResponseDTO> assignAdminRoleBatch(
        @RequestBody List<String> userIds,
        Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            MessageResponseDTO response = userService.grantAdminRoleBatch(adminEmail, userIds);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error asignando rol admin en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al asignar rol admin en lote"));
        }
    }

    @PutMapping("/{userId}/revoke-admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Revoke admin role",
        description = "Revoke admin role from a user")
    public ResponseEntity<MessageResponseDTO> revokeAdminRole(
        @Parameter(description = "User ID") @PathVariable String userId,
        Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            MessageResponseDTO response = userService.revokeAdminRole(adminEmail, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error revocando rol admin del usuario: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al revocar rol admin"));
        }
    }

    @PostMapping("/revoke-admin-batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Revoke admin role in batch",
        description = "Revoke admin role from multiple users at once")
    public ResponseEntity<MessageResponseDTO> revokeAdminRoleBatch(
        @RequestBody List<String> userIds,
        Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            MessageResponseDTO response = userService.revokeAdminRoleBatch(adminEmail, userIds);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error revocando rol admin en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al revocar rol admin en lote"));
        }
    }

    @PutMapping("/{userId}/deactivate")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Deactivate user account",
        description = "Deactivate a user account (admin only)")
    public ResponseEntity<MessageResponseDTO> deactivateAccount(
        @Parameter(description = "User ID") @PathVariable String userId,
        @RequestParam(required = false) String reason) {
        try {
            MessageResponseDTO response = userService.deactivateAccount(userId, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error desactivando cuenta del usuario: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al desactivar cuenta"));
        }
    }

    @PutMapping("/{userId}/reactivate")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Reactivate user account",
        description = "Reactivate a deactivated user account")
    public ResponseEntity<MessageResponseDTO> reactivateAccount(
        @Parameter(description = "User ID") @PathVariable String userId) {
        try {
            MessageResponseDTO response = userService.reactivateAccount(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error reactivando cuenta del usuario: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al reactivar cuenta"));
        }
    }

    @PostMapping("/deactivate-batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Deactivate accounts in batch",
        description = "Deactivate multiple user accounts at once")
    public ResponseEntity<MessageResponseDTO> deactivateAccountsBatch(
        @RequestBody List<String> userIds,
        @RequestParam(required = false) String reason) {
        try {
            MessageResponseDTO response = userService.deactivateAccountsBatch(userIds, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error desactivando cuentas en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al desactivar cuentas en lote"));
        }
    }

    @PostMapping("/reactivate-batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Reactivate accounts in batch",
        description = "Reactivate multiple deactivated user accounts at once")
    public ResponseEntity<MessageResponseDTO> reactivateAccountsBatch(
        @RequestBody List<String> userIds) {
        try {
            MessageResponseDTO response = userService.reactivateAccountsBatch(userIds);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error reactivando cuentas en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al reactivar cuentas en lote"));
        }
    }

    @PostMapping("/{userId}/send-email")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Send email to user",
        description = "Send profile completion reminder or other emails to user")
    public ResponseEntity<MessageResponseDTO> sendEmailToUser(
        @Parameter(description = "User ID") @PathVariable Long userId) {
        try {
            boolean emailSent = userService.sendProfileCompletionReminder(userId);
            String message = emailSent ? "Correo enviado correctamente" : "Error al enviar correo";
            return ResponseEntity.ok(new MessageResponseDTO(message));
        } catch (Exception e) {
            log.error("Error enviando correo al usuario: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error interno del servidor"));
        }
    }

    @PostMapping("/send-email-batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Send emails in batch",
        description = "Send emails to multiple users at once")
    public ResponseEntity<MessageResponseDTO> sendEmailsBatch(
        @RequestBody List<Long> userIds) {
        try {
            MessageResponseDTO response = userService.sendEmailsBatch(userIds);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error enviando correos en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al enviar correos en lote"));
        }
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Delete user",
        description = "Permanently delete a user account")
    public ResponseEntity<MessageResponseDTO> deleteUser(
        @Parameter(description = "User ID or email") @PathVariable String userId) {
        try {
            MessageResponseDTO response = userService.deleteUser(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error eliminando usuario: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al eliminar usuario"));
        }
    }

    @DeleteMapping("/delete-batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Delete users in batch",
        description = "Permanently delete multiple user accounts at once")
    public ResponseEntity<MessageResponseDTO> deleteUsersBatch(
        @RequestBody List<String> userIds) {
        try {
            MessageResponseDTO response = userService.deleteUsersBatch(userIds);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error eliminando usuarios en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al eliminar usuarios en lote"));
        }
    }

    // ========================================
    // MÉTODOS HELPER PRIVADOS
    // ========================================

    /**
     * Parsea JSON a UserPartialUpdateDTO
     */
    private UserPartialUpdateDTO parseProfileData(String profileDataJson) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        return objectMapper.readValue(profileDataJson, UserPartialUpdateDTO.class);
    }

    /**
     * Valida un DTO y retorna los errores formateados si existen
     */
    private String validateProfileRequest(UserPartialUpdateDTO profileRequest) {
        Set<ConstraintViolation<UserPartialUpdateDTO>> violations = validator.validate(profileRequest);
        if (violations.isEmpty()) {
            return null;
        }

        StringBuilder sb = new StringBuilder();
        for (ConstraintViolation<UserPartialUpdateDTO> violation : violations) {
            sb.append(violation.getMessage()).append("; ");
        }
        return sb.toString();
    }
}
