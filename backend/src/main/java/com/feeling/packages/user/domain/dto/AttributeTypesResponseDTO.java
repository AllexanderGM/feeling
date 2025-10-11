package com.feeling.packages.user.domain.dto;

import java.util.List;

/**
 * DTO para respuesta de tipos de atributos disponibles.
 * <p>
 * Contiene la lista de tipos únicos de atributos activos en el sistema.
 * Útil para poblar selectores, validaciones de frontend y consultas
 * de configuración.
 * <p>
 * Casos de uso:
 * - Listar opciones de tipos de atributos en formularios
 * - Validación de tipos permitidos en el frontend
 * - Documentación de tipos disponibles en la API
 *
 * @param types Lista de tipos de atributos únicos disponibles
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public record AttributeTypesResponseDTO(
    List<String> types
) {
}
