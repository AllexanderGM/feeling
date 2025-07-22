package com.feeling.application.controllers.auth;

import com.feeling.domain.dto.auth.ForgotPasswordRequestDTO;
import com.feeling.domain.dto.auth.ResetPasswordRequestDTO;
import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.services.auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/password")
@RequiredArgsConstructor
@Tag(name = "Gestión de Contraseñas", description = "Endpoints para recuperación y cambio de contraseñas")
public class PasswordController {

    private static final Logger logger = LoggerFactory.getLogger(PasswordController.class);
    private final AuthService authService;

    // ==============================
    // RECUPERACIÓN DE CONTRASEÑA
    // ==============================

    @PostMapping("/forgot")
    @Operation(
            summary = "Solicitar recuperación de contraseña",
            description = "Envía un token de recuperación al email del usuario para restablecer su contraseña"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200", 
                    description = "Token de recuperación enviado exitosamente",
                    content = @Content(schema = @Schema(implementation = MessageResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "404", 
                    description = "Email no encontrado en el sistema"
            ),
            @ApiResponse(
                    responseCode = "429", 
                    description = "Demasiadas solicitudes de recuperación"
            )
    })
    public ResponseEntity<MessageResponseDTO> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        logger.info("Solicitud de recuperación de contraseña para email: {}", request.email());
        
        MessageResponseDTO response = authService.forgotPassword(request);
        
        logger.info("Token de recuperación procesado para email: {}", request.email());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset")
    @Operation(
            summary = "Restablecer contraseña",
            description = "Restablece la contraseña del usuario usando el token de recuperación recibido por email"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200", 
                    description = "Contraseña restablecida exitosamente",
                    content = @Content(schema = @Schema(implementation = MessageResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400", 
                    description = "Token inválido, expirado o contraseña no válida"
            ),
            @ApiResponse(
                    responseCode = "404", 
                    description = "Token no encontrado"
            )
    })
    public ResponseEntity<MessageResponseDTO> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        logger.info("Intento de restablecimiento de contraseña con token: {}", 
                   request.token().substring(0, Math.min(10, request.token().length())) + "...");
        
        MessageResponseDTO response = authService.resetPassword(request);
        
        logger.info("Contraseña restablecida exitosamente para token: {}", 
                   request.token().substring(0, Math.min(10, request.token().length())) + "...");
        return ResponseEntity.ok(response);
    }

    // ==============================
    // VALIDACIÓN DE TOKEN
    // ==============================

    @GetMapping("/validate-reset-token/{token}")
    @Operation(
            summary = "Validar token de recuperación",
            description = "Verifica si un token de recuperación de contraseña es válido y no ha expirado"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200", 
                    description = "Token válido",
                    content = @Content(schema = @Schema(implementation = MessageResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400", 
                    description = "Token inválido o expirado"
            ),
            @ApiResponse(
                    responseCode = "404", 
                    description = "Token no encontrado"
            )
    })
    public ResponseEntity<MessageResponseDTO> validateResetToken(@PathVariable String token) {
        logger.debug("Validando token de recuperación: {}...", 
                    token.substring(0, Math.min(10, token.length())));
        
        boolean isValid = authService.isPasswordResetTokenValid(token);
        
        if (isValid) {
            logger.debug("Token de recuperación válido");
            return ResponseEntity.ok(new MessageResponseDTO("Token válido"));
        } else {
            logger.warn("Token de recuperación inválido o expirado");
            return ResponseEntity.badRequest()
                    .body(new MessageResponseDTO("Token inválido o expirado"));
        }
    }

    // ==============================
    // CAMBIO DE CONTRASEÑA (AUTENTICADO)
    // ==============================

    @PostMapping("/change")
    @Operation(
            summary = "Cambiar contraseña (autenticado)",
            description = "Permite a un usuario autenticado cambiar su contraseña actual"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200", 
                    description = "Contraseña cambiada exitosamente",
                    content = @Content(schema = @Schema(implementation = MessageResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400", 
                    description = "Contraseña actual incorrecta o nueva contraseña inválida"
            ),
            @ApiResponse(
                    responseCode = "401", 
                    description = "Usuario no autenticado"
            )
    })
    public ResponseEntity<MessageResponseDTO> changePassword(
            @Valid @RequestBody ChangePasswordRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        
        logger.info("Solicitud de cambio de contraseña para usuario autenticado");
        
        MessageResponseDTO response = authService.changePassword(request, authHeader);
        
        logger.info("Contraseña cambiada exitosamente");
        return ResponseEntity.ok(response);
    }

    // ==============================
    // DTO PARA CAMBIO DE CONTRASEÑA
    // ==============================

    public record ChangePasswordRequestDTO(
            @jakarta.validation.constraints.NotBlank(message = "La contraseña actual es obligatoria")
            String currentPassword,
            
            @jakarta.validation.constraints.NotBlank(message = "La nueva contraseña es obligatoria")
            @jakarta.validation.constraints.Size(min = 8, message = "La nueva contraseña debe tener al menos 8 caracteres")
            @jakarta.validation.constraints.Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
                message = "La nueva contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 símbolo"
            )
            String newPassword,
            
            @jakarta.validation.constraints.NotBlank(message = "La confirmación de contraseña es obligatoria")
            String confirmPassword
    ) {
        public ChangePasswordRequestDTO {
            if (!newPassword.equals(confirmPassword)) {
                throw new IllegalArgumentException("Las contraseñas no coinciden");
            }
        }
    }
}