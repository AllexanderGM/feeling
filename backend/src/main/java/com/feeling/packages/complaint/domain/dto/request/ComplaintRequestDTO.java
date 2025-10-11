package com.feeling.packages.complaint.domain.dto.request;

import com.feeling.packages.complaint.domain.enums.ComplaintPriority;
import com.feeling.packages.complaint.domain.enums.ComplaintType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO para creación de quejas por parte de usuarios.
 * <p>
 * Permite a los usuarios reportar problemas, incidencias o sugerencias,
 * con referencias opcionales a otros elementos del sistema.
 *
 * @param subject             Asunto de la queja
 * @param message             Mensaje detallado de la queja
 * @param complaintType       Tipo de queja (obligatorio)
 * @param complaintPriority   Prioridad de la queja (opcional, por defecto MEDIUM)
 * @param referencedUserId    ID de usuario referenciado (opcional, para reportes de usuarios)
 * @param referencedEventId   ID de evento referenciado (opcional, para quejas de eventos)
 * @param referencedBookingId ID de reserva referenciada (opcional, para quejas de bookings)
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Schema(description = "DTO para creación de quejas por usuarios")
public record ComplaintRequestDTO(

    @Schema(description = "Asunto de la queja", example = "Problema con la reserva del evento", maxLength = 200)
    @NotBlank(message = "El asunto es obligatorio")
    @Size(max = 200, message = "El asunto no puede superar los 200 caracteres")
    String subject,

    @Schema(description = "Mensaje detallado de la queja", example = "No puedo acceder a mi reserva confirmada", maxLength = 2000)
    @NotBlank(message = "El mensaje es obligatorio")
    @Size(max = 2000, message = "El mensaje no puede superar los 2000 caracteres")
    String message,

    @Schema(description = "Tipo de queja", example = "BOOKING_ISSUE")
    @NotNull(message = "El tipo de queja es obligatorio")
    ComplaintType complaintType,

    @Schema(description = "Prioridad de la queja (opcional, por defecto MEDIUM)", example = "HIGH")
    ComplaintPriority complaintPriority,

    @Schema(description = "ID de usuario referenciado (para reportes de usuarios)", example = "123")
    Long referencedUserId,

    @Schema(description = "ID de evento referenciado (para quejas de eventos)", example = "456")
    Long referencedEventId,

    @Schema(description = "ID de reserva referenciada (para quejas de bookings)", example = "789")
    Long referencedBookingId
) {

    /**
     * Constructor compacto con valores por defecto.
     * Establece prioridad MEDIUM si no se especifica.
     */
    public ComplaintRequestDTO {
        if (complaintPriority == null) {
            complaintPriority = ComplaintPriority.MEDIUM;
        }
    }
}
