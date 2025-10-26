package com.feeling.packages.common.domain.services.payment;

import com.feeling.packages.common.domain.dto.payment.PaymentIntentCommand;
import com.feeling.packages.common.domain.dto.payment.PaymentIntentResponse;
import com.feeling.packages.common.domain.dto.payment.PaymentWebhookNotification;
import com.feeling.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Gateway real basado en Stripe (actualmente en modo stub hasta integrar SDK).
 */
@Service
@ConditionalOnProperty(value = "feeling.payments.gateway", havingValue = "stripe")
@Slf4j
public class StripePaymentGateway implements PaymentGateway {

    private final Clock clock = Clock.systemUTC();

    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    @Override
    public PaymentIntentResponse createPaymentIntent(PaymentIntentCommand command) {
        ensureStripeConfigured();

        String paymentIntentId = "pi_live_" + Instant.now(clock).toEpochMilli();
        String clientSecret = paymentIntentId + "_secret_live";

        log.info("Stripe intent {} created", paymentIntentId);

        Map<String, String> metadata = new HashMap<>(command.metadata());
        metadata.put("integration", "STRIPE");
        metadata.putIfAbsent("currency", command.currency());

        return new PaymentIntentResponse(
            clientSecret,
            paymentIntentId,
            "requires_payment_method",
            "Payment intent created successfully (STRIPE MODE)",
            metadata
        );
    }

    @Override
    public PaymentIntentResponse confirmPayment(String paymentIntentId) {
        ensureStripeConfigured();

        log.info("Stripe intent {} confirmed", paymentIntentId);

        Map<String, String> metadata = new HashMap<>();
        metadata.put("integration", "STRIPE");

        return new PaymentIntentResponse(
            null,
            paymentIntentId,
            "succeeded",
            "Pago confirmado exitosamente (STRIPE MODE)",
            metadata
        );
    }

    @Override
    public Optional<PaymentWebhookNotification> handleWebhook(Map<String, Object> payload) {
        ensureStripeConfigured();

        if (payload == null) {
            return Optional.empty();
        }
        Object type = payload.get("type");
        if (!"payment_intent.succeeded".equals(type)) {
            return Optional.empty();
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            @SuppressWarnings("unchecked")
            Map<String, Object> paymentIntentData = (Map<String, Object>) data.get("object");
            String paymentIntentId = (String) paymentIntentData.get("id");

            return Optional.of(new PaymentWebhookNotification(paymentIntentId, "succeeded", Map.of()));
        } catch (Exception exception) {
            log.error("Error processing Stripe webhook", exception);
            return Optional.empty();
        }
    }

    private void ensureStripeConfigured() {
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            throw new BadRequestException("Stripe secret key is not configured");
        }
    }
}
