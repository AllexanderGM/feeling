package com.feeling.infrastructure.validators;

import com.feeling.infrastructure.entities.user.UserAttribute;
import com.feeling.infrastructure.repositories.user.IUserAttributeRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Implementación del validador de atributos de usuario
 */
@Component
@RequiredArgsConstructor
public class ValidUserAttributeValidator implements ConstraintValidator<ValidUserAttribute, String> {
    
    private final IUserAttributeRepository userAttributeRepository;
    
    private String attributeType;
    private boolean allowNull;
    private boolean requireActive;
    
    @Override
    public void initialize(ValidUserAttribute constraintAnnotation) {
        this.attributeType = constraintAnnotation.attributeType();
        this.allowNull = constraintAnnotation.allowNull();
        this.requireActive = constraintAnnotation.requireActive();
    }
    
    @Override
    public boolean isValid(String attributeCode, ConstraintValidatorContext context) {
        if (attributeCode == null || attributeCode.trim().isEmpty()) {
            return allowNull;
        }
        
        // Buscar el atributo en la base de datos
        Optional<UserAttribute> userAttributeOpt = userAttributeRepository
                .findByCodeAndAttributeType(attributeCode, attributeType);
        
        if (userAttributeOpt.isEmpty()) {
            addViolation(context, String.format("El código '%s' no es válido para el tipo de atributo '%s'", 
                                               attributeCode, attributeType));
            return false;
        }
        
        UserAttribute userAttribute = userAttributeOpt.get();
        
        // Verificar si está activo (si se requiere)
        if (requireActive && !userAttribute.isActive()) {
            addViolation(context, String.format("El atributo '%s' no está disponible actualmente", 
                                               userAttribute.getName()));
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