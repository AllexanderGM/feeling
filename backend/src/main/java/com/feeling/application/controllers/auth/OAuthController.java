package com.feeling.application.controllers.auth;

import com.feeling.domain.dto.auth.AuthLoginResponseDTO;
import com.feeling.domain.dto.auth.AuthMethodInfoDTO;
import com.feeling.domain.dto.auth.GoogleTokenRequestDTO;
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
    public ResponseEntity<?> registerWithGoogle(@Valid @RequestBody GoogleTokenRequestDTO googleRequest) {
        logger.info("Intento de registro con Google - Token recibido");
        
        try {
            AuthLoginResponseDTO response = authService.registerWithGoogle(googleRequest);
            
            logger.info("Registro con Google exitoso para usuario: {}", response.profile().email());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            logger.warn("Error en registro con Google: {}", e.getMessage());
            
            if (e.getMessage().contains("ya registrado")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new MessageResponseDTO("Email ya registrado con otro método"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponseDTO("Error en autenticación con Google: " + e.getMessage()));
            }
        }
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
    public ResponseEntity<?> loginWithGoogle(@Valid @RequestBody GoogleTokenRequestDTO googleRequest) {
        logger.info("Intento de login con Google - Token recibido");
        
        try {
            AuthLoginResponseDTO response = authService.loginWithGoogle(googleRequest);
            
            logger.info("Login con Google exitoso para usuario: {}", response.profile().email());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.warn("Error en login con Google: {}", e.getMessage());
            
            if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponseDTO("Usuario no registrado. Use el endpoint de registro."));
            } else if (e.getMessage().contains("método")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponseDTO("Este email está registrado con otro método de autenticación"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponseDTO("Error en autenticación con Google: " + e.getMessage()));
            }
        }
    }

    // ==============================
    // FACEBOOK OAUTH (PREPARADO PARA FUTURO)
    // ==============================

    @PostMapping("/facebook/register")
    @Operation(
            summary = "Registro con Facebook (Próximamente)",
            description = "Endpoint preparado para futuro registro con Facebook"
    )
    public ResponseEntity<MessageResponseDTO> registerWithFacebook(@RequestBody FacebookTokenRequestDTO facebookRequest) {
        logger.info("Intento de registro con Facebook - Funcionalidad no implementada");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(new MessageResponseDTO("Autenticación con Facebook próximamente disponible"));
    }

    @PostMapping("/facebook/login")
    @Operation(
            summary = "Login con Facebook (Próximamente)",
            description = "Endpoint preparado para futuro login con Facebook"
    )
    public ResponseEntity<MessageResponseDTO> loginWithFacebook(@RequestBody FacebookTokenRequestDTO facebookRequest) {
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
    public ResponseEntity<MessageResponseDTO> registerWithApple(@RequestBody AppleTokenRequestDTO appleRequest) {
        logger.info("Intento de registro con Apple - Funcionalidad no implementada");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(new MessageResponseDTO("Autenticación con Apple próximamente disponible"));
    }

    @PostMapping("/apple/login")
    @Operation(
            summary = "Login con Apple (Próximamente)",
            description = "Endpoint preparado para futuro login con Apple ID"
    )
    public ResponseEntity<MessageResponseDTO> loginWithApple(@RequestBody AppleTokenRequestDTO appleRequest) {
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
            @RequestBody UnlinkOAuthRequestDTO unlinkRequest) {
        
        logger.info("Solicitud de desvinculación de cuenta {} para usuario autenticado", provider);
        
        try {
            MessageResponseDTO response = authService.unlinkOAuthAccount(provider, authHeader, unlinkRequest);
            
            logger.info("Cuenta {} desvinculada exitosamente", provider);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.warn("Error al desvincular cuenta {}: {}", provider, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponseDTO("Error al desvincular cuenta: " + e.getMessage()));
        }
    }

    // ==============================
    // DTOs ESPECÍFICOS
    // ==============================

    public record FacebookTokenRequestDTO(
            @jakarta.validation.constraints.NotBlank(message = "Token de Facebook es obligatorio")
            String accessToken
    ) {}

    public record AppleTokenRequestDTO(
            @jakarta.validation.constraints.NotBlank(message = "Token de Apple es obligatorio")
            String identityToken,
            String authorizationCode
    ) {}

    public record OAuthProvidersDTO(
            boolean googleEnabled,
            boolean facebookEnabled,
            boolean appleEnabled,
            boolean microsoftEnabled
    ) {}

    public record UnlinkOAuthRequestDTO(
            @jakarta.validation.constraints.NotBlank(message = "Contraseña local es obligatoria")
            String localPassword,
            
            @jakarta.validation.constraints.NotBlank(message = "Confirmación es obligatoria")
            String confirmationText // Usuario debe escribir "CONFIRMAR" para desvincular
    ) {
        public UnlinkOAuthRequestDTO {
            if (!"CONFIRMAR".equals(confirmationText)) {
                throw new IllegalArgumentException("Debe escribir 'CONFIRMAR' para desvincular la cuenta");
            }
        }
    }
}