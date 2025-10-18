package com.feeling.packages.user.domain.dto.analytics;

/**
 * DTO para conteo de usuarios por pestañas del panel de administración.
 * <p>
 * Proporciona contadores de usuarios agrupados por estado de cuenta,
 * permitiendo a los administradores visualizar rápidamente cuántos usuarios
 * hay en cada categoría/pestaña del panel administrativo.
 * <p>
 * Usado para renderizar badges numéricos en las pestañas del dashboard
 * administrativo y facilitar la navegación entre diferentes vistas de usuarios.
 *
 * @param active      Usuarios activos (verificados y con perfil completo)
 * @param pending     Usuarios pendientes de aprobación inicial
 * @param incomplete  Usuarios con perfiles incompletos (< 100% completitud)
 * @param unverified  Usuarios sin verificación de email/teléfono
 * @param nonApproved Usuarios no aprobados (esperando revisión)
 * @param rejected    Usuarios rechazados en proceso de aprobación
 * @param deactivated Usuarios con cuentas desactivadas
 * @param total       Total general de usuarios en el sistema
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
public record UserStatusCountsDTO(
    Long active,
    Long pending,
    Long incomplete,
    Long unverified,
    Long nonApproved,
    Long rejected,
    Long deactivated,
    Long total
) {
}
