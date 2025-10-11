package com.feeling.packages.user.domain.services;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.user.domain.enums.UserRoleList;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.entities.UserRole;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import com.feeling.packages.user.infrastructure.repositories.IUserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Servicio especializado para la gestión de roles y permisos de usuarios.
 * <p>
 * Responsabilidades:
 * - Otorgar rol de administrador a usuarios
 * - Revocar rol de administrador
 * - Operaciones batch de roles (otorgar/revocar múltiples)
 * - Asignar roles personalizados
 * - Consultar usuarios por rol
 * - Validar permisos de rol
 * <p>
 * Este servicio encapsula toda la lógica de negocio relacionada con
 * la gestión de roles en la plataforma.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
public class UserRoleService {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(UserRoleService.class);

    private final IUserRepository userRepository;
    private final IUserRoleRepository roleRepository;
    private final UserValidationService userValidationService;
    private final UserBatchOperationHelper userBatchOperationHelper;

    // ========================================
    // OTORGAR ROLES
    // ========================================

    /**
     * Otorga rol de administrador a un usuario específico.
     * <p>
     * Validaciones:
     * - El usuario debe existir
     * - El usuario NO debe tener ya el rol de admin
     * - El rol ADMIN debe existir en la base de datos
     *
     * @param adminEmail Email del administrador que otorga el rol (auditoría)
     * @param userId     ID del usuario que recibirá el rol
     * @return Mensaje de confirmación o información si ya era admin
     * @throws NotFoundException Si el usuario o el rol ADMIN no existen
     */
    @Transactional
    public MessageResponseDTO grantAdminRole(String adminEmail, String userId) {
        User user = getUserById(userId);

        // Validar si puede recibir el rol
        if (!userValidationService.canGrantAdminRole(user)) {
            return new MessageResponseDTO("El usuario ya tiene rol de administrador");
        }

        UserRole adminRole = getAdminRole();
        user.setUserRole(adminRole);
        userRepository.save(user);

        logger.logUserOperation("admin_role_granted", user.getEmail(),
            Map.of("grantedBy", adminEmail, "userId", userId));

        return new MessageResponseDTO("Rol de administrador otorgado correctamente");
    }

    /**
     * Otorga rol de administrador a múltiples usuarios en batch.
     * <p>
     * Operación optimizada que realiza:
     * - Una sola consulta para obtener todos los usuarios
     * - Validación individual de cada usuario
     * - Una sola operación de guardado masivo
     *
     * @param adminEmail Email del administrador que otorga (auditoría)
     * @param userIds    Lista de IDs de usuarios a promover
     * @return Mensaje con resumen de la operación (otorgados, ya admin, fallos)
     * @throws NotFoundException Si el rol ADMIN no existe
     */
    @Transactional
    public MessageResponseDTO grantAdminRoleBatch(String adminEmail, List<String> userIds) {
        logger.info("Otorgando rol admin en lote",
            Map.of("totalRequested", userIds.size(), "grantedBy", adminEmail));

        // Obtener el rol de admin una sola vez
        UserRole adminRole = getAdminRole();

        UserBatchOperationHelper.BatchOperationResult result = userBatchOperationHelper.executeBatchOperation(
            userIds,
            userValidationService::canGrantAdminRole,
            user -> user.setUserRole(adminRole)
        );

        logger.info("Operación de otorgar rol admin en lote completada",
            Map.of("granted", result.updated(), "alreadyAdmin", result.alreadyInState(),
                "failed", result.failed()));

        String message = String.format(
            "Operación completada: %d roles admin otorgados, %d ya eran admin, %d fallos",
            result.updated(), result.alreadyInState(), result.failed());

        return new MessageResponseDTO(message);
    }

    // ========================================
    // REVOCAR ROLES
    // ========================================

