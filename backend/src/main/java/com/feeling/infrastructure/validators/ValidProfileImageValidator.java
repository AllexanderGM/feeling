package com.feeling.infrastructure.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Implementación del validador de imágenes de perfil
 */
public class ValidProfileImageValidator implements ConstraintValidator<ValidProfileImage, MultipartFile> {
    
    private long maxSize;
    private List<String> allowedTypes;
    private List<String> allowedExtensions;
    private int minWidth;
    private int minHeight;
    private int maxWidth;
    private int maxHeight;
    private boolean allowNull;
    
    @Override
    public void initialize(ValidProfileImage constraintAnnotation) {
        this.maxSize = constraintAnnotation.maxSize();
        this.allowedTypes = Arrays.asList(constraintAnnotation.allowedTypes());
        this.allowedExtensions = Arrays.asList(constraintAnnotation.allowedExtensions());
        this.minWidth = constraintAnnotation.minWidth();
        this.minHeight = constraintAnnotation.minHeight();
        this.maxWidth = constraintAnnotation.maxWidth();
        this.maxHeight = constraintAnnotation.maxHeight();
        this.allowNull = constraintAnnotation.allowNull();
    }
    
    @Override
    public boolean isValid(MultipartFile file, ConstraintValidatorContext context) {
        if (file == null || file.isEmpty()) {
            return allowNull;
        }
        
        // Validar tamaño del archivo
        if (file.getSize() > maxSize) {
            addViolation(context, String.format("El archivo es demasiado grande. Tamaño máximo: %.1f MB", 
                                               maxSize / (1024.0 * 1024.0)));
            return false;
        }
        
        // Validar tipo de contenido
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            addViolation(context, "Tipo de archivo no permitido. Tipos válidos: " + String.join(", ", allowedTypes));
            return false;
        }
        
        // Validar extensión del archivo
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            addViolation(context, "Nombre de archivo no válido");
            return false;
        }
        
        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!allowedExtensions.contains(extension)) {
            addViolation(context, "Extensión de archivo no permitida. Extensiones válidas: " + String.join(", ", allowedExtensions));
            return false;
        }
        
        // Validar dimensiones de la imagen
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                addViolation(context, "El archivo no es una imagen válida");
                return false;
            }
            
            int width = image.getWidth();
            int height = image.getHeight();
            
            if (width < minWidth || height < minHeight) {
                addViolation(context, String.format("La imagen es demasiado pequeña. Tamaño mínimo: %dx%d píxeles", 
                                                   minWidth, minHeight));
                return false;
            }
            
            if (width > maxWidth || height > maxHeight) {
                addViolation(context, String.format("La imagen es demasiado grande. Tamaño máximo: %dx%d píxeles", 
                                                   maxWidth, maxHeight));
                return false;
            }
            
        } catch (IOException e) {
            addViolation(context, "Error al procesar la imagen: " + e.getMessage());
            return false;
        }
        
        // Validaciones adicionales de seguridad
        if (containsSuspiciousContent(file)) {
            addViolation(context, "El archivo contiene contenido sospechoso");
            return false;
        }
        
        return true;
    }
    
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }
    
    private boolean containsSuspiciousContent(MultipartFile file) {
        try {
            // Leer los primeros bytes para detectar contenido sospechoso
            byte[] header = new byte[Math.min(1024, (int) file.getSize())];
            file.getInputStream().read(header);
            
            String headerString = new String(header).toLowerCase();
            
            // Detectar scripts o contenido ejecutable
            String[] suspiciousPatterns = {
                "<script", "javascript:", "vbscript:", "onload=", "onerror=",
                "<?php", "<%", "${{", "eval(", "function(",
                "\\x00", "\\xff\\xd8\\xff\\xe0", // Algunos marcadores de archivos ejecutables
            };
            
            for (String pattern : suspiciousPatterns) {
                if (headerString.contains(pattern)) {
                    return true;
                }
            }
            
            return false;
            
        } catch (IOException e) {
            // Si no podemos leer el archivo, considerarlo sospechoso
            return true;
        }
    }
    
    private void addViolation(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message)
               .addConstraintViolation();
    }
}