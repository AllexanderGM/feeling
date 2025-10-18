package com.feeling.packages.user.domain.services;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.user.domain.dto.mapper.UserResponseFactory;
import com.feeling.packages.user.domain.dto.profile.response.UserResponseDTO;
import com.feeling.packages.user.domain.enums.UserResponseLevel;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Servicio especializado para el sistema de aprobación y moderación de usuarios.
 * <p>
 * Responsabilidades:
 * - Aprobar usuarios pendientes
 * - Rechazar usuarios
 * - Revocar aprobaciones
 * - Resetear estado a PENDING (dar segunda oportunidad)
 * - Operaciones batch de aprobación/rechazo
 * - Envío de emails de notificación de aprobación/rechazo
 * - Consultas de usuarios por estado de aprobación
 * <p>
 * Este servicio implementa la lógica de negocio del flujo de moderación de usuarios
 * en la plataforma Feeling.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
public class UserApprovalService {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(UserApprovalService.class);

    private final IUserRepository userRepository;
    private final UserNotificationService userNotificationService;
    private final UserValidationService userValidationService;
    private final UserCachedService userCachedService;
    private final UserBatchOperationHelper userBatchOperationHelper;

    // ========================================
    // CONSULTAS POR ESTADO DE APROBACIÓN
    // ========================================

    /**
     * Obtiene usuarios pendientes de aprobación con búsqueda opcional.
     * <p>
     * Filtra usuarios con estado PENDING que han completado su registro
     * pero aún no han sido aprobados por un administrador.
     *
     * @param pageable   Configuración de paginación
     * @param searchTerm Término de búsqueda opcional (null para todos)
     * @return Página de usuarios pendientes de aprobación
     */
    public Page<UserResponseDTO> getPendingApprovalUsers(Pageable pageable, String searchTerm) {
        String search = (searchTerm != null && !searchTerm.trim().isEmpty()) ? searchTerm.trim() : null;
        Page<User> pendingUsers = userRepository.findPendingApprovalUsers(search, pageable);

        return pendingUsers.map(user ->
            UserResponseFactory.create(user, UserResponseLevel.ADMIN));
    }

    /**
     * Obtiene usuarios rechazados (no aprobados) con búsqueda opcional.
     *
     * @param pageable   Configuración de paginación
     * @param searchTerm Término de búsqueda opcional
     * @return Página de usuarios rechazados
     */
    public Page<UserResponseDTO> getRejectedUsers(Pageable pageable, String searchTerm) {
        String search = (searchTerm != null && !searchTerm.trim().isEmpty()) ? searchTerm.trim() : null;
        Page<User> rejectedUsers = userRepository.findNonApprovedUsers(search, pageable);

        return rejectedUsers.map(user ->
            UserResponseFactory.create(user, UserResponseLevel.ADMIN));
    }

    // ========================================
    // OPERACIONES SINGULARES
    // ========================================

    /**
     * Aprueba un usuario específico y lo activa en la plataforma.
     * <p>
     * Validaciones:
     * - El usuario debe existir
     * - El perfil debe estar completo
     * - El usuario no debe estar ya aprobado
     * <p>
     * Efectos:
     * - Cambia el estado a APPROVED
     * - Invalida cache del usuario
     * - Envía email de bienvenida (no bloqueante)
     *
     * @param userId ID del usuario a aprobar
     * @return Mensaje de confirmación
     * @throws NotFoundException   Si el usuario no existe
     * @throws BadRequestException Si el perfil no está completo
     */
    @Transactional
    public MessageResponseDTO approveUser(String userId) {
        User user = getUserWithTags(userId);

        // Validar que el perfil esté completo
        if (!userValidationService.isProfileComplete(user))
            throw new BadRequestException("El usuario debe completar su perfil antes de ser aprobado");


        // Validar que pueda ser aprobado
        if (!userValidationService.canBeApproved(user))
            return new MessageResponseDTO("El usuario ya está aprobado");


        user.approve();
        userRepository.save(user);
        userCachedService.evictUserCache(user.getEmail());  // Invalidar caché para reflejar cambios inmediatamente
        try {
            userNotificationService.sendApprovalEmail(user.getId());
        } catch (Exception e) {
            logger.warn("Error al enviar email de aprobación",
                Map.of("userEmail", user.getEmail(), "error", e.getMessage()));
        }

        logger.logUserOperation("user_approved", user.getEmail(),
            Map.of("userApprovalStatus", user.getUserApprovalStatus().name()));

        return new MessageResponseDTO("Usuario aprobado correctamente");
    }

