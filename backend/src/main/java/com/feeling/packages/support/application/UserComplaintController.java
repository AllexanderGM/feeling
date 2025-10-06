package com.feeling.packages.support.application;

import com.feeling.packages.auth.domain.services.JwtService;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.user.domain.dto.UserComplaintAdminActionDTO;
import com.feeling.packages.user.domain.dto.UserComplaintRequestDTO;
import com.feeling.packages.user.domain.dto.UserComplaintResponseDTO;
import com.feeling.packages.user.domain.services.UserComplaintService;
import com.feeling.packages.user.infrastructure.entities.UserComplaint;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/support")
@RequiredArgsConstructor
@Tag(name = "Support & Complaints", description = "Support and complaint management endpoints")
public class UserComplaintController {

    private final UserComplaintService complaintService;
    private final JwtService jwtService;

    // ========================================
    // ENDPOINTS PARA USUARIOS
    // ========================================

    @PostMapping("/complaints")
    @Operation(summary = "Create complaint", description = "Submit a new complaint or support request")
    @PreAuthorize("hasAuthority('CLIENT')")
    public ResponseEntity<UserComplaintResponseDTO> createComplaint(
        @Valid @RequestBody UserComplaintRequestDTO requestDTO,
        HttpServletRequest request,
        Authentication authentication) {

        String userEmail = authentication.getName();
        UserComplaintResponseDTO response = complaintService.createComplaint(userEmail, requestDTO, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-complaints")
    @Operation(summary = "Get my complaints", description = "Get all complaints submitted by the authenticated user")
    @PreAuthorize("hasAuthority('CLIENT')")
    public ResponseEntity<Page<UserComplaintResponseDTO>> getMyComplaints(
        @PageableDefault(size = 10) Pageable pageable,
        Authentication authentication) {

        String userEmail = authentication.getName();
        Page<UserComplaintResponseDTO> complaints = complaintService.getUserComplaints(userEmail, pageable);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/my-complaints/{complaintId}")
    @Operation(summary = "Get specific complaint", description = "Get details of a specific complaint")
    @PreAuthorize("hasAuthority('CLIENT')")
    public ResponseEntity<UserComplaintResponseDTO> getMyComplaint(
        @Parameter(description = "Complaint ID") @PathVariable Long complaintId,
        Authentication authentication) {

        String userEmail = authentication.getName();
        UserComplaintResponseDTO complaint = complaintService.getUserComplaint(userEmail, complaintId);
        return ResponseEntity.ok(complaint);
    }

    // ========================================
    // ENDPOINTS ADMINISTRATIVOS
    // ========================================

    @GetMapping("/complaints")
    @Operation(summary = "Get all complaints (admin)", description = "Get all complaints for administrative management")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<UserComplaintResponseDTO>> getAllComplaints(
        @PageableDefault(size = 20) Pageable pageable,
        @RequestParam(required = false) String search) {

        Page<UserComplaintResponseDTO> complaints = complaintService.getAllComplaints(pageable, search);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/complaints/pending")
    @Operation(summary = "Get pending complaints", description = "Get complaints that need attention")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<UserComplaintResponseDTO>> getPendingComplaints(
        @PageableDefault(size = 20) Pageable pageable) {

        Page<UserComplaintResponseDTO> complaints = complaintService.getPendingComplaints(pageable);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/complaints/urgent")
    @Operation(summary = "Get urgent complaints", description = "Get urgent complaints that need immediate attention")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<UserComplaintResponseDTO>> getUrgentComplaints(
        @PageableDefault(size = 20) Pageable pageable) {

        Page<UserComplaintResponseDTO> complaints = complaintService.getUrgentComplaints(pageable);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/complaints/overdue")
    @Operation(summary = "Get overdue complaints", description = "Get complaints that are overdue (>24h)")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<UserComplaintResponseDTO>> getOverdueComplaints(
        @PageableDefault(size = 20) Pageable pageable) {

        Page<UserComplaintResponseDTO> complaints = complaintService.getOverdueComplaints(pageable);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/complaints/resolved")
    @Operation(summary = "Get resolved complaints", description = "Get complaints that have been resolved")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<UserComplaintResponseDTO>> getResolvedComplaints(
        @PageableDefault(size = 20) Pageable pageable) {

        Page<UserComplaintResponseDTO> complaints = complaintService.getResolvedComplaints(pageable);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Obtiene quejas filtradas por tipo para panel administrativo.
     *
     * @param type Tipo de queja (HARASSMENT, SPAM, INAPPROPRIATE_CONTENT, etc.)
     * @param pageable Configuración de paginación
     * @return Página de quejas del tipo especificado
     */
    @GetMapping("/complaints/type/{type}")
    @Operation(summary = "Get complaints by type", description = "Get complaints filtered by complaint type for admin panel")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<UserComplaintResponseDTO>> getComplaintsByType(
        @Parameter(description = "Complaint type") @PathVariable UserComplaint.ComplaintType type,
        @PageableDefault(size = 20) Pageable pageable) {

        Page<UserComplaintResponseDTO> complaints = complaintService.getComplaintsByType(type, pageable);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Obtiene quejas filtradas por prioridad para panel administrativo.
     *
     * @param priority Prioridad (URGENT, HIGH, NORMAL, LOW)
     * @param pageable Configuración de paginación
     * @return Página de quejas con la prioridad especificada
     */
    @GetMapping("/complaints/priority/{priority}")
    @Operation(summary = "Get complaints by priority", description = "Get complaints filtered by priority level for admin panel")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<UserComplaintResponseDTO>> getComplaintsByPriority(
        @Parameter(description = "Priority level") @PathVariable UserComplaint.Priority priority,
        @PageableDefault(size = 20) Pageable pageable) {

        Page<UserComplaintResponseDTO> complaints = complaintService.getComplaintsByPriority(priority, pageable);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Obtiene quejas filtradas por rango de fechas para reportes administrativos.
     *
     * @param start Fecha y hora de inicio (formato: yyyy-MM-dd'T'HH:mm:ss)
     * @param end Fecha y hora de fin (formato: yyyy-MM-dd'T'HH:mm:ss)
     * @param pageable Configuración de paginación
     * @return Página de quejas en el rango de fechas especificado
     */
    @GetMapping("/complaints/dates")
    @Operation(summary = "Get complaints by date range", description = "Get complaints filtered by creation date range for admin reports")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<UserComplaintResponseDTO>> getComplaintsByDateRange(
        @Parameter(description = "Start date (ISO format)") @RequestParam java.time.LocalDateTime start,
        @Parameter(description = "End date (ISO format)") @RequestParam java.time.LocalDateTime end,
        @PageableDefault(size = 20) Pageable pageable) {

        Page<UserComplaintResponseDTO> complaints = complaintService.getComplaintsBetweenDates(start, end, pageable);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Obtiene quejas resueltas por un administrador específico.
     * Útil para métricas de rendimiento por administrador.
     *
     * @param adminEmail Email del administrador
     * @param pageable Configuración de paginación
     * @return Página de quejas resueltas por el admin
     */
    @GetMapping("/complaints/resolved-by/{adminEmail}")
    @Operation(summary = "Get complaints resolved by admin", description = "Get complaints resolved by a specific administrator for performance metrics")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<UserComplaintResponseDTO>> getComplaintsResolvedByAdmin(
        @Parameter(description = "Admin email") @PathVariable String adminEmail,
        @PageableDefault(size = 20) Pageable pageable) {

        Page<UserComplaintResponseDTO> complaints = complaintService.getComplaintsResolvedByAdmin(adminEmail, pageable);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Obtiene quejas relacionadas con referencias específicas.
     * Útil para investigar todas las quejas relacionadas con un usuario, evento o reserva específica.
     *
     * @param userId ID del usuario referenciado (opcional)
     * @param eventId ID del evento referenciado (opcional)
     * @param bookingId ID de la reserva referenciada (opcional)
     * @param pageable Configuración de paginación
     * @return Página de quejas relacionadas con las referencias
     */
    @GetMapping("/complaints/reference")
    @Operation(summary = "Get complaints by reference", description = "Get complaints related to a specific user, event, or booking")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<UserComplaintResponseDTO>> getComplaintsByReference(
        @Parameter(description = "User ID") @RequestParam(required = false) Long userId,
        @Parameter(description = "Event ID") @RequestParam(required = false) Long eventId,
        @Parameter(description = "Booking ID") @RequestParam(required = false) Long bookingId,
        @PageableDefault(size = 20) Pageable pageable) {

        Page<UserComplaintResponseDTO> complaints = complaintService.getComplaintsByReference(userId, eventId, bookingId, pageable);
        return ResponseEntity.ok(complaints);
    }

    @PutMapping("/complaints/{complaintId}")
    @Operation(summary = "Update complaint status", description = "Update the status and response of a complaint")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserComplaintResponseDTO> updateComplaintStatus(
        @Parameter(description = "Complaint ID") @PathVariable Long complaintId,
        @Valid @RequestBody UserComplaintAdminActionDTO actionDTO,
        Authentication authentication) {

        String adminEmail = authentication.getName();
        UserComplaintResponseDTO updatedComplaint = complaintService.updateComplaintStatus(
            complaintId, actionDTO, adminEmail);
        return ResponseEntity.ok(updatedComplaint);
    }

    @DeleteMapping("/complaints/{complaintId}")
    @Operation(summary = "Delete complaint", description = "Delete a complaint (use with caution)")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<MessageResponseDTO> deleteComplaint(
        @Parameter(description = "Complaint ID") @PathVariable Long complaintId,
        Authentication authentication) {

        String adminEmail = authentication.getName();
        MessageResponseDTO response = complaintService.deleteComplaint(complaintId, adminEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/complaints/stats")
    @Operation(summary = "Get complaint statistics", description = "Get comprehensive complaint statistics for dashboard")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Object>> getComplaintStats() {

        Map<String, Object> stats = complaintService.getComplaintStats();
        return ResponseEntity.ok(stats);
    }
}
