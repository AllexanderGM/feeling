package com.feeling.application.controllers.event;


import com.feeling.domain.dto.event.availability.AvailabilityRequestDTO;
import com.feeling.domain.dto.event.availability.AvailabilityResponseDTO;
import com.feeling.domain.services.event.AvailabilityService;
import com.feeling.exception.BadRequestException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/availabilities")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<List<AvailabilityResponseDTO>> getAvailabilityByTourId(@PathVariable Long tourId) {
        List<AvailabilityResponseDTO> availabilities = availabilityService.getAvailabilityByTourId(tourId);
        return ResponseEntity.ok(availabilities);
    }

    @PostMapping("/tour/{tourId}")
    public ResponseEntity<AvailabilityResponseDTO> addAvailabilityToTour(
            @PathVariable Long tourId,
            @Valid @RequestBody AvailabilityRequestDTO availabilityDTO) {
        AvailabilityResponseDTO savedAvailability = availabilityService.addAvailabilityToTour(tourId, availabilityDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAvailability);
    }

    @GetMapping
    public ResponseEntity<List<AvailabilityResponseDTO>> getAvailabilitiesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<AvailabilityResponseDTO> availabilities = availabilityService.findAvailabilitiesByDateRange(startDate, endDate);
            return ResponseEntity.ok(availabilities);
        } catch (BadRequestException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
}
