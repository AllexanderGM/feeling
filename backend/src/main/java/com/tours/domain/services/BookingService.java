package com.tours.domain.services;

import com.tours.domain.dto.booking.BookingRequestDTO;
import com.tours.domain.dto.booking.BookingResponseDTO;
import com.tours.exception.BadRequestException;
import com.tours.exception.UnauthorizedException;
import com.tours.infrastructure.entities.booking.*;
import com.tours.infrastructure.entities.tour.Tour;
import com.tours.infrastructure.entities.user.User;
import com.tours.infrastructure.repositories.booking.IAccommodationRepository;
import com.tours.infrastructure.repositories.booking.IAvailabilityRepository;
import com.tours.infrastructure.repositories.booking.IBookingRepository;
import com.tours.infrastructure.repositories.booking.IPaymentMethodRepository;
import com.tours.infrastructure.repositories.tour.ITourRepository;
import com.tours.infrastructure.repositories.user.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final IBookingRepository bookingRepository;
    private final ITourRepository tourRepository;
    private final IUserRepository userRepository;
    private final IAccommodationRepository accommodationRepository;
    private final IPaymentMethodRepository paymentMethodRepository;
    private final IAvailabilityRepository availabilityRepository;
    private final EmailService emailService;
    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO bookingRequestDTO, String userEmail) {
        //Obtener el tour
        Tour tour = tourRepository.findById(bookingRequestDTO.getTourId()).orElseThrow(() -> new UnauthorizedException("Tour no encontrado"));
        //Validar que la fecha de inicio sea posterior a la fecha de creacion del tour
        if (bookingRequestDTO.getStartDate().isBefore(tour.getCreationDate().atStartOfDay())) {
            throw new BadRequestException("La fecha de inicio debe ser posterior a la fecha de creacion del tour");
        }
        //Validar que la fecha de inicio sea anterior o igual a la fecha disponible
        Availability availability = availabilityRepository.findByTourIdAndAvailableDate(bookingRequestDTO.getTourId(), bookingRequestDTO.getStartDate());
        if (availability == null) {
            throw new BadRequestException("No hay disponibilidad para la fecha seleccionada");
        }
        if (bookingRequestDTO.getStartDate().isAfter(availability.getAvailableDate())) {
            throw new BadRequestException("La fecha de inicio debe ser anterior o igual a la fecha disponible");
        }
        //Validar que la fecha de inicio este dentro del rango de la fecha de creacion del tour y la fecha de disponibilidad
        if (bookingRequestDTO.getStartDate().isBefore(tour.getCreationDate().atStartOfDay()) || bookingRequestDTO.getStartDate().isAfter(availability.getAvailableDate())) {
            throw new BadRequestException("La fecha de inicio debe estar entre la fecha de creaciel tour y la fecha de disponibilidad");
        }
        //Validar que la suma de adultos y niños no supere los cupos disponibles
        int totalRequested = bookingRequestDTO.getAdults() + bookingRequestDTO.getChildren();
        if (totalRequested > availability.getAvailableSlots()) {
            throw new BadRequestException("No hay suficientes cupos disponibles");
        }

        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        Accommodation accommodation = null;
        if (bookingRequestDTO.getAccommodationBooking() != null) {
            accommodation = accommodationRepository.findByAccommodationBooking(bookingRequestDTO.getAccommodationBooking()).orElse(null);
            if (accommodation == null) {
                accommodation = new Accommodation(bookingRequestDTO.getAccommodationBooking());
                accommodation = accommodationRepository.save(accommodation);
            }
        }
        //Se crea la fecha de fin con la fecha de disponibilidad y la hora de regreso
        LocalDateTime endDate = LocalDateTime.of(availability.getAvailableDate().toLocalDate(), availability.getReturnTime().toLocalTime());

        if (!checkAvailability(tour, bookingRequestDTO.getStartDate(), endDate, bookingRequestDTO.getAdults(), bookingRequestDTO.getChildren(), availability)) {
            throw new UnauthorizedException("No hay disponibilidad para las fechas seleccionadas");
        }

        Double price = calculatePrice(tour, bookingRequestDTO.getAdults(), bookingRequestDTO.getChildren());

        Pay pay = null;
        if (bookingRequestDTO.getPaymentMethodId() != null) {
            pay = new Pay();
            PaymentMethod paymentMethod = paymentMethodRepository.findById(bookingRequestDTO.getPaymentMethodId()).orElse(null);
            if(paymentMethod == null){
                throw new UnauthorizedException("Metodo de pago no encontrado");
            }
            pay.setPaymentMethod(paymentMethod);
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setTour(tour);
        booking.setStartDate(bookingRequestDTO.getStartDate());
        //Se asigna la fecha de fin
        booking.setEndDate(endDate);
        booking.setAdults(bookingRequestDTO.getAdults());
        booking.setChildren(bookingRequestDTO.getChildren());
        booking.setAccommodation(accommodation);
        booking.setPrice(price);
        booking.setPay(pay);
        booking.setCreationDate(LocalDateTime.now());

        bookingRepository.save(booking);
        //Se actualizan los cupos disponibles
        availability.setAvailableSlots(availability.getAvailableSlots() - totalRequested);
        availabilityRepository.save(availability);

        BookingResponseDTO bookingResponseDTO = new BookingResponseDTO(booking);
        try {
            emailService.sendMailBooking(user.getEmail(), user.getName(), bookingResponseDTO);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return bookingResponseDTO;
    }

    public BookingResponseDTO getBooking(Long id) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new UnauthorizedException("Reserva no encontrada"));
        return new BookingResponseDTO(booking);
    }

    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream().map(BookingResponseDTO::new).collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getBookingsByTour(Long tourId) {
        return bookingRepository.findByTourId(tourId).stream().map(BookingResponseDTO::new).collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId).stream().map(BookingResponseDTO::new).collect(Collectors.toList());
    }

    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    private boolean checkAvailability(Tour tour, LocalDateTime startDate, LocalDateTime endDate, Integer adults, Integer children, Availability availability) {

        List<Booking> bookings = bookingRepository.findByTourId(tour.getId());
        int totalRequested = adults + children;
        for (Booking booking : bookings) {
            //Se valida si hay superposicion de reservas
            if (!(endDate.isBefore(booking.getStartDate()) || startDate.isAfter(booking.getEndDate()))) {
                //Si hay superposicion, se valida si hay cupos disponibles
                if(availability.getAvailableSlots() < totalRequested){
                    return false;
                }
            }
        }

        if (availability == null) {
            return false;
        }
        //Se modifica la validacion para que permita reservar la cantidad total de slots disponibles
        if (availability.getAvailableSlots() < totalRequested) {
            return false;
        }
        return true;
    }

    private Double calculatePrice(Tour tour, Integer adults, Integer children) {
        return tour.getAdultPrice().doubleValue() * adults + tour.getChildPrice().doubleValue() * children;
    }
}