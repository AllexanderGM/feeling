package com.feeling.packages.auth.application;

import com.feeling.packages.auth.domain.dto.request.AppleTokenRequestDTO;
import com.feeling.packages.auth.domain.dto.request.FacebookTokenRequestDTO;
import com.feeling.packages.auth.domain.dto.request.UnlinkOAuthRequestDTO;
import com.feeling.packages.auth.domain.dto.request.GoogleTokenRequestDTO;
import com.feeling.packages.auth.domain.dto.response.AuthLoginResponseDTO;
import com.feeling.packages.auth.domain.dto.response.AuthMethodInfoDTO;
import com.feeling.packages.auth.domain.dto.response.OAuthProvidersDTO;
import com.feeling.packages.auth.domain.services.AuthService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/oauth")
@RequiredArgsConstructor
@Tag(name = "Autenticación OAuth", description = "Endpoints para autenticación con proveedores externos")
public class OAuthController {

    private static final Logger logger = LoggerFactory.getLogger(OAuthController.class);
    private final AuthService authService;

    // ==============================
    // GOOGLE OAUTH
    // ==============================

    @PostMapping("/google/register")
    @Operation(
        summary = "Registro con Google",
        description = "Registra un nuevo usuario usando autenticación de Google"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Usuario registrado exitosamente con Google",
            content = @Content(schema = @Schema(implementation = AuthLoginResponseDTO.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Token de Google inválido o datos insuficientes"
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Email ya registrado con otro método"
        ),
        @ApiResponse(
            responseCode = "429",
            description = "Demasiados intentos de registro"
        )
    })
    public ResponseEntity<AuthLoginResponseDTO> registerWithGoogle(@Valid @RequestBody GoogleTokenRequestDTO googleRequest) {
        logger.info("Intento de registro con Google - Token recibido");

        AuthLoginResponseDTO response = authService.registerWithGoogle(googleRequest);

        logger.info("Registro con Google exitoso para usuario: {}", response.profile().email());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/google/login")
    @Operation(
        summary = "Login con Google",
        description = "Autentica un usuario existente usando Google OAuth"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Login con Google exitoso",
            content = @Content(schema = @Schema(implementation = AuthLoginResponseDTO.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Token de Google inválido o usuario registrado con otro método"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Usuario no encontrado"
        ),
        @ApiResponse(
            responseCode = "429",
            description = "Demasiados intentos de login"
        )
    })
    public ResponseEntity<AuthLoginResponseDTO> loginWithGoogle(@Valid @RequestBody GoogleTokenRequestDTO googleRequest) {
        logger.info("Intento de login con Google - Token recibido");

        AuthLoginResponseDTO response = authService.loginWithGoogle(googleRequest);

        logger.info("Login con Google exitoso para usuario: {}", response.profile().email());
        return ResponseEntity.ok(response);
    }

    // ==============================
    // FACEBOOK OAUTH (PREPARADO PARA FUTURO)
    // ==============================

    @PostMapping("/facebook/register")
    @Operation(
        summary = "Registro con Facebook (Próximamente)",
        description = "Endpoint preparado para futuro registro con Facebook"
    )
    public ResponseEntity<MessageResponseDTO> registerWithFacebook(@Valid @RequestBody FacebookTokenRequestDTO facebookRequest) {
        logger.info("Intento de registro con Facebook - Funcionalidad no implementada");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
            .body(new MessageResponseDTO("Autenticación con Facebook próximamente disponible"));
    }

    @PostMapping("/facebook/login")
    @Operation(
        summary = "Login con Facebook (Próximamente)",
        description = "Endpoint preparado para futuro login con Facebook"
    )
    public ResponseEntity<MessageResponseDTO> loginWithFacebook(@Valid @RequestBody FacebookTokenRequestDTO facebookRequest) {
        logger.info("Intento de login con Facebook - Funcionalidad no implementada");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
            .body(new MessageResponseDTO("Autenticación con Facebook próximamente disponible"));
    }

    // ==============================
    // APPLE OAUTH (PREPARADO PARA FUTURO)
    // ==============================

    @PostMapping("/apple/register")
    @Operation(
        summary = "Registro con Apple (Próximamente)",
        description = "Endpoint preparado para futuro registro con Apple ID"
    )
    public ResponseEntity<MessageResponseDTO> registerWithApple(@Valid @RequestBody AppleTokenRequestDTO appleRequest) {
        logger.info("Intento de registro con Apple - Funcionalidad no implementada");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
            .body(new MessageResponseDTO("Autenticación con Apple próximamente disponible"));
    }

    @PostMapping("/apple/login")
    @Operation(
        summary = "Login con Apple (Próximamente)",
        description = "Endpoint preparado para futuro login con Apple ID"
    )
    public ResponseEntity<MessageResponseDTO> loginWithApple(@Valid @RequestBody AppleTokenRequestDTO appleRequest) {
        logger.info("Intento de login con Apple - Funcionalidad no implementada");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
            .body(new MessageResponseDTO("Autenticación con Apple próximamente disponible"));
    }

    // ==============================
    // INFORMACIÓN DE MÉTODOS OAUTH
    // ==============================

    @GetMapping("/methods/{email}")
    @Operation(
        summary = "Obtener métodos de autenticación disponibles",
        description = "Devuelve los métodos de autenticación disponibles para un email específico"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Métodos de autenticación obtenidos",
            content = @Content(schema = @Schema(implementation = AuthMethodInfoDTO.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Email no encontrado"
        )
    })
    public ResponseEntity<AuthMethodInfoDTO> getAuthMethods(@PathVariable String email) {
        logger.debug("Consultando métodos de autenticación para: {}", email);

        AuthMethodInfoDTO methodInfo = authService.getAuthMethodInfo(email);

        logger.debug("Métodos disponibles para {}: {}", email, methodInfo.availableMethods());
        return ResponseEntity.ok(methodInfo);
    }

    @GetMapping("/providers")
    @Operation(
        summary = "Listar proveedores OAuth disponibles",
        description = "Devuelve la lista de proveedores OAuth soportados por la aplicación"
    )
    public ResponseEntity<OAuthProvidersDTO> getAvailableProviders() {
        OAuthProvidersDTO providers = new OAuthProvidersDTO(
            true,  // Google disponible
            false, // Facebook no implementado
            false, // Apple no implementado
            false  // Microsoft no implementado
        );

        return ResponseEntity.ok(providers);
    }

    // ==============================
    // DESVINCULACIÓN DE OAUTH
    // ==============================

    @PostMapping("/unlink/{provider}")
    @Operation(
        summary = "Desvincular cuenta OAuth",
        description = "Desvincula una cuenta OAuth del usuario (requiere contraseña local)"
    )
    public ResponseEntity<MessageResponseDTO> unlinkOAuthAccount(
        @PathVariable String provider,
        @RequestHeader("Authorization") String authHeader,
        @Valid @RequestBody UnlinkOAuthRequestDTO unlinkRequest) {

        logger.info("Solicitud de desvinculación de cuenta {} para usuario autenticado", provider);

        MessageResponseDTO response = authService.unlinkOAuthAccount(provider, authHeader, unlinkRequest);

        logger.info("Cuenta {} desvinculada exitosamente", provider);
        return ResponseEntity.ok(response);
    }
}
