package com.feeling.infrastructure.entities.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_metrics")
public class UserMetrics {
    
    @Id
    private Long userId; // Mismo ID que User para relación 1:1
    
    // ========================================
    // MÉTRICAS SOCIALES Y GAMIFICACIÓN
    // ========================================
    
    @Column(name = "profile_views")
    @Builder.Default
    @Min(0)
    private Long profileViews = 0L;
    
    @Column(name = "likes_received")
    @Builder.Default
    @Min(0)
    private Long likesReceived = 0L;
    
    @Column(name = "likes_given")
    @Builder.Default
    @Min(0)
    private Long likesGiven = 0L;
    
    @Column(name = "matches_count")
    @Builder.Default
    @Min(0)
    private Long matchesCount = 0L;
    
    @Column(name = "conversations_started")
    @Builder.Default
    @Min(0)
    private Long conversationsStarted = 0L;
    
    @Column(name = "messages_sent")
    @Builder.Default
    @Min(0)
    private Long messagesSent = 0L;
    
    @Column(name = "popularity_score")
    @Builder.Default
    @DecimalMin("0.0")
    private Double popularityScore = 0.0;
    
    @Column(name = "activity_score")
    @Builder.Default
    @DecimalMin("0.0")
    private Double activityScore = 0.0;
    
    // ========================================
    // SISTEMA DE INTENTOS/PINES
    // ========================================
    
    @Column(name = "available_attempts")
    @Builder.Default
    @Min(0)
    private Integer availableAttempts = 0;
    
    @Column(name = "total_attempts_purchased")
    @Builder.Default
    @Min(0)
    private Integer totalAttemptsPurchased = 0;
    
    @Column(name = "attempts_used_today")
    @Builder.Default
    @Min(0)
    private Integer attemptsUsedToday = 0;
    
    @Column(name = "attempts_expiry_date")
    private LocalDateTime attemptsExpiryDate;
    
    @Column(name = "last_attempt_reset")
    private LocalDateTime lastAttemptReset;
    
    // ========================================
    // MÉTRICAS DE ACTIVIDAD
    // ========================================
    
    @Column(name = "days_active")
    @Builder.Default
    @Min(0)
    private Integer daysActive = 0;
    
    @Column(name = "login_streak")
    @Builder.Default
    @Min(0)
    private Integer loginStreak = 0;
    
    @Column(name = "last_login_date")
    private LocalDateTime lastLoginDate;
    
    @Column(name = "total_session_time_minutes")
    @Builder.Default
    @Min(0)
    private Long totalSessionTimeMinutes = 0L;
    
    // ========================================
    // MÉTRICAS DE CALIDAD
    // ========================================
    
    @Column(name = "profile_completion_percentage")
    @Builder.Default
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private Double profileCompletionPercentage = 0.0;
    
    @Column(name = "response_rate")
    @Builder.Default
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private Double responseRate = 0.0;
    
    @Column(name = "average_response_time_hours")
    @Builder.Default
    @DecimalMin("0.0")
    private Double averageResponseTimeHours = 0.0;
    
    // ========================================
    // CAMPOS DE AUDITORIA
    // ========================================
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // ========================================
    // RELACIÓN CON USER
    // ========================================
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
    
    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================
    
    public boolean hasActiveAttempts() {
        return availableAttempts != null && availableAttempts > 0 &&
                (attemptsExpiryDate == null || attemptsExpiryDate.isAfter(LocalDateTime.now()));
    }
    
    public double getEngagementScore() {
        if (profileViews == 0) return 0.0;
        return ((double) likesReceived / profileViews) * 100;
    }
    
    public double getSuccessRate() {
        if (likesGiven == 0) return 0.0;
        return ((double) matchesCount / likesGiven) * 100;
    }
    
    // ========================================
    // MÉTODOS DE ACTUALIZACIÓN DE MÉTRICAS
    // ========================================
    
    public void incrementProfileViews() {
        this.profileViews++;
        updatePopularityScore();
    }
    
    public void incrementLikesReceived() {
        this.likesReceived++;
        updatePopularityScore();
    }
    
    public void incrementLikesGiven() {
        this.likesGiven++;
        updateActivityScore();
    }
    
    public void incrementMatches() {
        this.matchesCount++;
        updatePopularityScore();
        updateActivityScore();
    }
    
    public void incrementMessages() {
        this.messagesSent++;
        updateActivityScore();
    }
    
    public void useAttempt() {
        if (hasActiveAttempts()) {
            this.availableAttempts--;
            this.attemptsUsedToday++;
        }
    }
    
    public void addAttempts(Integer attempts) {
        if (this.availableAttempts == null) {
            this.availableAttempts = 0;
        }
        this.availableAttempts += attempts;
        
        if (this.totalAttemptsPurchased == null) {
            this.totalAttemptsPurchased = 0;
        }
        this.totalAttemptsPurchased += attempts;
        
        // Establecer fecha de expiración (1 año desde la compra)
        if (this.attemptsExpiryDate == null) {
            this.attemptsExpiryDate = LocalDateTime.now().plusYears(1);
        }
    }
    
    public void resetDailyAttempts() {
        this.attemptsUsedToday = 0;
        this.lastAttemptReset = LocalDateTime.now();
    }
    
    private void updatePopularityScore() {
        // Algoritmo de popularidad basado en métricas
        double viewsWeight = 0.2;
        double likesWeight = 0.4;
        double matchesWeight = 0.3;
        double engagementWeight = 0.1;
        
        double engagement = getEngagementScore();
        
        this.popularityScore = (profileViews * viewsWeight) +
                (likesReceived * likesWeight) +
                (matchesCount * matchesWeight) +
                (engagement * engagementWeight);
    }
    
    private void updateActivityScore() {
        // Algoritmo de actividad basado en acciones del usuario
        double likesWeight = 0.3;
        double messagesWeight = 0.4;
        double matchesWeight = 0.2;
        double streakWeight = 0.1;
        
        this.activityScore = (likesGiven * likesWeight) +
                (messagesSent * messagesWeight) +
                (matchesCount * matchesWeight) +
                (loginStreak * streakWeight);
    }
    
    // ========================================
    // MÉTODOS DE ACTUALIZACIÓN
    // ========================================
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }
}