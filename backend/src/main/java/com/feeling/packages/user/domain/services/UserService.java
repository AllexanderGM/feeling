package com.feeling.packages.user.domain.services;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.packages.auth.infrastructure.entities.AuthToken;
import com.feeling.packages.auth.infrastructure.repositories.IAuthTokenRepository;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.user.domain.dto.mapper.UserResponseFactory;
import com.feeling.packages.user.domain.dto.user.UserRequestDTO;
import com.feeling.packages.user.domain.dto.user.UserResponseDTO;
import com.feeling.packages.user.domain.enums.UserResponseLevel;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Servicio principal para la gestión de usuarios en la plataforma Feeling.
 * <p>
 * Responsabilidades:
 * - Consultas y búsquedas de usuarios con múltiples niveles de detalle
 * - Actualizaciones parciales y completas de perfil de usuario
 * - Gestión de cuentas (activación/desactivación)
 * - Operaciones batch de activación/desactivación
 * - Eliminación de usuarios con protecciones de seguridad
 * - Consultas filtradas por estado
 * <p>
 * Características técnicas:
 * - Optimización de consultas con cache estratificado
 * - Operaciones batch con protección contra N+1
 * - Logging estructurado para auditoría completa
 * - Transaccionalidad gestionada con Spring @Transactional
 * - Validación de permisos y seguridad multi-capa
 * - Manejo robusto de errores con excepciones personalizadas
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @see User
 * @see UserResponseDTO
 * @see UserResponseFactory
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
public class UserService {
    // ========================================
    // CONSTANTES Y DEPENDENCIAS
    // ========================================

    /**
     * Logger estructurado para auditoría y trazabilidad de operaciones.
     * Proporciona logging contextual con metadata estructurada.
     */
    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(UserService.class);

    // Repositorios
    private final IUserRepository userRepository;
    private final IAuthTokenRepository tokenRepository;

    // Servicios internos
    private final UserProfileUpdater userProfileUpdater;
    private final UserValidationService userValidationService;
    private final UserBatchOperationHelper userBatchOperationHelper;
    private final UserResponseFactory userResponseFactory;

    /**
     * Email del administrador principal del sistema.
     * Configurado vía application.properties con la clave 'app.admin.email'.
     * Este usuario tiene protecciones especiales contra eliminación y cambios de rol.
     */
    @Value("${app.admin.email}")
    private String adminEmail;

    // ========================================
    // MÉTODOS DE CONSULTA BÁSICOS
    // ========================================

