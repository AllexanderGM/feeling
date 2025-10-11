package com.feeling.packages.auth.domain.enums;

import lombok.Getter;

/**
 * Niveles de fuerza de contraseñas evaluados en la plataforma.
 */
@Getter
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

}
