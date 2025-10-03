package com.feeling.packages.user.domain.dto;

/**
 * DTO para la compatibilidad entre dos usuarios
 * Proporciona el score total y el desglose por factores
 */
public record UserCompatibilityDTO(
        Double totalScore,
        Integer totalPercentage,
        CompatibilityFactorsDTO factors
) {
    /**
     * DTO anidado con el desglose de cada factor de compatibilidad
     */
    public record CompatibilityFactorsDTO(
            Double categoryScore,
            Double ageScore,
            Double locationScore,
            Double tagsScore,
            String categoryMatch,
            String ageMatch,
            String locationMatch,
            String tagsMatch
    ) {}

    /**
     * Constructor que calcula el porcentaje automáticamente
     */
    public static UserCompatibilityDTO from(
            Double totalScore,
            Double categoryScore,
            Double ageScore,
            Double locationScore,
            Double tagsScore,
            String categoryMatch,
            String ageMatch,
            String locationMatch,
            String tagsMatch
    ) {
        Integer percentage = (int) Math.round(totalScore * 100);

        CompatibilityFactorsDTO factors = new CompatibilityFactorsDTO(
                categoryScore,
                ageScore,
                locationScore,
                tagsScore,
                categoryMatch,
                ageMatch,
                locationMatch,
                tagsMatch
        );

        return new UserCompatibilityDTO(totalScore, percentage, factors);
    }
}
