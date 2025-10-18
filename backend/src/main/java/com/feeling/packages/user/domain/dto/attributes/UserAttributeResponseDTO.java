package com.feeling.packages.user.domain.dto.attributes;

import com.feeling.packages.user.infrastructure.entities.UserAttribute;

/**
 * DTO de lectura para atributos configurables de usuario.
 * <p>
 * Se utiliza en respuestas públicas y administrativas para exponer
 * la información de los catálogos (género, color de ojos, etc.)
 * sin filtrar ni exponer detalles internos de la entidad JPA.
 *
 * @param id            Identificador del atributo
 * @param code          Código único en mayúsculas
 * @param name          Nombre legible
 * @param attributeType Tipo al que pertenece (GENDER, RELIGION, ...)
 * @param description   Descripción opcional
 * @param detail        Información extra (color, icono, etc.)
 * @param displayOrder  Orden de despliegue
 * @param active        Estado del atributo
 */
public record UserAttributeResponseDTO(
    Long id,
    String code,
    String name,
    String attributeType,
    String description,
    String detail,
    Integer displayOrder,
    boolean active
) {
    /**
     * Factory conveniente para mapear desde la entidad persistida.
     *
     * @param attribute Entidad cargada desde la base de datos
     */
    public UserAttributeResponseDTO(UserAttribute attribute) {
        this(
            attribute.getId(),
            attribute.getCode(),
            attribute.getName(),
            attribute.getAttributeType(),
            attribute.getDescription(),
            attribute.getDetail(),
            attribute.getDisplayOrder(),
            attribute.isActive()
        );
    }
}
