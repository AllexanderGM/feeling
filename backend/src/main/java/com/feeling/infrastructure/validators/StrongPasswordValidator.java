package com.feeling.infrastructure.validators;

import com.feeling.domain.services.security.PasswordValidationService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

    private final PasswordValidationService passwordValidationService;
    private int minStrengthLevel;

    @Override
    public void initialize(StrongPassword constraintAnnotation) {
        this.minStrengthLevel = constraintAnnotation.minStrengthLevel();
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null || password.trim().isEmpty()) {
            return false;
        }

        // Validar usando el servicio de validación
        PasswordValidationService.PasswordValidationResult result = 
                passwordValidationService.validatePassword(password, null);

        // Verificar si cumple el nivel mínimo de fuerza
        boolean meetsMinStrength = result.strength().getLevel() >= minStrengthLevel;
        
        if (!result.isValid() || !meetsMinStrength) {
            // Desabilitar el mensaje por defecto
            context.disableDefaultConstraintViolation();
            
            // Agregar errores específicos
            for (String error : result.errors()) {
                context.buildConstraintViolationWithTemplate(error)
                       .addConstraintViolation();
            }
            
            if (!meetsMinStrength) {
                context.buildConstraintViolationWithTemplate(
                    String.format("La contraseña debe ser al menos %s. Nivel actual: %s", 
                                 getStrengthDescription(minStrengthLevel),
                                 result.strength().getDescription()))
                       .addConstraintViolation();
            }
            
            return false;
        }

        return true;
    }

    private String getStrengthDescription(int level) {
        return switch (level) {
            case 1 -> "Muy débil";
            case 2 -> "Débil";
            case 3 -> "Regular";
            case 4 -> "Buena";
            case 5 -> "Fuerte";
            case 6 -> "Muy fuerte";
            default -> "Desconocido";
        };
    }
}