    /**
     * Revoca rol de administrador de un usuario específico.
     * <p>
     * Protecciones importantes:
     * - NO permite revocar rol del administrador principal del sistema
     * - Valida que el usuario tenga actualmente rol ADMIN
     * <p>
     * El usuario pasa de rol ADMIN a rol CLIENT.
     *
     * @param adminEmail Email del administrador que revoca (auditoría)
     * @param userId     ID del usuario a degradar
     * @return Mensaje de confirmación o información si ya era cliente
     * @throws BadRequestException Si se intenta revocar al admin principal
     * @throws NotFoundException   Si el usuario o el rol CLIENT no existen
     */
    @Transactional
    public MessageResponseDTO revokeAdminRole(String adminEmail, String userId) {
        User user = getUserById(userId);

        // Protección crítica: admin principal no puede perder su rol
        if (userValidationService.isSystemAdmin(user)) {
            throw new BadRequestException("No se puede revocar el rol del administrador principal");
        }

        // Validar si puede ser revocado
        if (!userValidationService.canRevokeAdminRole(user)) {
            return new MessageResponseDTO("El usuario ya tiene rol de cliente");
        }

        UserRole clientRole = getClientRole();
        user.setUserRole(clientRole);
        userRepository.save(user);

        logger.logUserOperation("admin_role_revoked", user.getEmail(),
            Map.of("revokedBy", adminEmail, "userId", userId));

        return new MessageResponseDTO("Rol de administrador revocado correctamente");
    }

    /**
     * Revoca rol de administrador de múltiples usuarios en batch.
     * <p>
     * Incluye protección especial para el administrador principal del sistema,
     * quien nunca puede perder su rol (se cuenta como "protegido").
     *
     * @param adminEmail Email del administrador que revoca (auditoría)
     * @param userIds    Lista de IDs de usuarios a degradar
     * @return Mensaje con resumen (revocados, protegidos, ya cliente, fallos)
     * @throws NotFoundException Si el rol CLIENT no existe
     */
    @Transactional
    public MessageResponseDTO revokeAdminRoleBatch(String adminEmail, List<String> userIds) {
        logger.info("Revocando rol admin en lote",
            Map.of("totalRequested", userIds.size(), "revokedBy", adminEmail));

        // Obtener el rol de cliente una sola vez
        UserRole clientRole = getClientRole();

        UserBatchOperationHelper.ExtendedBatchOperationResult result = userBatchOperationHelper.executeBatchOperationWithProtection(
            userIds,
            userValidationService::canRevokeAdminRole,
            userValidationService::isSystemAdmin,
            user -> user.setUserRole(clientRole)
        );

        logger.info("Operación de revocar rol admin en lote completada",
            Map.of("revoked", result.updated(), "protected", result.protectedCount(),
                "alreadyClient", result.alreadyInState(), "failed", result.failed()));

        String message = String.format(
            "Operación completada: %d roles admin revocados, %d protegidos, %d ya eran cliente, %d fallos",
            result.updated(), result.protectedCount(), result.alreadyInState(), result.failed());

        return new MessageResponseDTO(message);
    }

    // ========================================
    // ASIGNAR ROLES GENÉRICOS
    // ========================================

    /**
     * Asigna un rol específico a un usuario.
     * <p>
     * Método genérico que permite asignar cualquier rol disponible en el sistema.
     * Incluye las mismas protecciones que los métodos específicos.
     *
     * @param userId ID del usuario
     * @param role   Rol a asignar (ADMIN o CLIENT)
     * @return Mensaje de confirmación
     * @throws NotFoundException        Si el usuario o el rol no existen
     * @throws BadRequestException      Si se intenta cambiar el rol del admin principal
     * @throws IllegalArgumentException Si el rol es null
     */
    @Transactional
    public MessageResponseDTO assignRole(String userId, UserRoleList role) {
        if (role == null) {
            throw new IllegalArgumentException("El rol no puede ser null");
        }

        User user = getUserById(userId);

        // Protección: no cambiar rol del admin principal
        if (userValidationService.isSystemAdmin(user) && role != UserRoleList.ADMIN) {
            throw new BadRequestException("No se puede cambiar el rol del administrador principal");
        }

        UserRole userRole = roleRepository.findByUserRoleList(role)
            .orElseThrow(() -> new NotFoundException("Rol no encontrado: " + role));

        user.setUserRole(userRole);
        userRepository.save(user);

        logger.logUserOperation("role_assigned", user.getEmail(),
            Map.of("newRole", role.name(), "userId", userId));

        return new MessageResponseDTO("Rol " + role.name() + " asignado correctamente");
    }

