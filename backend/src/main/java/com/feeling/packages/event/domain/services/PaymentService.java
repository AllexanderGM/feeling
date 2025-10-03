package com.feeling.packages.event.domain.services;

import com.feeling.exception.BadRequestException;
import com.feeling.packages.event.domain.dto.PaymentRequestDTO;
import com.feeling.packages.event.domain.dto.PaymentResponseDTO;
import com.feeling.packages.event.infrastructure.repositories.IEventRegistrationRepository;
import com.feeling.packages.event.infrastructure.repositories.IEventRepository;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final IEventRepository eventRepository;
    private final IEventRegistrationRepository registrationRepository;
    private final IUserRepository userRepository;
    private final EventRegistrationService registrationService;

    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        // Stripe initialization commented out for MVP
        // if (stripeSecretKey != null && !stripeSecretKey.isEmpty()) {
        //     Stripe.apiKey = stripeSecretKey;
        // }
    }

    public PaymentResponseDTO createPaymentIntent(PaymentRequestDTO request, String userEmail) {
        // This method is temporarily disabled for MVP
        // Use PaymentServiceBasic instead for simulation mode
        throw new BadRequestException("Stripe integration temporarily disabled. Use PaymentServiceBasic for simulation mode.");
    }

    public PaymentResponseDTO confirmPayment(String paymentIntentId) {
        // This method is temporarily disabled for MVP
        // Use PaymentServiceBasic instead for simulation mode
        throw new BadRequestException("Stripe integration temporarily disabled. Use PaymentServiceBasic for simulation mode.");
    }

    public void handleStripeWebhook(Map<String, Object> payload) {
        // This method would handle Stripe webhooks for payment confirmations
        // Implementation would depend on your webhook setup
        String eventType = (String) payload.get("type");

        if ("payment_intent.succeeded".equals(eventType)) {
            Map<String, Object> paymentIntentData = (Map<String, Object>) ((Map<String, Object>) payload.get("data")).get("object");
            String paymentIntentId = (String) paymentIntentData.get("id");

            try {
                confirmPayment(paymentIntentId);
            } catch (Exception e) {
                // Log error but don't throw - webhook should not fail
                System.err.println("Error processing webhook for payment intent " + paymentIntentId + ": " + e.getMessage());
            }
        }
    }
}