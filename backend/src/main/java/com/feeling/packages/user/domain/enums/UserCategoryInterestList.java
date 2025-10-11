package com.feeling.packages.user.domain.enums;

/**
 * Enum que define los identificadores de las categorías de interés en la plataforma Feeling.
 * <p>
 * Las tres categorías representan diferentes enfoques de conexión:
 * <ul>
 *   <li>ESSENCE: Relaciones heterosexuales auténticas y significativas</li>
 *   <li>ROUSE: Espacio inclusivo para la comunidad LGBTI+</li>
 *   <li>SPIRIT: Comunidad cristiana con valores compartidos</li>
 * </ul>
 * <p>
 * Solo contiene los identificadores únicos. Toda la información descriptiva
 * (nombres, descripciones, características, íconos) se maneja en la entidad
 * {@link com.feeling.packages.user.infrastructure.entities.UserCategoryInterest}
 * almacenada en base de datos.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public enum UserCategoryInterestList {
    /**
     * Essence (✨) - Conexiones auténticas para relaciones heterosexuales.
     * <p>
     * Enfocado en relaciones heterosexuales auténticas desde citas casuales
     * hasta relaciones de largo plazo. Algoritmos diseñados para compatibilidad
     * en relaciones heterosexuales tradicionales.
     * <p>
     * Campos adicionales requeridos: Ninguno
     */
    ESSENCE,

    /**
     * Rouse (🏳️‍🌈) - Espacio inclusivo para la comunidad LGBTI+.
     * <p>
     * Espacio seguro e inclusivo para la comunidad LGBTI+ con opciones flexibles
     * de identidad de género y orientación sexual. Ambiente 100% inclusivo y
     * respetuoso con herramientas reforzadas de seguridad y privacidad.
     * <p>
     * Campos adicionales requeridos: sexualRole, relationshipType
     */
    ROUSE,

    /**
     * Spirit (✝️) - Comunidad cristiana con valores compartidos.
     * <p>
     * Comunidad para personas cristianas que desean conectar con otros que
     * comparten su fe y valores espirituales. Enfoque en relaciones donde
     * la fe es parte fundamental del vínculo.
     * <p>
     * Campos adicionales requeridos: religion
     */
    SPIRIT
}