    /**
     * Obtiene un usuario por su email con nivel de detalle estándar.
     * <p>
     * Retorna información básica del usuario sin aplicar filtros de privacidad
     * ni niveles de inclusión. Este método es utilizado principalmente para
     * operaciones internas del sistema.
     *
     * @param email Email del usuario a buscar
     * @return DTO con información estándar del usuario
     * @throws UnauthorizedException Si el usuario no existe
     */
    @Transactional(readOnly = true)
    public UserResponseDTO get(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));
        return userResponseFactory.create(user, UserResponseLevel.FULL);
    }

    /**
     * Obtiene un usuario con nivel de inclusión específico y caching optimizado.
     * <p>
     * Este método implementa cache estratificado por email y nivel de inclusión,
     * permitiendo respuestas ultra-rápidas para consultas repetidas. El nivel
     * de inclusión determina qué campos se incluyen en la respuesta (PUBLIC,
     * BASIC, STANDARD, COMPLETE).
     * <p>
     * Niveles de inclusión disponibles:
     * - PUBLIC: Solo información pública básica
     * - BASIC: Incluye preferencias y características básicas
     * - STANDARD: Incluye tags y métricas sociales
     * - COMPLETE: Incluye toda la información disponible
     *
     * @param email        Email del usuario a buscar
     * @param includeLevel Nivel de detalle deseado (public/basic/standard/complete)
     * @return DTO con información del usuario según el nivel especificado
     * @throws UnauthorizedException Si el usuario no existe
     */
    @org.springframework.cache.annotation.Cacheable(
        value = "userProfiles",
        key = "'user_profile_' + #email + '_' + #includeLevel",
        unless = "#result == null"
    )
    public UserResponseDTO get(String email, String includeLevel) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));
        return userResponseFactory.create(user, includeLevel, UserResponseLevel.BASIC);
    }

    /**
     * Obtiene un usuario con nivel de inclusión determinado por contexto de seguridad.
     * <p>
     * Este método inteligente determina automáticamente el nivel apropiado de
     * información a retornar basándose en la relación entre el usuario actual
     * y el usuario objetivo:
     * - Mismo usuario: Puede solicitar nivel COMPLETE
     * - Admin consultando: Puede solicitar nivel COMPLETE de cualquier usuario
     * - Otro usuario: Máximo nivel BASIC (respeta privacidad)
     * - Anónimo: Máximo nivel PUBLIC
     * <p>
     * La lógica de determinación de nivel se delega a {@link UserResponseFactory#determineAppropriateLevel}
     *
     * @param targetEmail      Email del usuario objetivo a consultar
     * @param currentUserEmail Email del usuario que realiza la consulta (null si es anónimo)
     * @param requestedLevel   Nivel de detalle solicitado (puede ser ajustado por seguridad)
     * @return DTO con información del usuario según el nivel apropiado determinado
     * @throws UnauthorizedException Si el usuario objetivo no existe
     */
    @Transactional(readOnly = true)
    public UserResponseDTO get(String targetEmail, String currentUserEmail, String requestedLevel) {
        return getUserResponseDTO(targetEmail, currentUserEmail, requestedLevel);
    }

    /**
     * Método helper interno para obtener usuario con contexto de seguridad.
     * <p>
     * Este método es package-private (visible solo en el paquete) y se utiliza
     * para compartir lógica entre diferentes servicios sin duplicación de código.
     * Determina el nivel apropiado de respuesta basándose en permisos.
     *
     * @param targetEmail      Email del usuario objetivo
     * @param currentUserEmail Email del usuario actual (null si anónimo)
     * @param requestedLevel   Nivel solicitado
     * @return DTO con nivel apropiado de información
     * @throws NotFoundException Si el usuario objetivo no existe
     */
    private UserResponseDTO getUserResponseDTO(String targetEmail, String currentUserEmail,
                                               String requestedLevel) {
        User targetUser = userRepository.findByEmail(targetEmail)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con email: " + targetEmail));
        User currentUser = currentUserEmail != null ?
            userRepository.findByEmail(currentUserEmail).orElse(null) : null;

        UserResponseLevel appropriateLevel = userResponseFactory
            .determineAppropriateLevel(currentUser, targetUser, requestedLevel);

        // Usar el método que incluye información de match cuando hay un usuario actual
        return userResponseFactory.create(targetUser, currentUser, appropriateLevel);
    }

    /**
     * Obtiene la entidad User completa por email.
     * <p>
     * Método de utilidad interna que retorna la entidad JPA completa en lugar
     * de un DTO. Utilizado principalmente por otros servicios que necesitan
     * trabajar con la entidad directamente.
     *
     * @param email Email del usuario
     * @return Entidad User completa
     * @throws NotFoundException Si el usuario no existe
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    /**
     * Obtiene la entidad User completa por ID.
     * <p>
     * Método de utilidad interna que retorna la entidad JPA completa.
     * Acepta el ID como String y realiza la conversión a Long internamente.
     *
     * @param userId ID del usuario como String
     * @return Entidad User completa
     * @throws NotFoundException     Si el usuario no existe
     * @throws NumberFormatException Si el userId no es un número válido
     */
    public User getUserById(String userId) {
        return userRepository.findById(Long.valueOf(userId))
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    /**
     * Obtiene lista paginada de usuarios ordenada por fecha de creación.
     * <p>
     * Este método implementa paginación optimizada con ordenamiento descendente
     * por fecha de creación (usuarios más recientes primero). Recomendado para
     * todas las operaciones de listado en producción.
     *
     * @param pageable Configuración de paginación y ordenamiento
     * @return Página de usuarios con metadata de paginación
     */
    public Page<UserResponseDTO> getListPaginated(Pageable pageable) {
        Page<User> users = userRepository.findAll(PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            Sort.by(Sort.Direction.DESC, "createdAt")
        ));
        return users.map(user -> userResponseFactory.create(user, UserResponseLevel.FULL));
    }

    /**
     * Busca usuarios por término de búsqueda con paginación.
     * <p>
     * Realiza búsqueda fuzzy en múltiples campos del usuario:
     * - Nombre y apellido
     * - Email
     * - Descripción
     * - Ciudad y país
     * <p>
     * La búsqueda es case-insensitive y utiliza LIKE con wildcards.
     *
     * @param searchTerm Término de búsqueda (puede ser parcial)
     * @param pageable   Configuración de paginación
     * @return Página de usuarios que coinciden con el término de búsqueda
     */
    public Page<UserResponseDTO> searchUsers(String searchTerm, Pageable pageable) {
        Page<User> users = userRepository.findBySearchTerm(searchTerm, pageable);
        return users.map(user -> userResponseFactory.create(user, UserResponseLevel.FULL));
    }

    // ========================================
    // MÉTODOS DE ACTUALIZACIÓN
    // ========================================

    /**
     * Realiza actualización parcial (PATCH) del perfil de usuario.
     * <p>
     * Implementa el patrón de actualización parcial REST siguiendo el estándar HTTP PATCH:
     * - Solo los campos presentes (no-null) en el DTO serán actualizados
     * - Los campos null/ausentes se ignoran (no se modifican)
     * - Validaciones automáticas según anotaciones en el DTO
     * - Recálculo automático de completitud de perfil (@PreUpdate en User)
     * <p>
     * Campos actualizables mediante este método:
     * - Información personal: nombre, apellido, teléfono, descripción
     * - Ubicación: país, ciudad, departamento, localidad
     * - Características: género, altura, color de ojos, color de cabello, etc.
     * - Preferencias: rango de edad, radio de ubicación
     * - Configuración: privacidad, notificaciones
     * - Contraseña (encriptada automáticamente)
     */
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(
        value = {"userProfiles", "userSuggestions", "userMetrics"},
        key = "#email",
        allEntries = false
    )
    public UserResponseDTO update(String email, UserRequestDTO userRequestDTO) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        if (!userRequestDTO.hasAnyUpdate()) {
            throw new BadRequestException("No se enviaron campos para actualizar");
        }

        // Determinar si quien actualiza es admin
        boolean isAdmin = user.getUserRole() != null &&
            ("ADMIN".equals(user.getUserRole().getAuthority()) ||
                "SUPER_ADMIN".equals(user.getUserRole().getAuthority()));

        // Aplicar actualizaciones usando el mapper centralizado
        userProfileUpdater.apply(user, userRequestDTO, isAdmin);

        User savedUser = userRepository.save(user);
        logger.logUserOperation("user_partial_updated", email,
            Map.of("fields_updated", userRequestDTO.countUpdates()));

        return userResponseFactory.create(savedUser, UserResponseLevel.FULL);
    }


    // ========================================
    // MÉTODOS DE ELIMINACIÓN
    // ========================================

    /**
     * Elimina permanentemente un usuario del sistema con múltiples capas de protección.
     * <p>
     * Sistema de protección multi-capa:
     * 1. Primera línea: Verifica flag {@code protectedUser} en la entidad
     * 2. Segunda línea: Verifica contra email del admin principal configurado
     * <p>
     * Proceso de eliminación:
     * 1. Validar protecciones de seguridad
     * 2. Eliminar tokens de autenticación (cascada manual para mayor control)
     * 3. Eliminar usuario (cascadas automáticas de JPA eliminan relaciones)
     * 4. Logging de auditoría
     * <p>
     * ⚠️ ADVERTENCIA: Esta operación es IRREVERSIBLE. El usuario y todos sus datos
     * relacionados (matches, favoritos, complaints, etc.) serán eliminados permanentemente.
     * <p>
     * Consideraciones:
     * - Las cascadas están configuradas en las entidades relacionadas
     * - Los tokens se eliminan manualmente para mayor control
     * - La operación es transaccional (rollback automático en caso de error)
     *
     * @param email Email del usuario a eliminar
     * @return Mensaje de confirmación de eliminación exitosa
     * @throws UnauthorizedException Si el usuario no existe
     * @throws BadRequestException   Si el usuario está protegido o es el admin principal
     */
    public MessageResponseDTO delete(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        // Primera línea de defensa: Verificar si el usuario está protegido contra eliminación
        if (user.isProtectedUser()) {
            logger.logUserOperation("user_deletion_blocked_protected", user.getEmail(), null);
            throw new BadRequestException("Este usuario está protegido y no puede ser eliminado por seguridad del sistema");
        }

        // Segunda línea de defensa: Verificar si es el email del administrador principal
        if (adminEmail != null && adminEmail.equalsIgnoreCase(email)) {
            logger.logUserOperation("user_deletion_blocked_admin_email", email, null);
            throw new BadRequestException("El usuario administrador principal no puede ser eliminado por seguridad del sistema");
        }

        // Eliminar los tokens del usuario (cascada manual)
        List<AuthToken> authTokens = tokenRepository.findByUser(user);
        tokenRepository.deleteAll(authTokens);

        // Eliminar usuario (cascadas automáticas eliminan relaciones)
        userRepository.delete(user);

        logger.logUserOperation("user_deleted", user.getEmail(), null);
        return new MessageResponseDTO("Usuario eliminado correctamente");
    }

    // ========================================
    // CONSULTAS FILTRADAS POR ESTADO
    // ========================================

    /**
     * Obtiene usuarios activos (aprobados y con perfil completo) con búsqueda opcional.
     * <p>
     * Filtra usuarios que cumplen TODOS estos criterios:
     * - Estado de aprobación: APPROVED
     * - Perfil completo: true
     * - Cuenta activa (no desactivada)
     * - Email verificado: true
     * <p>
     * Si se proporciona término de búsqueda, filtra adicionalmente por:
     * - Nombre y apellido
     * - Email
     * - Ciudad
     *
     * @param pageable   Configuración de paginación y ordenamiento
     * @param searchTerm Término de búsqueda opcional (null o vacío para todos)
     * @return Página de usuarios activos
     */
    public Page<UserResponseDTO> getActiveUsers(Pageable pageable, String searchTerm) {
        String search = (searchTerm != null && !searchTerm.trim().isEmpty()) ? searchTerm.trim() : null;
        Page<User> activeUsers = userRepository.findActiveUsers(search, pageable);
        return activeUsers.map(user -> userResponseFactory.create(user, UserResponseLevel.FULL));
    }

    /**
     * Obtiene usuarios con email no verificado con búsqueda opcional.
     * <p>
     * Filtra usuarios donde {@code verified = false}, típicamente usuarios que:
     * - Completaron el registro pero no verificaron su email
     * - No hicieron clic en el enlace de verificación
     * - Pueden requerir reenvío del código de verificación
     * <p>
     * Útil para identificar usuarios que necesitan seguimiento o reenvío de emails.
     *
     * @param pageable   Configuración de paginación y ordenamiento
     * @param searchTerm Término de búsqueda opcional (null o vacío para todos)
     * @return Página de usuarios no verificados
     */
    public Page<UserResponseDTO> getUnverifiedUsers(Pageable pageable, String searchTerm) {
        String search = (searchTerm != null && !searchTerm.trim().isEmpty()) ? searchTerm.trim() : null;
        Page<User> unverifiedUsers = userRepository.findUnverifiedUsers(search, pageable);
        return unverifiedUsers.map(user -> userResponseFactory.create(user, UserResponseLevel.FULL));
    }


    /**
     * Obtiene usuarios con cuenta desactivada con búsqueda opcional.
     * <p>
     * Filtra usuarios donde {@code accountDeactivated = true}.
     * Las cuentas pueden estar desactivadas por:
     * - Solicitud del propio usuario (auto-desactivación)
     * - Acción administrativa por violación de políticas
     * - Suspensión temporal por investigación
     * <p>
     * Incluye información de {@code deactivationDate} y {@code deactivationReason}
     * para auditoría y posible reactivación.
     *
     * @param pageable   Configuración de paginación y ordenamiento
     * @param searchTerm Término de búsqueda opcional (null o vacío para todos)
     * @return Página de usuarios con cuenta desactivada
     */
    public Page<UserResponseDTO> getDeactivatedUsers(Pageable pageable, String searchTerm) {
        String search = (searchTerm != null && !searchTerm.trim().isEmpty()) ? searchTerm.trim() : null;
        Page<User> deactivatedUsers = userRepository.findDeactivatedUsers(search, pageable);
        return deactivatedUsers.map(user -> userResponseFactory.create(user, UserResponseLevel.FULL));
    }

    /**
     * Obtiene usuarios con perfil incompleto con búsqueda opcional.
     * <p>
     * Filtra usuarios donde {@code profileComplete = false}, calculado por
     * el método {@link User#isProfileComplete()} basándose en:
     * - Datos personales básicos (nombre, apellido, fecha de nacimiento)
     * - Al menos una imagen de perfil
     * - Características físicas (género, altura, complexión, etc.)
     * - Preferencias de matching (edad, ubicación)
     * - Categoría de interés seleccionada
     * <p>
     * Estos usuarios típicamente requieren:
     * - Emails recordatorios para completar perfil
     * - No pueden ser aprobados hasta completar perfil
     * - No aparecen en sugerencias de matching
     *
     * @param pageable   Configuración de paginación y ordenamiento
     * @param searchTerm Término de búsqueda opcional (null o vacío para todos)
     * @return Página de usuarios con perfil incompleto
     */
    public Page<UserResponseDTO> getIncompleteUsers(Pageable pageable, String searchTerm) {
        String search = (searchTerm != null && !searchTerm.trim().isEmpty()) ? searchTerm.trim() : null;
        Page<User> users = userRepository.findIncompleteProfileUsers(search, pageable);
        return users.map(user -> userResponseFactory.create(user, UserResponseLevel.FULL));
    }


    /**
     * Permite a un usuario desactivar su propia cuenta (auto-desactivación).
     * <p>
     * Proceso de auto-desactivación:
     * - Marca {@code accountDeactivated = true}
     * - Registra fecha de desactivación
     * - Almacena razón proporcionada por el usuario
     * - Logging de auditoría con categoría "account_deactivated_self"
     * <p>
     * Efectos de la desactivación:
     * - El usuario no puede iniciar sesión
     * - No aparece en búsquedas ni sugerencias
     * - Los datos se conservan para posible reactivación
     * - Los matches existentes quedan pausados
     * <p>
     * La cuenta puede ser reactivada posteriormente por un administrador
     * usando {@link #reactivateAccount(String)}.
     *
     * @param userEmail Email del usuario que desactiva su cuenta
     * @param reason    Razón de desactivación proporcionada por el usuario (opcional)
     * @return Mensaje de confirmación
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional
    public MessageResponseDTO deactivateOwnAccount(String userEmail, String reason) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        user.setAccountDeactivated(true);
        user.setDeactivationDate(LocalDateTime.now());
        user.setDeactivationReason(reason);

        userRepository.save(user);
        logger.logUserOperation("account_deactivated_self", userEmail,
            Map.of("reason", reason != null ? reason : "No especificada"));

        return new MessageResponseDTO("Cuenta desactivada correctamente");
    }

    /**
     * Obtiene usuarios filtrados por estado con búsqueda opcional.
     * <p>
     * Switch unificado para obtener usuarios según su estado:
     * - "active": Aprobados, verificados, perfil completo
     * - "pending-approval": Pendientes de aprobación admin
     * - "unverified": Email no verificado
     * - "non-approved": Rechazados por admin
     * - "deactivated": Cuenta desactivada
     * - "incomplete-user": Perfil incompleto
     * <p>
     * Cada estado puede incluir búsqueda opcional por nombre/email/ciudad.
     * <p>
     * Este método es un router conveniente que delega a los métodos específicos
     * de consulta por estado, simplificando el controller.
     *
     * @param status   Estado a filtrar (case-insensitive)
     * @param search   Término de búsqueda opcional (null para omitir)
     * @param pageable Configuración de paginación
     * @return Página de usuarios filtrados por estado y búsqueda
     * @throws BadRequestException Si el estado no es válido
     */
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getUsersByStatus(String status, String search, Pageable pageable) {
        String searchTerm = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<User> users = switch (status.toLowerCase()) {
            case "active" -> userRepository.findActiveUsers(searchTerm, pageable);
            case "pending-approval" -> userRepository.findPendingApprovalUsers(searchTerm, pageable);
            case "unverified" -> userRepository.findUnverifiedUsers(searchTerm, pageable);
            case "non-approved" -> userRepository.findNonApprovedUsers(searchTerm, pageable);
            case "deactivated" -> userRepository.findDeactivatedUsers(searchTerm, pageable);
            case "incomplete-user" -> userRepository.findIncompleteProfileUsers(searchTerm, pageable);
            default -> throw new BadRequestException("Estado de usuario no válido: " + status);
        };

        return users.map(user -> userResponseFactory.create(user, UserResponseLevel.FULL));
    }

    /**
     * Obtiene el email de un usuario por su ID.
     * <p>
     * Método de utilidad simple que retorna únicamente el email.
     * Útil para operaciones donde solo se necesita el email sin cargar
     * toda la información del usuario.
     * <p>
     * Casos de uso:
     * - Logging y auditoría
     * - Validaciones rápidas
     * - Notificaciones donde solo se necesita el destinatario
     *
     * @param userId ID del usuario (como String)
     * @return Email del usuario
     * @throws NotFoundException     Si el usuario no existe
     * @throws NumberFormatException Si userId no es un número válido
     */
    @Transactional(readOnly = true)
    public String getUserEmailById(String userId) {
        User user = userRepository.findById(Long.valueOf(userId))
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        return user.getEmail();
    }


    // ========================================
    // GESTIÓN DE CUENTAS - Activación/Desactivación
    // ========================================

    /**
     * Desactiva cuenta de usuario por decisión administrativa.
     * <p>
     * Diferente de {@link #deactivateOwnAccount}: Esta es una acción admin,
     * típicamente por violación de políticas, spam, o comportamiento inapropiado.
     * <p>
     * Usa método helper {@link User#deactivateAccount(String)} que configura:
     * - accountDeactivated = true
     * - deactivationDate = now
     * - deactivationReason = motivo proporcionado
     *
     * @param userId ID del usuario a desactivar
     * @param reason Razón administrativa de desactivación
     * @return Mensaje de confirmación o indicación si ya estaba desactivado
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional
    public MessageResponseDTO deactivateAccount(String userId, String reason) {
        User user = userRepository.findById(Long.valueOf(userId))
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        if (!userValidationService.canBeDeactivated(user)) {
            return new MessageResponseDTO("La cuenta ya está desactivada");
        }

        user.deactivateAccount(reason);
        userRepository.save(user);

        logger.logUserOperation("account_deactivated_by_admin", user.getEmail(),
            Map.of("reason", reason != null ? reason : "No especificada", "userId", userId));
        return new MessageResponseDTO("Cuenta desactivada correctamente");
    }

    /**
     * Reactiva cuenta de usuario previamente desactivada.
     * <p>
     * Usa método helper {@link User#reactivateAccount()} que:
     * - Marca accountDeactivated = false
     * - Limpia deactivationDate y deactivationReason
     * <p>
     * El usuario recupera acceso completo a la plataforma.
     *
     * @param userId ID del usuario a reactivar
     * @return Mensaje de confirmación o indicación si ya estaba activo
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional
    public MessageResponseDTO reactivateAccount(String userId) {
        User user = userRepository.findById(Long.valueOf(userId))
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        if (!userValidationService.canBeReactivated(user)) {
            return new MessageResponseDTO("La cuenta ya está activa");
        }

        user.reactivateAccount();
        userRepository.save(user);

        logger.logUserOperation("account_reactivated", user.getEmail(), Map.of("userId", userId));
        return new MessageResponseDTO("Cuenta reactivada correctamente");
    }

    /**
     * Desactiva múltiples cuentas en batch.
     * Optimizado con infraestructura batch compartida.
     *
     * @param userIds IDs de usuarios a desactivar
     * @param reason  Razón de desactivación común para todos
     * @return Mensaje con contadores de operación
     */
    @Transactional
    public MessageResponseDTO deactivateAccountsBatch(List<String> userIds, String reason) {
        UserBatchOperationHelper.BatchOperationResult result = userBatchOperationHelper.executeBatchOperation(
            userIds,
            userValidationService::canBeDeactivated,
            user -> user.deactivateAccount(reason)
        );

        String message = String.format("Operación completada: %d cuentas desactivadas, %d ya estaban desactivadas, %d fallos",
            result.updated(), result.alreadyInState(), result.failed());
        return new MessageResponseDTO(message);
    }

    /**
     * Reactiva múltiples cuentas en batch.
     * Optimizado con infraestructura batch compartida.
     *
     * @param userIds IDs de usuarios a reactivar
     * @return Mensaje con contadores de operación
     */
    @Transactional
    public MessageResponseDTO reactivateAccountsBatch(List<String> userIds) {
        UserBatchOperationHelper.BatchOperationResult result = userBatchOperationHelper.executeBatchOperation(
            userIds,
            userValidationService::canBeReactivated,
            User::reactivateAccount
        );

        String message = String.format("Operación completada: %d cuentas reactivadas, %d ya estaban activas, %d fallos",
            result.updated(), result.alreadyInState(), result.failed());
        return new MessageResponseDTO(message);
    }


    // ========================================
    // MÉTODOS DE ELIMINACIÓN
    // ========================================

    /**
     * Elimina usuario permanentemente por ID o email (operación singular).
     * <p>
     * ⚠️ ADVERTENCIA: Operación IRREVERSIBLE. Elimina usuario y todas las relaciones.
     * <p>
     * Acepta:
     * - ID numérico (ej: "123")
     * - Email (ej: "user@example.com")
     * <p>
     * Protección: NO permite eliminar al administrador principal del sistema.
     *
     * @param userIdentifier ID (número) o email del usuario
     * @return Mensaje de confirmación
     * @throws NotFoundException   Si el usuario no existe
     * @throws BadRequestException Si se intenta eliminar al admin principal
     */
    @Transactional
    public MessageResponseDTO deleteUser(String userIdentifier) {
        User user;

        // Intentar parsear como ID numérico primero
        try {
            Long userId = Long.valueOf(userIdentifier);
            user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        } catch (NumberFormatException e) {
            // Si no es un número, buscar por email
            user = userRepository.findByEmail(userIdentifier)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        }

        // Prevenir eliminación del admin principal
        if (userValidationService.isSystemAdmin(user)) {
            throw new BadRequestException("No se puede eliminar el administrador principal");
        }

        String userEmail = user.getEmail();
        Long userIdForLog = user.getId();
        userRepository.delete(user);

        logger.logUserOperation("user_deleted", userEmail, Map.of("userId", userIdForLog.toString()));
        return new MessageResponseDTO("Usuario eliminado correctamente");
    }

    /**
     * Elimina múltiples usuarios en batch con protección.
     * <p>
     * ⚠️ ADVERTENCIA: Operación IRREVERSIBLE.
     * <p>
     * Utiliza UserBatchOperationHelper.executeBatchDeletion que:
     * - Protege al administrador principal
     * - Cuenta usuarios protegidos
     * - Realiza eliminación masiva optimizada
     *
     * @param userIds IDs de usuarios a eliminar
     * @return Mensaje con contadores (deleted, protected, failed)
     */
    @Transactional
    public MessageResponseDTO deleteUsersBatch(List<String> userIds) {
        UserBatchOperationHelper.ExtendedBatchOperationResult result = userBatchOperationHelper.executeBatchDeletion(
            userIds,
            userValidationService::canBeDeleted
        );

        String message = String.format("Operación completada: %d usuarios eliminados, %d protegidos (admin principal), %d fallos",
            result.updated(), result.protectedCount(), result.failed());
        return new MessageResponseDTO(message);
    }
}
