package com.feeling.application.controllers;

import com.feeling.domain.dto.auth.AuthRequestDTO;
import com.feeling.domain.dto.auth.AuthResponseDTO;
import com.feeling.domain.dto.auth.AuthVerifyCodeDTO;
import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.UserRequestDTO;
import com.feeling.domain.services.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints para registro, login y verificación de usuarios")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    // ==============================
    // REGISTRO
    // ==============================

    @PostMapping("/register")
    @Operation(
            summary = "Registro de nuevo usuario",
            description = "Registra un nuevo usuario con datos mínimos. Envía un código de verificación por email."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuario registrado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos de registro inválidos"),
            @ApiResponse(responseCode = "409", description = "El email ya está registrado")
    })
    public ResponseEntity<MessageResponseDTO> register(@Valid @RequestBody UserRequestDTO newUser) {
        try {
            logger.info("Intento de registro para usuario: {}", newUser.email());
            MessageResponseDTO response = authService.register(newUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error en registro para {}: {}", newUser.email(), e.getMessage());
            throw e;
        }
    }

    // ==============================
    // VERIFICACIÓN DE EMAIL
    // ==============================

    @PostMapping("/verify-email")
    @Operation(
            summary = "Verificar código de email",
            description = "Verifica el código de 6 dígitos enviado al email del usuario"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Email verificado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Código inválido o expirado"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<MessageResponseDTO> verifyEmail(@Valid @RequestBody AuthVerifyCodeDTO verifyCodeDTO) {
        try {
            logger.info("Intento de verificación de email para: {}", verifyCodeDTO.email());
            MessageResponseDTO response = authService.verifyCode(verifyCodeDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error en verificación para {}: {}", verifyCodeDTO.email(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/resend-verification")
    @Operation(
            summary = "Reenviar código de verificación",
            description = "Reenvía el código de verificación al email del usuario"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Código reenviado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Solicitud demasiado frecuente"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<MessageResponseDTO> resendVerificationCode(@RequestParam String email) {
        try {
            logger.info("Reenvío de código solicitado para: {}", email);
            MessageResponseDTO response = authService.resendCode(email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error en reenvío de código para {}: {}", email, e.getMessage());
            throw e;
        }
    }

    // ==============================
    // AUTENTICACIÓN
    // ==============================

    @PostMapping("/login")
    @Operation(
            summary = "Iniciar sesión",
            description = "Autentica un usuario con email y contraseña. Retorna un token JWT."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login exitoso",
                    content = @Content(schema = @Schema(implementation = AuthResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Credenciales incorrectas o usuario no verificado"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody AuthRequestDTO authRequest) {
        try {
            logger.info("Intento de login para usuario: {}", authRequest.email());
            AuthResponseDTO response = authService.login(authRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error en login para {}: {}", authRequest.email(), e.getMessage());
            throw e;
        }
    }

    // ==============================
    // GESTIÓN DE TOKENS
    // ==============================

    @PostMapping("/refresh-token")
    @Operation(
            summary = "Refrescar token JWT",
            description = "Genera un nuevo token JWT usando un token existente válido"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token refrescado exitosamente"),
            @ApiResponse(responseCode = "401", description = "Token inválido o expirado")
    })
    public ResponseEntity<MessageResponseDTO> refreshToken(@RequestHeader("Authorization") String authHeader) throws BadRequestException {
        try {
            logger.info("Solicitud de refresh token");
            MessageResponseDTO response = authService.refreshToken(authHeader);
            return ResponseEntity.ok(response);
        } catch (BadRequestException e) {
            logger.error("Error en refresh token: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping("/logout")
    @Operation(
            summary = "Cerrar sesión",
            description = "Invalida el token JWT del usuario"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Sesión cerrada exitosamente"),
            @ApiResponse(responseCode = "401", description = "Token inválido")
    })
    public ResponseEntity<MessageResponseDTO> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            logger.info("Solicitud de logout");
            // Nota: La lógica de logout se manejará en el SecurityConfiguration
            // Este endpoint es principalmente para completitud de la API
            return ResponseEntity.ok(new MessageResponseDTO("Sesión cerrada exitosamente"));
        } catch (Exception e) {
            logger.error("Error en logout: {}", e.getMessage());
            throw e;
        }
    }

    // ==============================
    // UTILIDADES
    // ==============================

    @GetMapping("/status/{email}")
    @Operation(
            summary = "Verificar estado del usuario",
            description = "Verifica si un usuario está completamente registrado y verificado"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado verificado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UserStatusDTO> checkUserStatus(@PathVariable String email) {
        try {
            logger.info("Verificación de estado para usuario: {}", email);
            boolean isFullyRegistered = authService.isUserFullyRegistered(email);

            UserStatusDTO status = new UserStatusDTO(
                    email,
                    isFullyRegistered,
                    authService.getUserByEmail(email).map(user -> user.isVerified()).orElse(false),
                    authService.getUserByEmail(email).map(user -> user.isProfileComplete()).orElse(false)
            );

            return ResponseEntity.ok(status);
        } catch (Exception e) {
            logger.error("Error verificando estado para {}: {}", email, e.getMessage());
            throw e;
        }
    }

    // ==============================
    // DTO INTERNO PARA ESTADO DE USUARIO
    // ==============================

    public record UserStatusDTO(
            String email,
            boolean fullyRegistered,
            boolean verified,
            boolean profileComplete
    ) {
    }
}
