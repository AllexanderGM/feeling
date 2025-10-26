package com.feeling.packages.event.application;

import com.feeling.packages.event.domain.dto.PaymentRequestDTO;
import com.feeling.packages.event.domain.dto.PaymentResponseDTO;
import com.feeling.packages.event.domain.services.EventPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment processing endpoints")
public class PaymentController {
    
    private final EventPaymentService paymentService;

    @PostMapping("/create-payment-intent")
    @Operation(summary = "Create payment intent", description = "Inicializa el proceso de pago para una inscripción de evento")
    public ResponseEntity<PaymentResponseDTO> createPaymentIntent(
            @Valid @RequestBody PaymentRequestDTO request,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        PaymentResponseDTO response = paymentService.createPaymentIntent(request, userEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirm/{transactionId}")
    @Operation(summary = "Confirm payment", description = "Confirma el estado de una transacción reportada por el gateway de pagos")
    public ResponseEntity<PaymentResponseDTO> confirmPayment(
            @Parameter(description = "Transaction ID reported by gateway") @PathVariable String transactionId) {
        
        PaymentResponseDTO response = paymentService.confirmPayment(transactionId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    @Operation(summary = "Payment webhook", description = "Endpoint para recibir notificaciones de Wompi u otros gateways configurados")
    public ResponseEntity<String> handlePaymentWebhook(@RequestBody Map<String, Object> payload) {
        try {
            paymentService.handleGatewayWebhook(payload);
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing webhook: " + e.getMessage());
        }
    }
}
