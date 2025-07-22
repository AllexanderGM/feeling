package com.feeling.domain.dto.user;

import com.feeling.infrastructure.entities.user.UserComplaint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserComplaintRequestDTO(
        @NotBlank(message = "El asunto es obligatorio")
        @Size(max = 200, message = "El asunto no puede superar los 200 caracteres")
        String subject,

        @NotBlank(message = "El mensaje es obligatorio")
        @Size(max = 2000, message = "El mensaje no puede superar los 2000 caracteres")
        String message,

        @NotNull(message = "El tipo de queja es obligatorio")
        UserComplaint.ComplaintType complaintType,

        UserComplaint.Priority priority,

        // Referencias opcionales a otros elementos del sistema
        Long referencedUserId,
        Long referencedEventId,
        Long referencedBookingId
) {
    
    // Constructor con valores por defecto
    public UserComplaintRequestDTO {
        if (priority == null) {
            priority = UserComplaint.Priority.MEDIUM;
        }
    }

    // Método de validación personalizada
    public boolean isValidComplaint() {
        return subject != null && !subject.trim().isEmpty() &&
               message != null && !message.trim().isEmpty() &&
               complaintType != null;
    }

    // Método para verificar si tiene referencias
    public boolean hasReferences() {
        return referencedUserId != null || referencedEventId != null || referencedBookingId != null;
    }
}