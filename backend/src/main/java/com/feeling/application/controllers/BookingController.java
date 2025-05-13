package com.feeling.application.controllers;

import com.feeling.domain.dto.booking.BookingRequestDTO;
import com.feeling.domain.dto.booking.BookingResponseDTO;
import com.feeling.domain.services.BookingService;
import com.feeling.domain.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;
    @PostMapping
    @PreAuthorize("isAuthenticated()") // Cualquier usuario autenticado puede acceder
    public ResponseEntity<BookingResponseDTO> createBooking(@RequestBody BookingRequestDTO bookingRequestDTO) {
        // Obtener el email del usuario autenticado
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName(); // El email se guarda en el nombre del usuario
        BookingResponseDTO bookingResponseDTO = bookingService.createBooking(bookingRequestDTO, userEmail);
        return new ResponseEntity<>(bookingResponseDTO, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponseDTO> getBooking(@PathVariable Long id) {
        BookingResponseDTO bookingResponseDTO = bookingService.getBooking(id);
        return new ResponseEntity<>(bookingResponseDTO, HttpStatus.OK);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        List<BookingResponseDTO> bookingResponseDTOList = bookingService.getAllBookings();
        return new ResponseEntity<>(bookingResponseDTOList, HttpStatus.OK);
    }

    @GetMapping("/tour/{tourId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByTour(@PathVariable Long tourId) {
        List<BookingResponseDTO> bookingResponseDTOList = bookingService.getBookingsByTour(tourId);
        return new ResponseEntity<>(bookingResponseDTOList, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    @GetMapping("/historic")
    @PreAuthorize("isAuthenticated()")
    public  ResponseEntity<List<BookingResponseDTO>> historicBooking() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Long userId = userService.get(email).id();
        List<BookingResponseDTO> bookingResponseDTOList = bookingService.getBookingsByUser(userId);
        return new ResponseEntity<>(bookingResponseDTOList, HttpStatus.OK);
    }
}
