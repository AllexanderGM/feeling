package com.feeling.domain.services.security;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class PasswordValidationService {

    // Patrones de validación
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile(".*[a-z].*");
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile(".*[A-Z].*");
    private static final Pattern DIGIT_PATTERN = Pattern.compile(".*\\d.*");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile(".*[@$!%*?&].*");
    
    // Patrones de contraseñas comunes/débiles
    private static final List<String> COMMON_PASSWORDS = List.of(
        "12345678", "password", "123456789", "qwertyui", "abc123456",
        "password123", "admin123", "welcome123", "letmein123", "monkey123",
        "dragon123", "princess123", "qwerty123", "football123", "baseball123"
    );
    
    // Patrones inseguros
    private static final List<Pattern> INSECURE_PATTERNS = List.of(
        Pattern.compile("^(.)\\1{3,}$"), // Repetición de caracteres: aaaa, 1111
        Pattern.compile("^(\\d{4,})$"), // Solo números: 12345678
        Pattern.compile("^([a-zA-Z]+)$"), // Solo letras: password
        Pattern.compile("^(\\d{1,2}/\\d{1,2}/\\d{2,4})$"), // Fechas: 01/01/1990
        Pattern.compile("^(qwerty|asdfgh|zxcvbn|qazwsx).*$", Pattern.CASE_INSENSITIVE), // Secuencias de teclado
        Pattern.compile("^(abc|123).*$", Pattern.CASE_INSENSITIVE) // Secuencias básicas
    );

    /**
     * Valida una contraseña según las políticas de seguridad definidas
     */
    public PasswordValidationResult validatePassword(String password, String userEmail) {
        List<String> errors = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();
        
        // Validación de longitud mínima
        if (password == null || password.length() < 8) {
            errors.add("La contraseña debe tener al menos 8 caracteres");
            suggestions.add("Usa una combinación de letras, números y símbolos");
        }
        
        // Validación de longitud máxima (seguridad contra ataques DoS)
        if (password != null && password.length() > 128) {
            errors.add("La contraseña no puede exceder 128 caracteres");
        }
        
        if (password != null) {
            // Validación de complejidad
            if (!LOWERCASE_PATTERN.matcher(password).matches()) {
                errors.add("La contraseña debe contener al menos una letra minúscula");
                suggestions.add("Agrega letras minúsculas como: a, b, c");
            }
            
            if (!UPPERCASE_PATTERN.matcher(password).matches()) {
                errors.add("La contraseña debe contener al menos una letra mayúscula");
                suggestions.add("Agrega letras mayúsculas como: A, B, C");
            }
            
            if (!DIGIT_PATTERN.matcher(password).matches()) {
                errors.add("La contraseña debe contener al menos un número");
                suggestions.add("Agrega números como: 0, 1, 2");
            }
            
            if (!SPECIAL_CHAR_PATTERN.matcher(password).matches()) {
                errors.add("La contraseña debe contener al menos un símbolo (@$!%*?&)");
                suggestions.add("Agrega símbolos como: @, $, !, %");
            }
            
            // Validación contra contraseñas comunes
            if (COMMON_PASSWORDS.contains(password.toLowerCase())) {
                errors.add("Esta contraseña es muy común y fácil de adivinar");
                suggestions.add("Usa una combinación única y personal");
            }
            
            // Validación contra patrones inseguros
            for (Pattern pattern : INSECURE_PATTERNS) {
                if (pattern.matcher(password).matches()) {
                    errors.add("La contraseña contiene un patrón inseguro");
                    suggestions.add("Evita secuencias predecibles y repeticiones");
                    break;
                }
            }
            
            // Validación contra información personal
            if (userEmail != null) {
                String emailPrefix = userEmail.split("@")[0].toLowerCase();
                if (password.toLowerCase().contains(emailPrefix) && emailPrefix.length() > 3) {
                    errors.add("La contraseña no debe contener partes de tu email");
                    suggestions.add("Usa palabras no relacionadas con tu información personal");
                }
            }
            
            // Validación de entropía (complejidad real)
            double entropy = calculateEntropy(password);
            if (entropy < 40) {
                errors.add("La contraseña es predecible - aumenta la variedad de caracteres");
                suggestions.add("Combina palabras, números y símbolos de forma creativa");
            }
        }
        
        boolean isValid = errors.isEmpty();
        PasswordStrength strength = calculateStrength(password, errors.size());
        
        return new PasswordValidationResult(isValid, errors, suggestions, strength);
    }
    
    /**
     * Genera sugerencias para contraseñas seguras
     */
    public List<String> generatePasswordSuggestions() {
        return List.of(
            "Casa$Verde123",
            "Playa&Sol2024",
            "Cafe@Mañana99",
            "Luna*Brillante7",
            "Viento#Fuerte85",
            "Rio!Azul456",
            "Montaña&Alta12",
            "Mar@Tranquilo34"
        );
    }
    
    /**
     * Verifica si una contraseña ha sido comprometida en brechas conocidas
     * (Implementación básica - en producción usar APIs como HaveIBeenPwned)
     */
    public boolean isPasswordCompromised(String password) {
        // Lista básica de contraseñas comprometidas más comunes
        List<String> compromisedPasswords = List.of(
            "123456", "password", "123456789", "guest", "qwerty",
            "12345678", "111111", "12345", "colonel", "abc123",
            "password1", "1234", "1234567890", "admin", "Password123"
        );
        
        return compromisedPasswords.contains(password);
    }
    
    /**
     * Calcula la entropía de una contraseña (medida de aleatoriedad)
     */
    private double calculateEntropy(String password) {
        if (password == null || password.isEmpty()) return 0;
        
        int poolSize = 0;
        boolean hasLower = LOWERCASE_PATTERN.matcher(password).matches();
        boolean hasUpper = UPPERCASE_PATTERN.matcher(password).matches();
        boolean hasDigit = DIGIT_PATTERN.matcher(password).matches();
        boolean hasSpecial = SPECIAL_CHAR_PATTERN.matcher(password).matches();
        
        if (hasLower) poolSize += 26;
        if (hasUpper) poolSize += 26;
        if (hasDigit) poolSize += 10;
        if (hasSpecial) poolSize += 8; // Caracteres especiales permitidos
        
        if (poolSize == 0) return 0;
        
        return password.length() * (Math.log(poolSize) / Math.log(2));
    }
    
    /**
     * Calcula la fuerza de la contraseña
     */
    private PasswordStrength calculateStrength(String password, int errorCount) {
        if (password == null || password.isEmpty()) {
            return PasswordStrength.VERY_WEAK;
        }
        
        if (errorCount > 3) return PasswordStrength.VERY_WEAK;
        if (errorCount > 2) return PasswordStrength.WEAK;
        if (errorCount > 1) return PasswordStrength.FAIR;
        if (errorCount == 1) return PasswordStrength.GOOD;
        
        // Sin errores - evaluar características adicionales
        double entropy = calculateEntropy(password);
        boolean hasMultipleSpecial = password.chars()
                .filter(c -> "@$!%*?&".indexOf(c) >= 0)
                .count() > 1;
        
        if (password.length() >= 12 && entropy > 60 && hasMultipleSpecial) {
            return PasswordStrength.VERY_STRONG;
        } else if (password.length() >= 10 && entropy > 50) {
            return PasswordStrength.STRONG;
        } else {
            return PasswordStrength.GOOD;
        }
    }
    
    // ==============================
    // CLASES DE RESULTADO
    // ==============================
    
    public enum PasswordStrength {
        VERY_WEAK("Muy débil", "#ff4757", 1),
        WEAK("Débil", "#ff6b81", 2),
        FAIR("Regular", "#ffa502", 3),
        GOOD("Buena", "#26de81", 4),
        STRONG("Fuerte", "#45b7d1", 5),
        VERY_STRONG("Muy fuerte", "#5f27cd", 6);
        
        private final String description;
        private final String color;
        private final int level;
        
        PasswordStrength(String description, String color, int level) {
            this.description = description;
            this.color = color;
            this.level = level;
        }
        
        public String getDescription() { return description; }
        public String getColor() { return color; }
        public int getLevel() { return level; }
    }
    
    public record PasswordValidationResult(
            boolean isValid,
            List<String> errors,
            List<String> suggestions,
            PasswordStrength strength
    ) {
        public double getStrengthPercentage() {
            return (strength.getLevel() / 6.0) * 100;
        }
    }
}