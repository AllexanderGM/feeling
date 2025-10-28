package com.feeling.packages.match.infrastructure.repositories;

import com.feeling.packages.match.infrastructure.entities.MatchPlanPurchase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IMatchPlanPurchaseRepository extends JpaRepository<MatchPlanPurchase, Long> {
    Optional<MatchPlanPurchase> findByPaymentReference(String paymentReference);
    Optional<MatchPlanPurchase> findByTransactionId(String transactionId);
}

