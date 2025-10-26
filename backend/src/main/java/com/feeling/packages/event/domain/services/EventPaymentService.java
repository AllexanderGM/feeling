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
    private final IUserRepository userRepository;
    private final EventRegistrationService registrationService;
    private final PaymentGateway paymentGateway;

    @Value("${feeling.payments.currency:USD}")
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

        EventRegistration registration = registrationRepository.findByStripePaymentIntentId(paymentReference)
            .orElseThrow(() -> new NotFoundException("Registro no encontrado para esta referencia de pago"));

        if (!isSuccessfulStatus(response.status())) {
            registrationService.markPaymentFailed(registration.getId());
            throw new BadRequestException("No fue posible confirmar el pago: " + response.message());
        }

        String transactionIdentifier = Optional.ofNullable(response.metadata().get("transactionId"))
            .orElse(paymentIntentId);

        registrationService.confirmPayment(registration.getId(), registration.getEvent().getPrice(), transactionIdentifier);
        log.info("Pago confirmado para el registro {}", registration.getId());

        return new PaymentResponseDTO(
            paymentReference,
            registration.getId(),
            response.status(),
            response.message(),
            response.metadata()
        );
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
            .orElse(null);

        if (registration != null && registration.isPaid()) {
            throw new BadRequestException("Ya has pagado por este evento");
        }

        if (registration == null) {
            registration = EventRegistration.builder()
                .user(user)
                .event(event)
                .paymentStatus(PaymentStatus.PENDING)
                .isConfirmed(false)
                .build();
            registration = registrationRepository.save(registration);
        }

        return registration;
    }

    private boolean isSuccessfulStatus(String status) {
        return status != null && (
            "succeeded".equalsIgnoreCase(status) ||
                "approved".equalsIgnoreCase(status) ||
                "success".equalsIgnoreCase(status)
        );
    }
}
