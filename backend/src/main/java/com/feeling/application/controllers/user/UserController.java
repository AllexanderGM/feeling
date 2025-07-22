package com.feeling.application.controllers.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.*;
import com.feeling.domain.services.auth.JwtService;
import com.feeling.domain.services.user.UserService;
import com.feeling.infrastructure.entities.user.User;
import com.feeling.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    @GetMapping("/{email}/standard")
    public ResponseEntity<UserStandardResponseDTO> getStandardFormat(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        UserStandardResponseDTO response = UserDTOMapper.toUserStandardResponseDTO(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{email}/public")
    public ResponseEntity<UserPublicResponseDTO> getPublicFormat(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        UserPublicResponseDTO response = UserDTOMapper.toUserPublicResponseDTO(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<?> getList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        Pageable pageable = PageRequest.of(page, size);

        if (search != null && !search.trim().isEmpty()) {
            Page<?> users = userService.searchUsers(search.trim(), pageable);
            return ResponseEntity.ok(users);
        } else {
            Page<?> users = userService.getListPaginated(pageable);
            return ResponseEntity.ok(users);
        }
    }

    @PutMapping("/{email}")
    public ResponseEntity<?> update(@PathVariable String email, @RequestBody UserModifyDTO user) {
        return ResponseEntity.ok(userService.update(email, user));
    }

    @PostMapping(value = "/complete-profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> profileComplete(
            @RequestParam("profileData") String profileDataJson,
            @RequestParam(value = "profileImages", required = false) List<MultipartFile> profileImages,
            HttpServletRequest request) throws IOException {

        try {
            // Validar token de acceso
            if (!jwtService.isValidAccessToken(request)) {
                throw new UnauthorizedException("Token inválido o expirado");
            }

            String token = jwtService.extractTokenFromRequest(request);

            // Extraer email del usuario
            String userEmail = jwtService.extractUsername(token);
            if (userEmail == null) {
                throw new UnauthorizedException("No se pudo extraer el usuario del token");
            }

            // Parsear JSON de los datos del perfil
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            UserProfileRequestDTO profileRequest = objectMapper.readValue(profileDataJson, UserProfileRequestDTO.class);

            // Validar los datos
            Set<ConstraintViolation<UserProfileRequestDTO>> violations = validator.validate(profileRequest);
            if (!violations.isEmpty()) {
                StringBuilder sb = new StringBuilder();
                for (ConstraintViolation<UserProfileRequestDTO> violation : violations) {
                    sb.append(violation.getMessage()).append("; ");
                }
                return ResponseEntity.badRequest().body(new MessageResponseDTO(sb.toString()));
            }

            // Completar perfil del usuario
            var updatedUser = userService.completeUser(userEmail, profileRequest, profileImages);

            return ResponseEntity.ok(updatedUser);

        } catch (UnauthorizedException e) {
            return ResponseEntity.status(401).body(new MessageResponseDTO(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponseDTO("Error al completar perfil: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{email}")
    public ResponseEntity<?> delete(@PathVariable String email) {
        return ResponseEntity.ok(userService.delete(email));
    }

    @GetMapping("/suggestions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getSuggestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size,
            HttpServletRequest request) {

        try {
            // Validar token de acceso
            if (!jwtService.isValidAccessToken(request)) {
                throw new UnauthorizedException("Token inválido o expirado");
            }

            String token = jwtService.extractTokenFromRequest(request);
            String userEmail = jwtService.extractUsername(token);
            if (userEmail == null) {
                throw new UnauthorizedException("No se pudo extraer el usuario del token");
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<?> suggestions = userService.getUserSuggestions(userEmail, pageable);
            
            return ResponseEntity.ok(suggestions);

        } catch (UnauthorizedException e) {
            return ResponseEntity.status(401).body(new MessageResponseDTO(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponseDTO("Error al obtener sugerencias: " + e.getMessage()));
        }
    }


    @PostMapping("/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponseDTO> assignAdminRole(
            HttpServletRequest request,
            @PathVariable String id) {

        String adminEmail = jwtService.extractUsernameFromRequest(request);
        MessageResponseDTO response = userService.grantAdminRole(adminEmail, id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponseDTO> removeAdminRole(
            HttpServletRequest request,
            @PathVariable String id) {

        String adminEmail = jwtService.extractUsernameFromRequest(request);
        MessageResponseDTO response = userService.revokeAdminRole(adminEmail, id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/deactivate-account")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<MessageResponseDTO> deactivateOwnAccount(
            HttpServletRequest request,
            @RequestParam(required = false) String reason) {
        
        String userEmail = jwtService.extractUsernameFromRequest(request);
        MessageResponseDTO response = userService.deactivateOwnAccount(userEmail, reason);
        return ResponseEntity.ok(response);
    }
}
