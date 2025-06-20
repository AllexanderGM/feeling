package com.feeling.application.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.UserModifyDTO;
import com.feeling.domain.dto.user.UserProfileRequestDTO;
import com.feeling.domain.services.JwtService;
import com.feeling.domain.services.UserService;
import com.feeling.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final Validator validator;
    private final JwtService jwtService;

    @GetMapping("/{email}")
    public ResponseEntity<?> get(@PathVariable String email) {
        return ResponseEntity.ok(userService.get(email));
    }

    @GetMapping
    public ResponseEntity<?> getList() {
        return ResponseEntity.ok(userService.getList());
    }

    @PutMapping("/{email}")
    public ResponseEntity<?> update(@PathVariable String email, @RequestBody UserModifyDTO user) {
        return ResponseEntity.ok(userService.update(email, user));
    }

    @PostMapping(value = "/complete-profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponseDTO> completeProfile(
            @RequestPart("profileData") String profileDataJson, // ✅ Recibir como String
            @RequestPart(value = "profileImages", required = false) List<MultipartFile> profileImages,
            HttpServletRequest request) throws IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Token no encontrado");
        }

        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);

        if (email == null) {
            throw new UnauthorizedException("Email no encontrado en token");
        }

        // ✅ Deserializar manualmente el JSON
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        UserProfileRequestDTO profileData = objectMapper.readValue(profileDataJson, UserProfileRequestDTO.class);

        // ✅ Validar manualmente
        Set<ConstraintViolation<UserProfileRequestDTO>> violations = validator.validate(profileData);
        if (!violations.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (ConstraintViolation<UserProfileRequestDTO> violation : violations) {
                sb.append(violation.getMessage()).append("; ");
            }
            throw new IllegalArgumentException("Errores de validación: " + sb.toString());
        }

        MessageResponseDTO response = userService.completeProfile(email, profileImages, profileData);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{email}")
    public ResponseEntity<?> delete(@PathVariable String email) {
        return ResponseEntity.ok(userService.delete(email));
    }


    @PostMapping("/{id}/admin")
    public ResponseEntity<MessageResponseDTO> assignAdminRole(
            @RequestHeader("Super-Admin-Email") String superAdminEmail,
            @PathVariable String id) {

        MessageResponseDTO response = userService.grantAdminRole(superAdminEmail, id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/admin")
    public ResponseEntity<MessageResponseDTO> removeAdminRole(
            @RequestHeader("Super-Admin-Email") String superAdminEmail,
            @PathVariable String id) {

        MessageResponseDTO response = userService.revokeAdminRole(superAdminEmail, id);
        return ResponseEntity.ok(response);
    }
}
