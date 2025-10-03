package com.feeling.packages.booking.domain.services;

import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.packages.booking.domain.dto.BookingRequestDTO;
import com.feeling.packages.booking.domain.dto.BookingResponseDTO;
import com.feeling.packages.booking.infrastructure.entities.Booking;
import com.feeling.packages.booking.infrastructure.entities.PaymentMethod;
import com.feeling.packages.booking.infrastructure.repositories.IAvailabilityRepository;
import com.feeling.packages.booking.infrastructure.repositories.IBookingRepository;
import com.feeling.packages.booking.infrastructure.repositories.IPaymentMethodRepository;
import com.feeling.packages.event.infrastructure.entities.Event;
import com.feeling.packages.event.infrastructure.repositories.IEventRepository;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final IBookingRepository bookingRepository;
    private final IEventRepository eventRepository;
    private final IUserRepository userRepository;
    private final IPaymentMethodRepository paymentMethodRepository;
    private final IAvailabilityRepository availabilityRepository;

    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO bookingRequest, String userEmail) {
        // Validar usuario
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        // Validar evento
        Event event = eventRepository.findById(bookingRequest.getEventId())
            .orElseThrow(() -> new NotFoundException("Evento no encontrado"));

        // Verificar que el evento esté activo y tenga capacidad
        if (!event.getIsActive()) {
            throw new BadRequestException("El evento no está activo");
        }

        if (event.getMaxCapacity() != null && getBookedAttendeesForEvent(event.getId()) + bookingRequest.getAttendees() > event.getMaxCapacity()) {
            throw new BadRequestException("No hay suficiente capacidad en el evento");
        }

        // Verificar que la fecha de reserva sea válida
        if (bookingRequest.getBookingDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("La fecha de reserva debe ser en el futuro");
        }

        // Crear la reserva
        Booking booking = Booking.builder()
            .user(user)
            .event(event)
            .bookingDate(bookingRequest.getBookingDate())
            .attendees(bookingRequest.getAttendees())
            .totalPrice(calculateTotalPrice(event, bookingRequest.getAttendees()))
            .specialRequests(bookingRequest.getSpecialRequests())
            .status(Booking.BookingStatus.PENDING)
            .build();

        // Procesar pago si se proporciona método de pago
        if (bookingRequest.getPaymentMethodId() != null) {
            PaymentMethod paymentMethod = paymentMethodRepository.findById(bookingRequest.getPaymentMethodId())
                .orElseThrow(() -> new NotFoundException("Método de pago no encontrado"));

            // Aquí se procesaría el pago
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
        }

        booking = bookingRepository.save(booking);
        return new BookingResponseDTO(booking);
    }

    public List<BookingResponseDTO> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        List<Booking> bookings = bookingRepository.findByUserOrderByCreatedAtDesc(user);
        return bookings.stream()
            .map(BookingResponseDTO::new)
            .collect(Collectors.toList());
    }

    public Page<BookingResponseDTO> getEventBookings(Long eventId, Pageable pageable) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new NotFoundException("Evento no encontrado"));

        Page<Booking> bookings = bookingRepository.findByEventOrderByCreatedAtDesc(event, pageable);
        return bookings.map(BookingResponseDTO::new);
    }

    public BookingResponseDTO getBookingById(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new NotFoundException("Reserva no encontrada"));

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        // Verificar que el usuario sea el propietario de la reserva
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("No tiene permisos para acceder a esta reserva");
        }

        return new BookingResponseDTO(booking);
    }

    @Transactional
    public BookingResponseDTO cancelBooking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new NotFoundException("Reserva no encontrada"));

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        // Verificar que el usuario sea el propietario
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("No tiene permisos para cancelar esta reserva");
        }

        // Verificar que la reserva se pueda cancelar
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BadRequestException("La reserva ya está cancelada");
        }

        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new BadRequestException("No se puede cancelar una reserva completada");
        }

        // Cancelar la reserva
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());

        booking = bookingRepository.save(booking);
        return new BookingResponseDTO(booking);
    }

    private Double calculateTotalPrice(Event event, Integer attendees) {
        // Lógica para calcular el precio total basado en el evento y número de asistentes
        if (event.getPrice() == null) {
            return 0.0;
        }
        return event.getPrice().doubleValue() * attendees;
    }

    private Integer getBookedAttendeesForEvent(Long eventId) {
        return bookingRepository.sumAttendeesByEventId(eventId);
    }

    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream().map(BookingResponseDTO::new).collect(Collectors.toList());
    }

    @Transactional
    public BookingResponseDTO updateBookingStatus(Long bookingId, Booking.BookingStatus newStatus, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new NotFoundException("Reserva no encontrada"));

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        // Verificar que el usuario sea el propietario
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("No tiene permisos para modificar esta reserva");
        }

        // Validar transiciones de estado permitidas
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BadRequestException("No se puede modificar una reserva cancelada");
        }

        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new BadRequestException("No se puede modificar una reserva completada");
        }

        booking.setStatus(newStatus);
        booking.setUpdatedAt(LocalDateTime.now());

        booking = bookingRepository.save(booking);
        return new BookingResponseDTO(booking);
    }
}