    /**
     * Rechaza un usuario específico.
     * <p>
     * El usuario pasa a estado REJECTED y no puede acceder a la plataforma
     * hasta que un administrador lo resetee a PENDING.
     *
     * @param userId ID del usuario a rechazar
     * @return Mensaje de confirmación
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional
    public MessageResponseDTO rejectUser(String userId) {
        User user = getUserById(userId);

        // Validar que pueda ser rechazado
        if (!userValidationService.canBeRejected(user))
            return new MessageResponseDTO("El usuario ya está rechazado");

        user.reject();
        userRepository.save(user);

        logger.logUserOperation("user_rejected", user.getEmail(), Map.of("userId", userId));

        return new MessageResponseDTO("Usuario rechazado correctamente");
    }

    /**
     * Revoca la aprobación de un usuario (lo pasa a REJECTED).
     * <p>
     * Usado cuando se detecta que un usuario aprobado no debería tener acceso
     * a la plataforma (ej: contenido inapropiado, violación de términos, etc.)
     *
     * @param userId ID del usuario
     * @return Mensaje de confirmación
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional
    public MessageResponseDTO revokeUserApproval(String userId) {
        User user = getUserById(userId);

        if (!userValidationService.canBeRejected(user)) {
            return new MessageResponseDTO("El usuario ya está rechazado");
        }

        user.reject();
        userRepository.save(user);
        userCachedService.evictUserCache(user.getEmail()); // Invalidar cache

        logger.logUserOperation("user_approval_revoked", user.getEmail(), Map.of("userId", userId));

        return new MessageResponseDTO("Aprobación de usuario revocada correctamente");
    }

    /**
     * Resetea el estado de aprobación de un usuario a PENDING.
     * <p>
     * Permite dar una "segunda oportunidad" a usuarios rechazados
     * o volver a evaluar usuarios aprobados.
     * <p>
     * Casos de uso comunes:
     * - Usuario rechazado por error administrativo
     * - Usuario actualizó su perfil tras rechazo
     * - Re-evaluación requerida por políticas nuevas
     *
     * @param userId ID del usuario a resetear
     * @return Mensaje de confirmación
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional
    public MessageResponseDTO resetUserApprovalToPending(String userId) {
        User user = getUserById(userId);

        if (!userValidationService.canBeResetToPending(user)) {
            return new MessageResponseDTO("El usuario ya está en estado pendiente");
        }

        user.setPending();
        userRepository.save(user);
        userCachedService.evictUserCache(user.getEmail()); // Invalidar cache

        logger.logUserOperation("user_reset_to_pending", user.getEmail(), Map.of("userId", userId));

        return new MessageResponseDTO("Usuario reseteado a estado pendiente correctamente");
    }


    // ========================================
    // OPERACIONES BATCH / MASIVAS
    // ========================================

    /**
     * Aprueba múltiples usuarios en una sola operación batch optimizada.
     * <p>
     * Optimizado para evitar N+1 queries:
     * - Una sola consulta para obtener todos los usuarios
     * - Validación individual de cada usuario
     * - Una sola operación de guardado masivo
     *
     * @param userIds Lista de IDs de usuarios a aprobar
     * @return Mensaje con resumen de la operación
     */
    @Transactional
    public MessageResponseDTO approveUsersBatch(List<String> userIds) {
        logger.info("Aprobando usuarios en lote", Map.of("totalRequested", userIds.size()));

        UserBatchOperationHelper.BatchOperationResult result = userBatchOperationHelper.executeBatchOperation(
            userIds,
            userValidationService::canBeApproved,
            User::approve
        );

        logger.info("Operación de aprobación en lote completada",
            Map.of("approved", result.updated(), "alreadyApproved", result.alreadyInState(),
                "failed", result.failed()));

        String message = String.format(
            "Operación completada: %d usuarios aprobados, %d ya estaban aprobados, %d fallos",
            result.updated(), result.alreadyInState(), result.failed());

        return new MessageResponseDTO(message);
    }

    /**
     * Rechaza múltiples usuarios en una sola operación batch optimizada.
     *
     * @param userIds Lista de IDs de usuarios a rechazar
     * @return Mensaje con resumen de la operación
     */
    @Transactional
    public MessageResponseDTO rejectUsersBatch(List<String> userIds) {
        logger.info("Rechazando usuarios en lote", Map.of("totalRequested", userIds.size()));

        UserBatchOperationHelper.BatchOperationResult result = userBatchOperationHelper.executeBatchOperation(
            userIds,
            userValidationService::canBeRejected,
            User::reject
        );

        logger.info("Operación de rechazo en lote completada",
            Map.of("rejected", result.updated(), "alreadyRejected", result.alreadyInState(),
                "failed", result.failed()));

        String message = String.format(
            "Operación completada: %d usuarios rechazados, %d ya estaban rechazados, %d fallos",
            result.updated(), result.alreadyInState(), result.failed());

        return new MessageResponseDTO(message);
    }

    // ========================================
    // HELPERS PRIVADOS
    // ========================================

    /**
     * Obtiene un usuario por ID con manejo de error.
     *
     * @param userId ID del usuario (como String)
     * @return Usuario encontrado
     * @throws NotFoundException Si el usuario no existe
     */
    private User getUserById(String userId) {
        return userRepository.findById(Long.valueOf(userId))
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    /**
     * Obtiene un usuario por ID con sus tags pre-cargados.
     * Útil para operaciones que necesitan acceso a los tags del usuario.
     *
     * @param userId ID del usuario (como String)
     * @return Usuario con tags cargados
     * @throws NotFoundException Si el usuario no existe
     */
    private User getUserWithTags(String userId) {
        return userRepository.findByIdWithTags(Long.valueOf(userId))
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }
}
