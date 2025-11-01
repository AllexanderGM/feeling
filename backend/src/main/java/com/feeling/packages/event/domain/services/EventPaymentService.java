package com.feeling.packages.event.domain.services;

import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.packages.common.domain.dto.payment.PaymentIntentCommand;
import com.feeling.packages.common.domain.dto.payment.PaymentIntentResponse;
import com.feeling.packages.common.domain.dto.payment.PaymentWebhookNotification;
import com.feeling.packages.common.domain.services.payment.PaymentGateway;
import com.feeling.packages.event.domain.dto.PaymentRequestDTO;
import com.feeling.packages.event.domain.dto.PaymentResponseDTO;
import com.feeling.packages.booking.domain.services.BookingService;
import com.feeling.packages.booking.infrastructure.entities.Booking;
import com.feeling.packages.booking.infrastructure.repositories.IBookingRepository;
import com.feeling.packages.event.infrastructure.entities.Event;
import com.feeling.packages.event.infrastructure.entities.EventRegistration;
import com.feeling.packages.event.infrastructure.entities.PaymentStatus;
import com.feeling.packages.event.infrastructure.repositories.IEventRegistrationRepository;
import com.feeling.packages.event.infrastructure.repositories.IEventRepository;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Orquestador de pagos específico para eventos.
 * <p>
 * Centraliza las validaciones de dominio y delega la integración al gateway
 * genérico definido en el módulo common.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EventPaymentService {

    private final IEventRepository eventRepository;
    private final IEventRegistrationRepository registrationRepository;
    private final IBookingRepository bookingRepository;
    private final IUserRepository userRepository;
    private final EventRegistrationService registrationService;
    private final BookingService bookingService;
    private final PaymentGateway paymentGateway;

    @Value("${feeling.payments.currency:COP}")
    private String defaultCurrency;
    @Value("${feeling.payments.redirect-url:}")
    private String defaultRedirectUrl;

    @Transactional
    public PaymentResponseDTO createPaymentIntent(PaymentRequestDTO request, String userEmail) {
        EventRegistration registration = validateRegistrationContext(request, userEmail);
        Event event = registration.getEvent();

        Map<String, String> metadata = new HashMap<>();
        metadata.put("eventId", event.getId().toString());
        metadata.put("registrationId", registration.getId().toString());
        if (defaultRedirectUrl != null && !defaultRedirectUrl.isBlank()) {
            metadata.put("redirectUrl", defaultRedirectUrl);
        }

        PaymentIntentCommand command = new PaymentIntentCommand(
            event.getPrice(),
            defaultCurrency,
            "Pago de inscripción al evento " + event.getTitle(),
            metadata,
            null
        );

        PaymentIntentResponse response = paymentGateway.createPaymentIntent(command);
        if (response.paymentIntentId() == null || response.paymentIntentId().isBlank()) {
            throw new BadRequestException("El gateway de pago no generó una referencia válida");
        }
        registration.setStripePaymentIntentId(response.paymentIntentId());
        registrationRepository.save(registration);

        log.debug("Intento de pago {} asociado al registro {}", response.paymentIntentId(), registration.getId());

        Map<String, String> responseData = new HashMap<>(response.metadata());
        Optional.ofNullable(response.clientSecret()).ifPresent(signature -> responseData.putIfAbsent("signature", signature));

        return new PaymentResponseDTO(
            response.paymentIntentId(),
            registration.getId(),
            response.status(),
            response.message(),
            responseData
        );
    }

    @Transactional
    public PaymentResponseDTO confirmPayment(String paymentIntentId) {
        PaymentIntentResponse response = paymentGateway.confirmPayment(paymentIntentId);
        String paymentReference = Optional.ofNullable(response.metadata().get("reference"))
            .orElseGet(response::paymentIntentId);
        if (paymentReference == null || paymentReference.isBlank()) {
            throw new BadRequestException("No se pudo determinar la referencia del pago");
        }

        if (!isSuccessfulStatus(response.status())) {
            throw new BadRequestException("No fue posible confirmar el pago: " + response.message());
        }

        String transactionIdentifier = Optional.ofNullable(response.metadata().get("transactionId"))
            .orElse(paymentIntentId);

        // Intentar buscar primero en EventRegistration (sistema antiguo)
        Optional<EventRegistration> registrationOpt = registrationRepository.findByStripePaymentIntentId(paymentReference)
            .or(() -> extractRegistrationId(paymentReference).flatMap(registrationRepository::findById));

        if (registrationOpt.isPresent()) {
            EventRegistration registration = registrationOpt.get();
            registrationService.confirmPayment(registration.getId(), registration.getEvent().getPrice(), transactionIdentifier);
            log.info("Pago confirmado para EventRegistration {}", registration.getId());

            return new PaymentResponseDTO(
                paymentReference,
                registration.getId(),
                response.status(),
                response.message(),
                response.metadata()
            );
        }

        // Si no se encuentra en EventRegistration, buscar en Booking (sistema nuevo)
        Optional<Booking> bookingOpt = bookingRepository.findByPaymentIntentId(paymentReference);

        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            booking.setPaymentStatus("APPROVED");
            bookingRepository.save(booking);
            log.info("Pago confirmado para Booking {}", booking.getId());

            return new PaymentResponseDTO(
                paymentReference,
                booking.getId(),
                response.status(),
                response.message(),
                response.metadata()
            );
        }

        throw new NotFoundException("No se encontró ninguna reserva asociada a esta referencia de pago: " + paymentReference);
    }

    @Transactional
    public void handleGatewayWebhook(Map<String, Object> payload) {
        paymentGateway.handleWebhook(payload)
            .filter(notification -> isSuccessfulStatus(notification.status()))
            .ifPresent(this::handleSuccessfulNotification);
    }

    private void handleSuccessfulNotification(PaymentWebhookNotification notification) {
        log.debug("Procesando webhook para paymentIntent {}", notification.paymentIntentId());
        confirmPayment(notification.metadata().getOrDefault("transactionId", notification.paymentIntentId()));
    }

    private EventRegistration validateRegistrationContext(PaymentRequestDTO request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        Event event = eventRepository.findById(request.eventId())
            .orElseThrow(() -> new NotFoundException("Evento no encontrado"));

        if (!Boolean.TRUE.equals(event.getIsActive())) {
            throw new BadRequestException("El evento no está disponible");
        }
        if (event.isFull()) {
            throw new BadRequestException("El evento está lleno");
        }

        if (event.getPrice() == null || event.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("El evento no requiere pago.");
        }

        EventRegistration registration = registrationRepository.findByUserIdAndEventId(user.getId(), event.getId())
            .orElseGet(() -> createPendingRegistration(user, event));

        if (registration.isPaid()) {
            throw new BadRequestException("Ya has pagado por este evento");
        }

        return registration;
    }

    private EventRegistration createPendingRegistration(User user, Event event) {
        try {
            return registrationRepository.save(
                EventRegistration.builder()
                    .user(user)
                    .event(event)
                    .paymentStatus(PaymentStatus.PENDING)
                    .isConfirmed(false)
                    .build()
            );
        } catch (DataIntegrityViolationException exception) {
            log.debug("Concurrent registration detected for user {} and event {}", user.getId(), event.getId());
            return registrationRepository.findByUserIdAndEventId(user.getId(), event.getId())
                .orElseThrow(() -> exception);
        }
    }

    private boolean isSuccessfulStatus(String status) {
        return status != null && (
            "succeeded".equalsIgnoreCase(status) ||
                "approved".equalsIgnoreCase(status) ||
                "success".equalsIgnoreCase(status)
        );
    }

    private Optional<Long> extractRegistrationId(String paymentReference) {
        if (paymentReference == null || paymentReference.isBlank()) {
            return Optional.empty();
        }

        String[] parts = paymentReference.split("-");
        if (parts.length < 4) {
            return Optional.empty();
        }

        try {
            return Optional.of(Long.parseLong(parts[2]));
        } catch (NumberFormatException exception) {
            log.warn("Unable to extract registration id from reference {}", paymentReference, exception);
            return Optional.empty();
        }
    }
}
