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
import com.feeling.packages.event.infrastructure.repositories.IEventRegistrationRepository;
import com.feeling.packages.event.infrastructure.repositories.IEventRepository;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

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

    @Transactional
    public PaymentResponseDTO createPaymentIntent(PaymentRequestDTO request, String userEmail) {
        EventRegistration registration = validateRegistrationContext(request, userEmail);
        Event event = registration.getEvent();

        PaymentIntentCommand command = new PaymentIntentCommand(
            event.getPrice(),
            defaultCurrency,
            "Pago de inscripción al evento " + event.getTitle(),
            Map.of(
                "eventId", event.getId().toString(),
                "registrationId", registration.getId().toString()
            ),
            request.paymentMethodId()
        );

        PaymentIntentResponse response = paymentGateway.createPaymentIntent(command);
        registration.setStripePaymentIntentId(response.paymentIntentId());
        registrationRepository.save(registration);

        log.debug("Intento de pago {} asociado al registro {}", response.paymentIntentId(), registration.getId());

        return new PaymentResponseDTO(
            response.clientSecret(),
            response.paymentIntentId(),
            response.status(),
            registration.getId(),
            response.message()
        );
    }

    @Transactional
    public PaymentResponseDTO confirmPayment(String paymentIntentId) {
        EventRegistration registration = registrationRepository.findByStripePaymentIntentId(paymentIntentId)
            .orElseThrow(() -> new NotFoundException("Registro no encontrado para este pago"));

        PaymentIntentResponse response = paymentGateway.confirmPayment(paymentIntentId);

        if (!"succeeded".equalsIgnoreCase(response.status())) {
            throw new BadRequestException("No fue posible confirmar el pago: " + response.message());
        }

        registrationService.confirmPayment(registration.getId(), registration.getEvent().getPrice(), paymentIntentId);
        log.info("Pago confirmado para el registro {}", registration.getId());

        return new PaymentResponseDTO(
            response.clientSecret(),
            response.paymentIntentId(),
            response.status(),
            registration.getId(),
            response.message()
        );
    }

    @Transactional
    public void handleStripeWebhook(Map<String, Object> payload) {
        paymentGateway.handleWebhook(payload)
            .filter(notification -> "succeeded".equalsIgnoreCase(notification.status()))
            .ifPresent(this::handleSuccessfulNotification);
    }

    private void handleSuccessfulNotification(PaymentWebhookNotification notification) {
        log.debug("Procesando webhook para paymentIntent {}", notification.paymentIntentId());
        confirmPayment(notification.paymentIntentId());
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

        EventRegistration registration = registrationRepository.findByUserIdAndEventId(user.getId(), event.getId())
            .orElseThrow(() -> new NotFoundException("No tienes un registro para este evento"));

        if (registration.isPaid()) {
            throw new BadRequestException("Ya has pagado por este evento");
        }

        return registration;
    }
}
