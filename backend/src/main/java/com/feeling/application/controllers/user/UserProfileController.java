package com.feeling.application.controllers.user;

import com.feeling.domain.dto.user.UserStandardResponseDTO;
import com.feeling.domain.dto.user.UserExtendedResponseDTO;
import com.feeling.domain.dto.user.UserDTOMapper;
import com.feeling.domain.services.user.UserService;
import com.feeling.infrastructure.entities.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/profile")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "User profile management endpoints")
public class UserProfileController {
    
    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile", 
               description = "Get the current authenticated user's profile information")
    public ResponseEntity<UserStandardResponseDTO> getCurrentUserProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        UserStandardResponseDTO response = UserDTOMapper.toUserStandardResponseDTO(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/extended")
    @Operation(summary = "Get current user extended profile", 
               description = "Get the current authenticated user's complete profile with privacy, notifications, and metrics")
    public ResponseEntity<UserExtendedResponseDTO> getCurrentUserExtendedProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        UserExtendedResponseDTO response = UserDTOMapper.toUserExtendedResponseDTO(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get user profile by ID", 
               description = "Get a user's public profile information by ID")
    public ResponseEntity<UserStandardResponseDTO> getUserProfile(@PathVariable String userId) {
        User user = userService.getUserById(userId);
        UserStandardResponseDTO response = UserDTOMapper.toUserStandardResponseDTO(user);
        return ResponseEntity.ok(response);
    }
}