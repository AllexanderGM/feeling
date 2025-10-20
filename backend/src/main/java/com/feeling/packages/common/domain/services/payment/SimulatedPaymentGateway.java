package com.feeling.packages.common.domain.services.payment;

import com.feeling.packages.common.domain.dto.payment.PaymentIntentCommand;
import com.feeling.packages.common.domain.dto.payment.PaymentIntentResponse;
import com.feeling.packages.common.domain.dto.payment.PaymentWebhookNotification;
import com.feeling.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

/**
 * Gateway simulado para entornos de desarrollo.
 */
@Service
@ConditionalOnProperty(value = "feeling.payments.gateway", havingValue = "simulation", matchIfMissing = true)
@Slf4j
public class SimulatedPaymentGateway implements PaymentGateway {

    private final Clock clock = Clock.systemUTC();

    @Override
    public PaymentIntentResponse createPaymentIntent(PaymentIntentCommand command) {
        String paymentIntentId = "pi_simulation_" + Instant.now(clock).toEpochMilli();
        String clientSecret = paymentIntentId + "_secret_simulation";

        log.debug("Simulated intent {} created", paymentIntentId);

        return new PaymentIntentResponse(
            clientSecret,
            paymentIntentId,
            "requires_payment_method",
            "Payment intent created successfully (SIMULATION MODE)",
            command.metadata()
        );
    }

    @Override
    public PaymentIntentResponse confirmPayment(String paymentIntentId) {
        if (!paymentIntentId.startsWith("pi_simulation_")) {
            throw new BadRequestException("Integración simulada incompatible con el payment intent proporcionado");
        }

        log.info("Simulated payment intent {} confirmed", paymentIntentId);

        return new PaymentIntentResponse(
            null,
            paymentIntentId,
            "succeeded",
            "Pago confirmado exitosamente (SIMULATION MODE)",
            Map.of()
        );
    }

    @Override
    public Optional<PaymentWebhookNotification> handleWebhook(Map<String, Object> payload) {
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
            log.error("Error interpreting simulated webhook payload", exception);
            return Optional.empty();
        }
    }
}
