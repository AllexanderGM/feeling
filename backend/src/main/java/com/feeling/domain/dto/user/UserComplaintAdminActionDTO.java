package com.feeling.domain.dto.user;

import com.feeling.infrastructure.entities.user.UserComplaint;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserComplaintAdminActionDTO(
        @NotNull(message = "El estado es obligatorio")
        UserComplaint.Status status,

        @Size(max = 2000, message = "La respuesta no puede superar los 2000 caracteres")
        String adminResponse,

        @Size(max = 1000, message = "Las notas no pueden superar los 1000 caracteres")
        String adminNotes,

        UserComplaint.Priority priority
) {
    
    // Validación para acciones que requieren respuesta
    public boolean requiresResponse() {
        return status == UserComplaint.Status.RESOLVED;
    }

    // Validación para verificar si tiene respuesta cuando es necesaria
    public boolean hasValidResponse() {
        if (requiresResponse()) {
            return adminResponse != null && !adminResponse.trim().isEmpty();
        }
        return true;
    }
}