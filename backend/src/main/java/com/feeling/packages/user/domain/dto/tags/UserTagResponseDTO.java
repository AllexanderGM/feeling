package com.feeling.packages.user.domain.dto.tags;

import com.feeling.packages.user.infrastructure.entities.UserTag;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * DTO de lectura para tags asociados a usuarios.
 * <p>
 * Se usa en endpoints de perfil y administración para exponer
 * la información relevante del tag sin acoplarse a la entidad.
 *
 * @param id          Identificador del tag
 * @param name        Nombre normalizado
 * @param displayName Nombre presentacional (si aplica)
 * @param createdAt   Fecha de creación
 * @param createdBy   Usuario que lo creó
 * @param usageCount  Cantidad de usos actuales
 * @param lastUsed    Última fecha de utilización
 */
@Builder
public record UserTagResponseDTO(
    Long id,
    String name,
    String displayName,
    LocalDateTime createdAt,
    String createdBy,
    Long usageCount,
    LocalDateTime lastUsed
) {
    /**
     * Factory conveniente para convertir desde la entidad persistida.
     *
     * @param userTag Entidad de tag cargada desde la base de datos
     */
    public UserTagResponseDTO(UserTag userTag) {
        this(
            userTag.getId(),
            userTag.getName(),
            userTag.getDisplayName(),
            userTag.getCreatedAt(),
            userTag.getCreatedBy(),
            userTag.getUsageCount(),
            userTag.getLastUsed()
        );
    }
}
