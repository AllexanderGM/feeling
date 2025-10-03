package com.feeling.packages.user.infrastructure.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entidad que almacena métricas y estadísticas de usuario para gamificación y análisis.
 * Mantiene una relación 1:1 con la entidad User.
 *
 * Incluye métricas para:
 * - Actividad social (visualizaciones, likes, matches)
 * - Sistema de intentos/pines
 * - Métricas de actividad (días activos, streak de login)
 * - Métricas de calidad (completitud del perfil, tasa de respuesta)
 * - Scores calculados (popularidad, actividad, engagement)
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_metrics")
public class UserMetrics {
    
    /**
     * Identificador único que coincide con el ID del usuario.
     * Mantiene la relación 1:1 con la entidad User.
     */
    @Id
    private Long userId;
    
    // ========================================
    // MÉTRICAS SOCIALES Y GAMIFICACIÓN
    // ========================================
    
    /**
     * Número total de visualizaciones que ha recibido el perfil del usuario.
     */
    @Column(name = "profile_views")
    @Builder.Default
    @Min(0)
    private Long profileViews = 0L;
    
    /**
     * Número total de likes que ha recibido el usuario.
     */
    @Column(name = "likes_received")
    @Builder.Default
    @Min(0)
    private Long likesReceived = 0L;
    
    /**
     * Número total de likes que ha dado el usuario a otros perfiles.
     */
    @Column(name = "likes_given")
    @Builder.Default
    @Min(0)
    private Long likesGiven = 0L;
    
    /**
     * Número total de matches (coincidencias mutuas) que ha conseguido el usuario.
     */
    @Column(name = "matches_count")
    @Builder.Default
    @Min(0)
    private Long matchesCount = 0L;
    
    /**
     * Número total de conversaciones iniciadas por el usuario.
     * Métrica de proactividad y engagement social.
     */
    @Column(name = "conversations_started")
    @Builder.Default
    @Min(0)
    private Long conversationsStarted = 0L;

    /**
     * Número total de mensajes enviados por el usuario.
     * Métrica de actividad y participación en conversaciones.
     */
    @Column(name = "messages_sent")
    @Builder.Default
    @Min(0)
    private Long messagesSent = 0L;

    /**
     * Score calculado de popularidad del usuario.
     * Algoritmo ponderado: visualizaciones (20%), likes recibidos (40%), matches (30%), engagement (10%).
     */
    @Column(name = "popularity_score")
    @Builder.Default
    @DecimalMin("0.0")
    private Double popularityScore = 0.0;

    /**
     * Score calculado de actividad del usuario.
     * Algoritmo ponderado: likes dados (30%), mensajes (40%), matches (20%), streak de login (10%).
     */
    @Column(name = "activity_score")
    @Builder.Default
    @DecimalMin("0.0")
    private Double activityScore = 0.0;
    
    // ========================================
    // SISTEMA DE INTENTOS/PINES
    // ========================================
    
    /**
     * Número de intentos (pines) disponibles para enviar likes o realizar acciones premium.
     * Los intentos se pueden comprar o recibir como bonificación.
     */
    @Column(name = "available_attempts")
    @Builder.Default
    @Min(0)
    private Integer availableAttempts = 0;

    /**
     * Número total de intentos que el usuario ha comprado históricamente.
     * Métrica para análisis de monetización y comportamiento del usuario.
     */
    @Column(name = "total_attempts_purchased")
    @Builder.Default
    @Min(0)
    private Integer totalAttemptsPurchased = 0;

    /**
     * Contador de intentos utilizados en el día actual.
     * Se reinicia diariamente para controlar límites de uso.
     */
    @Column(name = "attempts_used_today")
    @Builder.Default
    @Min(0)
    private Integer attemptsUsedToday = 0;

    /**
     * Fecha de expiración de los intentos comprados.
     * Los intentos son válidos por un año desde la primera compra.
     */
    @Column(name = "attempts_expiry_date")
    private LocalDateTime attemptsExpiryDate;

    /**
     * Fecha del último reinicio del contador de intentos diarios.
     * Utilizado para verificar si corresponde reiniciar el contador attemptsUsedToday.
     */
    @Column(name = "last_attempt_reset")
    private LocalDateTime lastAttemptReset;
    
    // ========================================
    // MÉTRICAS DE ACTIVIDAD
    // ========================================
    
    /**
     * Número total de días únicos en los que el usuario ha estado activo.
     * Se incrementa una vez por día cuando el usuario realiza acciones.
     */
    @Column(name = "days_active")
    @Builder.Default
    @Min(0)
    private Integer daysActive = 0;

    /**
     * Racha de días consecutivos de login.
     * Se incrementa por cada día consecutivo de acceso, se reinicia si rompe la racha.
     */
    @Column(name = "login_streak")
    @Builder.Default
    @Min(0)
    private Integer loginStreak = 0;

    /**
     * Fecha y hora del último login del usuario.
     * Utilizado para calcular la racha de login y días activos.
     */
    @Column(name = "last_login_date")
    private LocalDateTime lastLoginDate;

    /**
     * Tiempo total de sesión acumulado en minutos.
     * Métrica de engagement y tiempo de uso de la plataforma.
     */
    @Column(name = "total_session_time_minutes")
    @Builder.Default
    @Min(0)
    private Long totalSessionTimeMinutes = 0L;
    
