package com.feeling.packages.user.domain.dto.response.profile;

/**
 * DTO para el resumen general de analytics de usuarios.
 * <p>
 * Proporciona contadores de usuarios agrupados por diferentes estados del sistema,
 * permitiendo un overview rápido de la distribución de usuarios en la plataforma.
 * <p>
 * Usado principalmente en dashboards administrativos para visualizar el estado
 * general de la base de usuarios.
 *
 * @param total       Total de usuarios registrados en el sistema
 * @param active      Usuarios con cuentas activas y verificadas
 * @param pending     Usuarios pendientes de verificación inicial
 * @param incomplete  Usuarios con perfiles incompletos
 * @param unverified  Usuarios no verificados (email/teléfono)
 * @param rejected    Usuarios rechazados en proceso de aprobación
 * @param deactivated Usuarios con cuentas desactivadas
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public record UserAnalyticsResponseDTO(
    Long total,
    Long active,
    Long pending,
    Long incomplete,
    Long unverified,
    Long rejected,
    Long deactivated
) {
}
