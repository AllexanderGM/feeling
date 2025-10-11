package com.feeling.config.async;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.packages.auth.domain.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.Map;

/**
 * Configuración de tareas programadas (scheduled tasks)
 * <p>
 * Ejecuta tareas de mantenimiento periódicas en segundo plano:
 * - Limpieza de tokens expirados/revocados
 * - Otras tareas de limpieza futura
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class ScheduledTasksConfig {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(ScheduledTasksConfig.class);

    private final AuthService authService;

    /**
     * Limpieza de tokens antiguos
     * Se ejecuta cada día a las 3:00 AM
     * Elimina tokens expirados/revocados con más de 7 días de antigüedad
     */
    @Scheduled(cron = "0 0 3 * * ?") // Todos los días a las 3 AM
    public void cleanupOldTokens() {
        try {
            logger.info("Iniciando limpieza programada de tokens antiguos", Map.of(
                "task", "token_cleanup",
                "category", "SCHEDULED_TASK"
            ));

            authService.cleanupOldTokens();

            logger.info("Limpieza de tokens completada exitosamente", Map.of(
                "task", "token_cleanup",
                "complaintStatus", "success",
                "category", "SCHEDULED_TASK"
            ));
        } catch (Exception e) {
            logger.error("Error en limpieza programada de tokens", Map.of(
                "task", "token_cleanup",
                "complaintStatus", "failed",
                "category", "SCHEDULED_TASK"
            ), e);
        }
    }

    /**
     * Limpieza adicional opcional cada 12 horas
     * Descomenta si necesitas limpieza más frecuente
     */
    // @Scheduled(cron = "0 0 */12 * * ?") // Cada 12 horas
    // public void cleanupOldTokensFrequent() {
    //     cleanupOldTokens();
    // }
}
