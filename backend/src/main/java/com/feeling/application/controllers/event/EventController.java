package com.feeling.application.controllers.event;

import com.feeling.domain.dto.event.*;
import com.feeling.domain.services.event.EventImageService;
import com.feeling.domain.services.event.EventService;
import com.feeling.domain.services.event.EventStatsService;
import com.feeling.infrastructure.entities.event.EventCategory;
import com.feeling.infrastructure.entities.event.EventStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Event management endpoints")
public class EventController {
    
    private final EventService eventService;
    private final EventImageService eventImageService;
    private final EventStatsService statsService;

    @GetMapping
    @Operation(summary = "Get all active events", description = "Retrieve all active events with optional pagination")
    public ResponseEntity<List<EventResponseDTO>> getAllEvents(
            @RequestParam(required = false) boolean paginated,
            @PageableDefault(size = 10) Pageable pageable) {
        
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

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming events", description = "Retrieve events that haven't started yet")
    public ResponseEntity<List<EventResponseDTO>> getUpcomingEvents(
            @RequestParam(required = false) boolean paginated,
            @PageableDefault(size = 10) Pageable pageable) {
        
        if (paginated) {
            Page<EventResponseDTO> events = eventService.getUpcomingEvents(pageable);
            return ResponseEntity.ok()
                    .header("X-Total-Elements", String.valueOf(events.getTotalElements()))
                    .header("X-Total-Pages", String.valueOf(events.getTotalPages()))
                    .body(events.getContent());
        } else {
            List<EventResponseDTO> events = eventService.getUpcomingEvents();
            return ResponseEntity.ok(events);
        }
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get events by category", description = "Retrieve events filtered by category")
    public ResponseEntity<List<EventResponseDTO>> getEventsByCategory(
            @Parameter(description = "Event category") @PathVariable EventCategory category,
            @RequestParam(required = false) boolean paginated,
            @PageableDefault(size = 10) Pageable pageable) {
        
        if (paginated) {
            Page<EventResponseDTO> events = eventService.getEventsByCategory(category, pageable);
            return ResponseEntity.ok()
                    .header("X-Total-Elements", String.valueOf(events.getTotalElements()))
                    .header("X-Total-Pages", String.valueOf(events.getTotalPages()))
                    .body(events.getContent());
        } else {
            List<EventResponseDTO> events = eventService.getEventsByCategory(category);
            return ResponseEntity.ok(events);
        }
    }

    @GetMapping("/search")
    @Operation(summary = "Search events", description = "Search events by title or description")
    public ResponseEntity<List<EventResponseDTO>> searchEvents(
            @Parameter(description = "Search term") @RequestParam String q,
            @RequestParam(required = false) boolean paginated,
            @PageableDefault(size = 10) Pageable pageable) {
        
        if (paginated) {
            Page<EventResponseDTO> events = eventService.searchEvents(q, pageable);
            return ResponseEntity.ok()
                    .header("X-Total-Elements", String.valueOf(events.getTotalElements()))
                    .header("X-Total-Pages", String.valueOf(events.getTotalPages()))
                    .body(events.getContent());
        } else {
            List<EventResponseDTO> events = eventService.searchEvents(q);
            return ResponseEntity.ok(events);
        }
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get events by status", description = "Retrieve events filtered by status")
    public ResponseEntity<List<EventResponseDTO>> getEventsByStatus(
            @Parameter(description = "Event status") @PathVariable EventStatus status,
            @RequestParam(required = false) boolean paginated,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 10) Pageable pageable) {
        
        if (paginated) {
            Page<EventResponseDTO> events;
            if (q != null && !q.trim().isEmpty()) {
                events = eventService.getEventsByStatusWithSearch(status, q.trim(), pageable);
            } else {
                events = eventService.getEventsByStatus(status, pageable);
            }
            return ResponseEntity.ok()
                    .header("X-Total-Elements", String.valueOf(events.getTotalElements()))
                    .header("X-Total-Pages", String.valueOf(events.getTotalPages()))
                    .body(events.getContent());
        } else {
            List<EventResponseDTO> events;
            if (q != null && !q.trim().isEmpty()) {
                events = eventService.getEventsByStatusWithSearch(status, q.trim());
            } else {
                events = eventService.getEventsByStatus(status);
            }
            return ResponseEntity.ok(events);
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get event by ID", description = "Retrieve a specific event by its ID")
    public ResponseEntity<EventResponseDTO> getEventById(
            @Parameter(description = "Event ID") @PathVariable Long id) {
        
        EventResponseDTO event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    @GetMapping("/my-events")
    @Operation(summary = "Get my created events", description = "Retrieve events created by the authenticated user")
    public ResponseEntity<List<EventResponseDTO>> getMyEvents(
            @RequestParam(required = false) boolean paginated,
            @PageableDefault(size = 10) Pageable pageable,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        
        // Get user ID from the authentication service or user service
        // For now, we'll modify the service to accept email directly
        if (paginated) {
            Page<EventResponseDTO> events = eventService.getEventsByCreatorEmail(userEmail, pageable);
            return ResponseEntity.ok()
                    .header("X-Total-Elements", String.valueOf(events.getTotalElements()))
                    .header("X-Total-Pages", String.valueOf(events.getTotalPages()))
                    .body(events.getContent());
        } else {
            List<EventResponseDTO> events = eventService.getEventsByCreatorEmail(userEmail);
            return ResponseEntity.ok(events);
        }
    }

    @PostMapping
    @Operation(summary = "Create new event", description = "Create a new event")
    public ResponseEntity<EventResponseDTO> createEvent(
            @Valid @RequestBody EventCreateRequestDTO request,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        EventResponseDTO createdEvent = eventService.createEvent(request, userEmail);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    @PostMapping(value = "/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create new event with image", description = "Create a new event and upload its main image in one request")
    public ResponseEntity<EventResponseDTO> createEventWithImage(
            @Valid @ModelAttribute EventCreateRequestDTO request,
            @Parameter(description = "Main image file") @RequestParam(value = "mainImage", required = false) MultipartFile mainImage,
            Authentication authentication) throws IOException {
        
        String userEmail = authentication.getName();
        
        // Create event first
        EventResponseDTO createdEvent = eventService.createEvent(request, userEmail);
        
        // Upload image if provided
        if (mainImage != null && !mainImage.isEmpty()) {
            eventImageService.uploadMainImage(createdEvent.id(), mainImage, userEmail);
            // Re-fetch the updated event with the new image URL
            createdEvent = eventService.getEventById(createdEvent.id());
        }
        
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update event", description = "Update an existing event")
    public ResponseEntity<EventResponseDTO> updateEvent(
            @Parameter(description = "Event ID") @PathVariable Long id,
            @Valid @RequestBody EventUpdateRequestDTO request,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        EventResponseDTO updatedEvent = eventService.updateEvent(id, request, userEmail);
        return ResponseEntity.ok(updatedEvent);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete event", description = "Delete an event")
    public ResponseEntity<Void> deleteEvent(
            @Parameter(description = "Event ID") @PathVariable Long id,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        eventService.deleteEvent(id, userEmail);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle event status", description = "Activate or deactivate an event")
    public ResponseEntity<EventResponseDTO> toggleEventStatus(
            @Parameter(description = "Event ID") @PathVariable Long id,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        EventResponseDTO updatedEvent = eventService.toggleEventStatus(id, userEmail);
        return ResponseEntity.ok(updatedEvent);
    }

    @GetMapping("/categories")
    @Operation(summary = "Get event categories", description = "Get all available event categories")
    public ResponseEntity<EventCategory[]> getEventCategories() {
        return ResponseEntity.ok(EventCategory.values());
    }

    @GetMapping("/stats/count")
    @Operation(summary = "Get events count", description = "Get total count of active events")
    public ResponseEntity<Long> getActiveEventsCount() {
        Long count = eventService.countActiveEvents();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/stats/count-by-category")
    @Operation(summary = "Get events count by category", description = "Get count of active events by category")
    public ResponseEntity<Long> getActiveEventsByCategory(
            @Parameter(description = "Event category") @RequestParam EventCategory category) {
        Long count = eventService.countActiveEventsByCategory(category);
        return ResponseEntity.ok(count);
    }

    // ==============================
    // ADMIN ENDPOINTS
    // ==============================

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get event dashboard statistics", description = "Get comprehensive event statistics for admin dashboard")
    public ResponseEntity<EventStatsDTO> getDashboardStats() {
        EventStatsDTO stats = statsService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/all-admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get all events (admin)", description = "Get all events including inactive ones (admin only)")
    public ResponseEntity<List<EventResponseDTO>> getAllEventsAdmin(
            @RequestParam(required = false) boolean paginated,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) EventCategory category,
            @PageableDefault(size = 20) Pageable pageable) {
        
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
    @PreAuthorize("hasAuthority('ADMIN')")
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

    @PatchMapping("/{id}/admin-toggle-status")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Toggle event status (admin)", description = "Activate or deactivate any event as admin")
    public ResponseEntity<EventResponseDTO> adminToggleEventStatus(
            @Parameter(description = "Event ID") @PathVariable Long id,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        EventResponseDTO updatedEvent = eventService.toggleEventStatus(id, userEmail);
        return ResponseEntity.ok(updatedEvent);
    }

    @DeleteMapping("/{id}/force-delete")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Force delete event", description = "Force delete any event as admin (even with attendees)")
    public ResponseEntity<Void> forceDeleteEvent(
            @Parameter(description = "Event ID") @PathVariable Long id,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        eventService.deleteEvent(id, userEmail);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats/revenue")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get revenue statistics", description = "Get detailed revenue statistics")
    public ResponseEntity<EventStatsDTO> getRevenueStats() {
        EventStatsDTO stats = statsService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/category")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get category statistics", description = "Get event statistics by category")
    public ResponseEntity<EventStatsDTO> getCategoryStats() {
        EventStatsDTO stats = statsService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    // ==============================
    // EVENT STATUS MANAGEMENT
    // ==============================

    @PatchMapping("/{id}/publish")
    @Operation(summary = "Publish event", description = "Publish an event making it available for registrations")
    public ResponseEntity<EventResponseDTO> publishEvent(
            @Parameter(description = "Event ID") @PathVariable Long id,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        EventResponseDTO updatedEvent = eventService.publishEvent(id, userEmail);
        return ResponseEntity.ok(updatedEvent);
    }

    @PatchMapping("/{id}/pause")
    @Operation(summary = "Pause event", description = "Pause a published event")
    public ResponseEntity<EventResponseDTO> pauseEvent(
            @Parameter(description = "Event ID") @PathVariable Long id,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        EventResponseDTO updatedEvent = eventService.pauseEvent(id, userEmail);
        return ResponseEntity.ok(updatedEvent);
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel event", description = "Cancel an event")
    public ResponseEntity<EventResponseDTO> cancelEvent(
            @Parameter(description = "Event ID") @PathVariable Long id,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        EventResponseDTO updatedEvent = eventService.cancelEvent(id, userEmail);
        return ResponseEntity.ok(updatedEvent);
    }

    @PatchMapping("/{id}/finish")
    @Operation(summary = "Finish event", description = "Mark an event as finished")
    public ResponseEntity<EventResponseDTO> finishEvent(
            @Parameter(description = "Event ID") @PathVariable Long id,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        EventResponseDTO updatedEvent = eventService.finishEvent(id, userEmail);
        return ResponseEntity.ok(updatedEvent);
    }

    @PatchMapping("/{id}/back-to-edition")
    @Operation(summary = "Back to edition", description = "Move a paused event back to edition")
    public ResponseEntity<EventResponseDTO> backToEdition(
            @Parameter(description = "Event ID") @PathVariable Long id,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        EventResponseDTO updatedEvent = eventService.backToEdition(id, userEmail);
        return ResponseEntity.ok(updatedEvent);
    }


    // ==============================
    // EVENT REGISTRATIONS MANAGEMENT
    // ==============================

    @GetMapping("/{id}/registrations")
    @PreAuthorize("hasAuthority('ADMIN') or @eventService.isEventCreator(#id, authentication.name)")
    @Operation(summary = "Get event registrations", description = "Get all users registered for an event")
    public ResponseEntity<List<Map<String, Object>>> getEventRegistrations(
            @Parameter(description = "Event ID") @PathVariable Long id,
            Authentication authentication) {
        
        List<Map<String, Object>> registrations = eventService.getEventRegistrations(id);
        return ResponseEntity.ok(registrations);
    }

    @GetMapping("/my-registrations")
    @Operation(summary = "Get my registrations", description = "Get events where the current user is registered")
    public ResponseEntity<List<EventResponseDTO>> getMyRegistrations(
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        List<EventResponseDTO> events = eventService.getUserRegisteredEvents(userEmail);
        return ResponseEntity.ok(events);
    }

    // ==============================
    // EVENT IMAGES BROWSER
    // ==============================

    @GetMapping("/images/browse")
    @Operation(summary = "Browse event images", description = "Get available images for event creation")
    public ResponseEntity<List<Map<String, String>>> browseEventImages() {
        List<Map<String, String>> images = eventImageService.browseAvailableImages();
        return ResponseEntity.ok(images);
    }
}