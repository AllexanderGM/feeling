package com.feeling.packages.user.domain.dto;

import java.util.List;
import java.util.Map;

/**
 * DTO para respuesta agrupada de atributos por tipo.
 * <p>
 * Representa el resultado de una consulta de atributos organizados
 * por sus tipos respectivos. Cada tipo contiene una lista de atributos
 * que pertenecen a esa categoría.
 * <p>
 * Casos de uso:
 * - Panel de administración para visualizar atributos agrupados
 * - Exportación de configuración de atributos del sistema
 * - Consulta de atributos disponibles por categoría
 *
 * @param attributesByType Mapa donde la clave es el tipo de atributo y el valor es la lista de atributos
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public record AttributesByTypeResponseDTO(
    Map<String, List<UserAttributeDTO>> attributesByType
) {
}
