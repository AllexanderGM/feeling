package com.feeling.packages.match.infrastructure.entities;

import com.feeling.packages.match.domain.enums.MatchPlanPurchaseStatus;
import com.feeling.packages.user.infrastructure.entities.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "match_plan_purchases", uniqueConstraints = @UniqueConstraint(columnNames = "payment_reference"))
public class MatchPlanPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_plan_id", nullable = false)
    private MatchPlan matchPlan;

    @Column(name = "payment_reference", nullable = false, length = 120)
    private String paymentReference;

    @Column(name = "amount_in_cents", nullable = false)
    private Long amountInCents;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MatchPlanPurchaseStatus status = MatchPlanPurchaseStatus.PENDING;

    @Column(name = "transaction_id", length = 120)
    private String transactionId;

    @Column(name = "payment_method", length = 60)
    private String paymentMethod;

    @Column(name = "gateway_status", length = 60)
    private String gatewayStatus;

    @Column(name = "environment", length = 20)
    private String environment;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_match_plan_id")
    private UserMatchPlan userMatchPlan;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    public boolean isPending() {
        return MatchPlanPurchaseStatus.PENDING.equals(status);
    }

    public boolean isApproved() {
        return MatchPlanPurchaseStatus.APPROVED.equals(status);
    }

    public void markPending(String gatewayStatus, String transactionId, String paymentMethod, String environment) {
        this.status = MatchPlanPurchaseStatus.PENDING;
        this.gatewayStatus = gatewayStatus;
        this.transactionId = transactionId;
        this.paymentMethod = paymentMethod;
        this.environment = environment;
    }

    public void markDeclined(String gatewayStatus, String transactionId, String paymentMethod, String environment) {
        this.status = MatchPlanPurchaseStatus.DECLINED;
        this.gatewayStatus = gatewayStatus;
        this.transactionId = transactionId;
        this.paymentMethod = paymentMethod;
        this.environment = environment;
        this.confirmedAt = LocalDateTime.now();
    }

    public void markError(String gatewayStatus, String transactionId, String paymentMethod, String environment) {
        this.status = MatchPlanPurchaseStatus.ERROR;
        this.gatewayStatus = gatewayStatus;
        this.transactionId = transactionId;
        this.paymentMethod = paymentMethod;
        this.environment = environment;
        this.confirmedAt = LocalDateTime.now();
    }

    public void markApproved(String gatewayStatus, String transactionId, String paymentMethod, String environment, UserMatchPlan userMatchPlan) {
        this.status = MatchPlanPurchaseStatus.APPROVED;
        this.gatewayStatus = gatewayStatus;
        this.transactionId = transactionId;
        this.paymentMethod = paymentMethod;
        this.environment = environment;
        this.userMatchPlan = userMatchPlan;
        this.confirmedAt = LocalDateTime.now();
    }
}

