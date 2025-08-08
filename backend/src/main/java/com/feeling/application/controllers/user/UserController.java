package com.feeling.application.controllers.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.*;
import com.feeling.domain.services.auth.JwtService;
import com.feeling.domain.services.user.UserService;
import com.feeling.domain.services.user.UserTagService;
import com.feeling.domain.services.user.UserAttributeService;
import com.feeling.exception.UnauthorizedException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
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

    @GetMapping("/")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user profile", 
               description = "Get the current authenticated user's complete profile")
    public ResponseEntity<UserExtendedResponseDTO> getCurrentUser(Authentication authentication) {
        try {
            String email = authentication.getName();
            UserExtendedResponseDTO user = userService.getCurrentUserComplete(email);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Error obteniendo usuario actual", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{email}/public")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user public profile", 
               description = "Get user public profile for matching (without phone number)")
    public ResponseEntity<UserPublicResponseDTO> getUserPublicProfile(
            @Parameter(description = "User email") @PathVariable String email) {
        try {
            UserPublicResponseDTO user = userService.getUserPublicProfile(email);
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
    public ResponseEntity<UserStandardResponseDTO> getUserCompleteProfile(
            @Parameter(description = "User email") @PathVariable String email,
            Authentication authentication) {
        try {
            String currentUserEmail = authentication.getName();
            UserStandardResponseDTO user = userService.getUserCompleteProfileForMatch(email, currentUserEmail);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Error obteniendo perfil completo del usuario: {}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/compatibility/{otherUserEmail}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Calculate user compatibility", 
               description = "Calculate compatibility based on attributes and tags")
    public ResponseEntity<Double> calculateCompatibility(
            @Parameter(description = "Other user email") @PathVariable String otherUserEmail,
            Authentication authentication) {
        try {
            String currentUserEmail = authentication.getName();
            double compatibility = userService.calculateUserCompatibility(currentUserEmail, otherUserEmail);
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
    public ResponseEntity<Page<UserPublicResponseDTO>> getUserSuggestions(
            @PageableDefault(size = 10) Pageable pageable,
            Authentication authentication) {
        try {
            String currentUserEmail = authentication.getName();
            Page<UserPublicResponseDTO> suggestions = userService.getUserSuggestions(currentUserEmail, pageable);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            log.error("Error obteniendo sugerencias para el usuario: {}", authentication.getName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update current user profile", 
               description = "Update current user profile with images")
    public ResponseEntity<?> updateCurrentUser(
            @RequestParam("profileData") String profileDataJson,
            @RequestParam(value = "profileImages", required = false) List<MultipartFile> profileImages,
            Authentication authentication) throws IOException {
        try {
            String userEmail = authentication.getName();
            
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            UserProfileRequestDTO profileRequest = objectMapper.readValue(profileDataJson, UserProfileRequestDTO.class);

            Set<ConstraintViolation<UserProfileRequestDTO>> violations = validator.validate(profileRequest);
            if (!violations.isEmpty()) {
                StringBuilder sb = new StringBuilder();
                for (ConstraintViolation<UserProfileRequestDTO> violation : violations) {
                    sb.append(violation.getMessage()).append("; ");
                }
                return ResponseEntity.badRequest().body(new MessageResponseDTO(sb.toString()));
            }

            var updatedUser = userService.updateUserProfile(userEmail, profileRequest, profileImages);
            return ResponseEntity.ok(updatedUser);

        } catch (Exception e) {
            log.error("Error actualizando perfil del usuario", e);
            return ResponseEntity.badRequest().body(new MessageResponseDTO("Error al actualizar perfil: " + e.getMessage()));
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
    public ResponseEntity<UserExtendedResponseDTO> getUserByEmail(
            @Parameter(description = "User email") @PathVariable String email) {
        try {
            UserExtendedResponseDTO user = userService.getUserCompleteByEmail(email);
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
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            UserProfileRequestDTO profileRequest = objectMapper.readValue(profileDataJson, UserProfileRequestDTO.class);

            Set<ConstraintViolation<UserProfileRequestDTO>> violations = validator.validate(profileRequest);
            if (!violations.isEmpty()) {
                StringBuilder sb = new StringBuilder();
                for (ConstraintViolation<UserProfileRequestDTO> violation : violations) {
                    sb.append(violation.getMessage()).append("; ");
                }
                return ResponseEntity.badRequest().body(new MessageResponseDTO(sb.toString()));
            }

            var updatedUser = userService.updateUserProfileByAdmin(userId, profileRequest, profileImages);
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
            @Parameter(description = "User ID") @PathVariable String userId) {
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
}