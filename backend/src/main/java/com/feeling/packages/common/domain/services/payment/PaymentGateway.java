package com.feeling.packages.common.domain.services.payment;

import com.feeling.packages.common.domain.dto.payment.PaymentIntentCommand;
import com.feeling.packages.common.domain.dto.payment.PaymentIntentResponse;
import com.feeling.packages.common.domain.dto.payment.PaymentWebhookNotification;

import java.util.Map;
import java.util.Optional;

/**
 * Contrato genérico para gateways de pago.
 */
public interface PaymentGateway {

    /**
     * Crea un nuevo intento de pago en el gateway seleccionado.
     *
     * @param command información necesaria para el intento
     * @return datos del intento generado
     */
    PaymentIntentResponse createPaymentIntent(PaymentIntentCommand command);

    /**
     * Confirma el intento de pago identificado.
     *
     * @param paymentIntentId identificador del intento
     * @return datos del pago tras la confirmación
     */
    PaymentIntentResponse confirmPayment(String paymentIntentId);

    /**
     * Procesa una notificación recibida desde el gateway.
     *
     * @param payload datos crudos del webhook
     * @return notificación interpretada, si aplica
     */
    Optional<PaymentWebhookNotification> handleWebhook(Map<String, Object> payload);
}
