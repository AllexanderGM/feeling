package com.feeling.packages.booking.application;

import com.feeling.handlers.ResponseHandler;
import com.feeling.packages.booking.domain.dto.BookingRequestDTO;
import com.feeling.packages.booking.domain.dto.BookingResponseDTO;
import com.feeling.packages.booking.domain.services.BookingService;
import com.feeling.packages.booking.infrastructure.entities.Booking;
import com.feeling.packages.user.domain.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Object> createBooking(@Valid @RequestBody BookingRequestDTO bookingRequestDTO) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Long userId = userService.get(email).id();

            BookingResponseDTO bookingResponseDTO = bookingService.createBooking(bookingRequestDTO, userId);
            return ResponseHandler.success("Reserva creada exitosamente", bookingResponseDTO, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseHandler.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Object> getBooking(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Long userId = userService.get(email).id();

            BookingResponseDTO bookingResponseDTO = bookingService.getBookingById(id, userId);
            return ResponseHandler.success("Reserva obtenida exitosamente", bookingResponseDTO, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseHandler.error(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> getAllBookings() {
        try {
            List<BookingResponseDTO> bookingResponseDTOList = bookingService.getAllBookings();
            return ResponseHandler.success("Todas las reservas obtenidas exitosamente", bookingResponseDTOList, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseHandler.error(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> getBookingsByEvent(@PathVariable Long eventId, Pageable pageable) {
        try {
            Page<BookingResponseDTO> bookingResponseDTOPage = bookingService.getEventBookings(eventId, pageable);
            return ResponseHandler.success("Reservas del evento obtenidas exitosamente", bookingResponseDTOPage, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseHandler.error(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Object> cancelBooking(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Long userId = userService.get(email).id();

            BookingResponseDTO bookingResponseDTO = bookingService.cancelBooking(id, userId);
            return ResponseHandler.success("Reserva cancelada exitosamente", bookingResponseDTO, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseHandler.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Object> updateBookingStatus(@PathVariable Long id, @RequestParam Booking.BookingStatus status) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Long userId = userService.get(email).id();

            BookingResponseDTO bookingResponseDTO = bookingService.updateBookingStatus(id, status, userId);
            return ResponseHandler.success("Estado de reserva actualizado exitosamente", bookingResponseDTO, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseHandler.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Object> getMyBookings() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Long userId = userService.get(email).id();

            List<BookingResponseDTO> bookingResponseDTOList = bookingService.getUserBookings(userId);
            return ResponseHandler.success("Reservas del usuario obtenidas exitosamente", bookingResponseDTOList, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseHandler.error(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
