package com.feeling.infrastructure.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

/**
 * Implementación del validador de nombres
 */
public class ValidNameValidator implements ConstraintValidator<ValidName, String> {
    
    private int minLength;
    private int maxLength;
    private boolean allowSpaces;
    private boolean allowNull;
    
    // Patrones regex para validación
    private static final Pattern INVALID_CHARS = Pattern.compile("[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\\s'-]");
    private static final Pattern MULTIPLE_SPACES = Pattern.compile("\\s{2,}");
    private static final Pattern STARTS_OR_ENDS_WITH_SPACE = Pattern.compile("^\\s|\\s$");
    private static final Pattern CONSECUTIVE_SPECIAL_CHARS = Pattern.compile("[-']{2,}");
    
    @Override
    public void initialize(ValidName constraintAnnotation) {
        this.minLength = constraintAnnotation.minLength();
        this.maxLength = constraintAnnotation.maxLength();
        this.allowSpaces = constraintAnnotation.allowSpaces();
        this.allowNull = constraintAnnotation.allowNull();
    }
    
    @Override
    public boolean isValid(String name, ConstraintValidatorContext context) {
        if (name == null) {
            return allowNull;
        }
        
        if (name.trim().isEmpty()) {
            addViolation(context, "El nombre no puede estar vacío");
            return false;
        }
        
        // Verificar longitud
        if (name.length() < minLength || name.length() > maxLength) {
            addViolation(context, String.format("El nombre debe tener entre %d y %d caracteres", minLength, maxLength));
            return false;
        }
        
        // Verificar espacios si no están permitidos
        if (!allowSpaces && name.contains(" ")) {
            addViolation(context, "El nombre no puede contener espacios");
            return false;
        }
        
        // Verificar caracteres inválidos
        if (INVALID_CHARS.matcher(name).find()) {
            addViolation(context, "El nombre contiene caracteres no válidos. Solo se permiten letras, espacios, guiones y apostrofes");
            return false;
        }
        
        // Verificar espacios múltiples
        if (MULTIPLE_SPACES.matcher(name).find()) {
            addViolation(context, "El nombre no puede contener espacios consecutivos");
            return false;
        }
        
        // Verificar que no inicie o termine con espacio
        if (STARTS_OR_ENDS_WITH_SPACE.matcher(name).find()) {
            addViolation(context, "El nombre no puede iniciar o terminar con espacios");
            return false;
        }
        
        // Verificar caracteres especiales consecutivos
        if (CONSECUTIVE_SPECIAL_CHARS.matcher(name).find()) {
            addViolation(context, "El nombre no puede contener guiones o apostrofes consecutivos");
            return false;
        }
        
        // Verificar que no sea solo caracteres especiales
        if (name.replaceAll("[\\s'-]", "").isEmpty()) {
            addViolation(context, "El nombre debe contener al menos una letra");
            return false;
        }
        
        return true;
    }
    
    private void addViolation(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message)
               .addConstraintViolation();
    }
}