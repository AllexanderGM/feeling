package com.feeling.packages.booking.application;

import com.feeling.packages.booking.domain.dto.BookingRequestDTO;
import com.feeling.packages.booking.domain.dto.BookingResponseDTO;
import com.feeling.packages.booking.domain.services.BookingService;
import com.feeling.packages.booking.infrastructure.entities.Booking;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Event booking management endpoints")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create booking", description = "Create a new booking for an event")
    public ResponseEntity<BookingResponseDTO> createBooking(
        @Valid @RequestBody BookingRequestDTO bookingRequestDTO,
        Authentication authentication) {

        String userEmail = authentication.getName();
        BookingResponseDTO booking = bookingService.createBooking(bookingRequestDTO, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get booking by ID", description = "Retrieve a specific booking by ID")
    public ResponseEntity<BookingResponseDTO> getBooking(
        @PathVariable Long id,
        Authentication authentication) {

        String userEmail = authentication.getName();
        BookingResponseDTO booking = bookingService.getBookingById(id, userEmail);
        return ResponseEntity.ok(booking);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all bookings", description = "Admin endpoint to retrieve all bookings")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        List<BookingResponseDTO> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get bookings by event", description = "Admin endpoint to retrieve bookings for a specific event")
    public ResponseEntity<Page<BookingResponseDTO>> getBookingsByEvent(
        @PathVariable Long eventId,
        Pageable pageable) {

        Page<BookingResponseDTO> bookings = bookingService.getEventBookings(eventId, pageable);
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancel booking", description = "Cancel a booking")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
        @PathVariable Long id,
        Authentication authentication) {

        String userEmail = authentication.getName();
        BookingResponseDTO booking = bookingService.cancelBooking(id, userEmail);
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update booking complaintStatus", description = "Update the complaintStatus of a booking")
    public ResponseEntity<BookingResponseDTO> updateBookingStatus(
        @PathVariable Long id,
        @RequestParam Booking.BookingStatus status,
        Authentication authentication) {

        String userEmail = authentication.getName();
        BookingResponseDTO booking = bookingService.updateBookingStatus(id, status, userEmail);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my bookings", description = "Retrieve bookings for the authenticated user")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(Authentication authentication) {
        String userEmail = authentication.getName();
        List<BookingResponseDTO> bookings = bookingService.getUserBookings(userEmail);
        return ResponseEntity.ok(bookings);
    }
}
