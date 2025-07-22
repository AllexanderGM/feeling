package com.feeling.application.controllers.admin;

import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.UserResponseDTO;
import com.feeling.domain.services.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Users", description = "Admin user management endpoints")
public class AdminUserController {
    
    private final UserService userService;

    @GetMapping("/pending-approval")
    @Operation(summary = "Get pending approval users", 
               description = "Get users who completed their profile but are not approved yet")
    public ResponseEntity<Page<UserResponseDTO>> getPendingApprovalUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<UserResponseDTO> users = userService.getPendingApprovalUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{userId}/approve")
    @Operation(summary = "Approve user", 
               description = "Approve a user to allow them to use the platform")
    public ResponseEntity<MessageResponseDTO> approveUser(
            @Parameter(description = "User ID") @PathVariable String userId) {
        MessageResponseDTO response = userService.approveUser(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{userId}/revoke-approval")
    @Operation(summary = "Revoke user approval", 
               description = "Revoke approval from a user, preventing them from using the platform")
    public ResponseEntity<MessageResponseDTO> revokeUserApproval(
            @Parameter(description = "User ID") @PathVariable String userId) {
        MessageResponseDTO response = userService.revokeUserApproval(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    @Operation(summary = "Get all users", 
               description = "Get all users with pagination and search")
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        
        if (search != null && !search.trim().isEmpty()) {
            Page<UserResponseDTO> users = userService.searchUsers(search, pageable);
            return ResponseEntity.ok(users);
        } else {
            Page<UserResponseDTO> users = userService.getListPaginated(pageable);
            return ResponseEntity.ok(users);
        }
    }

    @PutMapping("/{userId}/grant-admin")
    @Operation(summary = "Grant admin role", 
               description = "Grant admin role to a user (admin only)")
    public ResponseEntity<MessageResponseDTO> grantAdminRole(
            @Parameter(description = "User ID") @PathVariable String userId,
            Authentication authentication) {
        String adminEmail = authentication.getName();
        MessageResponseDTO response = userService.grantAdminRole(adminEmail, userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{userId}/revoke-admin")
    @Operation(summary = "Revoke admin role", 
               description = "Revoke admin role from a user (admin only)")
    public ResponseEntity<MessageResponseDTO> revokeAdminRole(
            @Parameter(description = "User ID") @PathVariable String userId,
            Authentication authentication) {
        String adminEmail = authentication.getName();
        MessageResponseDTO response = userService.revokeAdminRole(adminEmail, userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{userId}/reactivate")
    @Operation(summary = "Reactivate account", 
               description = "Reactivate a deactivated user account")
    public ResponseEntity<MessageResponseDTO> reactivateAccount(
            @Parameter(description = "User ID") @PathVariable String userId) {
        MessageResponseDTO response = userService.reactivateAccount(userId);
        return ResponseEntity.ok(response);
    }
}