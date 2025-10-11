package com.feeling.packages.user.domain.dto.attributes;

import java.util.List;
import java.util.Map;

/**
 * DTO para estadísticas de atributos de usuario.
 * <p>
 * Proporciona métricas sobre la distribución y uso de atributos del sistema
 * (género, edad, estado civil, iglesia, color de ojos, etc.).
 * <p>
 * Usado en analytics del panel administrativo para analizar la demografía
 * y patrones de configuración de atributos en la plataforma.
 *
 * @param totalAttributes    Total de atributos registrados en el sistema
 * @param activeAttributes   Cantidad de atributos activos
 * @param inactiveAttributes Cantidad de atributos inactivos
 * @param distributionByType Distribución de atributos por tipo (GENDER, AGE, etc.)
 * @param activeByType       Distribución de atributos activos por tipo
 * @param availableTypes     Lista de tipos de atributos disponibles en el sistema
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public record UserAttributeStatisticsResponseDTO(
    Integer totalAttributes,
    Integer activeAttributes,
    Integer inactiveAttributes,
    Map<String, Long> distributionByType,
    Map<String, Long> activeByType,
    List<String> availableTypes
) {
}
