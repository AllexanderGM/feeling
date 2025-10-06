package com.feeling.packages.user.domain.enums;

import java.util.Arrays;

/**
 * Enum que define los identificadores de las categorías de interés en la plataforma Feeling.
 * <p>
 * Solo contiene los identificadores únicos de las tres categorías principales:
 * ESSENCE, ROUSE y SPIRIT.
 * <p>
 * Toda la información descriptiva (nombres, descripciones, características) se maneja
 * en la entidad UserCategoryInterest que se almacena en la base de datos.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public enum UserCategoryInterestList {
    ESSENCE,
    ROUSE,
    SPIRIT;

    /**
     * Busca una categoría por nombre, ignorando mayúsculas y minúsculas.
     * Si no encuentra coincidencia, retorna ESSENCE como categoría por defecto.
     *
     * @param userCategoryInterest Nombre de la categoría a buscar
     * @return La categoría encontrada o ESSENCE como fallback
     */
    public static UserCategoryInterestList lookup(String userCategoryInterest) {
        return Arrays.stream(values())
            .filter(r -> r.name().equalsIgnoreCase(userCategoryInterest))
            .findFirst()
            .orElse(ESSENCE);
    }

    /**
     * Verifica si una categoría requiere campos adicionales obligatorios en el perfil.
     *
     * @return true si la categoría requiere campos adicionales
     */
    public boolean requiresAdditionalFields() {
        return this == ROUSE || this == SPIRIT;
    }
}
