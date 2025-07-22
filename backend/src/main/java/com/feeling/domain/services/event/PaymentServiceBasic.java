package com.feeling.domain.services.event;

import com.feeling.domain.dto.event.PaymentRequestDTO;
import com.feeling.domain.dto.event.PaymentResponseDTO;
import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.infrastructure.entities.event.Event;
import com.feeling.infrastructure.entities.event.EventRegistration;
import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.repositories.event.IEventRegistrationRepository;
import com.feeling.infrastructure.repositories.event.IEventRepository;
import com.feeling.infrastructure.repositories.user.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentServiceBasic {
    
    private final IEventRepository eventRepository;
    private final IEventRegistrationRepository registrationRepository;
    private final IUserRepository userRepository;
    private final EventRegistrationService registrationService;
    
    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    public PaymentResponseDTO createPaymentIntent(PaymentRequestDTO request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new NotFoundException("Evento no encontrado"));

        // Validate event is still available
        if (!event.getIsActive()) {
            throw new BadRequestException("El evento no está disponible");
        }

        if (event.isFull()) {
            throw new BadRequestException("El evento está lleno");
        }

        // Check if user has a registration for this event
        EventRegistration registration = registrationRepository.findByUserIdAndEventId(user.getId(), event.getId())
                .orElseThrow(() -> new NotFoundException("No tienes un registro para este evento"));

        if (registration.isPaid()) {
            throw new BadRequestException("Ya has pagado por este evento");
        }

        // For MVP, we'll simulate a successful payment creation
        // In production, integrate with actual Stripe SDK
        String simulatedPaymentIntentId = "pi_simulation_" + System.currentTimeMillis();
        String simulatedClientSecret = simulatedPaymentIntentId + "_secret_simulation";

        // Update registration with simulated payment intent ID
        registration.setStripePaymentIntentId(simulatedPaymentIntentId);
        registrationRepository.save(registration);

        return new PaymentResponseDTO(
                simulatedClientSecret,
                simulatedPaymentIntentId,
                "requires_payment_method",
                registration.getId(),
                "Payment intent created successfully (SIMULATION MODE)"
        );
    }

    public PaymentResponseDTO confirmPayment(String paymentIntentId) {
        // Find registration by payment intent ID
        EventRegistration registration = registrationRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new NotFoundException("Registro no encontrado para este pago"));

        // For MVP simulation - automatically confirm payment
        if (paymentIntentId.startsWith("pi_simulation_")) {
            // Simulate successful payment
            BigDecimal amount = registration.getEvent().getPrice();
            registrationService.confirmPayment(registration.getId(), amount, paymentIntentId);

            return new PaymentResponseDTO(
                    null,
                    paymentIntentId,
                    "succeeded",
                    registration.getId(),
                    "Pago confirmado exitosamente (SIMULATION MODE)"
            );
        }

        // For real Stripe integration, this would use actual Stripe API
        throw new BadRequestException("Integración con Stripe no configurada para este payment intent");
    }

    public void handleStripeWebhook(Map<String, Object> payload) {
        // Webhook handling for future Stripe integration
        String eventType = (String) payload.get("type");
        
        if ("payment_intent.succeeded".equals(eventType)) {
            // Handle successful payment webhook
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) payload.get("data");
                @SuppressWarnings("unchecked")
                Map<String, Object> paymentIntentData = (Map<String, Object>) data.get("object");
                String paymentIntentId = (String) paymentIntentData.get("id");
                
                confirmPayment(paymentIntentId);
            } catch (Exception e) {
                // Log error but don't throw - webhook should not fail
                System.err.println("Error processing webhook: " + e.getMessage());
            }
        }
    }
}