    // ========================================
    // MÉTRICAS DE CALIDAD
    // ========================================
    
    /**
     * Porcentaje de completitud del perfil (0-100).
     * Calcula qué tan completa está la información del perfil del usuario.
     */
    @Column(name = "profile_completion_percentage")
    @Builder.Default
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private Double profileCompletionPercentage = 0.0;

    /**
     * Tasa de respuesta a mensajes recibidos (0-100).
     * Indica el porcentaje de mensajes que el usuario responde.
     */
    @Column(name = "response_rate")
    @Builder.Default
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private Double responseRate = 0.0;

    /**
     * Tiempo promedio de respuesta en horas.
     * Métrica de calidad que indica qué tan rápido responde el usuario a los mensajes.
     */
    @Column(name = "average_response_time_hours")
    @Builder.Default
    @DecimalMin("0.0")
    private Double averageResponseTimeHours = 0.0;
    
    // ========================================
    // CAMPOS DE AUDITORIA
    // ========================================
    
    /**
     * Fecha y hora de creación del registro de métricas.
     * Se establece automáticamente al crear la entidad.
     */
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Fecha y hora de la última actualización del registro.
     * Se actualiza automáticamente con @PreUpdate.
     */
    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // ========================================
    // RELACIÓN CON USER
    // ========================================

    /**
     * Relación 1:1 con la entidad User.
     * El ID de las métricas coincide con el ID del usuario (@MapsId).
     * Permite acceder a toda la información del usuario desde las métricas.
     */
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
    
    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================
    
    /**
     * Verifica si el usuario tiene intentos (pines) activos disponibles.
     *
     * @return true si tiene intentos disponibles y no han expirado
     */
    public boolean hasActiveAttempts() {
        return availableAttempts != null && availableAttempts > 0 &&
                (attemptsExpiryDate == null || attemptsExpiryDate.isAfter(LocalDateTime.now()));
    }
    
    /**
     * Calcula el porcentaje de engagement basado en likes recibidos vs visualizaciones.
     *
     * @return Porcentaje de engagement (0-100)
     */
    public double getEngagementScore() {
        if (profileViews == 0) return 0.0;
        return ((double) likesReceived / profileViews) * 100;
    }
    
    /**
     * Calcula la tasa de éxito basada en matches conseguidos vs likes dados.
     *
     * @return Porcentaje de éxito (0-100)
     */
    public double getSuccessRate() {
        if (likesGiven == 0) return 0.0;
        return ((double) matchesCount / likesGiven) * 100;
    }
    
    // ========================================
    // MÉTODOS DE ACTUALIZACIÓN DE MÉTRICAS
    // ========================================
    
    /**
     * Incrementa el contador de visualizaciones del perfil.
     * Actualiza automáticamente el score de popularidad.
     */
    public void incrementProfileViews() {
        this.profileViews++;
        updatePopularityScore();
    }
    
    /**
     * Incrementa el contador de likes recibidos.
     * Actualiza automáticamente el score de popularidad.
     */
    public void incrementLikesReceived() {
        this.likesReceived++;
        updatePopularityScore();
    }
    
    /**
     * Incrementa el contador de likes dados.
     * Actualiza automáticamente el score de actividad.
     */
    public void incrementLikesGiven() {
        this.likesGiven++;
        updateActivityScore();
    }
    
    /**
     * Incrementa el contador de matches.
     * Actualiza automáticamente los scores de popularidad y actividad.
     */
    public void incrementMatches() {
        this.matchesCount++;
        updatePopularityScore();
        updateActivityScore();
    }
    
    /**
     * Incrementa el contador de mensajes enviados.
     * Actualiza automáticamente el score de actividad.
     */
    public void incrementMessages() {
        this.messagesSent++;
        updateActivityScore();
    }
    
    /**
     * Consume un intento disponible si es que tiene.
     * Incrementa el contador de intentos usados hoy.
     */
    public void useAttempt() {
        if (hasActiveAttempts()) {
            this.availableAttempts--;
            this.attemptsUsedToday++;
        }
    }
    
    
    /**
     * Reinicia el contador de intentos utilizados en el día.
     * Actualiza la fecha del último reset.
     */
    public void resetDailyAttempts() {
        this.attemptsUsedToday = 0;
        this.lastAttemptReset = LocalDateTime.now();
    }
    
    /**
     * Actualiza el score de popularidad basado en métricas sociales.
     * <p>
     * Utiliza un algoritmo ponderado que considera:
     * - Visualizaciones del perfil: 20%
     * - Likes recibidos: 40%
     * - Matches conseguidos: 30%
     * - Score de engagement: 10%
     * <p>
     * El score se recalcula automáticamente cada vez que cambian las métricas sociales.
     */
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

    /**
     * Actualiza el score de actividad basado en las acciones del usuario.
     * <p>
     * Utiliza un algoritmo ponderado que considera:
     * - Likes dados: 30%
     * - Mensajes enviados: 40%
     * - Matches conseguidos: 20%
     * - Racha de login: 10%
     * <p>
     * El score se recalcula automáticamente cada vez que el usuario realiza acciones.
     */
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

    /**
     * Callback ejecutado antes de actualizar la entidad.
     * Actualiza automáticamente el timestamp updatedAt.
     */
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Callback ejecutado antes de persistir la entidad por primera vez.
     * Inicializa los timestamps createdAt y updatedAt si no están establecidos.
     */
    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }
}