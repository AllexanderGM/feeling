package com.feeling.packages.complaint.domain.dto.request;

import com.feeling.packages.complaint.domain.enums.ComplaintPriority;
import com.feeling.packages.complaint.domain.enums.ComplaintStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO para acciones administrativas sobre quejas.
 * <p>
 * Permite a los administradores actualizar el estado de una queja,
 * agregar respuestas, notas internas y cambiar la prioridad.
 *
 * @param complaintStatus   Estado de la queja (obligatorio)
 * @param adminResponse     Respuesta del administrador al usuario (visible para el usuario)
 * @param adminNotes        Notas internas del administrador (solo visible para admins)
 * @param complaintPriority Nueva prioridad de la queja (opcional)
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Schema(description = "DTO para acciones administrativas sobre quejas")
public record ComplaintAdminActionDTO(

    @Schema(description = "Nuevo estado de la queja", example = "RESOLVED", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "El estado es obligatorio")
    ComplaintStatus complaintStatus,

    @Schema(description = "Respuesta del administrador visible para el usuario", example = "Hemos resuelto tu problema contactando al organizador del evento", maxLength = 2000)
    @Size(max = 2000, message = "La respuesta no puede superar los 2000 caracteres")
    String adminResponse,

    @Schema(description = "Notas internas del administrador (no visible para usuarios)", example = "Contactado con el organizador vía email", maxLength = 1000)
    @Size(max = 1000, message = "Las notas no pueden superar los 1000 caracteres")
    String adminNotes,

    @Schema(description = "Nueva prioridad de la queja", example = "URGENT")
    ComplaintPriority complaintPriority
) {
}
