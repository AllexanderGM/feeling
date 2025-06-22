package com.feeling.domain.services.event;

import com.feeling.domain.dto.event.availability.AvailabilityRequestDTO;
import com.feeling.domain.dto.event.availability.AvailabilityResponseDTO;
import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.infrastructure.entities.booking.Availability;
import com.feeling.infrastructure.entities.booking.Booking;
import com.feeling.infrastructure.entities.tour.Tour;
import com.feeling.infrastructure.repositories.booking.IAvailabilityRepository;
import com.feeling.infrastructure.repositories.booking.IBookingRepository;
import com.feeling.infrastructure.repositories.tour.ITourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilityService {
    private final IAvailabilityRepository availabilityRepository;
    private final ITourRepository tourRepository;
    private final IBookingRepository bookingRepository;

    public List<AvailabilityResponseDTO> getAvailabilityByTourId(Long tourId) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new NotFoundException("No se encontró el tour con ID: " + tourId));

        List<Availability> availabilities = availabilityRepository.findByTour(tour);
        return availabilities.stream()
                .map(availability -> {
                    List<Booking> bookings = bookingRepository.findAll();
                    Boolean isReserved = bookings.stream()
                            .anyMatch(booking -> booking.getTour().equals(tour) &&
                                    booking.getStartDate().isBefore(availability.getAvailableDate().plusDays(1)) &&
                                    booking.getEndDate().isAfter(availability.getAvailableDate()));

                    return new AvailabilityResponseDTO(availability, isReserved);
                })
                .collect(Collectors.toList());
    }

    public AvailabilityResponseDTO addAvailabilityToTour(Long tourId, AvailabilityRequestDTO availabilityDTO) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new NotFoundException("No se encontró el tour con ID: " + tourId));

        // Validar que la fecha sea en el futuro
        if (availabilityDTO.availableDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("La fecha de disponibilidad debe ser en el futuro");
        }

        // Validar que la hora de regreso sea posterior a la hora de salida
        if (availabilityDTO.returnTime().isBefore(availabilityDTO.departureTime()) || availabilityDTO.returnTime().equals(availabilityDTO.departureTime())) {
            throw new BadRequestException("La hora de regreso debe ser posterior a la hora de salida");
        }

        // Validar que los cupos sean positivos
        if (availabilityDTO.availableSlots() <= 0) {
            throw new BadRequestException("Los cupos disponibles deben ser mayores a cero");
        }

        // Validar que departureTime y returnTime estén dentro del rango
        LocalDateTime tourCreationDateTime = tour.getCreationDate().atStartOfDay();
        LocalDateTime availableDateTime = availabilityDTO.availableDate();
        LocalDateTime departureDateTime = LocalDateTime.of(availableDateTime.toLocalDate(), availabilityDTO.departureTime().toLocalTime());
        LocalDateTime returnDateTime = LocalDateTime.of(availableDateTime.toLocalDate(), availabilityDTO.returnTime().toLocalTime());

        if (departureDateTime.isBefore(tourCreationDateTime) || departureDateTime.isAfter(availableDateTime)) {
            throw new BadRequestException("La hora de salida debe estar entre la fecha de creación del tour y la fecha de disponibilidad");
        }

        if (returnDateTime.isBefore(tourCreationDateTime) || returnDateTime.isAfter(availableDateTime)) {
            throw new BadRequestException("La hora de regreso debe estar entre la fecha de creación del tour y la fecha de disponibilidad");
        }

        // Validar que no haya superposición con otras disponibilidades
        List<Availability> existingAvailabilities = availabilityRepository.findByTour(tour);
        for (Availability existingAvailability : existingAvailabilities) {
            if (isOverlapping(availabilityDTO, existingAvailability)) {
                throw new BadRequestException("La disponibilidad se superpone con otra ya existente");
            }
        }

        Availability availability = new Availability();
        availability.setAvailableDate(availabilityDTO.availableDate());
        availability.setAvailableSlots(availabilityDTO.availableSlots());
        availability.setDepartureTime(availabilityDTO.departureTime());
        availability.setReturnTime(availabilityDTO.returnTime());
        availability.setTour(tour);

        Availability savedAvailability = availabilityRepository.save(availability);
        return new AvailabilityResponseDTO(savedAvailability, false);
    }

    public List<AvailabilityResponseDTO> findAvailabilitiesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null || endDate == null) {
            throw new BadRequestException("La fecha de inicio y la fecha de fin son obligatorias");
        }
        if (startDate.isAfter(endDate)) {
            throw new BadRequestException("La fecha de inicio debe ser anterior a la fecha de fin");
        }
        List<Availability> availabilities = availabilityRepository.findByDateRange(startDate, endDate);
        return availabilities.stream()
                .map(availability -> {
                    List<Booking> bookings = bookingRepository.findAll();
                    Boolean isReserved = bookings.stream()
                            .anyMatch(booking -> booking.getTour().equals(availability.getTour()) &&
                                    booking.getStartDate().isBefore(availability.getAvailableDate().plusDays(1)) &&
                                    booking.getEndDate().isAfter(availability.getAvailableDate()));

                    return new AvailabilityResponseDTO(availability, isReserved);
                })
                .collect(Collectors.toList());
    }

    private boolean isOverlapping(AvailabilityRequestDTO newAvailability, Availability existingAvailability) {
        LocalDateTime newStart = LocalDateTime.of(newAvailability.availableDate().toLocalDate(), newAvailability.departureTime().toLocalTime());
        LocalDateTime newEnd = LocalDateTime.of(newAvailability.availableDate().toLocalDate(), newAvailability.returnTime().toLocalTime());
        LocalDateTime existingStart = LocalDateTime.of(existingAvailability.getAvailableDate().toLocalDate(), existingAvailability.getDepartureTime().toLocalTime());
        LocalDateTime existingEnd = LocalDateTime.of(existingAvailability.getAvailableDate().toLocalDate(), existingAvailability.getReturnTime().toLocalTime());

        return newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);
    }
}
