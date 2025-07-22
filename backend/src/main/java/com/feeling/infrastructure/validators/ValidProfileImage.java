package com.feeling.infrastructure.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validador personalizado para imágenes de perfil
 */
@Documented
@Constraint(validatedBy = ValidProfileImageValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidProfileImage {
    
    String message() default "Imagen de perfil no válida";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * Tamaño máximo en bytes (por defecto 5MB)
     */
    long maxSize() default 5 * 1024 * 1024;
    
    /**
     * Tipos de archivo permitidos
     */
    String[] allowedTypes() default {"image/jpeg", "image/jpg", "image/png", "image/webp"};
    
    /**
     * Extensiones permitidas
     */
    String[] allowedExtensions() default {"jpg", "jpeg", "png", "webp"};
    
    /**
     * Ancho mínimo en píxeles
     */
    int minWidth() default 100;
    
    /**
     * Alto mínimo en píxeles
     */
    int minHeight() default 100;
    
    /**
     * Ancho máximo en píxeles
     */
    int maxWidth() default 2048;
    
    /**
     * Alto máximo en píxeles
     */
    int maxHeight() default 2048;
    
    /**
     * Permitir archivos nulos
     */
    boolean allowNull() default true;
}