package com.feeling.packages.user.domain.dto.interest;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO de entrada para crear o actualizar categorías de interés de usuario.
 * <p>
 * Separa los datos provistos por el cliente de los DTO orientados a respuesta,
 * permitiendo validar y normalizar la información antes de delegarla al dominio.
 *
 * @param interestEnum    Identificador único de la categoría (ESSENCE, ROUSE, SPIRIT)
 * @param name            Nombre legible de la categoría
 * @param description     Descripción corta (máx. 500 caracteres)
 * @param icon            Código/icono asociado (máx. 20 caracteres)
 * @param fullDescription Descripción extendida (HTML/markdown permitido)
 * @param targetAudience  Texto que describe el público objetivo
 * @param features        Lista de características adicionales opcionales
 * @param active          Estado activo/inactivo de la categoría
 * @param displayOrder    Orden preferido en el listado (opcional)
 */
public record UserInterestRequestDTO(
    @NotBlank(message = "El identificador de la categoría es obligatorio")
    String interestEnum,

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    String name,

    @Size(max = 400, message = "La descripción corta no puede superar 400 caracteres")
    String description,

    @Size(max = 20, message = "El icono no puede superar 20 caracteres")
    String icon,

    @Size(max = 1500, message = "La descripción extendida no puede superar 1500 caracteres")
    String fullDescription,

    String targetAudience,

    List<@NotBlank(message = "Las características no pueden ser vacías") String> features,

    @NotNull(message = "El estado activo es obligatorio")
    Boolean active,

    Integer displayOrder
) {
    /**
     * Constructor compacto que normaliza cadenas y evita listas nulas.
     */
    public UserInterestRequestDTO {
        name = name != null ? name.trim() : null;
        interestEnum = interestEnum != null ? interestEnum.trim() : null;
        description = description != null ? description.trim() : null;
        icon = icon != null ? icon.trim() : null;
        fullDescription = fullDescription != null ? fullDescription.trim() : null;
        targetAudience = targetAudience != null ? targetAudience.trim() : null;
        features = features != null ? new ArrayList<>(features) : new ArrayList<>();
    }
}
