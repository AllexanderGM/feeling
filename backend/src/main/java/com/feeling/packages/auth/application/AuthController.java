package com.feeling.packages.auth.application;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.auth.*;
import com.feeling.packages.auth.domain.dto.mapper.AuthResponseFactory;
import com.feeling.packages.auth.domain.dto.password.ForgotPasswordRequestDTO;
import com.feeling.packages.auth.domain.dto.password.ResetPasswordRequestDTO;
import com.feeling.packages.auth.domain.dto.verification.*;
import com.feeling.packages.auth.domain.dto.views.AuthViews;
import com.feeling.packages.auth.domain.services.AuthService;
import com.feeling.packages.auth.domain.services.PasswordService;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.user.infrastructure.entities.User;
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

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints para registro, login y verificación de usuarios")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;
    private final PasswordService passwordService;
    private final AuthResponseFactory authResponseFactory;

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
    public ResponseEntity<MessageResponseDTO> register(@Valid @RequestBody AuthRegisterRequestDTO newUser) {
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
    public ResponseEntity<MessageResponseDTO> resendVerificationCode(@Valid @RequestBody AuthResendCodeRequestDTO request) {
        try {
            logger.info("Reenvío de código solicitado para: {}", request.email());
            MessageResponseDTO response = authService.resendCode(request.email());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error en reenvío de código para {}: {}", request.email(), e.getMessage());
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
            content = @Content(schema = @Schema(implementation = AuthLoginResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "Credenciales incorrectas o usuario no verificado"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @JsonView(AuthViews.Session.Full.class)
    public ResponseEntity<AuthLoginResponseDTO> login(@Valid @RequestBody AuthLoginRequestDTO authRequest) {
        try {
            logger.info("Intento de login para usuario: {}", authRequest.email());
            AuthLoginResponseDTO response = authService.login(authRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error en login para {}: {}", authRequest.email(), e.getMessage());
            throw e;
        }
    }

    @GetMapping("/check-auth-method/{email}")
    @Operation(
        summary = "Verificar método de autenticación",
        description = "Verifica qué método de autenticación debe usar un email específico"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Método de autenticación verificado"),
        @ApiResponse(responseCode = "404", description = "Email no registrado")
    })
    @JsonView(AuthViews.Verification.Basic.class)
    public ResponseEntity<AuthMethodInfoDTO> checkAuthMethod(@PathVariable String email) {
        try {
            logger.info("Verificando método de autenticación para: {}", email);

            Optional<User> userOptional = authService.getUserByEmail(email);

            AuthMethodInfoDTO info = authResponseFactory.resolveAuthMethodInfo(
                email,
                userOptional,
                userOptional.map(User::getAuthMethodMessage).orElse(null),
                "Email no registrado. Puedes registrarte con cualquier método."
            );

            return ResponseEntity.ok(info);

        } catch (Exception e) {
            logger.error("Error verificando método de autenticación para {}: {}", email, e.getMessage());
            throw e;
        }
    }

    @GetMapping("/check-email/{email}")
    @Operation(
        summary = "Verificar disponibilidad de email",
        description = "Verifica si un email está disponible para registro y con qué método"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Información del email verificada")
    })
    @JsonView(AuthViews.Verification.Basic.class)
    public ResponseEntity<EmailAvailabilityDTO> checkEmailAvailability(@PathVariable String email) {
        try {
            logger.info("Verificando disponibilidad del email: {}", email);

            Optional<User> userOptional = authService.getUserByEmail(email);

            if (userOptional.isEmpty()) {
                // Email disponible
                return ResponseEntity.ok(
                    authResponseFactory.createEmailAvailable(
                        email,
                        "Email disponible para registro",
                        null
                    )
                );
            }

            User user = userOptional.get();
            return ResponseEntity.ok(authResponseFactory.createEmailConflict(user, null));

        } catch (Exception e) {
            logger.error("Error verificando disponibilidad del email {}: {}", email, e.getMessage());
            throw e;
        }
    }

    // ==============================
    // GESTIÓN DE TOKENS
    // ==============================

    @PostMapping("/refresh-token")
    @Operation(
        summary = "Refrescar access token",
        description = "Genera un nuevo access token usando un refresh token válido"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Access token refrescado exitosamente"),
        @ApiResponse(responseCode = "401", description = "Refresh token inválido o expirado")
    })
    @JsonView(AuthViews.Session.Basic.class)
    public ResponseEntity<RefreshTokenResponseDTO> refreshToken(
        @RequestBody @Valid RefreshTokenRequestDTO request) throws BadRequestException {
        try {
            logger.info("Solicitud de refresh token");
            RefreshTokenResponseDTO response = authService.refreshToken(request);
            return ResponseEntity.ok(response);
        } catch (BadRequestException e) {
            logger.error("Error en refresh token: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping("/logout")
    @Operation(
        summary = "Cerrar sesión",
        description = "Invalida todos los tokens JWT del usuario"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sesión cerrada exitosamente"),
        @ApiResponse(responseCode = "401", description = "Token inválido")
    })
    public ResponseEntity<MessageResponseDTO> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            logger.info("Solicitud de logout");
            MessageResponseDTO response = authService.logout(authHeader);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error en logout: {}", e.getMessage());
            throw e;
        }
    }

    // ==============================
    // RECUPERACIÓN DE CONTRASEÑA
    // ==============================

    @PostMapping("/forgot-password")
    @Operation(
        summary = "Solicitar recuperación de contraseña",
        description = "Envía un enlace de recuperación de contraseña al email del usuario"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Enlace de recuperación enviado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "400", description = "Email inválido o usuario no verificado")
    })
    public ResponseEntity<MessageResponseDTO> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        try {
            logger.info("Solicitud de recuperación de contraseña para: {}", request.email());
            MessageResponseDTO response = passwordService.forgotPassword(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error en recuperación de contraseña para {}: {}", request.email(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/reset-password")
    @Operation(
        summary = "Restablecer contraseña",
        description = "Restablece la contraseña del usuario usando el token enviado por email"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Contraseña restablecida exitosamente"),
        @ApiResponse(responseCode = "400", description = "Token inválido o expirado"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<MessageResponseDTO> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        try {
            logger.info("Intento de restablecimiento de contraseña con token");
            MessageResponseDTO response = passwordService.resetPassword(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error en restablecimiento de contraseña: {}", e.getMessage());
            throw e;
        }
    }

    @GetMapping("/validate-reset-token/{token}")
    @Operation(
        summary = "Validar token de recuperación",
        description = "Verifica si un token de recuperación de contraseña es válido"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token válido"),
        @ApiResponse(responseCode = "400", description = "Token inválido o expirado")
    })
    @JsonView(AuthViews.Password.Basic.class)
    public ResponseEntity<TokenValidationDTO> validateResetToken(@PathVariable String token) {
        try {
            logger.info("Validando token de recuperación de contraseña");
            TokenValidationDTO response = passwordService.validateResetToken(token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error validando token de recuperación: {}", e.getMessage());
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
    @JsonView(AuthViews.Verification.Basic.class)
    public ResponseEntity<AuthUserStatusDTO> checkUserStatus(@PathVariable String email) {
        try {
            logger.info("Verificación de estado para usuario: {}", email);
            boolean isFullyRegistered = authService.isUserFullyRegistered(email);

            Optional<User> userOptional = authService.getUserByEmail(email);

            AuthUserStatusDTO status = authResponseFactory.createAuthUserStatus(email, isFullyRegistered, userOptional);

            return ResponseEntity.ok(status);
        } catch (Exception e) {
            logger.error("Error verificando estado para {}: {}", email, e.getMessage());
            throw e;
        }
    }
}
