package com.feeling.packages.booking.domain.services;

import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.packages.booking.domain.dto.BookingRequestDTO;
import com.feeling.packages.booking.domain.dto.BookingResponseDTO;
import com.feeling.packages.booking.domain.dto.BookingStatisticsDTO;
import com.feeling.packages.booking.infrastructure.entities.Booking;
import com.feeling.packages.booking.infrastructure.entities.PaymentMethod;
import com.feeling.packages.booking.infrastructure.repositories.IBookingRepository;
import com.feeling.packages.booking.infrastructure.repositories.IPaymentMethodRepository;
import com.feeling.packages.common.domain.dto.payment.PaymentIntentCommand;
import com.feeling.packages.common.domain.dto.payment.PaymentIntentResponse;
import com.feeling.packages.common.domain.services.payment.PaymentGateway;
import com.feeling.packages.event.infrastructure.entities.Event;
import com.feeling.packages.event.infrastructure.repositories.IEventRepository;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio de dominio para la gestión de reservas de eventos.
 * <p>
 * Responsabilidades principales:
 * - Validar la relación usuario-evento y disponibilidad.
 * - Orquestar integración con el gateway de pagos genérico.
 * - Exponer consultas paginadas para clientes y métricas para administradores.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final IBookingRepository bookingRepository;
    private final IEventRepository eventRepository;
    private final IUserRepository userRepository;
    private final IPaymentMethodRepository paymentMethodRepository;
    private final PaymentGateway paymentGateway;

    @Value("${feeling.bookings.max-future-days:365}")
    private int maxFutureDays;

    @Value("${feeling.payments.currency:USD}")
    private String defaultCurrency;

    // ========================================
    // ESTADÍSTICAS
    // ========================================

    @Transactional(readOnly = true)
    public BookingStatisticsDTO getUserBookingStatistics(String userEmail) {
        User user = loadUser(userEmail);
        LocalDateTime now = LocalDateTime.now();
        long total = bookingRepository.countByUserId(user.getId());
        long upcoming = bookingRepository.findUpcomingBookingsForUser(user.getId(), now).size();
        long cancelled = bookingRepository.countByUserIdAndStatus(user.getId(), Booking.BookingStatus.CANCELLED);
        long completed = bookingRepository.countByUserIdAndStatus(user.getId(), Booking.BookingStatus.COMPLETED);
        return new BookingStatisticsDTO(total, upcoming, cancelled, completed, now);
    }

    @Transactional(readOnly = true)
    public BookingStatisticsDTO getEventBookingStatistics(Long eventId) {
        Event event = loadEvent(eventId);
        LocalDateTime now = LocalDateTime.now();
        long total = bookingRepository.countByEventId(event.getId());
        long upcoming = bookingRepository.findByEventOrderByCreatedAtDesc(event, Pageable.unpaged())
            .getContent()
            .stream()
            .filter(b -> b.getBookingDate().isAfter(now))
            .count();
        long cancelled = bookingRepository.countByEventIdAndStatus(event.getId(), Booking.BookingStatus.CANCELLED);
        long completed = bookingRepository.countByEventIdAndStatus(event.getId(), Booking.BookingStatus.COMPLETED);
        return new BookingStatisticsDTO(total, upcoming, cancelled, completed, now);
    }

    // ========================================
    // CLIENTE - OPERACIONES CRUD
    // ========================================

    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO bookingRequest, String userEmail) {
        User user = loadUser(userEmail);
        Event event = loadEvent(bookingRequest.getEventId());
        validateBookingRequest(event, bookingRequest);

        Booking booking = Booking.builder()
            .user(user)
            .event(event)
            .bookingDate(bookingRequest.getBookingDate())
            .attendees(bookingRequest.getAttendees())
            .totalPrice(calculateTotalPrice(event, bookingRequest.getAttendees()))
            .currency(defaultCurrency)
            .specialRequests(bookingRequest.getSpecialRequests())
            .status(Booking.BookingStatus.PENDING)
            .build();

        PaymentIntentResponse paymentResponse = null;
        if (bookingRequest.getPaymentMethodId() != null) {
            PaymentMethod paymentMethod = paymentMethodRepository.findById(bookingRequest.getPaymentMethodId())
                .orElseThrow(() -> new NotFoundException("Método de pago no encontrado"));

            PaymentIntentCommand command = new PaymentIntentCommand(
                booking.getTotalPrice(),
                booking.getCurrency(),
                "Reserva de evento: " + event.getTitle(),
                Map.of(
                    "eventId", String.valueOf(event.getId()),
                    "userId", String.valueOf(user.getId())
                ),
                String.valueOf(paymentMethod.getId())
            );

            paymentResponse = paymentGateway.createPaymentIntent(command);
            booking.setPaymentIntentId(paymentResponse.paymentIntentId());
            booking.setPaymentStatus(paymentResponse.status());
        } else {
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            booking.setPaymentStatus("not_required");
        }

        booking = bookingRepository.save(booking);
        BookingResponseDTO response = mapToResponse(booking);
        if (paymentResponse != null) {
            response.setPaymentClientSecret(paymentResponse.clientSecret());
        }
        return response;
    }

    @Transactional
    public BookingResponseDTO confirmBookingPayment(Long bookingId, String userEmail) {
        Booking booking = getBookingForUser(bookingId, userEmail);
        if (booking.getPaymentIntentId() == null) {
            throw new BadRequestException("La reserva no tiene un pago pendiente");
        }

        PaymentIntentResponse response = paymentGateway.confirmPayment(booking.getPaymentIntentId());
        if (!"succeeded".equalsIgnoreCase(response.status())) {
            throw new BadRequestException("No fue posible confirmar el pago: " + response.message());
        }

        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setPaymentStatus(response.status());
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Long bookingId, String userEmail) {
        Booking booking = getBookingForUser(bookingId, userEmail);
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponseDTO cancelBooking(Long bookingId, String userEmail) {
        Booking booking = getBookingForUser(bookingId, userEmail);

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BadRequestException("La reserva ya está cancelada");
        }
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new BadRequestException("No se puede cancelar una reserva completada");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setPaymentStatus("cancelled");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        return mapToResponse(booking);
    }

    @Transactional(readOnly = true)
    public Page<BookingResponseDTO> getUserBookings(String userEmail, Pageable pageable) {
        User user = loadUser(userEmail);
        Pageable resolvedPageable = pageable == null ? Pageable.unpaged() : pageable;
        Page<Booking> bookings = bookingRepository.findByUserIdOptimized(user.getId(), resolvedPageable);
        return bookings.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getUpcomingBookings(String userEmail) {
        User user = loadUser(userEmail);
        List<Booking> bookings = bookingRepository.findUpcomingBookingsForUser(user.getId(), LocalDateTime.now());
        return bookings.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ========================================
    // ADMIN - CONSULTAS
    // ========================================

    @Transactional(readOnly = true)
    public Page<BookingResponseDTO> getEventBookings(Long eventId, Pageable pageable) {
        Event event = loadEvent(eventId);
        Pageable resolvedPageable = pageable == null ? Pageable.unpaged() : pageable;
        Page<Booking> bookings = bookingRepository.findByEventIdOptimized(event.getId(), resolvedPageable);
        return bookings.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public BookingResponseDTO updateBookingStatus(Long bookingId, Booking.BookingStatus newStatus, String userEmail) {
        Booking booking = getBookingForUser(bookingId, userEmail);

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BadRequestException("No se puede modificar una reserva cancelada");
        }
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new BadRequestException("No se puede modificar una reserva completada");
        }

        booking.setStatus(newStatus);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================

    private Booking getBookingForUser(Long bookingId, String userEmail) {
        User user = loadUser(userEmail);
        Booking booking = bookingRepository.findByIdWithRelations(bookingId)
            .orElseThrow(() -> new NotFoundException("Reserva no encontrada"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("No tiene permisos para acceder a esta reserva");
        }
        return booking;
    }

    private void validateBookingRequest(Event event, BookingRequestDTO bookingRequest) {
        if (!Boolean.TRUE.equals(event.getIsActive())) {
            throw new BadRequestException("El evento no está activo");
        }

        if (event.getEventDate() != null && event.getEventDate().isAfter(LocalDateTime.now().plusDays(maxFutureDays))) {
            throw new BadRequestException("El evento se encuentra fuera del rango de reservas permitido");
        }

        if (bookingRequest.getBookingDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("La fecha de reserva debe ser en el futuro");
        }

        if (event.getMaxCapacity() != null) {
            int bookedAttendees = getBookedAttendeesForEvent(event.getId());
            if (bookedAttendees + bookingRequest.getAttendees() > event.getMaxCapacity()) {
                throw new BadRequestException("No hay suficiente capacidad en el evento");
            }
        }

        if (!bookingRepository.findConflictingBookings(event.getId(), bookingRequest.getBookingDate()).isEmpty()) {
            throw new BadRequestException("Ya existe una reserva para esta fecha y evento");
        }
    }

    private BookingResponseDTO mapToResponse(Booking booking) {
        BookingResponseDTO responseDTO = new BookingResponseDTO(booking);
        responseDTO.setPaymentStatus(booking.getPaymentStatus());
        responseDTO.setPaymentIntentId(booking.getPaymentIntentId());
        return responseDTO;
    }

    private User loadUser(String userEmail) {
        return userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));
    }

    private Event loadEvent(Long eventId) {
        return eventRepository.findById(eventId)
            .orElseThrow(() -> new NotFoundException("Evento no encontrado"));
    }

    private BigDecimal calculateTotalPrice(Event event, Integer attendees) {
        BigDecimal price = event.getPrice() != null ? event.getPrice() : BigDecimal.ZERO;
        int attendeeCount = attendees == null ? 0 : attendees;
        return price.multiply(BigDecimal.valueOf(attendeeCount));
    }

    private int getBookedAttendeesForEvent(Long eventId) {
        Integer total = bookingRepository.sumAttendeesByEventId(eventId);
        return total == null ? 0 : total;
    }
}
