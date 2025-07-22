package com.feeling.domain.services.user;

import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.UserComplaintAdminActionDTO;
import com.feeling.domain.dto.user.UserComplaintRequestDTO;
import com.feeling.domain.dto.user.UserComplaintResponseDTO;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.entities.user.UserComplaint;
import com.feeling.infrastructure.logging.StructuredLoggerFactory;
import com.feeling.infrastructure.repositories.user.IUserComplaintRepository;
import com.feeling.infrastructure.repositories.user.IUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserComplaintService {
    
    private static final StructuredLoggerFactory.StructuredLogger logger = 
            StructuredLoggerFactory.create(UserComplaintService.class);
    
    private final IUserComplaintRepository complaintRepository;
    private final IUserRepository userRepository;

    /**
     * Crea una nueva queja/consulta de usuario
     */
    @Transactional
    public UserComplaintResponseDTO createComplaint(String userEmail, 
                                                    UserComplaintRequestDTO requestDTO, 
                                                    HttpServletRequest request) {
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        // Crear la queja
        UserComplaint complaint = UserComplaint.builder()
                .user(user)
                .subject(requestDTO.subject().trim())
                .message(requestDTO.message().trim())
                .complaintType(requestDTO.complaintType())
                .priority(requestDTO.priority())
                .userIp(getClientIpAddress(request))
                .userAgent(request.getHeader("User-Agent"))
                .referencedUserId(requestDTO.referencedUserId())
                .referencedEventId(requestDTO.referencedEventId())
                .referencedBookingId(requestDTO.referencedBookingId())
                .build();

        UserComplaint savedComplaint = complaintRepository.save(complaint);
        
        logger.logUserOperation("complaint_created", userEmail, Map.of(
                "complaintId", savedComplaint.getId(),
                "type", requestDTO.complaintType().name(),
                "priority", requestDTO.priority().name()
        ));

        return new UserComplaintResponseDTO(savedComplaint);
    }

    /**
     * Obtiene las quejas de un usuario
     */
    public Page<UserComplaintResponseDTO> getUserComplaints(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Page<UserComplaint> complaints = complaintRepository.findByUserOptimized(user, pageable);
        
        logger.info("Quejas de usuario obtenidas", Map.of(
                "userEmail", userEmail,
                "total", complaints.getTotalElements(),
                "page", pageable.getPageNumber()
        ));

        return complaints.map(UserComplaintResponseDTO::new);
    }

    /**
     * Obtiene una queja específica del usuario
     */
    public UserComplaintResponseDTO getUserComplaint(String userEmail, Long complaintId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        UserComplaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new NotFoundException("Queja no encontrada"));

        // Verificar que la queja pertenece al usuario
        if (!complaint.getUser().equals(user)) {
            throw new UnauthorizedException("No tienes acceso a esta queja");
        }

        return new UserComplaintResponseDTO(complaint);
    }

    // ========================================
    // MÉTODOS ADMINISTRATIVOS
    // ========================================

    /**
     * Obtiene todas las quejas para administradores
     */
    public Page<UserComplaintResponseDTO> getAllComplaints(Pageable pageable, String search) {
        Page<UserComplaint> complaints;
        
        if (search != null && !search.trim().isEmpty()) {
            complaints = complaintRepository.searchComplaints(search.trim(), pageable);
        } else {
            complaints = complaintRepository.findAll(pageable);
        }
        
        logger.info("Quejas administrativas obtenidas", Map.of(
                "total", complaints.getTotalElements(),
                "page", pageable.getPageNumber(),
                "hasSearch", search != null && !search.trim().isEmpty()
        ));

        return complaints.map(UserComplaintResponseDTO::new);
    }

    /**
     * Obtiene quejas pendientes de resolución
     */
    public Page<UserComplaintResponseDTO> getPendingComplaints(Pageable pageable) {
        Page<UserComplaint> complaints = complaintRepository.findPendingComplaintsOptimized(pageable);
        
        logger.info("Quejas pendientes obtenidas", Map.of(
                "total", complaints.getTotalElements(),
                "page", pageable.getPageNumber()
        ));

        return complaints.map(UserComplaintResponseDTO::new);
    }

    /**
     * Obtiene quejas urgentes sin resolver
     */
    public List<UserComplaintResponseDTO> getUrgentComplaints() {
        List<UserComplaint> complaints = complaintRepository.findUrgentPendingComplaints();
        
        logger.info("Quejas urgentes obtenidas", Map.of("count", complaints.size()));

        return complaints.stream()
                .map(UserComplaintResponseDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Actualiza el estado de una queja (solo administradores)
     */
    @Transactional
    public UserComplaintResponseDTO updateComplaintStatus(Long complaintId, 
                                                          UserComplaintAdminActionDTO actionDTO,
                                                          String adminEmail) {
        
        UserComplaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new NotFoundException("Queja no encontrada"));

        // Validar que si el estado es RESOLVED, debe haber una respuesta
        if (actionDTO.requiresResponse() && !actionDTO.hasValidResponse()) {
            throw new IllegalArgumentException("Se requiere una respuesta para resolver la queja");
        }

        // Actualizar campos según la acción
        complaint.updateStatus(actionDTO.status());
        
        if (actionDTO.priority() != null) {
            complaint.setPriority(actionDTO.priority());
        }
        
        if (actionDTO.adminNotes() != null && !actionDTO.adminNotes().trim().isEmpty()) {
            complaint.addAdminNotes(actionDTO.adminNotes().trim());
        }
        
        // Manejar estados específicos
        switch (actionDTO.status()) {
            case RESOLVED:
                complaint.markAsResolved(adminEmail, actionDTO.adminResponse().trim());
                break;
            case CLOSED:
                complaint.markAsClosed(adminEmail);
                break;
            default:
                // Para otros estados, solo actualizar el status
                break;
        }

        UserComplaint savedComplaint = complaintRepository.save(complaint);
        
        logger.logUserOperation("complaint_updated_by_admin", adminEmail, Map.of(
                "complaintId", complaintId,
                "newStatus", actionDTO.status().name(),
                "userEmail", complaint.getUser().getEmail()
        ));

        return new UserComplaintResponseDTO(savedComplaint);
    }

    /**
     * Obtiene estadísticas de quejas para el dashboard administrativo
     */
    public Map<String, Object> getComplaintStats() {
        long totalComplaints = complaintRepository.count();
        long pendingComplaints = complaintRepository.countByStatus(UserComplaint.Status.OPEN) +
                                complaintRepository.countByStatus(UserComplaint.Status.IN_PROGRESS) +
                                complaintRepository.countByStatus(UserComplaint.Status.WAITING_USER);
        long resolvedComplaints = complaintRepository.countByStatus(UserComplaint.Status.RESOLVED);
        long urgentComplaints = complaintRepository.countByPriority(UserComplaint.Priority.URGENT);
        
        // Quejas de las últimas 24 horas
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        long complaintsLast24h = complaintRepository.countComplaintsSince(last24Hours);
        
        // Tiempo promedio de resolución
        Double avgResolutionHours = complaintRepository.getAverageResolutionTimeInHours();
        
        Map<String, Object> stats = Map.of(
                "totalComplaints", totalComplaints,
                "pendingComplaints", pendingComplaints,
                "resolvedComplaints", resolvedComplaints,
                "urgentComplaints", urgentComplaints,
                "complaintsLast24h", complaintsLast24h,
                "averageResolutionHours", avgResolutionHours != null ? avgResolutionHours : 0.0,
                "resolutionRate", totalComplaints > 0 ? (double) resolvedComplaints / totalComplaints * 100 : 0.0
        );
        
        logger.info("Estadísticas de quejas generadas", stats);
        
        return stats;
    }

    /**
     * Obtiene quejas atrasadas (más de 24 horas sin resolver)
     */
    public List<UserComplaintResponseDTO> getOverdueComplaints() {
        LocalDateTime overdueThreshold = LocalDateTime.now().minusHours(24);
        List<UserComplaint> complaints = complaintRepository.findOverdueComplaints(overdueThreshold);
        
        logger.info("Quejas atrasadas obtenidas", Map.of("count", complaints.size()));
        
        return complaints.stream()
                .map(UserComplaintResponseDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Elimina una queja (solo administradores - uso con precaución)
     */
    @Transactional
    public MessageResponseDTO deleteComplaint(Long complaintId, String adminEmail) {
        UserComplaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new NotFoundException("Queja no encontrada"));

        String userEmail = complaint.getUser().getEmail();
        complaintRepository.delete(complaint);
        
        logger.logUserOperation("complaint_deleted_by_admin", adminEmail, Map.of(
                "complaintId", complaintId,
                "userEmail", userEmail
        ));

        return new MessageResponseDTO("Queja eliminada correctamente");
    }

    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================

    /**
     * Obtiene la dirección IP del cliente
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}