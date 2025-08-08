package com.feeling.application.controllers.event;

import com.feeling.domain.dto.event.PaymentRequestDTO;
import com.feeling.domain.dto.event.PaymentResponseDTO;
import com.feeling.domain.services.event.PaymentServiceBasic;
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
    
    private final PaymentServiceBasic paymentService;

    @PostMapping("/create-payment-intent")
    @Operation(summary = "Create payment intent", description = "Create a Stripe payment intent for event registration")
    public ResponseEntity<PaymentResponseDTO> createPaymentIntent(
            @Valid @RequestBody PaymentRequestDTO request,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        PaymentResponseDTO response = paymentService.createPaymentIntent(request, userEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirm/{paymentIntentId}")
    @Operation(summary = "Confirm payment", description = "Confirm a payment intent")
    public ResponseEntity<PaymentResponseDTO> confirmPayment(
            @Parameter(description = "Payment Intent ID") @PathVariable String paymentIntentId) {
        
        PaymentResponseDTO response = paymentService.confirmPayment(paymentIntentId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    @Operation(summary = "Stripe webhook", description = "Handle Stripe webhook events")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody Map<String, Object> payload) {
        try {
            paymentService.handleStripeWebhook(payload);
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing webhook: " + e.getMessage());
        }
    }
}