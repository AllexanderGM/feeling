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
@Table(name = "matches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiator_user_id", nullable = false)
    private User initiatorUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id", nullable = false)
    private User targetUser;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status = MatchStatus.PENDING;

    @Column
    private LocalDateTime respondedAt;

    @Column
    private LocalDateTime viewedAt;

    @Column(nullable = false)
    private Boolean contactUnlocked = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Match(User initiatorUser, User targetUser) {
        this.initiatorUser = initiatorUser;
        this.targetUser = targetUser;
        this.status = MatchStatus.PENDING;
        this.contactUnlocked = false;
    }

    public void accept() {
        this.status = MatchStatus.ACCEPTED;
        this.respondedAt = LocalDateTime.now();
        this.contactUnlocked = true;
    }

    public void reject() {
        this.status = MatchStatus.REJECTED;
        this.respondedAt = LocalDateTime.now();
    }

    public void markAsViewed() {
        if (this.viewedAt == null) {
            this.viewedAt = LocalDateTime.now();
        }
    }

    public boolean isPending() {
        return this.status == MatchStatus.PENDING;
    }

    public boolean isAccepted() {
        return this.status == MatchStatus.ACCEPTED;
    }

    public boolean isRejected() {
        return this.status == MatchStatus.REJECTED;
    }

    public enum MatchStatus {
        PENDING,
        ACCEPTED,
        REJECTED
    }
}