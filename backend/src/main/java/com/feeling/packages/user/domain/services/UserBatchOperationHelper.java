package com.feeling.packages.user.domain.services;

import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Consumer;
import java.util.function.Predicate;

/**
 * Helper para operaciones batch sobre usuarios.
 * <p>
 * Centraliza la lógica de procesamiento masivo de usuarios para evitar duplicación
 * de código entre servicios (UserRoleService, UserApprovalService, UserService).
 * <p>
 * Características:
 * - Anti-N+1: Una sola query para obtener todos los usuarios
 * - Batch saving: Una sola operación de guardado masivo
 * - Genérico: Funciona con cualquier predicado y acción
 * - Auditoría: Retorna contadores detallados de la operación
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Component
@RequiredArgsConstructor
public class UserBatchOperationHelper {

    private final IUserRepository userRepository;

    /**
     * Ejecuta una operación batch genérica sobre usuarios.
     * <p>
     * Optimizado para evitar N+1 queries:
     * - Una sola consulta para obtener todos los usuarios
     * - Una sola operación de guardado masivo
     *
     * @param userIds Lista de IDs de usuarios (como String)
     * @param filter  Predicado que determina si el usuario puede ser modificado
     * @param action  Acción a aplicar al usuario (ej: approve, reject, assign role)
     * @return Resultado con contadores de la operación
     */
    public BatchOperationResult executeBatchOperation(
        List<String> userIds,
        Predicate<User> filter,
        Consumer<User> action) {

        // Obtener todos los usuarios de una vez (anti-N+1)
        List<User> users = fetchUsersByIds(userIds);

        // Filtrar y aplicar acción
        List<User> usersToUpdate = users.stream()
            .filter(filter)
            .peek(action)
            .toList();

        // Guardar todos en lote
        userRepository.saveAll(usersToUpdate);

        return new BatchOperationResult(
            usersToUpdate.size(),
            users.size() - usersToUpdate.size(),
            userIds.size() - users.size()
        );
    }

    /**
     * Ejecuta una operación batch con protección adicional.
     * <p>
     * Usado para operaciones que requieren validación adicional antes de aplicar,
     * como proteger al administrador principal del sistema.
     *
     * @param userIds          Lista de IDs de usuarios
     * @param filter           Predicado que determina si el usuario puede ser modificado
     * @param protectionFilter Predicado para usuarios que deben ser protegidos
     * @param action           Acción a aplicar al usuario
     * @return Resultado extendido con contador de usuarios protegidos
     */
    public ExtendedBatchOperationResult executeBatchOperationWithProtection(
        List<String> userIds,
        Predicate<User> filter,
        Predicate<User> protectionFilter,
        Consumer<User> action) {

        // Obtener todos los usuarios de una vez (anti-N+1)
        List<User> users = fetchUsersByIds(userIds);

        // Separar usuarios protegidos
        List<User> protectedUsers = users.stream()
            .filter(protectionFilter)
            .toList();

        // Filtrar y aplicar acción (excluyendo protegidos)
        List<User> usersToUpdate = users.stream()
            .filter(user -> !protectionFilter.test(user))
            .filter(filter)
            .peek(action)
            .toList();

        // Guardar todos en lote
        userRepository.saveAll(usersToUpdate);

        return new ExtendedBatchOperationResult(
            usersToUpdate.size(),
            users.size() - usersToUpdate.size() - protectedUsers.size(),
            userIds.size() - users.size(),
            protectedUsers.size()
        );
    }

    /**
     * Obtiene múltiples usuarios por sus IDs en una sola query.
     *
     * @param userIds Lista de IDs como String
     * @return Lista de usuarios encontrados
     */
    public List<User> fetchUsersByIds(List<String> userIds) {
        List<Long> ids = userIds.stream()
            .map(Long::valueOf)
            .toList();
        return userRepository.findAllById(ids);
    }

    /**
     * Record que encapsula el resultado de operaciones batch.
     *
     * @param updated        Número de usuarios actualizados exitosamente
     * @param alreadyInState Número de usuarios que ya tenían el estado correcto
     * @param failed         Número de IDs inválidos o usuarios no encontrados
     */
    public record BatchOperationResult(
        int updated,
        int alreadyInState,
        int failed
    ) {
    }

    /**
     * Record extendido que incluye usuarios protegidos.
     *
     * @param updated        Número de usuarios actualizados exitosamente
     * @param alreadyInState Número de usuarios que ya tenían el estado correcto
     * @param failed         Número de IDs inválidos o usuarios no encontrados
     * @param protectedCount Número de usuarios protegidos (no modificados por seguridad)
     */
    public record ExtendedBatchOperationResult(
        int updated,
        int alreadyInState,
        int failed,
        int protectedCount
    ) {
    }

    /**
     * Ejecuta operación batch de eliminación masiva con filtro de protección.
     * <p>
     * Similar a otros helpers batch pero específico para eliminaciones:
     * - No tiene concepto de "alreadyInState" (siempre es 0 para delete)
     * - Usa deleteAll en lugar de saveAll
     * - El filter determina quiénes PUEDEN ser eliminados
     * <p>
     * ⚠️ ADVERTENCIA: Operación irreversible, usar con precaución.
     *
     * @param userIds Lista de IDs de usuarios a eliminar
     * @param filter  Predicado que determina si un usuario puede ser eliminado
     * @return Resultado extendido (alreadyInState siempre es 0, protectedCount cuenta no eliminados)
     */
    public ExtendedBatchOperationResult executeBatchDeletion(
        List<String> userIds,
        Predicate<User> filter) {

        // Obtener todos los usuarios de una vez (anti-N+1)
        List<User> users = fetchUsersByIds(userIds);

        // Filtrar usuarios que pueden ser eliminados
        List<User> usersToDelete = users.stream()
            .filter(filter)
            .toList();

        // Eliminar todos en lote
        userRepository.deleteAll(usersToDelete);

        // Usuarios protegidos = total encontrados - eliminados
        int protectedCount = users.size() - usersToDelete.size();

        return new ExtendedBatchOperationResult(
            usersToDelete.size(),
            0, // No hay "alreadyInState" para eliminación
            userIds.size() - users.size(), // IDs que no se encontraron
            protectedCount
        );
    }
}
