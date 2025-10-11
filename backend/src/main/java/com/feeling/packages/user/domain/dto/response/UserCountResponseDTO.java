package com.feeling.packages.user.domain.dto.response;

/**
 * DTO genérico para respuestas de conteo.
 * <p>
 * Representa el resultado de operaciones de conteo en el sistema,
 * proporcionando una estructura consistente para todas las respuestas
 * que retornan cantidades.
 * <p>
 * Casos de uso:
 * - Conteo de registros pendientes de aprobación
 * - Estadísticas numéricas simples
 * - Respuestas de agregación que retornan un solo valor numérico
 * <p>
 * Ventajas sobre Map<String, Long>:
 * - Type-safe y autocompletado en IDEs
 * - Documentación explícita del campo
 * - Validación en tiempo de compilación
 * - Mejor generación de documentación Swagger
 *
 * @param count Cantidad total de elementos contados
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public record UserCountResponseDTO(
    Long count
) {
}
