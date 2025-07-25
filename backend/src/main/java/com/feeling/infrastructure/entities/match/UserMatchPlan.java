package com.feeling.infrastructure.entities.match;

import com.feeling.infrastructure.entities.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_match_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserMatchPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_plan_id", nullable = false)
    private MatchPlan matchPlan;

    @Column(nullable = false)
    private Integer remainingAttempts;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column
    private LocalDateTime purchaseDate;

    @Column
    private LocalDateTime expirationDate;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public UserMatchPlan(User user, MatchPlan matchPlan, Integer remainingAttempts) {
        this.user = user;
        this.matchPlan = matchPlan;
        this.remainingAttempts = remainingAttempts;
        this.isActive = true;
        this.purchaseDate = LocalDateTime.now();
    }

    public void useAttempt() {
        if (this.remainingAttempts > 0) {
            this.remainingAttempts--;
        }
        if (this.remainingAttempts == 0) {
            this.isActive = false;
        }
    }

    public boolean hasAttemptsLeft() {
        return this.remainingAttempts > 0 && this.isActive;
    }
}