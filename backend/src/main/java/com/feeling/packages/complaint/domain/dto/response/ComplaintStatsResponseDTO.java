package com.feeling.packages.complaint.domain.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO para estadísticas completas de quejas del sistema.
 * Utilizado en el dashboard administrativo para métricas y análisis.
 * <p>
 * Incluye:
 * - Contadores básicos por estado
 * - Distribución por prioridad
 * - Distribución por tipo de queja
 * - Métricas temporales y de rendimiento
 * - Contexto de referencias
 *
 * @param totalComplaints          Total de quejas en el sistema
 * @param openComplaints           Quejas con estado OPEN
 * @param inProgressComplaints     Quejas con estado IN_PROGRESS
 * @param waitingUserComplaints    Quejas con estado WAITING_USER
 * @param pendingComplaints        Total de quejas pendientes (OPEN + IN_PROGRESS + WAITING_USER)
 * @param resolvedComplaints       Quejas con estado RESOLVED
 * @param closedComplaints         Quejas con estado CLOSED
 * @param escalatedComplaints      Quejas con estado ESCALATED
 * @param overdueComplaints        Quejas atrasadas (más de 24 horas sin resolver)
 * @param urgentComplaints         Quejas con prioridad URGENT
 * @param complaintsLast24h        Quejas creadas en las últimas 24 horas
 * @param averageResolutionHours   Tiempo promedio de resolución en horas
 * @param resolutionRate           Tasa de resolución (porcentaje)
 * @param priorityDistribution     Distribución de quejas por prioridad
 * @param typeDistribution         Distribución de quejas por tipo
 * @param contextMetrics           Métricas de quejas con referencias a otros elementos
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Schema(description = "Estadísticas completas del sistema de quejas para dashboard administrativo")
public record ComplaintStatsResponseDTO(

    @Schema(description = "Total de quejas en el sistema", example = "1547")
    long totalComplaints,

    @Schema(description = "Quejas con estado OPEN", example = "234")
    long openComplaints,

    @Schema(description = "Quejas con estado IN_PROGRESS", example = "156")
    long inProgressComplaints,

    @Schema(description = "Quejas con estado WAITING_USER", example = "89")
    long waitingUserComplaints,

    @Schema(description = "Total de quejas pendientes (OPEN + IN_PROGRESS + WAITING_USER)", example = "479")
    long pendingComplaints,

    @Schema(description = "Quejas con estado RESOLVED", example = "987")
    long resolvedComplaints,

    @Schema(description = "Quejas con estado CLOSED", example = "67")
    long closedComplaints,

    @Schema(description = "Quejas con estado ESCALATED", example = "14")
    long escalatedComplaints,

    @Schema(description = "Quejas atrasadas (más de 24 horas sin resolver)", example = "42")
    long overdueComplaints,

    @Schema(description = "Quejas con prioridad URGENT", example = "23")
    long urgentComplaints,

    @Schema(description = "Quejas creadas en las últimas 24 horas", example = "38")
    long complaintsLast24h,

    @Schema(description = "Tiempo promedio de resolución en horas", example = "12.5")
    double averageResolutionHours,

    @Schema(description = "Tasa de resolución (porcentaje)", example = "63.8")
    double resolutionRate,

    @Schema(description = "Distribución de quejas por prioridad (low, medium, high, urgent)")
    PriorityDistributionDTO priorityDistribution,

    @Schema(description = "Distribución de quejas por tipo")
    TypeDistributionDTO typeDistribution,

    @Schema(description = "Métricas de quejas con referencias a usuarios, eventos o bookings")
    ContextMetricsDTO contextMetrics

) {

    /**
     * DTO para distribución de quejas por prioridad.
     *
     * @param low    Quejas con prioridad LOW
     * @param medium Quejas con prioridad MEDIUM
     * @param high   Quejas con prioridad HIGH
     * @param urgent Quejas con prioridad URGENT
     */
    @Schema(description = "Distribución de quejas por nivel de prioridad")
    public record PriorityDistributionDTO(
        @Schema(description = "Quejas con prioridad LOW", example = "456")
        long low,

        @Schema(description = "Quejas con prioridad MEDIUM", example = "789")
        long medium,

        @Schema(description = "Quejas con prioridad HIGH", example = "234")
        long high,

        @Schema(description = "Quejas con prioridad URGENT", example = "68")
        long urgent
    ) {
    }

    /**
     * DTO para distribución de quejas por tipo.
     *
     * @param general        Quejas tipo GENERAL
     * @param technicalIssue Quejas tipo TECHNICAL_ISSUE
     * @param accountIssue   Quejas tipo ACCOUNT_ISSUE
     * @param paymentIssue   Quejas tipo PAYMENT_ISSUE
     * @param userReport     Quejas tipo USER_REPORT
     * @param eventIssue     Quejas tipo EVENT_ISSUE
     * @param bookingIssue   Quejas tipo BOOKING_ISSUE
     * @param privacyConcern Quejas tipo PRIVACY_CONCERN
     * @param featureRequest Quejas tipo FEATURE_REQUEST
     * @param bugReport      Quejas tipo BUG_REPORT
     * @param abuseReport    Quejas tipo ABUSE_REPORT
     * @param refundRequest  Quejas tipo REFUND_REQUEST
     */
    @Schema(description = "Distribución de quejas por tipo de problema")
    public record TypeDistributionDTO(
        @Schema(description = "Quejas tipo GENERAL", example = "345")
        long general,

        @Schema(description = "Quejas tipo TECHNICAL_ISSUE", example = "234")
        long technicalIssue,

        @Schema(description = "Quejas tipo ACCOUNT_ISSUE", example = "156")
        long accountIssue,

        @Schema(description = "Quejas tipo PAYMENT_ISSUE", example = "89")
        long paymentIssue,

        @Schema(description = "Quejas tipo USER_REPORT (reportes de usuarios)", example = "67")
        long userReport,

        @Schema(description = "Quejas tipo EVENT_ISSUE", example = "45")
        long eventIssue,

        @Schema(description = "Quejas tipo BOOKING_ISSUE", example = "78")
        long bookingIssue,

        @Schema(description = "Quejas tipo PRIVACY_CONCERN", example = "23")
        long privacyConcern,

        @Schema(description = "Quejas tipo FEATURE_REQUEST (solicitudes de características)", example = "112")
        long featureRequest,

        @Schema(description = "Quejas tipo BUG_REPORT (reportes de bugs)", example = "167")
        long bugReport,

        @Schema(description = "Quejas tipo ABUSE_REPORT (reportes de abuso)", example = "34")
        long abuseReport,

        @Schema(description = "Quejas tipo REFUND_REQUEST (solicitudes de reembolso)", example = "56")
        long refundRequest
    ) {
    }

    /**
     * DTO para métricas de quejas con referencias.
     *
     * @param complaintsWithUserReference    Quejas que referencian a un usuario
     * @param complaintsWithEventReference   Quejas que referencian a un evento
     * @param complaintsWithBookingReference Quejas que referencian a una reserva
     * @param totalContextualComplaints      Total de quejas con cualquier tipo de referencia
     */
    @Schema(description = "Métricas de quejas que referencian otros elementos del sistema")
    public record ContextMetricsDTO(
        @Schema(description = "Quejas que referencian a un usuario (reportes)", example = "78")
        long complaintsWithUserReference,

        @Schema(description = "Quejas que referencian a un evento", example = "45")
        long complaintsWithEventReference,

        @Schema(description = "Quejas que referencian a una reserva", example = "67")
        long complaintsWithBookingReference,

        @Schema(description = "Total de quejas con cualquier tipo de referencia", example = "190")
        long totalContextualComplaints
    ) {
    }
}
