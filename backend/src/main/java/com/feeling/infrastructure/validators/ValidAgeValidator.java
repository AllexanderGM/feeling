package com.feeling.infrastructure.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;
import java.time.Period;

/**
 * Implementación del validador de edad
 */
public class ValidAgeValidator implements ConstraintValidator<ValidAge, LocalDate> {
    
    private int min;
    private int max;
    private boolean allowNull;
    
    @Override
    public void initialize(ValidAge constraintAnnotation) {
        this.min = constraintAnnotation.min();
        this.max = constraintAnnotation.max();
        this.allowNull = constraintAnnotation.allowNull();
    }
    
    @Override
    public boolean isValid(LocalDate dateOfBirth, ConstraintValidatorContext context) {
        if (dateOfBirth == null) {
            return allowNull;
        }
        
        LocalDate now = LocalDate.now();
        
        // Verificar que la fecha no sea en el futuro
        if (dateOfBirth.isAfter(now)) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("La fecha de nacimiento no puede ser en el futuro")
                   .addConstraintViolation();
            return false;
        }
        
        int age = Period.between(dateOfBirth, now).getYears();
        
        boolean isValidAge = age >= min && age <= max;
        
        if (!isValidAge) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                String.format("La edad debe estar entre %d y %d años. Edad actual: %d años", min, max, age))
                   .addConstraintViolation();
        }
        
        return isValidAge;
    }
}