    /**
     * Remueve un rol específico de un usuario (lo pasa a CLIENT por defecto).
     * <p>
     * Protección: El administrador principal nunca puede perder su rol ADMIN.
     *
     * @param userId ID del usuario
     * @param role   Rol a remover
     * @return Mensaje de confirmación
     * @throws NotFoundException   Si el usuario no existe
     * @throws BadRequestException Si se intenta remover rol del admin principal
     */
    @Transactional
    public MessageResponseDTO removeRole(String userId, UserRoleList role) {
        User user = getUserById(userId);

        // Protección del admin principal
        if (userValidationService.isSystemAdmin(user)) {
            throw new BadRequestException("No se puede modificar el rol del administrador principal");
        }

        // Si intenta remover un rol que no tiene, no hacer nada
        if (!userValidationService.hasRole(user, role)) {
            return new MessageResponseDTO("El usuario no tiene el rol " + role.name());
        }

        // Por defecto, asignar rol CLIENT al remover cualquier otro rol
        UserRole clientRole = getClientRole();
        user.setUserRole(clientRole);
        userRepository.save(user);

        logger.logUserOperation("role_removed", user.getEmail(),
            Map.of("removedRole", role.name(), "userId", userId));

        return new MessageResponseDTO("Rol " + role.name() + " removido correctamente");
    }

    // ========================================
    // CONSULTAS
    // ========================================

    /**
     * Obtiene todos los usuarios que tienen un rol específico.
     * <p>
     * Resultado paginado para mejor rendimiento.
     *
     * @param role     Rol a buscar
     * @param pageable Configuración de paginación
     * @return Página de usuarios con ese rol
     */
    public Page<User> getUsersByRole(UserRoleList role, Pageable pageable) {
        UserRole userRole = roleRepository.findByUserRoleList(role)
            .orElseThrow(() -> new NotFoundException("Rol no encontrado: " + role));

        return userRepository.findByUserRole(userRole, pageable);
    }

    /**
     * Cuenta cuántos usuarios tienen un rol específico.
     *
     * @param role Rol a contar
     * @return Número de usuarios con ese rol
     */
    public long countUsersByRole(UserRoleList role) {
        UserRole userRole = roleRepository.findByUserRoleList(role)
            .orElseThrow(() -> new NotFoundException("Rol no encontrado: " + role));

        return userRepository.countByUserRole(userRole);
    }

    // ========================================
    // HELPERS - OBTENCIÓN DE ROLES
    // ========================================

    /**
     * Obtiene el rol de administrador desde la base de datos.
     * Helper para evitar duplicación de código.
     *
     * @return UserRole de tipo ADMIN
     * @throws NotFoundException Si el rol ADMIN no existe en la BD
     */
    private UserRole getAdminRole() {
        return roleRepository.findByUserRoleList(UserRoleList.ADMIN)
            .orElseThrow(() -> new NotFoundException("Rol de administrador no encontrado"));
    }

    /**
     * Obtiene el rol de cliente desde la base de datos.
     * Helper para evitar duplicación de código.
     *
     * @return UserRole de tipo CLIENT
     * @throws NotFoundException Si el rol CLIENT no existe en la BD
     */
    private UserRole getClientRole() {
        return roleRepository.findByUserRoleList(UserRoleList.CLIENT)
            .orElseThrow(() -> new NotFoundException("Rol de cliente no encontrado"));
    }

    /**
     * Obtiene un usuario por ID con manejo de error.
     * Helper para evitar duplicación de código.
     *
     * @param userId ID del usuario (como String)
     * @return Usuario encontrado
     * @throws NotFoundException Si el usuario no existe
     */
    private User getUserById(String userId) {
        return userRepository.findById(Long.valueOf(userId))
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

}
