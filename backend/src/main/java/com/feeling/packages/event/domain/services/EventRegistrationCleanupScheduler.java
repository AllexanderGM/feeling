package com.feeling.packages.event.domain.services;

import com.feeling.config.logging.StructuredLoggerFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class EventRegistrationCleanupScheduler {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(EventRegistrationCleanupScheduler.class);

    private final EventRegistrationService registrationService;

    @Value("${feeling.events.pending-registration.max-age-minutes:15}")
    private long maxPendingMinutes;

    @Value("${feeling.events.pending-registration.cleanup-interval-ms:300000}")
    private long cleanupIntervalMillis;

    @Value("${feeling.events.pending-registration.initial-delay-ms:60000}")
    private long initialDelayMillis;

    @Scheduled(
        fixedDelayString = "${feeling.events.pending-registration.cleanup-interval-ms:300000}",
        initialDelayString = "${feeling.events.pending-registration.initial-delay-ms:60000}"
    )
    public void cleanupExpiredPendingRegistrations() {
        long effectiveMinutes = maxPendingMinutes > 0 ? maxPendingMinutes : 15L;

        try {
            int released = registrationService.releaseStalePendingRegistrations(Duration.ofMinutes(effectiveMinutes));
            if (released > 0) {
                logger.info("Liberadas inscripciones pendientes expiradas", Map.of(
                    "task", "event_registration_cleanup",
                    "releasedCount", released,
                    "maxPendingMinutes", effectiveMinutes,
                    "cleanupIntervalMillis", cleanupIntervalMillis,
                    "initialDelayMillis", initialDelayMillis
                ));
            }
        } catch (Exception exception) {
            logger.error("Error liberando inscripciones pendientes expiradas", Map.of(
                "task", "event_registration_cleanup",
                "maxPendingMinutes", effectiveMinutes,
                "cleanupIntervalMillis", cleanupIntervalMillis,
                "initialDelayMillis", initialDelayMillis
            ), exception);
        }
    }
}

