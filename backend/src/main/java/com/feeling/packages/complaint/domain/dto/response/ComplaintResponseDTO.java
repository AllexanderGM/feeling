package com.feeling.packages.complaint.domain.dto.response;

import com.feeling.packages.complaint.domain.enums.ComplaintPriority;
import com.feeling.packages.complaint.domain.enums.ComplaintStatus;
import com.feeling.packages.complaint.domain.enums.ComplaintType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para quejas del sistema.
 * <p>
 * Contiene información completa de una queja incluyendo:
 * - Datos del usuario que reportó
 * - Detalles de la queja
 * - Estado y prioridad
 * - Respuesta administrativa
 * - Referencias a otros elementos
 * - Métricas calculadas
 *
 * @param id                       ID único de la queja
 * @param userId                   ID del usuario que reportó
 * @param userEmail                Email del usuario
 * @param userName                 Nombre completo del usuario
 * @param subject                  Asunto de la queja
 * @param message                  Mensaje de la queja
 * @param complaintType            Tipo de queja (enum)
 * @param complaintTypeDescription Descripción del tipo
 * @param complaintPriority        Prioridad de la queja (enum)
 * @param priorityDescription      Descripción de la prioridad
 * @param complaintStatus          Estado de la queja (enum)
 * @param statusDescription        Descripción del estado
 * @param createdAt                Fecha de creación
 * @param updatedAt                Fecha de última actualización
 * @param resolvedAt               Fecha de resolución
 * @param resolvedBy               Email del admin que resolvió
 * @param adminResponse            Respuesta del administrador
 * @param adminNotes               Notas internas del admin
 * @param referencedUserId         ID de usuario referenciado
 * @param referencedEventId        ID de evento referenciado
 * @param referencedBookingId      ID de reserva referenciada
 * @param userIp                   IP del usuario al crear la queja
 * @param userAgent                User agent del navegador
 * @param hoursSinceCreated        Horas desde creación
 * @param isPending                Si está pendiente
 * @param isResolved               Si está resuelta
 * @param isOverdue                Si está atrasada (>24h)
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Schema(description = "DTO de respuesta con información completa de una queja")
public record ComplaintResponseDTO(

    @Schema(description = "ID único de la queja", example = "1")
    Long id,

    @Schema(description = "ID del usuario que reportó", example = "123")
    Long userId,

    @Schema(description = "Email del usuario", example = "usuario@example.com")
    String userEmail,

    @Schema(description = "Nombre completo del usuario", example = "Juan Pérez")
    String userName,

    @Schema(description = "Asunto de la queja", example = "Problema con la reserva")
    String subject,

    @Schema(description = "Mensaje detallado de la queja", example = "No puedo acceder a mi reserva confirmada")
    String message,

    @Schema(description = "Tipo de queja", example = "BOOKING_ISSUE")
    ComplaintType complaintType,

    @Schema(description = "Descripción del tipo de queja", example = "Problema con reserva")
    String complaintTypeDescription,

    @Schema(description = "Prioridad de la queja", example = "HIGH")
    ComplaintPriority complaintPriority,

    @Schema(description = "Descripción de la prioridad", example = "Alta")
    String priorityDescription,

    @Schema(description = "Estado actual de la queja", example = "IN_PROGRESS")
    ComplaintStatus complaintStatus,

    @Schema(description = "Descripción del estado", example = "En progreso")
    String statusDescription,

    @Schema(description = "Fecha de creación", example = "2025-01-15T10:30:00")
    LocalDateTime createdAt,

    @Schema(description = "Fecha de última actualización", example = "2025-01-15T14:20:00")
    LocalDateTime updatedAt,

    @Schema(description = "Fecha de resolución", example = "2025-01-16T09:00:00")
    LocalDateTime resolvedAt,

    @Schema(description = "Email del administrador que resolvió", example = "admin@feeling.com")
    String resolvedBy,

    @Schema(description = "Respuesta del administrador al usuario", example = "Hemos contactado al organizador")
    String adminResponse,

    @Schema(description = "Notas internas del administrador", example = "Contactado vía email")
    String adminNotes,

    @Schema(description = "ID de usuario referenciado (para reportes)", example = "456")
    Long referencedUserId,

    @Schema(description = "ID de evento referenciado", example = "789")
    Long referencedEventId,

    @Schema(description = "ID de reserva referenciada", example = "101")
    Long referencedBookingId,

    @Schema(description = "Dirección IP del usuario al crear", example = "192.168.1.1")
    String userIp,

    @Schema(description = "User agent del navegador", example = "Mozilla/5.0...")
    String userAgent,

    @Schema(description = "Horas transcurridas desde creación", example = "18")
    long hoursSinceCreated,

    @Schema(description = "Si la queja está pendiente de resolución", example = "true")
    boolean isPending,

    @Schema(description = "Si la queja está resuelta", example = "false")
    boolean isResolved,

    @Schema(description = "Si la queja está atrasada (más de 24 horas)", example = "false")
    boolean isOverdue
) {
}
