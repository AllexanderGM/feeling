package com.feeling.packages.match.domain.services;

import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.packages.common.domain.dto.payment.PaymentIntentCommand;
import com.feeling.packages.common.domain.dto.payment.PaymentIntentResponse;
import com.feeling.packages.common.domain.services.payment.PaymentGateway;
import com.feeling.packages.match.domain.dto.ConfirmMatchPlanPurchaseRequestDTO;
import com.feeling.packages.match.domain.dto.MatchPlanPaymentIntentRequestDTO;
import com.feeling.packages.match.domain.dto.MatchPlanPaymentIntentResponseDTO;
import com.feeling.packages.match.domain.dto.MatchPlanPurchaseResponseDTO;
import com.feeling.packages.match.domain.dto.MatchPlanResponseDTO;
import com.feeling.packages.match.domain.dto.UserMatchPlanResponseDTO;
import com.feeling.packages.match.domain.enums.MatchPlanPurchaseStatus;
import com.feeling.packages.match.infrastructure.entities.MatchPlan;
import com.feeling.packages.match.infrastructure.entities.MatchPlanPurchase;
import com.feeling.packages.match.infrastructure.entities.UserMatchPlan;
import com.feeling.packages.match.infrastructure.repositories.IMatchPlanPurchaseRepository;
import com.feeling.packages.match.infrastructure.repositories.IMatchPlanRepository;
import com.feeling.packages.match.infrastructure.repositories.IUserMatchPlanRepository;
import com.feeling.packages.user.infrastructure.entities.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchPlanPurchaseService {

    private static final String MATCH_ENTITY_TYPE = "MATCH";

    private final IMatchPlanRepository matchPlanRepository;
    private final IUserMatchPlanRepository userMatchPlanRepository;
    private final IMatchPlanPurchaseRepository matchPlanPurchaseRepository;
    private final PaymentGateway paymentGateway;

    @Value("${feeling.payments.currency:COP}")
    private String defaultCurrency;
    @Value("${feeling.payments.redirect-url:}")
    private String defaultRedirectUrl;

    @Transactional
    public MatchPlanPaymentIntentResponseDTO createPaymentIntent(User user, MatchPlanPaymentIntentRequestDTO request) {
        MatchPlan matchPlan = matchPlanRepository.findById(request.matchPlanId())
            .orElseThrow(() -> new NotFoundException("No se encontró el plan de matches con id: " + request.matchPlanId()));

        if (!Boolean.TRUE.equals(matchPlan.getIsActive())) {
            throw new BadRequestException("El plan de matches no está activo.");
        }

        BigDecimal price = Optional.ofNullable(matchPlan.getPrice())
            .orElseThrow(() -> new BadRequestException("El plan de matches no tiene un precio configurado."));

        if (price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("El plan de matches seleccionado no requiere pago.");
        }

        long amountInCents = price
            .multiply(BigDecimal.valueOf(100))
            .setScale(0, RoundingMode.HALF_UP)
            .longValueExact();

        String currency = isBlank(defaultCurrency) ? "COP" : defaultCurrency.toUpperCase();
        String reference = generateReference(matchPlan.getId(), user.getId());

        Map<String, String> metadata = new HashMap<>();
        metadata.put("reference", reference);
        metadata.put("entityType", MATCH_ENTITY_TYPE);
        metadata.put("planId", matchPlan.getId().toString());
        metadata.put("userId", user.getId().toString());
        // El flujo de matches controla el redirect desde el frontend para evitar redirecciones cruzadas con eventos.

        PaymentIntentCommand command = new PaymentIntentCommand(
            price,
            currency,
            "Compra del plan de matches " + matchPlan.getName(),
            metadata,
            null
        );

        PaymentIntentResponse paymentIntent = paymentGateway.createPaymentIntent(command);

        MatchPlanPurchase purchase = MatchPlanPurchase.builder()
            .user(user)
            .matchPlan(matchPlan)
            .paymentReference(reference)
            .amountInCents(amountInCents)
            .currency(currency)
            .build();
        matchPlanPurchaseRepository.save(purchase);

        String publicKey = paymentIntent.metadata().get("publicKey");
        String redirectUrl = Optional.ofNullable(paymentIntent.metadata().get("redirectUrl"))
            .orElseGet(() -> normalizeRedirectUrl(defaultRedirectUrl));
        Long gatewayAmount = Optional.ofNullable(paymentIntent.metadata().get("amountInCents"))
            .map(Long::valueOf)
            .orElse(amountInCents);

        return new MatchPlanPaymentIntentResponseDTO(
            reference,
            paymentIntent.clientSecret(),
            gatewayAmount,
            currency,
            publicKey,
            redirectUrl,
            toMatchPlanResponse(matchPlan)
        );
    }

    @Transactional
    public MatchPlanPurchaseResponseDTO confirmPurchase(User user, ConfirmMatchPlanPurchaseRequestDTO request) {
        MatchPlanPurchase purchase = matchPlanPurchaseRepository.findByPaymentReference(request.paymentReference())
            .orElseThrow(() -> new NotFoundException("No se encontró una compra asociada a la referencia proporcionada."));

        if (!purchase.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("No tienes permisos para confirmar esta compra.");
        }

        if (purchase.isApproved()) {
            log.debug("Match plan purchase {} already approved. Returning cached result.", purchase.getId());

            return buildResponse(purchase);
        }

        PaymentIntentResponse gatewayResponse = paymentGateway.confirmPayment(request.transactionId());
        String referenceFromGateway = Optional.ofNullable(gatewayResponse.metadata().get("reference"))
            .orElseGet(gatewayResponse::paymentIntentId);

        if (!purchase.getPaymentReference().equals(referenceFromGateway)) {
            purchase.markError(gatewayResponse.status(), request.transactionId(), gatewayResponse.metadata().get("paymentMethod"), gatewayResponse.metadata().get("environment"));
            matchPlanPurchaseRepository.save(purchase);
            throw new BadRequestException("La referencia reportada por el gateway no coincide con la compra registrada.");
        }

        long reportedAmountInCents = Optional.ofNullable(gatewayResponse.metadata().get("amountInCents"))
            .map(Long::valueOf)
            .orElse(0L);
        if (reportedAmountInCents != 0L && !reportedAmountEqualsPurchase(purchase, reportedAmountInCents)) {
            purchase.markError(gatewayResponse.status(), request.transactionId(), gatewayResponse.metadata().get("paymentMethod"), gatewayResponse.metadata().get("environment"));
            matchPlanPurchaseRepository.save(purchase);
            throw new BadRequestException("El monto reportado por Wompi no coincide con el plan seleccionado.");
        }

        String currencyFromGateway = Optional.ofNullable(gatewayResponse.metadata().get("currency")).orElse(purchase.getCurrency());
        if (!purchase.getCurrency().equalsIgnoreCase(currencyFromGateway)) {
            purchase.markError(gatewayResponse.status(), request.transactionId(), gatewayResponse.metadata().get("paymentMethod"), gatewayResponse.metadata().get("environment"));
            matchPlanPurchaseRepository.save(purchase);
            throw new BadRequestException("La moneda reportada por Wompi no coincide con la configurada para el plan.");
        }

        String gatewayStatus = Optional.ofNullable(gatewayResponse.status()).orElse("UNKNOWN").trim();
        String normalizedStatus = gatewayStatus.toUpperCase();
        String paymentMethod = gatewayResponse.metadata().get("paymentMethod");
        String environment = gatewayResponse.metadata().get("environment");

        if ("PENDING".equals(normalizedStatus)) {
            purchase.markPending(gatewayStatus, request.transactionId(), paymentMethod, environment);
            matchPlanPurchaseRepository.save(purchase);

            return buildResponse(purchase);
        }

        if (!"APPROVED".equals(normalizedStatus)) {
            purchase.markDeclined(gatewayStatus, request.transactionId(), paymentMethod, environment);
            matchPlanPurchaseRepository.save(purchase);
            throw new BadRequestException("La transacción no fue aprobada por el gateway de pagos.");
        }

        if (!purchase.isPending()) {
            log.warn("Match plan purchase {} in unexpected state {} when trying to approve.", purchase.getId(), purchase.getStatus());
        }

        UserMatchPlan userMatchPlan = new UserMatchPlan(
            user,
            purchase.getMatchPlan(),
            purchase.getMatchPlan().getAttempts()
        );
        userMatchPlan = userMatchPlanRepository.save(userMatchPlan);

        purchase.markApproved(gatewayStatus, request.transactionId(), paymentMethod, environment, userMatchPlan);
        matchPlanPurchaseRepository.save(purchase);

        return buildResponse(purchase);
    }

    private MatchPlanPurchaseResponseDTO buildResponse(MatchPlanPurchase purchase) {
        MatchPlanResponseDTO matchPlanResponse = toMatchPlanResponse(purchase.getMatchPlan());
        UserMatchPlanResponseDTO userMatchPlan = Optional.ofNullable(purchase.getUserMatchPlan())
            .map(this::toUserMatchPlanResponse)
            .orElse(null);

        return new MatchPlanPurchaseResponseDTO(
            purchase.getStatus(),
            purchase.getPaymentReference(),
            purchase.getTransactionId(),
            purchase.getGatewayStatus(),
            purchase.getPaymentMethod(),
            purchase.getEnvironment(),
            matchPlanResponse,
            userMatchPlan
        );
    }

    private MatchPlanResponseDTO toMatchPlanResponse(MatchPlan matchPlan) {
        return new MatchPlanResponseDTO(
            matchPlan.getId(),
            matchPlan.getName(),
            matchPlan.getDescription(),
            matchPlan.getAttempts(),
            matchPlan.getPrice(),
            matchPlan.getIsActive(),
            matchPlan.getSortOrder()
        );
    }

    private UserMatchPlanResponseDTO toUserMatchPlanResponse(UserMatchPlan userMatchPlan) {
        return new UserMatchPlanResponseDTO(
            userMatchPlan.getId(),
            toMatchPlanResponse(userMatchPlan.getMatchPlan()),
            userMatchPlan.getRemainingAttempts(),
            userMatchPlan.getIsActive(),
            userMatchPlan.getPurchaseDate(),
            userMatchPlan.getExpirationDate(),
            userMatchPlan.getCreatedAt()
        );
    }

    private boolean reportedAmountEqualsPurchase(MatchPlanPurchase purchase, long reportedAmountInCents) {
        return purchase.getAmountInCents() != null && purchase.getAmountInCents().longValue() == reportedAmountInCents;
    }

    private String normalizeRedirectUrl(String redirectUrl) {
        if (isBlank(redirectUrl)) {
            return null;
        }

        return redirectUrl.trim();
    }

    private String generateReference(Long planId, Long userId) {
        return "MATCH-" + planId + "-" + userId + "-" + Instant.now().toEpochMilli();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
