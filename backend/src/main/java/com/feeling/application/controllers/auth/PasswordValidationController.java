package com.feeling.application.controllers.auth;

import com.feeling.domain.services.security.PasswordValidationService;
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
@RequestMapping("/auth/password-validation")
@RequiredArgsConstructor
@Tag(name = "Validación de Contraseñas", description = "Endpoints para validar fortaleza y seguridad de contraseñas")
public class PasswordValidationController {

    private static final Logger logger = LoggerFactory.getLogger(PasswordValidationController.class);
    private final PasswordValidationService passwordValidationService;

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
                    content = @Content(schema = @Schema(implementation = PasswordValidationResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Datos de validación inválidos"
            )
    })
    public ResponseEntity<PasswordValidationResponse> validatePassword(
            @Valid @RequestBody PasswordValidationRequest request) {
        
        logger.debug("Validando fortaleza de contraseña para email: {}", 
                    request.email() != null ? request.email() : "no especificado");
        
        PasswordValidationService.PasswordValidationResult result = 
                passwordValidationService.validatePassword(request.password(), request.email());
        
        boolean isCompromised = passwordValidationService.isPasswordCompromised(request.password());
        
        PasswordValidationResponse response = new PasswordValidationResponse(
                result.isValid(),
                result.errors(),
                result.suggestions(),
                new PasswordStrengthInfo(
                        result.strength().name(),
                        result.strength().getDescription(),
                        result.strength().getColor(),
                        result.strength().getLevel(),
                        result.getStrengthPercentage()
                ),
                isCompromised,
                isCompromised ? List.of("Esta contraseña ha sido comprometida en brechas de seguridad") : List.of()
        );
        
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
                    content = @Content(schema = @Schema(implementation = PasswordSuggestionsResponse.class))
            )
    })
    public ResponseEntity<PasswordSuggestionsResponse> getPasswordSuggestions() {
        logger.debug("Generando sugerencias de contraseñas seguras");
        
        List<String> suggestions = passwordValidationService.generatePasswordSuggestions();
        
        PasswordSuggestionsResponse response = new PasswordSuggestionsResponse(
                suggestions,
                List.of(
                        "Usa al menos 8 caracteres",
                        "Combina letras mayúsculas y minúsculas",
                        "Incluye números y símbolos",
                        "Evita información personal",
                        "No uses contraseñas comunes",
                        "Considera usar frases con símbolos"
                )
        );
        
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
                    content = @Content(schema = @Schema(implementation = CompromisedCheckResponse.class))
            )
    })
    public ResponseEntity<CompromisedCheckResponse> checkCompromisedPassword(
            @Valid @RequestBody CompromisedCheckRequest request) {
        
        logger.debug("Verificando si contraseña está comprometida");
        
        boolean isCompromised = passwordValidationService.isPasswordCompromised(request.password());
        
        CompromisedCheckResponse response = new CompromisedCheckResponse(
                isCompromised,
                isCompromised ? "Esta contraseña ha sido encontrada en brechas de seguridad" : "Contraseña no encontrada en brechas conocidas",
                isCompromised ? List.of(
                        "Cambia esta contraseña inmediatamente",
                        "Nunca reutilices contraseñas comprometidas",
                        "Considera usar un gestor de contraseñas"
                ) : List.of("Continúa usando buenas prácticas de seguridad")
        );
        
        logger.debug("Verificación completada - Comprometida: {}", isCompromised);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/policy")
    @Operation(
            summary = "Obtener política de contraseñas",
            description = "Devuelve los requisitos y políticas actuales para contraseñas"
    )
    public ResponseEntity<PasswordPolicyResponse> getPasswordPolicy() {
        PasswordPolicyResponse policy = new PasswordPolicyResponse(
                8,  // Mínimo
                128, // Máximo
                true, // Requiere minúsculas
                true, // Requiere mayúsculas
                true, // Requiere números
                true, // Requiere símbolos
                List.of("@", "$", "!", "%", "*", "?", "&"),
                List.of(
                        "La contraseña debe tener al menos 8 caracteres",
                        "Debe contener al menos una letra minúscula",
                        "Debe contener al menos una letra mayúscula", 
                        "Debe contener al menos un número",
                        "Debe contener al menos un símbolo (@$!%*?&)",
                        "No debe contener información personal",
                        "No debe ser una contraseña común"
                )
        );
        
        return ResponseEntity.ok(policy);
    }

    // ==============================
    // DTOs DE REQUEST
    // ==============================

    public record PasswordValidationRequest(
            @jakarta.validation.constraints.NotBlank(message = "La contraseña es obligatoria")
            String password,
            
            String email // Opcional para validaciones adicionales
    ) {}

    public record CompromisedCheckRequest(
            @jakarta.validation.constraints.NotBlank(message = "La contraseña es obligatoria")
            String password
    ) {}

    // ==============================
    // DTOs DE RESPONSE
    // ==============================

    public record PasswordValidationResponse(
            boolean isValid,
            List<String> errors,
            List<String> suggestions,
            PasswordStrengthInfo strength,
            boolean isCompromised,
            List<String> securityWarnings
    ) {}

    public record PasswordStrengthInfo(
            String level,           // WEAK, FAIR, GOOD, etc.
            String description,     // "Débil", "Buena", etc.
            String color,          // Color hex para UI
            int numericLevel,      // 1-6
            double percentage      // 0-100%
    ) {}

    public record PasswordSuggestionsResponse(
            List<String> suggestions,
            List<String> tips
    ) {}

    public record CompromisedCheckResponse(
            boolean isCompromised,
            String message,
            List<String> recommendations
    ) {}

    public record PasswordPolicyResponse(
            int minLength,
            int maxLength,
            boolean requiresLowercase,
            boolean requiresUppercase,
            boolean requiresNumbers,
            boolean requiresSymbols,
            List<String> allowedSymbols,
            List<String> rules
    ) {}
}