package com.feeling.packages.auth.application;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.auth.TokenValidationDTO;
import com.feeling.packages.auth.domain.dto.mapper.PasswordResponseFactory;
import com.feeling.packages.auth.domain.dto.password.*;
import com.feeling.packages.auth.domain.dto.views.AuthViews;
import com.feeling.packages.auth.domain.services.PasswordService;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
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

import java.util.List;

@RestController
@RequestMapping("/auth/password")
@RequiredArgsConstructor
@Tag(name = "Gestión de Contraseñas", description = "Endpoints para recuperación, cambio y validación de contraseñas")
public class PasswordController {

    private static final Logger logger = LoggerFactory.getLogger(PasswordController.class);
    private final PasswordService passwordService;
    private final PasswordResponseFactory passwordResponseFactory;

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

        MessageResponseDTO response = passwordService.forgotPassword(request);

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

        MessageResponseDTO response = passwordService.resetPassword(request);

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
    @JsonView(AuthViews.Password.Basic.class)
    public ResponseEntity<TokenValidationDTO> validateResetToken(@PathVariable String token) {
        logger.debug("Validando token de recuperación: {}...",
            token.substring(0, Math.min(10, token.length())));

        TokenValidationDTO validation = passwordService.validateResetToken(token);

        if (validation.valid()) {
            logger.debug("Token de recuperación válido");
        } else {
            logger.warn("Token de recuperación inválido o expirado: {}", validation.message());
        }

        return ResponseEntity.ok(validation);
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

        MessageResponseDTO response = passwordService.changePassword(request, authHeader);

        logger.info("Contraseña cambiada exitosamente");
        return ResponseEntity.ok(response);
    }

    // ==============================
    // VALIDACIÓN DE CONTRASEÑAS
    // ==============================

    @PostMapping("/validate")
    @Operation(
        summary = "Validar fortaleza de contraseña",
        description = "Valida una contraseña según políticas de seguridad y devuelve recomendaciones"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Validación completada",
            content = @Content(schema = @Schema(implementation = PasswordValidationResponseDTO.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos de validación inválidos"
        )
    })
    public ResponseEntity<PasswordValidationResponseDTO> validatePassword(
        @Valid @RequestBody PasswordValidationRequestDTO request
    ) {
        logger.debug("Validando fortaleza de contraseña para email: {}",
            request.email() != null ? request.email() : "no especificado");

        PasswordValidationResultDTO result =
            passwordService.validatePassword(request.password(), request.email());

        boolean isCompromised = passwordService.isPasswordCompromised(request.password());

        PasswordValidationResponseDTO response = passwordResponseFactory.buildValidationResponse(result, isCompromised);

        logger.debug("Validación completada - Válida: {}, Fuerza: {}, Comprometida: {}",
            result.isValid(), result.strength(), isCompromised);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/suggestions")
    @Operation(
        summary = "Obtener sugerencias de contraseñas",
        description = "Genera ejemplos de contraseñas seguras para ayudar al usuario"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Sugerencias generadas",
            content = @Content(schema = @Schema(implementation = PasswordSuggestionsResponseDTO.class))
        )
    })
    public ResponseEntity<PasswordSuggestionsResponseDTO> getPasswordSuggestions() {
        logger.debug("Generando sugerencias de contraseñas seguras");

        List<String> suggestions = passwordService.generatePasswordSuggestions();

        PasswordSuggestionsResponseDTO response = passwordResponseFactory.buildPasswordSuggestions(suggestions);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/check-compromised")
    @Operation(
        summary = "Verificar si contraseña está comprometida",
        description = "Verifica si una contraseña ha sido expuesta en brechas de seguridad conocidas"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Verificación completada",
            content = @Content(schema = @Schema(implementation = CompromisedCheckResponseDTO.class))
        )
    })
    public ResponseEntity<CompromisedCheckResponseDTO> checkCompromisedPassword(
        @Valid @RequestBody CompromisedCheckRequestDTO request
    ) {
        logger.debug("Verificando si contraseña está comprometida");

        boolean isCompromised = passwordService.isPasswordCompromised(request.password());

        CompromisedCheckResponseDTO response = passwordResponseFactory.buildCompromisedCheckResponse(isCompromised);

        logger.debug("Verificación completada - Comprometida: {}", isCompromised);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/policy")
    @Operation(
        summary = "Obtener política de contraseñas",
        description = "Devuelve los requisitos y políticas actuales para contraseñas"
    )
    public ResponseEntity<PasswordPolicyResponseDTO> getPasswordPolicy() {
        PasswordPolicyResponseDTO policy = passwordResponseFactory.buildPasswordPolicy();

        return ResponseEntity.ok(policy);
    }
}
