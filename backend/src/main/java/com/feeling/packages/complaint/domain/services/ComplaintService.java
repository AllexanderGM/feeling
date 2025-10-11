package com.feeling.packages.complaint.domain.services;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.complaint.domain.dto.mapper.ComplaintDTOMapper;
import com.feeling.packages.complaint.domain.dto.request.ComplaintAdminActionDTO;
import com.feeling.packages.complaint.domain.dto.request.ComplaintRequestDTO;
import com.feeling.packages.complaint.domain.dto.response.ComplaintResponseDTO;
import com.feeling.packages.complaint.domain.dto.response.ComplaintStatsResponseDTO;
import com.feeling.packages.complaint.domain.enums.ComplaintPriority;
import com.feeling.packages.complaint.domain.enums.ComplaintStatus;
import com.feeling.packages.complaint.domain.enums.ComplaintType;
import com.feeling.packages.complaint.infrastructure.entities.Complaint;
import com.feeling.packages.complaint.infrastructure.repositories.IComplaintRepository;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Servicio para gestión de quejas y soporte de usuarios.
 * <p>
 * Responsabilidades:
 * - CRUD de quejas/consultas de usuarios
 * - Gestión de estados de quejas (OPEN, IN_PROGRESS, RESOLVED, CLOSED, etc.)
 * - Filtrado por tipo, prioridad, fechas y referencias
 * - Estadísticas completas para dashboard administrativo
 * - Tracking de IPs y User-Agent para auditoría
 * - Métricas de resolución y rendimiento por administrador
 * <p>
 * Sistema de prioridades: LOW, MEDIUM, HIGH, URGENT
 * <p>
 * Tipos de quejas soportados: GENERAL, TECHNICAL_ISSUE, ACCOUNT_ISSUE, PAYMENT_ISSUE,
 * USER_REPORT, EVENT_ISSUE, BOOKING_ISSUE, PRIVACY_CONCERN, FEATURE_REQUEST,
 * BUG_REPORT, ABUSE_REPORT, REFUND_REQUEST
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class ComplaintService {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(ComplaintService.class);

    private final IComplaintRepository complaintRepository;
    private final IUserRepository userRepository;
    private final ComplaintDTOMapper complaintMapper;

    // ========================================
    // ESTADÍSTICAS
    // ========================================

    /**
     * Obtiene estadísticas completas de quejas para el dashboard administrativo.
     * <p>
     * Incluye:
     * - Contadores por estado (open, pending, resolved, closed, escalated)
     * - Distribución por prioridad (low, medium, high, urgent)
     * - Distribución por tipo de queja (12 tipos)
     * - Métricas temporales (últimas 24h, quejas vencidas)
     * - Tiempo promedio de resolución
     * - Tasa de resolución
     * - Métricas de contexto (referencias a usuarios, eventos, bookings)
     *
     * @return Map con estadísticas detalladas
     */
    public ComplaintStatsResponseDTO getComplaintStats() {
        long totalComplaints = complaintRepository.count();
        long openComplaints = complaintRepository.countByComplaintStatus(ComplaintStatus.OPEN);
        long inProgressComplaints = complaintRepository.countByComplaintStatus(ComplaintStatus.IN_PROGRESS);
        long waitingUserComplaints = complaintRepository.countByComplaintStatus(ComplaintStatus.WAITING_USER);
        long pendingComplaints = openComplaints + inProgressComplaints + waitingUserComplaints;
        long resolvedComplaints = complaintRepository.countByComplaintStatus(ComplaintStatus.RESOLVED);
        long closedComplaints = complaintRepository.countByComplaintStatus(ComplaintStatus.CLOSED);
        long escalatedComplaints = complaintRepository.countByComplaintStatus(ComplaintStatus.ESCALATED);

        // Métricas por prioridad
        long lowPriorityComplaints = complaintRepository.countByComplaintPriority(ComplaintPriority.LOW);
        long mediumPriorityComplaints = complaintRepository.countByComplaintPriority(ComplaintPriority.MEDIUM);
        long highPriorityComplaints = complaintRepository.countByComplaintPriority(ComplaintPriority.HIGH);
        long urgentComplaints = complaintRepository.countByComplaintPriority(ComplaintPriority.URGENT);

        // Métricas por tipo de queja
        long generalComplaints = complaintRepository.countByComplaintType(ComplaintType.GENERAL);
        long technicalIssues = complaintRepository.countByComplaintType(ComplaintType.TECHNICAL_ISSUE);
        long accountIssues = complaintRepository.countByComplaintType(ComplaintType.ACCOUNT_ISSUE);
        long paymentIssues = complaintRepository.countByComplaintType(ComplaintType.PAYMENT_ISSUE);
        long userReports = complaintRepository.countByComplaintType(ComplaintType.USER_REPORT);
        long eventIssues = complaintRepository.countByComplaintType(ComplaintType.EVENT_ISSUE);
        long bookingIssues = complaintRepository.countByComplaintType(ComplaintType.BOOKING_ISSUE);
        long privacyConcerns = complaintRepository.countByComplaintType(ComplaintType.PRIVACY_CONCERN);
        long featureRequests = complaintRepository.countByComplaintType(ComplaintType.FEATURE_REQUEST);
        long bugReports = complaintRepository.countByComplaintType(ComplaintType.BUG_REPORT);
        long abuseReports = complaintRepository.countByComplaintType(ComplaintType.ABUSE_REPORT);
        long refundRequests = complaintRepository.countByComplaintType(ComplaintType.REFUND_REQUEST);

        // Métricas de contexto (quejas que referencian otros elementos)
        long complaintsWithUserReference = complaintRepository.countComplaintsWithUserReference();
        long complaintsWithEventReference = complaintRepository.countComplaintsWithEventReference();
        long complaintsWithBookingReference = complaintRepository.countComplaintsWithBookingReference();

        // Quejas de las últimas 24 horas
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        long complaintsLast24h = complaintRepository.countComplaintsSince(last24Hours);

        // Quejas vencidas (más de 24 horas pendientes)
        LocalDateTime overdueThreshold = LocalDateTime.now().minusHours(24);
        long overdueComplaints = complaintRepository.countOverdueComplaints(overdueThreshold);

        // Tiempo promedio de resolución (calculado en servicio para mantener consistencia JPQL)
        List<Complaint> resolvedComplaintsList = complaintRepository.findResolvedComplaints();
        Double avgResolutionHours = resolvedComplaintsList.isEmpty() ? null : resolvedComplaintsList.stream()
            .mapToDouble(c -> {
                long diffInMillis = java.time.Duration.between(c.getCreatedAt(), c.getResolvedAt()).toMillis();
                return diffInMillis / (1000.0 * 60 * 60); // convertir a horas
            })
            .average()
            .orElse(0.0);

        logger.info("Estadísticas expandidas de quejas generadas", Map.of(
            "totalComplaints", totalComplaints,
            "pendingComplaints", pendingComplaints,
            "resolvedComplaints", resolvedComplaints,
            "overdueComplaints", overdueComplaints,
            "urgentComplaints", urgentComplaints
        ));

        ComplaintStatsResponseDTO.PriorityDistributionDTO priorityDistribution =
            new ComplaintStatsResponseDTO.PriorityDistributionDTO(
                lowPriorityComplaints,
                mediumPriorityComplaints,
                highPriorityComplaints,
                urgentComplaints
            );

        ComplaintStatsResponseDTO.TypeDistributionDTO typeDistribution =
            new ComplaintStatsResponseDTO.TypeDistributionDTO(
                generalComplaints,
                technicalIssues,
                accountIssues,
                paymentIssues,
                userReports,
                eventIssues,
                bookingIssues,
                privacyConcerns,
                featureRequests,
                bugReports,
                abuseReports,
                refundRequests
            );

        ComplaintStatsResponseDTO.ContextMetricsDTO contextMetrics =
            new ComplaintStatsResponseDTO.ContextMetricsDTO(
                complaintsWithUserReference,
                complaintsWithEventReference,
                complaintsWithBookingReference,
                complaintsWithUserReference + complaintsWithEventReference + complaintsWithBookingReference
            );

        return new ComplaintStatsResponseDTO(
            totalComplaints,
            openComplaints,
            inProgressComplaints,
            waitingUserComplaints,
            pendingComplaints,
            resolvedComplaints,
            closedComplaints,
            escalatedComplaints,
            overdueComplaints,
            urgentComplaints,
            complaintsLast24h,
            avgResolutionHours != null ? avgResolutionHours : 0.0,
            totalComplaints > 0 ? (double) resolvedComplaints / totalComplaints * 100 : 0.0,
            priorityDistribution,
            typeDistribution,
            contextMetrics
        );
    }

    // ========================================
    // CLIENTE - OPERACIONES CRUD
    // ========================================

    // ----- LECTURAS (Cliente) -----

    /**
     * Obtiene las quejas de un usuario específico.
     *
     * @param userEmail Email del usuario
     * @param pageable  Configuración de paginación
     * @return Página de quejas del usuario
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional(readOnly = true)
    public Page<ComplaintResponseDTO> getUserComplaints(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Page<Complaint> complaints = complaintRepository.findByUser(user, pageable);

        logger.info("Quejas de usuario obtenidas", Map.of(
            "userEmail", userEmail,
            "total", complaints.getTotalElements(),
            "page", pageable.getPageNumber()
        ));

        return complaints.map(complaintMapper::toResponseDTO);
    }

    /**
     * Obtiene una queja específica del usuario.
     * <p>
     * Valida que la queja pertenezca al usuario autenticado.
     *
     * @param userEmail   Email del usuario
     * @param complaintId ID de la queja
     * @return DTO de la queja
     * @throws NotFoundException     Si el usuario o la queja no existen
     * @throws UnauthorizedException Si la queja no pertenece al usuario
     */
    @Transactional(readOnly = true)
    public ComplaintResponseDTO getUserComplaint(String userEmail, Long complaintId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Complaint complaint = complaintRepository.findByIdAndUser(complaintId, user)
            .orElseThrow(() -> new UnauthorizedException("No tienes acceso a esta queja"));

        return complaintMapper.toResponseDTO(complaint);
    }

    // ----- CREACIÓN (Cliente) -----

    /**
     * Crea una nueva queja/consulta de usuario.
     * <p>
     * Captura información de contexto: IP, User-Agent, referencias opcionales.
     *
     * @param userEmail  Email del usuario que crea la queja
     * @param requestDTO DTO con datos de la queja
     * @param request    HttpServletRequest para capturar IP y User-Agent
     * @return DTO de la queja creada
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional
    public ComplaintResponseDTO createComplaint(String userEmail,
                                                ComplaintRequestDTO requestDTO,
                                                String clientIp,
                                                String userAgent) {

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        // Crear la queja
        Complaint complaint = Complaint.builder()
            .user(user)
            .subject(requestDTO.subject().trim())
            .message(requestDTO.message().trim())
            .complaintType(requestDTO.complaintType())
            .complaintPriority(requestDTO.complaintPriority())
            .userIp(clientIp)
            .userAgent(userAgent)
            .referencedUserId(requestDTO.referencedUserId())
            .referencedEventId(requestDTO.referencedEventId())
            .referencedBookingId(requestDTO.referencedBookingId())
            .build();

        Complaint savedComplaint = complaintRepository.save(complaint);

        logger.logUserOperation("complaint_created", userEmail, Map.of(
            "complaintId", savedComplaint.getId(),
            "type", requestDTO.complaintType().name(),
            "complaintPriority", requestDTO.complaintPriority().name()
        ));

        return complaintMapper.toResponseDTO(savedComplaint);
    }

    // ========================================
    // ADMIN - OPERACIONES CRUD
    // ========================================

    // ----- LECTURAS (Admin) -----

    /**
     * Obtiene todas las quejas para administradores con búsqueda opcional.
     *
     * @param pageable Configuración de paginación
     * @param search   Término de búsqueda opcional (busca en subject y message)
     * @return Página de quejas
     */
    public Page<ComplaintResponseDTO> getAllComplaints(Pageable pageable, String search) {
        Page<Complaint> complaints;

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

        return complaints.map(complaintMapper::toResponseDTO);
    }

    /**
     * Obtiene quejas pendientes de resolución (OPEN, IN_PROGRESS, WAITING_USER, ESCALATED).
     *
     * @param pageable Configuración de paginación
     * @return Página de quejas pendientes
     */
    public Page<ComplaintResponseDTO> getPendingComplaints(Pageable pageable) {
        Page<Complaint> complaints = complaintRepository.findPendingComplaints(pageable);

        logger.info("Quejas pendientes obtenidas", Map.of(
            "total", complaints.getTotalElements(),
            "page", pageable.getPageNumber()
        ));

        return complaints.map(complaintMapper::toResponseDTO);
    }

    /**
     * Obtiene quejas urgentes sin resolver con paginación.
     *
     * @param pageable Configuración de paginación
     * @return Página de quejas urgentes
     */
    public Page<ComplaintResponseDTO> getUrgentComplaints(Pageable pageable) {
        Page<Complaint> complaints = complaintRepository.findUrgentComplaints(pageable);

        logger.info("Quejas urgentes obtenidas", Map.of(
            "total", complaints.getTotalElements(),
            "page", pageable.getPageNumber()
        ));

        return complaints.map(complaintMapper::toResponseDTO);
    }

    /**
     * Obtiene quejas atrasadas (más de 24 horas sin resolver) con paginación.
     *
     * @param pageable Configuración de paginación
     * @return Página de quejas atrasadas
     */
    public Page<ComplaintResponseDTO> getOverdueComplaints(Pageable pageable) {
        LocalDateTime overdueThreshold = LocalDateTime.now().minusHours(24);
        Page<Complaint> complaints = complaintRepository.findOverdueComplaints(overdueThreshold, pageable);

        logger.info("Quejas atrasadas obtenidas", Map.of(
            "total", complaints.getTotalElements(),
            "page", pageable.getPageNumber()
        ));

        return complaints.map(complaintMapper::toResponseDTO);
    }

    /**
     * Obtiene quejas resueltas.
     *
     * @param pageable Configuración de paginación
     * @return Página de quejas con estado RESOLVED
     */
    public Page<ComplaintResponseDTO> getResolvedComplaints(Pageable pageable) {
        Page<Complaint> complaints = complaintRepository.findByComplaintStatusIn(
            List.of(ComplaintStatus.RESOLVED), pageable);

        logger.info("Quejas resueltas obtenidas", Map.of(
            "total", complaints.getTotalElements(),
            "page", pageable.getPageNumber()
        ));

        return complaints.map(complaintMapper::toResponseDTO);
    }

    /**
     * Obtiene quejas por tipo para panel administrativo.
     *
     * @param complaintType Tipo de queja
     * @param pageable      Configuración de paginación
     * @return Página de quejas del tipo especificado
     */
    public Page<ComplaintResponseDTO> getComplaintsByType(ComplaintType complaintType, Pageable pageable) {
        Page<Complaint> complaints = complaintRepository.findByComplaintType(complaintType, pageable);

        logger.info("Quejas obtenidas por tipo", Map.of(
            "type", complaintType,
            "total", complaints.getTotalElements(),
            "page", pageable.getPageNumber()
        ));

        return complaints.map(complaintMapper::toResponseDTO);
    }

    /**
     * Obtiene quejas por prioridad para panel administrativo.
     *
     * @param complaintPriority Prioridad de la queja
     * @param pageable          Configuración de paginación
     * @return Página de quejas con la prioridad especificada
     */
    public Page<ComplaintResponseDTO> getComplaintsByPriority(ComplaintPriority complaintPriority, Pageable pageable) {
        Page<Complaint> complaints = complaintRepository.findByComplaintPriority(complaintPriority, pageable);

        logger.info("Quejas obtenidas por prioridad", Map.of(
            "complaintPriority", complaintPriority,
            "total", complaints.getTotalElements(),
            "page", pageable.getPageNumber()
        ));

        return complaints.map(complaintMapper::toResponseDTO);
    }

    /**
     * Obtiene quejas creadas en un rango de fechas para reportes administrativos.
     *
     * @param start    Fecha y hora de inicio
     * @param end      Fecha y hora de fin
     * @param pageable Configuración de paginación
     * @return Página de quejas en el rango de fechas especificado
     */
    public Page<ComplaintResponseDTO> getComplaintsBetweenDates(LocalDateTime start, LocalDateTime end, Pageable pageable) {
        Page<Complaint> complaints = complaintRepository.findComplaintsBetweenDates(start, end, pageable);

        logger.info("Quejas obtenidas por rango de fechas", Map.of(
            "start", start,
            "end", end,
            "total", complaints.getTotalElements(),
            "page", pageable.getPageNumber()
        ));

        return complaints.map(complaintMapper::toResponseDTO);
    }

    /**
     * Obtiene quejas resueltas por un administrador específico.
     * Útil para métricas de rendimiento por administrador.
     *
     * @param adminEmail Email del administrador
     * @param pageable   Configuración de paginación
     * @return Página de quejas resueltas por el admin
     */
    public Page<ComplaintResponseDTO> getComplaintsResolvedByAdmin(String adminEmail, Pageable pageable) {
        Page<Complaint> complaints = complaintRepository.findComplaintsResolvedBy(adminEmail, pageable);

        logger.info("Quejas resueltas por admin obtenidas", Map.of(
            "adminEmail", adminEmail,
            "total", complaints.getTotalElements(),
            "page", pageable.getPageNumber()
        ));

        return complaints.map(complaintMapper::toResponseDTO);
    }

    /**
     * Obtiene quejas relacionadas con referencias específicas (usuario, evento o reserva) con paginación.
     * Útil para investigar quejas relacionadas con un elemento específico.
     *
     * @param userId    ID del usuario referenciado (puede ser null)
     * @param eventId   ID del evento referenciado (puede ser null)
     * @param bookingId ID de la reserva referenciada (puede ser null)
     * @param pageable  Configuración de paginación
     * @return Página de quejas relacionadas con las referencias
     */
    public Page<ComplaintResponseDTO> getComplaintsByReference(Long userId, Long eventId, Long bookingId, Pageable pageable) {
        Page<Complaint> complaints = complaintRepository.findComplaintsByReference(userId, eventId, bookingId, pageable);

        logger.info("Quejas obtenidas por referencia", Map.of(
            "userId", userId != null ? userId : "null",
            "eventId", eventId != null ? eventId : "null",
            "bookingId", bookingId != null ? bookingId : "null",
            "total", complaints.getTotalElements(),
            "page", pageable.getPageNumber()
        ));

        return complaints.map(complaintMapper::toResponseDTO);
    }

    // ----- ACTUALIZACIONES (Admin) -----

    /**
     * Actualiza el estado de una queja (solo administradores).
     * <p>
     * Permite cambiar estado, prioridad, agregar notas administrativas y respuesta.
     * Valida que estados RESOLVED requieran respuesta.
     *
     * @param complaintId ID de la queja
     * @param actionDTO   DTO con acción administrativa (estado, prioridad, notas, respuesta)
     * @param adminEmail  Email del administrador que realiza la acción
     * @return DTO de la queja actualizada
     * @throws NotFoundException        Si la queja no existe
     * @throws IllegalArgumentException Si se intenta resolver sin respuesta
     */
    @Transactional
    public ComplaintResponseDTO updateComplaintStatus(Long complaintId,
                                                      ComplaintAdminActionDTO actionDTO,
                                                      String adminEmail) {

        Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() -> new NotFoundException("Queja no encontrada"));

        // Validar que si el estado es RESOLVED, debe haber una respuesta visible para el usuario
        if (requiresAdminResponse(actionDTO.complaintStatus()) && isBlank(actionDTO.adminResponse())) {
            throw new IllegalArgumentException("Se requiere una respuesta para resolver la queja");
        }

        // Actualizar campos según la acción
        complaint.updateStatus(actionDTO.complaintStatus());

        if (actionDTO.complaintPriority() != null) {
            complaint.setComplaintPriority(actionDTO.complaintPriority());
        }

        if (!isBlank(actionDTO.adminNotes())) {
            complaint.addAdminNotes(actionDTO.adminNotes().trim());
        }

        // Manejar estados específicos
        switch (actionDTO.complaintStatus()) {
            case RESOLVED:
                complaint.markAsResolved(adminEmail, actionDTO.adminResponse().trim());
                break;
            case CLOSED:
                complaint.markAsClosed(adminEmail);
                break;
            default:
                // Para otros estados, solo actualizar el complaintStatus
                break;
        }

        Complaint savedComplaint = complaintRepository.save(complaint);

        logger.logUserOperation("complaint_updated_by_admin", adminEmail, Map.of(
            "complaintId", complaintId,
            "newStatus", actionDTO.complaintStatus().name(),
            "userEmail", complaint.getUser().getEmail()
        ));

        return complaintMapper.toResponseDTO(savedComplaint);
    }

    private boolean requiresAdminResponse(ComplaintStatus status) {
        return status == ComplaintStatus.RESOLVED;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    // ----- ELIMINACIONES (Admin) -----

    /**
     * Elimina una queja del sistema (solo administradores - uso con precaución).
     *
     * @param complaintId ID de la queja a eliminar
     * @param adminEmail  Email del administrador que realiza la acción
     * @return Mensaje de confirmación
     * @throws NotFoundException Si la queja no existe
     */
    @Transactional
    public MessageResponseDTO deleteComplaint(Long complaintId, String adminEmail) {
        Complaint complaint = complaintRepository.findById(complaintId)
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

}
