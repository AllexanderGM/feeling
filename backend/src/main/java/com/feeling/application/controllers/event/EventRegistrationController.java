package com.feeling.application.controllers.event;

import com.feeling.domain.dto.event.EventRegistrationRequestDTO;
import com.feeling.domain.dto.event.EventRegistrationResponseDTO;
import com.feeling.domain.services.event.EventRegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event-registrations")
@RequiredArgsConstructor
@Tag(name = "Event Registrations", description = "Event registration management endpoints")
public class EventRegistrationController {
    
    private final EventRegistrationService registrationService;

    @GetMapping("/my-registrations")
    @Operation(summary = "Get my event registrations", description = "Retrieve all registrations for the authenticated user")
    public ResponseEntity<List<EventRegistrationResponseDTO>> getMyRegistrations(
            @RequestParam(required = false) boolean paginated,
            @PageableDefault(size = 10) Pageable pageable,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        
        if (paginated) {
            Page<EventRegistrationResponseDTO> registrations = 
                registrationService.getUserRegistrations(userEmail, pageable);
            return ResponseEntity.ok()
                    .header("X-Total-Elements", String.valueOf(registrations.getTotalElements()))
                    .header("X-Total-Pages", String.valueOf(registrations.getTotalPages()))
                    .body(registrations.getContent());
        } else {
            List<EventRegistrationResponseDTO> registrations = 
                registrationService.getUserRegistrations(userEmail);
            return ResponseEntity.ok(registrations);
        }
    }

    @GetMapping("/event/{eventId}/attendees")
    @Operation(summary = "Get event attendees", description = "Get all attendees for a specific event (creator/admin only)")
    public ResponseEntity<List<EventRegistrationResponseDTO>> getEventAttendees(
            @Parameter(description = "Event ID") @PathVariable Long eventId,
            @RequestParam(required = false) boolean paginated,
            @PageableDefault(size = 10) Pageable pageable,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        
        if (paginated) {
            Page<EventRegistrationResponseDTO> attendees = 
                registrationService.getEventAttendees(eventId, userEmail, pageable);
            return ResponseEntity.ok()
                    .header("X-Total-Elements", String.valueOf(attendees.getTotalElements()))
                    .header("X-Total-Pages", String.valueOf(attendees.getTotalPages()))
                    .body(attendees.getContent());
        } else {
            List<EventRegistrationResponseDTO> attendees = 
                registrationService.getEventAttendees(eventId, userEmail);
            return ResponseEntity.ok(attendees);
        }
    }

    @GetMapping("/event/{eventId}/confirmed-attendees")
    @Operation(summary = "Get confirmed attendees", description = "Get confirmed attendees for a specific event (creator/admin only)")
    public ResponseEntity<List<EventRegistrationResponseDTO>> getConfirmedAttendees(
            @Parameter(description = "Event ID") @PathVariable Long eventId,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        List<EventRegistrationResponseDTO> attendees = 
            registrationService.getConfirmedAttendees(eventId, userEmail);
        return ResponseEntity.ok(attendees);
    }

    @PostMapping("/register")
    @Operation(summary = "Register for event", description = "Register the authenticated user for an event")
    public ResponseEntity<EventRegistrationResponseDTO> registerForEvent(
            @Valid @RequestBody EventRegistrationRequestDTO request,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        EventRegistrationResponseDTO registration = 
            registrationService.registerForEvent(request, userEmail);
        return new ResponseEntity<>(registration, HttpStatus.CREATED);
    }

    @DeleteMapping("/{registrationId}/cancel")
    @Operation(summary = "Cancel registration", description = "Cancel an event registration")
    public ResponseEntity<Void> cancelRegistration(
            @Parameter(description = "Registration ID") @PathVariable Long registrationId,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        registrationService.cancelRegistration(registrationId, userEmail);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/event/{eventId}/my-registration")
    @Operation(summary = "Get my registration for event", description = "Get the authenticated user's registration for a specific event")
    public ResponseEntity<EventRegistrationResponseDTO> getMyEventRegistration(
            @Parameter(description = "Event ID") @PathVariable Long eventId,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        EventRegistrationResponseDTO registration = 
            registrationService.getUserEventRegistration(eventId, userEmail);
        return ResponseEntity.ok(registration);
    }

    @GetMapping("/event/{eventId}/is-registered")
    @Operation(summary = "Check if registered", description = "Check if the authenticated user is registered for a specific event")
    public ResponseEntity<Boolean> isRegisteredForEvent(
            @Parameter(description = "Event ID") @PathVariable Long eventId,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        boolean isRegistered = registrationService.isUserRegistered(eventId, userEmail);
        return ResponseEntity.ok(isRegistered);
    }

    @GetMapping("/stats/my-completed-count")
    @Operation(summary = "Get my completed registrations count", description = "Get count of completed registrations for the authenticated user")
    public ResponseEntity<Long> getMyCompletedRegistrationsCount(Authentication authentication) {
        String userEmail = authentication.getName();
        Long count = registrationService.countUserCompletedRegistrations(userEmail);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/event/{eventId}/confirmed-count")
    @Operation(summary = "Get confirmed attendees count", description = "Get count of confirmed attendees for a specific event")
    public ResponseEntity<Long> getConfirmedAttendeesCount(
            @Parameter(description = "Event ID") @PathVariable Long eventId) {
        
        Long count = registrationService.countEventConfirmedAttendees(eventId);
        return ResponseEntity.ok(count);
    }
}