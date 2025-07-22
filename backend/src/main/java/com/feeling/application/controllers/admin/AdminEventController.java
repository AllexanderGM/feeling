package com.feeling.application.controllers.admin;

import com.feeling.domain.dto.event.EventResponseDTO;
import com.feeling.domain.dto.event.EventStatsDTO;
import com.feeling.domain.services.event.EventService;
import com.feeling.domain.services.event.EventStatsService;
import com.feeling.infrastructure.entities.event.EventCategory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Events", description = "Admin event management endpoints")
public class AdminEventController {
    
    private final EventService eventService;
    private final EventStatsService statsService;

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get event dashboard statistics", description = "Get comprehensive event statistics for admin dashboard")
    public ResponseEntity<EventStatsDTO> getDashboardStats() {
        EventStatsDTO stats = statsService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/all")
    @Operation(summary = "Get all events", description = "Get all events including inactive ones (admin only)")
    public ResponseEntity<List<EventResponseDTO>> getAllEvents(
            @RequestParam(required = false) boolean paginated,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) EventCategory category,
            @PageableDefault(size = 20) Pageable pageable) {
        
        // This would need to be implemented in the service
        // For now, return active events
        if (paginated) {
            Page<EventResponseDTO> events = eventService.getAllActiveEvents(pageable);
            return ResponseEntity.ok()
                    .header("X-Total-Elements", String.valueOf(events.getTotalElements()))
                    .header("X-Total-Pages", String.valueOf(events.getTotalPages()))
                    .body(events.getContent());
        } else {
            List<EventResponseDTO> events = eventService.getAllActiveEvents();
            return ResponseEntity.ok(events);
        }
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get events by user", description = "Get all events created by a specific user")
    public ResponseEntity<List<EventResponseDTO>> getEventsByUser(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @RequestParam(required = false) boolean paginated,
            @PageableDefault(size = 10) Pageable pageable) {
        
        if (paginated) {
            Page<EventResponseDTO> events = eventService.getEventsByCreator(userId, pageable);
            return ResponseEntity.ok()
                    .header("X-Total-Elements", String.valueOf(events.getTotalElements()))
                    .header("X-Total-Pages", String.valueOf(events.getTotalPages()))
                    .body(events.getContent());
        } else {
            List<EventResponseDTO> events = eventService.getEventsByCreator(userId);
            return ResponseEntity.ok(events);
        }
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle event status (admin)", description = "Activate or deactivate any event as admin")
    public ResponseEntity<EventResponseDTO> adminToggleEventStatus(
            @Parameter(description = "Event ID") @PathVariable Long id,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        EventResponseDTO updatedEvent = eventService.toggleEventStatus(id, userEmail);
        return ResponseEntity.ok(updatedEvent);
    }

    @DeleteMapping("/{id}/force-delete")
    @Operation(summary = "Force delete event", description = "Force delete any event as admin (even with attendees)")
    public ResponseEntity<Void> forceDeleteEvent(
            @Parameter(description = "Event ID") @PathVariable Long id,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        // This would need special implementation in service for admin force delete
        eventService.deleteEvent(id, userEmail);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats/revenue")
    @Operation(summary = "Get revenue statistics", description = "Get detailed revenue statistics")
    public ResponseEntity<EventStatsDTO> getRevenueStats() {
        EventStatsDTO stats = statsService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/category")
    @Operation(summary = "Get category statistics", description = "Get event statistics by category")
    public ResponseEntity<EventStatsDTO> getCategoryStats() {
        EventStatsDTO stats = statsService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}