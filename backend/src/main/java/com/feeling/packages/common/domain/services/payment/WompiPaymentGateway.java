package com.feeling.packages.common.domain.services.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.feeling.exception.BadRequestException;
import com.feeling.packages.common.domain.dto.payment.PaymentIntentCommand;
import com.feeling.packages.common.domain.dto.payment.PaymentIntentResponse;
import com.feeling.packages.common.domain.dto.payment.PaymentWebhookNotification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Implementación del gateway de pagos para Wompi.
 *
 * Gestiona la generación de la firma de integridad y la consulta
 * del estado de transacciones contra la API de Wompi.
 */
@Service
@ConditionalOnProperty(value = "feeling.payments.gateway", havingValue = "wompi")
@Slf4j
public class WompiPaymentGateway implements PaymentGateway {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final Clock clock = Clock.systemUTC();

    @Value("${wompi.public-key:}")
    private String publicKey;
    @Value("${wompi.private-key:}")
    private String privateKey;
    @Value("${wompi.integrity-secret:}")
    private String integritySecret;
    @Value("${wompi.api-base:https://sandbox.wompi.co/v1}")
    private String apiBase;
    @Value("${wompi.redirect-url:}")
    private String redirectUrl;

    public WompiPaymentGateway(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public PaymentIntentResponse createPaymentIntent(PaymentIntentCommand command) {
        ensureConfigured();

        long amountInCents = command.amount()
            .multiply(BigDecimal.valueOf(100))
            .setScale(0, RoundingMode.HALF_UP)
            .longValueExact();

        long timestamp = Instant.now(clock).toEpochMilli();
        String reference = Optional.ofNullable(command.metadata().get("reference"))
            .filter(ref -> !ref.isBlank())
            .orElseGet(() -> {
                String eventId = command.metadata().getOrDefault("eventId", "EVT");
                String registrationId = command.metadata().getOrDefault("registrationId", "REG");

                return "EVT-" + eventId + "-" + registrationId + "-" + timestamp;
            });

        String signature = generateIntegritySignature(reference, amountInCents, command.currency());
        log.debug(
            "Wompi integrity signature generated reference={} amountInCents={} currency={} signaturePreview={}",
            reference,
            amountInCents,
            command.currency(),
            signature != null ? signature.substring(0, Math.min(signature.length(), 12)) : "null"
        );

        Map<String, String> responseMetadata = new HashMap<>(command.metadata());
        responseMetadata.put("publicKey", publicKey);
        responseMetadata.put("reference", reference);
        responseMetadata.put("amountInCents", Long.toString(amountInCents));
        responseMetadata.put("currency", command.currency());
        responseMetadata.put("integration", "WOMPI");
        String entityType = responseMetadata.getOrDefault("entityType", "");
        if (!responseMetadata.containsKey("redirectUrl")
            && redirectUrl != null && !redirectUrl.isBlank()
            && !"MATCH".equalsIgnoreCase(entityType)) {
            responseMetadata.put("redirectUrl", redirectUrl);
        }

        return new PaymentIntentResponse(
            signature,
            reference,
            "PENDING",
            "READY_FOR_WOMPI_CHECKOUT",
            responseMetadata
        );
    }

    @Override
    public PaymentIntentResponse confirmPayment(String transactionId) {
        ensureConfigured();

        try {
            String url = apiBase + "/transactions/" + transactionId;
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + privateKey);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode data = root.path("data");

            String status = data.path("status").asText();
            String reference = data.path("reference").asText();
            long amountInCents = data.path("amount_in_cents").asLong();
            String currency = data.path("currency").asText();
            String paymentMethodType = Optional.ofNullable(data.path("payment_method_type").asText(null)).orElse("");
            String environment = root.path("environment").asText(null);

            Map<String, String> metadata = new HashMap<>();
            metadata.put("transactionId", transactionId);
            metadata.put("reference", reference);
            metadata.put("status", status);
            metadata.put("integration", "WOMPI");
            metadata.put("amountInCents", Long.toString(amountInCents));
            metadata.put("currency", currency);
            if (paymentMethodType != null && !paymentMethodType.isBlank()) {
                metadata.put("paymentMethod", paymentMethodType);
            }
            if (environment != null && !environment.isBlank()) {
                metadata.put("environment", environment);
            }

            return new PaymentIntentResponse(
                null,
                reference,
                status,
                "Wompi transaction status retrieved",
                metadata
            );
        } catch (Exception exception) {
            log.error("Error consultando transacción {} en Wompi", transactionId, exception);
            throw new BadRequestException("No fue posible verificar la transacción en Wompi");
        }
    }

    @Override
    public Optional<PaymentWebhookNotification> handleWebhook(Map<String, Object> payload) {
        ensureConfigured();

        if (payload == null) {
            return Optional.empty();
        }

        Object event = payload.get("event");
        if (!"transaction.updated".equals(event)) {
            return Optional.empty();
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            if (data == null) {
                return Optional.empty();
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> transaction = (Map<String, Object>) data.get("transaction");
            if (transaction == null) {
                return Optional.empty();
            }

            String status = Optional.ofNullable(transaction.get("status")).map(Object::toString).orElse("");
            String reference = Optional.ofNullable(transaction.get("reference")).map(Object::toString).orElse("");
            String wompiTransactionId = Optional.ofNullable(transaction.get("id")).map(Object::toString).orElse("");

            if (reference.isBlank()) {
                return Optional.empty();
            }

            Map<String, String> metadata = new HashMap<>();
            metadata.put("transactionId", wompiTransactionId);
            metadata.put("status", status);
            metadata.put("integration", "WOMPI");

            return Optional.of(new PaymentWebhookNotification(reference, status, metadata));
        } catch (Exception exception) {
            log.error("Error procesando webhook de Wompi", exception);
            return Optional.empty();
        }
    }

    private void ensureConfigured() {
        if (publicKey == null || publicKey.isBlank()
            || privateKey == null || privateKey.isBlank()
            || integritySecret == null || integritySecret.isBlank()) {
            throw new BadRequestException("Las credenciales de Wompi no están configuradas correctamente");
        }
    }

    private String generateIntegritySignature(String reference, long amountInCents, String currency) {
        String payload = reference + amountInCents + currency + integritySecret;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 algorithm not available", exception);
        }
    }
}
