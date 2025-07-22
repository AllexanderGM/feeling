package com.feeling.domain.dto.user;

import com.feeling.infrastructure.entities.user.UserComplaint;

import java.time.LocalDateTime;

public record UserComplaintResponseDTO(
        Long id,
        Long userId,
        String userEmail,
        String userName,
        String subject,
        String message,
        UserComplaint.ComplaintType complaintType,
        String complaintTypeDescription,
        UserComplaint.Priority priority,
        String priorityDescription,
        UserComplaint.Status status,
        String statusDescription,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt,
        String resolvedBy,
        String adminResponse,
        String adminNotes,
        
        // Referencias opcionales
        Long referencedUserId,
        Long referencedEventId,
        Long referencedBookingId,
        
        // Información adicional
        String userIp,
        String userAgent,
        
        // Métricas calculadas
        long hoursSinceCreated,
        boolean isPending,
        boolean isResolved,
        boolean isOverdue
) {
    
    public UserComplaintResponseDTO(UserComplaint complaint) {
        this(
                complaint.getId(),
                complaint.getUser().getId(),
                complaint.getUser().getEmail(),
                complaint.getUser().getName() + " " + complaint.getUser().getLastName(),
                complaint.getSubject(),
                complaint.getMessage(),
                complaint.getComplaintType(),
                complaint.getComplaintType().getDescription(),
                complaint.getPriority(),
                complaint.getPriority().getDescription(),
                complaint.getStatus(),
                complaint.getStatus().getDescription(),
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