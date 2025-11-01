package com.feeling.packages.complaint.domain.dto.mapper;

import com.feeling.packages.complaint.domain.dto.response.ComplaintResponseDTO;
import com.feeling.packages.complaint.infrastructure.entities.Complaint;
import org.springframework.stereotype.Component;

/**
 * Mapper para conversión entre entidades Complaint y DTOs.
 * <p>
 * Centraliza la lógica de transformación de datos entre la capa de persistencia
 * y la capa de presentación.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Component
public class ComplaintDTOMapper {

    /**
     * Convierte una entidad Complaint a DTO de respuesta completo.
     *
     * @param complaint Entidad Complaint
     * @return DTO de respuesta con toda la información
     */
    public ComplaintResponseDTO toResponseDTO(Complaint complaint) {
        if (complaint == null) {
            return null;
        }

        final var user = complaint.getUser();
        final Long userId = user != null ? user.getId() : null;
        final String userEmail = user != null ? user.getEmail() : null;
        final String userFullName = user != null
            ? String.join(" ",
                (user.getName() != null ? user.getName().trim() : ""),
                (user.getLastName() != null ? user.getLastName().trim() : ""))
                .trim()
            : null;

        return new ComplaintResponseDTO(
            complaint.getId(),
            userId,
            userEmail,
            userFullName,
            complaint.getSubject(),
            complaint.getMessage(),
            complaint.getComplaintType(),
            complaint.getComplaintType().getDescription(),
            complaint.getComplaintPriority(),
            complaint.getComplaintPriority().getDescription(),
            complaint.getComplaintStatus(),
            complaint.getComplaintStatus().getDescription(),
            complaint.getCreatedAt(),
            complaint.getUpdatedAt(),
            complaint.getResolvedAt(),
            complaint.getResolvedBy(),
            complaint.getAdminResponse(),
            complaint.getAdminNotes(),
            complaint.getReferencedUserId(),
            complaint.getReferencedEventId(),
            complaint.getReferencedBookingId(),
            complaint.getUserIp(),
            complaint.getUserAgent(),
            complaint.getHoursSinceCreated(),
            complaint.isPending(),
            complaint.isResolved(),
            complaint.isOverdue()
        );
    }

}
