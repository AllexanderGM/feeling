package com.feeling.packages.auth.domain.dto.mapper;

import com.feeling.packages.auth.domain.dto.password.*;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Factoría de DTOs exclusivos para los flujos de gestión de contraseñas.
 * <p>
 * Ofrece métodos de conveniencia que encapsulan la construcción de respuestas
 * públicas a partir de resultados internos del dominio.
 */
@Component
public class PasswordResponseFactory {

    private static final List<String> PASSWORD_GUIDELINES = List.of(
        "Usa al menos 8 caracteres",
        "Combina letras mayúsculas y minúsculas",
        "Incluye números y símbolos",
        "Evita información personal",
        "No uses contraseñas comunes",
        "Considera usar frases con símbolos"
    );

    private static final List<String> COMPROMISED_WARNINGS = List.of(
        "Cambia esta contraseña inmediatamente",
        "Nunca reutilices contraseñas comprometidas",
        "Considera usar un gestor de contraseñas"
    );

    private static final List<String> NON_COMPROMISED_RECOMMENDATION = List.of(
        "Continúa usando buenas prácticas de seguridad"
    );

    private static final List<String> VALIDATION_COMPROMISED_NOTICE = List.of(
        "Esta contraseña ha sido comprometida en brechas de seguridad"
    );

    private static final List<String> ALLOWED_SYMBOLS = List.of("@", "$", "!", "%", "*", "?", "&");

    /**
     * Construye la respuesta pública a partir del resultado interno de validación.
     */
    public PasswordValidationResponseDTO buildValidationResponse(PasswordValidationResultDTO result, boolean compromised) {
        PasswordStrengthInfoDTO strengthInfo = new PasswordStrengthInfoDTO(
            result.strength().name(),
            result.strength().getDescription(),
            result.strength().getColor(),
            result.strength().getLevel(),
            result.strengthPercentage()
        );

        List<String> warnings = compromised ? VALIDATION_COMPROMISED_NOTICE : List.of();

        return new PasswordValidationResponseDTO(
            result.isValid(),
            result.errors(),
            result.suggestions(),
            strengthInfo,
            compromised,
            warnings
        );
    }

    /**
     * Construye la respuesta con sugerencias de contraseñas seguras.
     */
    public PasswordSuggestionsResponseDTO buildPasswordSuggestions(List<String> suggestions) {
        return new PasswordSuggestionsResponseDTO(suggestions, PASSWORD_GUIDELINES);
    }

    /**
     * Construye la respuesta para la verificación de contraseñas comprometidas.
     */
    public CompromisedCheckResponseDTO buildCompromisedCheckResponse(boolean compromised) {
        String message = compromised
            ? "Esta contraseña ha sido encontrada en brechas de seguridad"
            : "Contraseña no encontrada en brechas conocidas";

        List<String> recommendations = compromised ? COMPROMISED_WARNINGS : NON_COMPROMISED_RECOMMENDATION;

        return new CompromisedCheckResponseDTO(compromised, message, recommendations);
    }

    /**
     * Construye la respuesta con la política vigente de contraseñas.
     */
    public PasswordPolicyResponseDTO buildPasswordPolicy() {
        return new PasswordPolicyResponseDTO(
            8,
            128,
            true,
            true,
            true,
            true,
            ALLOWED_SYMBOLS,
            PASSWORD_GUIDELINES
        );
    }
}
