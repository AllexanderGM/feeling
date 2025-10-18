package com.feeling.packages.user.domain.dto.interest;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de salida para representar categorías de interés configuradas en el sistema.
 * <p>
 * Expone toda la metadata relevante para construir formularios y paneles
 * administrativos, manteniendo separados los datos enviados por el cliente.
 *
 * @param id              Identificador de la categoría
 * @param interestEnum    Enum asociado (ESSENCE, ROUSE, SPIRIT)
 * @param name            Nombre legible
 * @param description     Descripción corta
 * @param icon            Icono/pictograma asociado
 * @param fullDescription Descripción extendida
 * @param targetAudience  Público objetivo descriptivo
 * @param features        Lista de características adicionales
 * @param isActive        Estado activo/inactivo
 * @param displayOrder    Orden de despliegue
 * @param createdAt       Fecha de creación
 * @param updatedAt       Fecha de actualización
 */
public record UserInterestResponseDTO(
    Long id,
    String interestEnum,
    String name,
    String description,
    String icon,
    String fullDescription,
    String targetAudience,
    List<String> features,
    boolean isActive,
    Integer displayOrder,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
