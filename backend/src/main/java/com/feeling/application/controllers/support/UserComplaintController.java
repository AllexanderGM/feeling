package com.feeling.application.controllers.support;

import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.UserComplaintAdminActionDTO;
import com.feeling.domain.dto.user.UserComplaintRequestDTO;
import com.feeling.domain.dto.user.UserComplaintResponseDTO;
import com.feeling.domain.services.auth.JwtService;
import com.feeling.domain.services.user.UserComplaintService;
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
    public ResponseEntity<List<UserComplaintResponseDTO>> getUrgentComplaints() {
        
        List<UserComplaintResponseDTO> complaints = complaintService.getUrgentComplaints();
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/complaints/overdue")
    @Operation(summary = "Get overdue complaints", description = "Get complaints that are overdue (>24h)")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<UserComplaintResponseDTO>> getOverdueComplaints() {
        
        List<UserComplaintResponseDTO> complaints = complaintService.getOverdueComplaints();
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