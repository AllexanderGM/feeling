package com.feeling.packages.user.domain.services;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.services.email.EmailService;
import com.feeling.domain.services.storage.StorageService;
import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.packages.auth.domain.enums.AuthProvider;
import com.feeling.packages.auth.infrastructure.entities.AuthToken;
import com.feeling.packages.auth.infrastructure.repositories.IAuthTokenRepository;
import com.feeling.packages.user.domain.dto.*;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.entities.UserRole;
import com.feeling.packages.user.infrastructure.entities.UserRoleList;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import com.feeling.packages.user.infrastructure.repositories.IUserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio principal para la gestión integral de usuarios en la plataforma Feeling.
 * <p>
 * Este servicio maneja todas las operaciones relacionadas con usuarios incluyendo:
 * - Consultas y búsquedas de usuarios con múltiples niveles de detalle
 * - Actualizaciones parciales y completas de perfil
 * - Gestión de imágenes y multimedia
 * - Sistema de aprobación y moderación de usuarios
 * - Operaciones administrativas en lote (batch operations)
 * - Gestión de roles y permisos
 * - Analytics y métricas de usuarios
 * - Cálculo de compatibilidad entre usuarios
 * - Gestión de cuentas (activación/desactivación)
 * - Notificaciones y comunicaciones
 * <p>
 * Características técnicas:
 * - Optimización de consultas con cache estratificado
 * - Operaciones batch con protección contra N+1
 * - Logging estructurado para auditoría completa
 * - Transaccionalidad gestionada con Spring @Transactional
 * - Validación de permisos y seguridad multi-capa
 * - Helpers reutilizables para operaciones batch
 * - Manejo robusto de errores con excepciones personalizadas
 *
 * @author J. Alexander Gavilán M.
 * @version 1.8
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
    private final IUserRoleRepository roleRepository;
    private final IAuthTokenRepository tokenRepository;

    // Servicios externos
    private final PasswordEncoder passwordEncoder;
    private final StorageService storageService;
    private final EmailService emailService;

    // Servicios internos
    private final CachedUserService cachedUserService;
    private final UserAttributeService userAttributeService;

    /**
     * Email del administrador principal del sistema.
     * Configurado vía application.properties con la clave 'admin.username'.
     * Este usuario tiene protecciones especiales contra eliminación y cambios de rol.
     */
    @Value("${admin.username}")
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
    public UserResponseDTO get(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));
        logger.logUserOperation("GET_USER", user.getEmail(), Map.of("found", true));
        return new UserResponseDTO(user);
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
        logger.logUserOperation("GET_USER_WITH_LEVEL", user.getEmail(),
            Map.of("found", true, "level", includeLevel));
        return UserResponseFactory.create(user, includeLevel, UserResponseLevel.BASIC);
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
    public UserResponseDTO get(String targetEmail, String currentUserEmail, String requestedLevel) {
        return getUserResponseDTO(targetEmail, currentUserEmail, requestedLevel, userRepository, logger);
    }

    /**
     * Método helper estático para obtener usuario con contexto de seguridad.
     * <p>
     * Este método es package-private (visible solo en el paquete) y se utiliza
     * para compartir lógica entre diferentes servicios sin duplicación de código.
     * Determina el nivel apropiado de respuesta basándose en permisos.
     *
     * @param targetEmail      Email del usuario objetivo
     * @param currentUserEmail Email del usuario actual (null si anónimo)
     * @param requestedLevel   Nivel solicitado
     * @param userRepository   Repositorio de usuarios
     * @param logger           Logger para auditoría
     * @return DTO con nivel apropiado de información
     * @throws UnauthorizedException Si el usuario objetivo no existe
     */
    static UserResponseDTO getUserResponseDTO(String targetEmail, String currentUserEmail,
                                              String requestedLevel, IUserRepository userRepository,
                                              StructuredLoggerFactory.StructuredLogger logger) {
        User targetUser = userRepository.findByEmail(targetEmail)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));
        User currentUser = currentUserEmail != null ?
            userRepository.findByEmail(currentUserEmail).orElse(null) : null;

        UserResponseLevel appropriateLevel = UserResponseFactory
            .determineAppropriateLevel(currentUser, targetUser, requestedLevel);

        logger.logUserOperation("GET_USER_CONTEXTUALIZED", targetUser.getEmail(),
            Map.of("currentUser", currentUserEmail != null ? currentUserEmail : "anonymous",
                "requestedLevel", requestedLevel,
                "grantedLevel", appropriateLevel.toString()));

        return UserResponseFactory.create(targetUser, appropriateLevel);
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
     * Obtiene lista completa de todos los usuarios del sistema.
     * <p>
     * ⚠️ ADVERTENCIA: Este método carga TODOS los usuarios en memoria.
     * Solo debe usarse para operaciones administrativas específicas o
     * exportaciones. Para listados normales, usar {@link #getListPaginated(Pageable)}.
     *
     * @return Lista de DTOs con todos los usuarios
     */
    public List<UserResponseDTO> getList() {
        List<User> users = userRepository.findAll();
        logger.info("Usuarios encontrados correctamente");
        return users.stream()
            .map(UserResponseDTO::new)
            .collect(Collectors.toList());
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
        logger.info("Usuarios paginados encontrados correctamente", Map.of(
            "page", pageable.getPageNumber(),
            "size", pageable.getPageSize(),
            "total", users.getTotalElements()));
        return users.map(UserResponseDTO::new);
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
        logger.info("Búsqueda de usuarios completada", Map.of(
            "searchTerm", searchTerm,
            "page", pageable.getPageNumber(),
            "results", users.getTotalElements()));
        return users.map(UserResponseDTO::new);
    }

    // ========================================
    // SUGERENCIAS Y MATCHING
    // ========================================

    /**
     * Obtiene sugerencias personalizadas de usuarios compatibles con caching optimizado.
     * <p>
     * Este método implementa el algoritmo de matching de la plataforma, considerando:
     * - Categoría de interés (ESSENCE, ROUSE, SPIRIT) - debe coincidir
     * - Rango de edad según preferencias del usuario
     * - Proximidad geográfica (ciudad y departamento)
     * - Perfil completo y estado de aprobación
     * <p>
     * Características de seguridad y privacidad:
     * - Requiere perfil completo para ver sugerencias
     * - Nivel máximo de información: BASIC (respeta privacidad de sugeridos)
     * - Cache multinivel por usuario, nivel y paginación
     * <p>
     * Optimizaciones de rendimiento:
     * - Query optimizada con índices en categoría, edad y ubicación
     * - Paginación para evitar carga masiva de datos
     * - Cache estratificado con TTL configurado
     *
     * @param userEmail    Email del usuario que solicita sugerencias
     * @param includeLevel Nivel de detalle solicitado (limitado a BASIC máximo)
     * @param pageable     Configuración de paginación
     * @return Página de usuarios sugeridos según compatibilidad
     * @throws NotFoundException   Si el usuario no existe
     * @throws BadRequestException Si el perfil del usuario no está completo
     */
    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable(
        value = "userSuggestions",
        key = "'user_suggestions_' + #userEmail + '_' + #includeLevel + '_' + #pageable.pageNumber + '_' + #pageable.pageSize",
        unless = "#result == null || #result.isEmpty()"
    )
    public Page<UserResponseDTO> getUserSuggestions(String userEmail, String includeLevel, Pageable pageable) {
        User currentUser = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        if (!currentUser.isProfileComplete()) {
            throw new BadRequestException("Debes completar tu perfil antes de ver sugerencias");
        }

        // Obtener usuarios compatibles con paginación optimizada
        Page<User> suggestedUsers = userRepository.findCompatibleUsersOptimized(
            currentUser.getId(),
            currentUser.getCategoryInterest() != null ? currentUser.getCategoryInterest().getId() : null,
            currentUser.getAgePreferenceMin(),
            currentUser.getAgePreferenceMax(),
            currentUser.getCity(),
            currentUser.getDepartment(),
            pageable
        );

        logger.logMatching(userEmail, "suggestions", (int) suggestedUsers.getTotalElements(),
            Map.of("page", pageable.getPageNumber(), "level", includeLevel));

        // Determinar nivel apropiado para sugerencias (máximo BASIC por seguridad)
        UserResponseLevel level = UserResponseLevel.fromString(includeLevel, UserResponseLevel.PUBLIC);
        if (level.ordinal() > UserResponseLevel.BASIC.ordinal()) {
            level = UserResponseLevel.BASIC;
        }

        final UserResponseLevel finalLevel = level;
        return suggestedUsers.map(user -> UserResponseFactory.create(user, finalLevel));
    }

    // ========================================
    // MÉTODOS DE ACTUALIZACIÓN
    // ========================================

    /**
     * Actualiza un usuario mediante actualización parcial (delegación a partialUpdate).
     * <p>
     * Este método es un wrapper conveniente que mantiene compatibilidad con código
     * legacy que esperaba un método update(). Internamente delega toda la lógica
     * al método {@link #partialUpdate(String, UserPartialUpdateDTO)}.
     * <p>
     * Cache: Invalida automáticamente los caches relacionados al usuario:
     * - userProfiles: Perfiles en diferentes niveles
     * - userSuggestions: Sugerencias donde aparece el usuario
     * - userMetrics: Métricas y estadísticas del usuario
     *
     * @param email Email del usuario a actualizar
     * @param userRequestDTO DTO con los campos a actualizar (solo campos no-null serán actualizados)
     * @return DTO con la información actualizada del usuario
     * @throws UnauthorizedException Si el usuario no existe
     * @throws BadRequestException Si no se envían campos para actualizar
     */
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
     * <p>
     * La lógica de aplicación de cambios está centralizada en {@link UserDTOMapper#applyPartialUpdate}
     * para mantener consistencia y evitar duplicación de código.
     * <p>
     * Cache: Invalida múltiples caches relacionados automáticamente.
     *
     * @param email          Email del usuario a actualizar
     * @param userRequestDTO DTO con los campos a actualizar (solo campos no-null)
     * @return DTO con la información completa actualizada del usuario
     * @throws UnauthorizedException Si el usuario no existe
     * @throws BadRequestException   Si el DTO está vacío (sin campos para actualizar)
     */
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(
        value = {"userProfiles", "userSuggestions", "userMetrics"},
        key = "#email",
        allEntries = false
    )
    public UserResponseDTO update(String email, UserPartialUpdateDTO userRequestDTO) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        if (!userRequestDTO.hasAnyUpdate()) {
            throw new BadRequestException("No se enviaron campos para actualizar");
        }

        // Aplicar actualizaciones usando el mapper centralizado
        UserDTOMapper.applyPartialUpdate(user, userRequestDTO, userAttributeService, passwordEncoder);

        User savedUser = userRepository.save(user);
        logger.logUserOperation("user_partial_updated", email,
            Map.of("fields_updated", userRequestDTO.countUpdates()));

        return new UserResponseDTO(savedUser);
    }

    /**
     * Sube y procesa imágenes del perfil del usuario.
     * <p>
     * Maneja la subida de múltiples imágenes de perfil con las siguientes características:
     * - Validación automática de formato y tamaño (delegada a StorageService)
     * - Almacenamiento en bucket "profiles"
     * - Reemplazo completo de imágenes anteriores
     * - Recálculo automático de completitud de perfil
     * - Invalidación de caches relacionados
     * <p>
     * Límites y validaciones:
     * - Formatos soportados: JPEG, PNG, WEBP (configurado en StorageService)
     * - Tamaño máximo por imagen: Configurado en application.properties
     * - Número máximo de imágenes: Sin límite directo (considerar UX)
     * <p>
     * Manejo de errores:
     * - Rollback transaccional si falla la subida
     * - Logging detallado del error para troubleshooting
     * - Mensaje de error user-friendly
     *
     * @param email  Email del usuario que sube las imágenes
     * @param images Lista de archivos MultipartFile con las imágenes
     * @return DTO con la información actualizada del usuario incluyendo URLs de imágenes
     * @throws UnauthorizedException Si el usuario no existe
     * @throws IOException           Si ocurre un error durante la subida o procesamiento
     */
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(
        value = {"userProfiles", "userSuggestions", "userMetrics"},
        key = "#email",
        allEntries = false
    )
    public UserResponseDTO uploadImages(String email, List<MultipartFile> images) throws IOException {
        logger.info("Subiendo imágenes de usuario", Map.of("email", email, "count", images.size()));

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        try {
            List<String> imageUrls = storageService.uploadImages(images, "profiles");
            if (!imageUrls.isEmpty()) {
                user.setImages(imageUrls);
                user.setProfileComplete(user.isProfileComplete());
                userRepository.save(user);
                logger.logUserOperation("user_images_uploaded", email,
                    Map.of("images_count", imageUrls.size()));
            }
        } catch (Exception e) {
            logger.error("Error al subir imágenes de perfil", Map.of("email", email), e);
            throw new IOException("Error al subir imágenes de perfil: " + e.getMessage(), e);
        }

        return new UserResponseDTO(user);
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
    // SISTEMA DE APROBACIÓN Y MODERACIÓN
    // ========================================

    /**
     * Aprueba un usuario permitiéndole acceso completo a la plataforma.
     * <p>
     * Este método implementa el flujo de aprobación de usuarios con las siguientes etapas:
     * 1. Validación de perfil completo (requisito obligatorio para aprobación)
     * 2. Cambio de estado a APPROVED (método {@link User#approve()})
     * 3. Invalidación de cache para reflejar cambios inmediatamente
     * 4. Envío de email de bienvenida (no bloqueante, fallo se registra pero no rompe flujo)
     * 5. Logging de auditoría
     * <p>
     * Requisitos previos:
     * - El usuario debe tener su perfil 100% completo según {@link User#isProfileComplete()}
     * - El perfil completo incluye: datos básicos, imágenes, características, preferencias, etc.
     * <p>
     * Efectos de la aprobación:
     * - El usuario puede usar todas las funcionalidades de la plataforma
     * - Aparece en búsquedas y sugerencias para otros usuarios
     * - Recibe notificaciones de matches y eventos
     * - Puede enviar likes y crear matches
     * <p>
     * Optimización: Se usa {@code findByIdWithTags} para cargar tags en la misma query
     * y evitar N+1 en caso de que se necesiten posteriormente.
     *
     * @param userId ID del usuario a aprobar (como String)
     * @return Mensaje de confirmación de aprobación exitosa
     * @throws NotFoundException   Si el usuario no existe
     * @throws BadRequestException Si el perfil del usuario no está completo
     */
    @Transactional
    public MessageResponseDTO approveUser(String userId) {
        User user = userRepository.findByIdWithTags(Long.valueOf(userId))
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        if (!user.isProfileComplete()) {
            throw new BadRequestException("El usuario debe completar su perfil antes de ser aprobado");
        }

        user.approve();
        userRepository.save(user);

        // Invalidar cache para reflejar cambios inmediatamente
        cachedUserService.evictUserCache(user.getEmail());

        // Enviar email de bienvenida (no bloqueante)
        sendApprovalEmail(user);

        logger.logUserOperation("user_approved", user.getEmail(),
            Map.of("approvalStatus", user.getApprovalStatus().name()));

        return new MessageResponseDTO("Usuario aprobado correctamente");
    }

    /**
     * Envía email de bienvenida personalizado a usuario recién aprobado.
     * <p>
     * Email personalizado según proveedor de autenticación:
     * - Usuarios OAuth (Google, Facebook): Incluye su avatar externo
     * - Usuarios locales: Email estándar de bienvenida
     * <p>
     * Manejo de errores:
     * - Los fallos en el envío se registran como WARNING (no ERROR)
     * - No lanzan excepción para evitar romper el flujo de aprobación
     * - El usuario queda aprobado incluso si el email falla
     * <p>
     * Este comportamiento es intencional ya que la aprobación del usuario
     * es más crítica que el envío del email de bienvenida.
     *
     * @param user Usuario aprobado al que se le enviará el email
     */
    private void sendApprovalEmail(User user) {
        try {
            boolean isGoogleUser = user.getUserAuthProvider() == AuthProvider.GOOGLE;
            emailService.sendWelcomeEmailForApprovedUser(
                user.getEmail(),
                user.getName() + " " + user.getLastName(),
                isGoogleUser,
                isGoogleUser ? user.getExternalAvatarUrl() : null
            );
            logger.logUserOperation("approval_welcome_email_sent", user.getEmail(),
                Map.of("provider", user.getUserAuthProvider().toString()));
        } catch (Exception e) {
            logger.warn("Error al enviar email de bienvenida de aprobación",
                Map.of("userEmail", user.getEmail(), "error", e.getMessage()));
        }
    }


    // ========================================
    // CONSULTAS FILTRADAS POR ESTADO
    // ========================================

    /**
     * Obtiene usuarios pendientes de aprobación con búsqueda opcional.
     * <p>
     * Filtra usuarios con estado {@code ApprovalStatus.PENDING} que han completado
     * su registro pero aún no han sido aprobados por un administrador.
     * <p>
     * Si se proporciona un término de búsqueda, filtra adicionalmente por:
     * - Nombre y apellido
     * - Email
     * - Descripción
     *
     * @param pageable   Configuración de paginación y ordenamiento
     * @param searchTerm Término de búsqueda opcional (null o vacío para todos)
     * @return Página de usuarios pendientes de aprobación
     */
    public Page<UserResponseDTO> getPendingApprovalUsers(Pageable pageable, String searchTerm) {
        Page<User> pendingUsers = (searchTerm != null && !searchTerm.trim().isEmpty())
            ? userRepository.findPendingApprovalUsersWithSearch(searchTerm.trim(), pageable)
            : userRepository.findPendingApprovalUsers(pageable);

        logger.info("Usuarios pendientes de aprobación encontrados", Map.of(
            "searchTerm", searchTerm != null ? searchTerm : "N/A",
            "page", pageable.getPageNumber(),
            "size", pageable.getPageSize(),
            "total", pendingUsers.getTotalElements()));

        return pendingUsers.map(UserResponseDTO::new);
    }

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
        Page<User> activeUsers = (searchTerm != null && !searchTerm.trim().isEmpty())
            ? userRepository.findActiveUsersWithSearch(searchTerm.trim(), pageable)
            : userRepository.findActiveUsers(pageable);

        logger.info("Usuarios activos encontrados", Map.of(
            "searchTerm", searchTerm != null ? searchTerm : "N/A",
            "page", pageable.getPageNumber(),
            "size", pageable.getPageSize(),
            "total", activeUsers.getTotalElements()));

        return activeUsers.map(UserResponseDTO::new);
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
        Page<User> unverifiedUsers = (searchTerm != null && !searchTerm.trim().isEmpty())
            ? userRepository.findUnverifiedUsersWithSearch(searchTerm.trim(), pageable)
            : userRepository.findUnverifiedUsers(pageable);

        logger.info("Usuarios con email no verificado encontrados", Map.of(
            "searchTerm", searchTerm != null ? searchTerm : "N/A",
            "page", pageable.getPageNumber(),
            "size", pageable.getPageSize(),
            "total", unverifiedUsers.getTotalElements()));

        return unverifiedUsers.map(UserResponseDTO::new);
    }

    /**
     * Obtiene usuarios no aprobados (rechazados) con búsqueda opcional.
     * <p>
     * Filtra usuarios con estado {@code ApprovalStatus.REJECTED}.
     * Estos usuarios:
     * - Fueron explícitamente rechazados por un administrador
     * - No pueden acceder a funcionalidades de matching
     * - Pueden ser revisados para posible reactivación
     * <p>
     * Diferente de "pending" - estos fueron evaluados y rechazados.
     *
     * @param pageable   Configuración de paginación y ordenamiento
     * @param searchTerm Término de búsqueda opcional (null o vacío para todos)
     * @return Página de usuarios rechazados
     */
    public Page<UserResponseDTO> getNonApprovedUsers(Pageable pageable, String searchTerm) {
        Page<User> nonApprovedUsers = (searchTerm != null && !searchTerm.trim().isEmpty())
            ? userRepository.findNonApprovedUsersWithSearch(searchTerm.trim(), pageable)
            : userRepository.findNonApprovedUsers(pageable);

        logger.info("Usuarios no aprobados encontrados", Map.of(
            "searchTerm", searchTerm != null ? searchTerm : "N/A",
            "page", pageable.getPageNumber(),
            "size", pageable.getPageSize(),
            "total", nonApprovedUsers.getTotalElements()));

        return nonApprovedUsers.map(UserResponseDTO::new);
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
        Page<User> deactivatedUsers = (searchTerm != null && !searchTerm.trim().isEmpty())
            ? userRepository.findDeactivatedUsersWithSearch(searchTerm.trim(), pageable)
            : userRepository.findDeactivatedUsers(pageable);

        logger.info("Usuarios desactivados encontrados", Map.of(
            "searchTerm", searchTerm != null ? searchTerm : "N/A",
            "page", pageable.getPageNumber(),
            "size", pageable.getPageSize(),
            "total", deactivatedUsers.getTotalElements()));

        return deactivatedUsers.map(UserResponseDTO::new);
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
        Page<User> users = (searchTerm != null && !searchTerm.trim().isEmpty())
            ? userRepository.findIncompleteProfileUsersWithSearch(searchTerm.trim(), pageable)
            : userRepository.findIncompleteProfileUsers(pageable);

        logger.info("Usuarios con perfil incompleto encontrados", Map.of(
            "searchTerm", searchTerm != null ? searchTerm : "N/A",
            "page", pageable.getPageNumber(),
            "size", pageable.getPageSize(),
            "total", users.getTotalElements()));

        return users.map(UserResponseDTO::new);
    }

    /**
     * Envía email recordatorio a un usuario para completar su perfil.
     * <p>
     * Validaciones previas al envío:
     * - El usuario debe existir
     * - El usuario NO debe estar ya aprobado
     * - El perfil NO debe estar ya completo
     * <p>
     * Si las validaciones fallan, retorna false y registra un warning.
     * Si las validaciones pasan, delega el envío a {@link EmailService#sendProfileCompletionReminder}
     * <p>
     * Casos de uso:
     * - Operación batch desde panel admin
     * - Recordatorios automáticos programados
     * - Seguimiento manual de usuarios inactivos
     *
     * @param userId ID del usuario que recibirá el recordatorio
     * @return true si el email se envió exitosamente, false si se omitió por validación
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional(readOnly = true)
    public boolean sendProfileCompletionReminder(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + userId));

        // Verificar que el usuario realmente necesita completar el perfil
        if (user.isApproved() || user.isProfileComplete()) {
            logger.warn("El usuario ya está aprobado o tiene perfil completo: " + user.getEmail());
            return false;
        }

        // Enviar correo
        emailService.sendProfileCompletionReminder(user);

        logger.logUserOperation("profile_completion_reminder_sent", user.getEmail(), null);
        return true;
    }


    // ========================================
    // MÉTODOS DE ANALYTICS Y MÉTRICAS
    // ========================================

    /**
     * Obtiene vista general (overview) de analytics de usuarios del sistema.
     * <p>
     * Proporciona un dashboard resumido con las métricas clave:
     * - Total de usuarios registrados
     * - Usuarios activos (aprobados + perfil completo + verificados)
     * - Usuarios pendientes de aprobación
     * - Usuarios con perfil incompleto
     * - Usuarios no verificados
     * - Usuarios rechazados
     * - Usuarios con cuenta desactivada
     * <p>
     * Optimización: Cada métrica usa count queries específicas optimizadas
     * con índices en las columnas relevantes.
     * <p>
     * Casos de uso:
     * - Dashboard principal de administración
     * - Reporting y KPIs
     * - Monitoreo de salud del sistema
     *
     * @return DTO con overview completo de métricas de usuarios
     */
    @Transactional(readOnly = true)
    public AnalyticsOverviewDTO getAnalyticsOverview() {
        logger.info("Generando overview de analytics de usuarios");

        AnalyticsOverviewDTO overview = new AnalyticsOverviewDTO(
            userRepository.count(),
            userRepository.countActiveUsers(),
            userRepository.countByPendingApproval(),
            userRepository.countByProfileCompleteFalse(),
            userRepository.countByVerifiedFalse(),
            userRepository.countByRejected(),
            userRepository.countDeactivatedUsers()
        );

        logger.info("Analytics overview generado exitosamente", Map.of(
            "total_users", overview.total(),
            "active_users", overview.active()
        ));

        return overview;
    }

    /**
     * Obtiene métricas detalladas de un usuario específico.
     * <p>
     * Retorna métricas sociales y de engagement del usuario:
     * - Número de matches activos
     * - Visualizaciones de perfil recibidas
     * - Likes enviados y recibidos
     * - Favoritos agregados
     * - Score de popularidad calculado
     * - Estadísticas de actividad reciente
     * <p>
     * La conversión a DTO se realiza mediante {@link UserDTOMapper#toUserMetricsDTO}
     * que extrae y formatea todas las métricas relevantes del usuario.
     * <p>
     * Casos de uso:
     * - Perfil detallado de usuario para administradores
     * - Analytics personalizados por usuario
     * - Investigación de patrones de uso
     *
     * @param userId ID del usuario
     * @return DTO con métricas detalladas del usuario
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional(readOnly = true)
    public UserMetricsDTO getUserDetailedMetrics(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + userId));

        logger.logUserOperation("user_metrics_retrieved", user.getEmail(),
            Map.of("userId", userId));

        return UserDTOMapper.toUserMetricsDTO(user);
    }

    /**
     * Genera distribución geográfica de usuarios por país y ciudad.
     * <p>
     * Retorna dos mapas ordenados:
     * 1. Usuarios por país (todos los países con al menos 1 usuario)
     * 2. Usuarios por ciudad (todas las ciudades con al menos 1 usuario)
     * 3. Top 5 países con más usuarios
     * 4. Top 5 ciudades con más usuarios
     * <p>
     * Los mapas están ordenados por cantidad de usuarios (descendente).
     * <p>
     * Optimización:
     * - Usa queries GROUP BY optimizadas con índices en country y city
     * - Recolecta en LinkedHashMap para mantener orden
     * - Filtra top 5 con stream().limit(5)
     * <p>
     * Casos de uso:
     * - Visualización de mapas de calor
     * - Identificación de mercados principales
     * - Estrategias de expansión geográfica
     * - Marketing local izado
     *
     * @return DTO con distribución geográfica completa y tops
     */
    @Transactional(readOnly = true)
    public GeographicDistributionDTO getGeographicDistribution() {
        logger.info("Generando distribución geográfica de usuarios");

        // Distribución por países
        Map<String, Long> usersByCountry = userRepository.getUserCountByCountry().stream()
            .collect(Collectors.toMap(
                row -> (String) row[0],
                row -> (Long) row[1],
                (v1, v2) -> v1,
                LinkedHashMap::new
            ));

        // Distribución por ciudades
        Map<String, Long> usersByCity = userRepository.getUserCountByCity().stream()
            .collect(Collectors.toMap(
                row -> (String) row[0],
                row -> (Long) row[1],
                (v1, v2) -> v1,
                LinkedHashMap::new
            ));

        // Top 5 de cada categoría
        Map<String, Long> topCountries = usersByCountry.entrySet().stream()
            .limit(5)
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                Map.Entry::getValue,
                (v1, v2) -> v1,
                LinkedHashMap::new
            ));

        Map<String, Long> topCities = usersByCity.entrySet().stream()
            .limit(5)
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                Map.Entry::getValue,
                (v1, v2) -> v1,
                LinkedHashMap::new
            ));

        var topLocations = new GeographicDistributionDTO.TopLocationsDTO(topCountries, topCities);
        var distribution = new GeographicDistributionDTO(usersByCountry, usersByCity, topLocations);

        logger.info("Distribución geográfica generada", Map.of(
            "total_countries", usersByCountry.size(),
            "total_cities", usersByCity.size()
        ));

        return distribution;
    }

    /**
     * Genera estadísticas de engagement y activación de usuarios.
     * <p>
     * Calcula y retorna:
     * - Total de usuarios registrados
     * - Total de usuarios verificados
     * - Total de usuarios con perfil completo
     * - Tasa promedio de verificación de email (%)
     * - Tasa promedio de completitud de perfil (%)
     * <p>
     * Las tasas se calculan en {@link EngagementStatsDTO#from} como porcentajes
     * redondeados con precisión de 2 decimales.
     * <p>
     * Casos de uso:
     * - KPIs de engagement para reporting ejecutivo
     * - Identificación de cuellos de botella en onboarding
     * - Monitoreo de tasas de conversión registro → usuario activo
     *
     * @return DTO con estadísticas de engagement y tasas calculadas
     */
    @Transactional(readOnly = true)
    public EngagementStatsDTO getEngagementStats() {
        logger.info("Generando estadísticas de engagement");

        Long totalUsers = userRepository.count();
        Long verifiedUsers = userRepository.countByVerifiedTrue();
        Long completeProfiles = userRepository.countByProfileCompleteTrue();

        EngagementStatsDTO stats = EngagementStatsDTO.from(totalUsers, verifiedUsers, completeProfiles);

        logger.info("Estadísticas de engagement generadas", Map.of(
            "total_users", totalUsers,
            "verification_rate", stats.averageVerificationRate() + "%",
            "completion_rate", stats.averageCompletionRate() + "%"
        ));

        return stats;
    }

    /**
     * Genera ranking de top usuarios según múltiples criterios.
     * <p>
     * Retorna tres rankings independientes:
     * 1. Top por popularityScore (score compuesto de métricas sociales)
     * 2. Top por matchesCount (mayor número de matches exitosos)
     * 3. Top por profileViews (perfiles más visitados)
     * <p>
     * Cada ranking incluye hasta `limit` usuarios (máximo 100, mínimo 1).
     * Los usuarios se ordenan descendentemente por su métrica respectiva.
     * <p>
     * Optimización:
     * - Carga todos los usuarios en memoria (⚠️ considerar para bases de datos grandes)
     * - Filtra solo usuarios con valores > 0 en la métrica
     * - Usa sorted + limit en streams para eficiencia
     * <p>
     * ⚠️ NOTA: Este método carga TODOS los usuarios. Para sistemas con millones
     * de usuarios, considerar implementación con queries nativas LIMIT.
     *
     * @param limit Número máximo de usuarios por ranking (validado entre 1-100)
     * @return DTO con tres rankings de top usuarios
     */
    @Transactional(readOnly = true)
    public TopUsersDTO getTopUsers(int limit) {
        logger.info("Generando ranking de top usuarios", Map.of("limit", limit));

        // Validar límite
        int validLimit = Math.max(1, Math.min(limit, 100));

        // Obtener todos los usuarios activos y ordenarlos
        List<User> allUsers = userRepository.findAll();

        // Top por popularidad (popularityScore)
        List<TopUsersDTO.TopUserDTO> topByPopularity = allUsers.stream()
            .filter(u -> u.getPopularityScore() != null && u.getPopularityScore() > 0)
            .sorted((u1, u2) -> Double.compare(
                u2.getPopularityScore() != null ? u2.getPopularityScore() : 0.0,
                u1.getPopularityScore() != null ? u1.getPopularityScore() : 0.0))
            .limit(validLimit)
            .map(u -> new TopUsersDTO.TopUserDTO(
                u.getId(),
                u.getName() + " " + u.getLastName(),
                u.getEmail(),
                u.getPopularityScore() != null ? u.getPopularityScore().longValue() : 0L,
                u.getPopularityScore()
            ))
            .toList();

        // Top por matches
        List<TopUsersDTO.TopUserDTO> topByMatches = allUsers.stream()
            .filter(u -> u.getMatchesCount() != null && u.getMatchesCount() > 0)
            .sorted((u1, u2) -> Long.compare(
                u2.getMatchesCount() != null ? u2.getMatchesCount() : 0L,
                u1.getMatchesCount() != null ? u1.getMatchesCount() : 0L))
            .limit(validLimit)
            .map(u -> new TopUsersDTO.TopUserDTO(
                u.getId(),
                u.getName() + " " + u.getLastName(),
                u.getEmail(),
                u.getMatchesCount() != null ? u.getMatchesCount() : 0L,
                u.getPopularityScore()
            ))
            .toList();

        // Top por vistas de perfil
        List<TopUsersDTO.TopUserDTO> topByProfileViews = allUsers.stream()
            .filter(u -> u.getProfileViews() != null && u.getProfileViews() > 0)
            .sorted((u1, u2) -> Long.compare(
                u2.getProfileViews() != null ? u2.getProfileViews() : 0L,
                u1.getProfileViews() != null ? u1.getProfileViews() : 0L))
            .limit(validLimit)
            .map(u -> new TopUsersDTO.TopUserDTO(
                u.getId(),
                u.getName() + " " + u.getLastName(),
                u.getEmail(),
                u.getProfileViews() != null ? u.getProfileViews() : 0L,
                u.getPopularityScore()
            ))
            .toList();

        logger.info("Ranking de top usuarios generado", Map.of(
            "limit", validLimit,
            "top_popularity_count", topByPopularity.size(),
            "top_matches_count", topByMatches.size(),
            "top_views_count", topByProfileViews.size()
        ));

        return new TopUsersDTO(topByPopularity, topByMatches, topByProfileViews, validLimit);
    }

    /**
     * Genera estadísticas de crecimiento y retención de usuarios.
     * <p>
     * Calcula métricas temporales de crecimiento:
     * - Nuevos usuarios en últimas 24 horas
     * - Nuevos usuarios en últimos 7 días
     * - Nuevos usuarios en últimos 30 días
     * - Usuarios activos en últimos 7 días
     * - Usuarios activos en últimos 30 días
     * - Tasas de retención calculadas (7 días y 30 días)
     * <p>
     * Retención se calcula como: (usuarios activos / usuarios totales) * 100
     * <p>
     * Optimización: Usa queries con filtro temporal optimizado con índice en created_at
     *
     * @param period Parámetro de período (actualmente no utilizado, reservado para futuro)
     * @return DTO con estadísticas de crecimiento y retención
     */
    @Transactional(readOnly = true)
    public GrowthStatsDTO getGrowthStats(String period) {
        logger.info("Generando estadísticas de crecimiento", Map.of("period", period != null ? period : "default"));

        LocalDateTime now = LocalDateTime.now();

        // Estadísticas de crecimiento
        Long usersLast24Hours = userRepository.countNewUsersSince(now.minusDays(1));
        Long usersLast7Days = userRepository.countNewUsersSince(now.minusDays(7));
        Long usersLast30Days = userRepository.countNewUsersSince(now.minusDays(30));

        // Retención
        Long activeUsersLast7Days = userRepository.countActiveUsersSince(now.minusDays(7));
        Long activeUsersLast30Days = userRepository.countActiveUsersSince(now.minusDays(30));

        Long totalUsers = userRepository.count();

        GrowthStatsDTO stats = GrowthStatsDTO.from(
            usersLast24Hours,
            usersLast7Days,
            usersLast30Days,
            activeUsersLast7Days,
            activeUsersLast30Days,
            totalUsers
        );

        logger.info("Estadísticas de crecimiento generadas", Map.of(
            "new_users_7d", usersLast7Days,
            "new_users_30d", usersLast30Days,
            "retention_7d", stats.retentionRate7Days() + "%",
            "retention_30d", stats.retentionRate30Days() + "%"
        ));

        return stats;
    }

    /**
     * Obtiene contadores para las pestañas del panel de administración.
     * <p>
     * Retorna contadores para cada vista/pestaña del panel admin:
     * - active: Usuarios aprobados, verificados y con perfil completo
     * - pending: Usuarios pendientes de aprobación
     * - incomplete: Usuarios con perfil incompleto
     * - unverified: Usuarios con email no verificado
     * - nonApproved: Usuarios rechazados
     * - rejected: Usuarios rechazados (igual a nonApproved)
     * - deactivated: Usuarios con cuenta desactivada
     * - total: Total de usuarios en el sistema
     * <p>
     * Usado para mostrar badges con contadores en cada pestaña del panel admin.
     *
     * @return DTO con contadores para cada pestaña
     */
    @Transactional(readOnly = true)
    public UserTabsCountDTO getUserTabsCount() {
        logger.info("Calculando conteos de pestañas de usuarios");

        Long activeCount = userRepository.countActiveUsers();
        Long pendingCount = userRepository.countByPendingApproval();
        Long incompleteCount = userRepository.countByProfileCompleteFalse();
        Long unverifiedCount = userRepository.countByVerifiedFalse();
        Long nonApprovedCount = userRepository.countByRejected();
        Long deactivatedCount = userRepository.countDeactivatedUsers();
        Long totalUsers = userRepository.count();

        UserTabsCountDTO tabsCounts = new UserTabsCountDTO(
            activeCount,
            pendingCount,
            incompleteCount,
            unverifiedCount,
            nonApprovedCount,
            nonApprovedCount,  // rejected es igual a nonApproved
            deactivatedCount,
            totalUsers
        );

        logger.info("Conteos de pestañas calculados", Map.of(
            "total", totalUsers,
            "active", activeCount,
            "pending", pendingCount,
            "incomplete", incompleteCount
        ));

        return tabsCounts;
    }

    // ========================================
    // MÉTODOS ADICIONALES
    // ========================================

    /**
     * Calcula compatibilidad entre dos usuarios con algoritmo ponderado multi-factor.
     * <p>
     * Algoritmo de compatibilidad con 4 factores ponderados:
     * 1. Categoría de interés (40%): Debe coincidir exactamente
     * 2. Edad (20%): Menor diferencia = mayor score
     * - Excelente: ≤2 años diferencia (100%)
     * - Buena: 3-5 años diferencia (75%)
     * - Aceptable: 6-10 años diferencia (50%)
     * - Baja: >10 años diferencia (0%)
     * 3. Ubicación (20%):
     * - Misma ciudad: 100%
     * - Mismo país: 50%
     * - Diferente país: 0%
     * 4. Tags comunes (20%): Placeholder (actualmente 50% fijo)
     * <p>
     * Score total = suma de factores ponderados, máximo 1.0 (100%)
     * <p>
     * Retorna desglose completo con score por factor y match description.
     *
     * @param currentUserEmail Email del usuario que solicita el cálculo
     * @param otherUserEmail   Email del usuario objetivo
     * @return DTO con compatibilidad total, porcentaje y desglose por factores
     * @throws NotFoundException Si alguno de los usuarios no existe
     */
    @Transactional(readOnly = true)
    public UserCompatibilityDTO calculateUserCompatibility(String currentUserEmail, String otherUserEmail) {
        logger.info("Calculando compatibilidad entre usuarios", Map.of(
            "current_user", currentUserEmail,
            "other_user", otherUserEmail
        ));

        User currentUser = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new NotFoundException("Usuario actual no encontrado"));
        User otherUser = userRepository.findByEmail(otherUserEmail)
            .orElseThrow(() -> new NotFoundException("Otro usuario no encontrado"));

        // Pesos de compatibilidad (constantes)
        final double CATEGORY_WEIGHT = 0.4;
        final double AGE_WEIGHT = 0.2;
        final double LOCATION_WEIGHT = 0.2;
        final double TAGS_WEIGHT = 0.2;

        double totalCompatibility = 0.0;
        double categoryScore = 0.0;
        double ageScore = 0.0;
        double locationScore = 0.0;
        double tagsScore = 0.0;

        String categoryMatch = "Sin coincidencia";
        String ageMatch = "Sin coincidencia";
        String locationMatch = "Sin coincidencia";
        String tagsMatch = "Coincidencia parcial";

        // Factor 1: Misma categoría de interés (40%)
        if (currentUser.getCategoryInterest() != null && otherUser.getCategoryInterest() != null) {
            if (currentUser.getCategoryInterest().equals(otherUser.getCategoryInterest())) {
                categoryScore = CATEGORY_WEIGHT;
                categoryMatch = "Coincidencia perfecta - " + currentUser.getCategoryInterest().getName();
            }
        }

        // Factor 2: Rango de edad similar (20%)
        if (currentUser.getDateOfBirth() != null && otherUser.getDateOfBirth() != null) {
            int ageDifference = Math.abs(currentUser.getAge() - otherUser.getAge());

            if (ageDifference <= 2) {
                ageScore = AGE_WEIGHT;
                ageMatch = "Excelente - " + ageDifference + (ageDifference == 1 ? " año de diferencia" : " años de diferencia");
            } else if (ageDifference <= 5) {
                ageScore = AGE_WEIGHT * 0.75;
                ageMatch = "Buena - " + ageDifference + " años de diferencia";
            } else if (ageDifference <= 10) {
                ageScore = AGE_WEIGHT * 0.5;
                ageMatch = "Aceptable - " + ageDifference + " años de diferencia";
            } else {
                ageMatch = "Baja - " + ageDifference + " años de diferencia";
            }
        }

        // Factor 3: Ubicación (20%)
        if (currentUser.getCity() != null && otherUser.getCity() != null) {
            if (currentUser.getCity().equals(otherUser.getCity())) {
                locationScore = LOCATION_WEIGHT;
                locationMatch = "Misma ciudad - " + currentUser.getCity();
            } else if (currentUser.getCountry() != null && otherUser.getCountry() != null &&
                currentUser.getCountry().equals(otherUser.getCountry())) {
                locationScore = LOCATION_WEIGHT * 0.5;
                locationMatch = "Mismo país - " + currentUser.getCountry();
            } else if (currentUser.getCountry() != null && otherUser.getCountry() != null) {
                locationMatch = "Diferente país";
            }
        }

        // Factor 4: Tags comunes (20%) - Placeholder
        tagsScore = TAGS_WEIGHT * 0.5;

        // Total
        totalCompatibility = categoryScore + ageScore + locationScore + tagsScore;
        totalCompatibility = Math.min(1.0, totalCompatibility);

        UserCompatibilityDTO result = UserCompatibilityDTO.from(
            totalCompatibility,
            categoryScore,
            ageScore,
            locationScore,
            tagsScore,
            categoryMatch,
            ageMatch,
            locationMatch,
            tagsMatch
        );

        logger.info("Compatibilidad calculada", Map.of(
            "current_user", currentUserEmail,
            "other_user", otherUserEmail,
            "total_percentage", result.totalPercentage() + "%",
            "category", String.format("%.0f%%", categoryScore * 100),
            "age", String.format("%.0f%%", ageScore * 100),
            "location", String.format("%.0f%%", locationScore * 100)
        ));

        return result;
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
     * - "incomplete-profiles": Perfil incompleto
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
        Page<User> users = switch (status.toLowerCase()) {
            case "active" -> search != null && !search.trim().isEmpty() ?
                userRepository.findActiveUsersWithSearch(search, pageable) :
                userRepository.findActiveUsers(pageable);
            case "pending-approval" -> search != null && !search.trim().isEmpty() ?
                userRepository.findPendingApprovalUsersWithSearch(search, pageable) :
                userRepository.findPendingApprovalUsers(pageable);
            case "unverified" -> search != null && !search.trim().isEmpty() ?
                userRepository.findUnverifiedUsersWithSearch(search, pageable) :
                userRepository.findUnverifiedUsers(pageable);
            case "non-approved" -> search != null && !search.trim().isEmpty() ?
                userRepository.findNonApprovedUsersWithSearch(search, pageable) :
                userRepository.findNonApprovedUsers(pageable);
            case "deactivated" -> search != null && !search.trim().isEmpty() ?
                userRepository.findDeactivatedUsersWithSearch(search, pageable) :
                userRepository.findDeactivatedUsers(pageable);
            case "incomplete-profiles" -> search != null && !search.trim().isEmpty() ?
                userRepository.findIncompleteProfileUsersWithSearch(search, pageable) :
                userRepository.findIncompleteProfileUsers(pageable);
            default -> throw new BadRequestException("Estado de usuario no válido: " + status);
        };

        return users.map(UserResponseDTO::new);
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
    // MÉTODOS HELPER PRIVADOS PARA OPERACIONES BATCH
    // ========================================
    /*
     * Esta sección contiene la infraestructura genérica reutilizable para operaciones
     * batch optimizadas. Estos helpers eliminan duplicación de código y garantizan
     * consistencia en el manejo de operaciones masivas.
     *
     * ARQUITECTURA DE BATCH OPERATIONS:
     * ==================================
     * Todos los métodos batch siguen el patrón:
     * 1. Fetch único con findAllById (evita N+1)
     * 2. Filtrado funcional con Predicates
     * 3. Aplicación de cambios con Consumers
     * 4. Guardado/eliminación en lote con saveAll/deleteAll
     * 5. Conteo detallado de resultados
     *
     * TIPOS DE RESULTADOS:
     * ====================
     * - BatchOperationResult: Para operaciones simples (aprobar, rechazar, activar)
     * - ExtendedBatchOperationResult: Para operaciones con usuarios protegidos (admin, eliminar)
     *
     * HELPERS DE VALIDACIÓN:
     * ======================
     * Los métodos canBeX() encapsulan lógica de negocio reutilizable entre
     * operaciones singulares y batch, garantizando consistencia.
     */

    /**
     * Record que encapsula el resultado de una operación batch estándar.
     * <p>
     * Contadores incluidos:
     * - updated: Usuarios que fueron modificados exitosamente
     * - alreadyInState: Usuarios que ya estaban en el estado objetivo (skip)
     * - failed: Usuarios solicitados que no existen en la base de datos
     *
     * @param updated        Número de usuarios actualizados
     * @param alreadyInState Número de usuarios que ya estaban en el estado correcto
     * @param failed         Número de IDs inválidos o no encontrados
     */
    private record BatchOperationResult(
        int updated,
        int alreadyInState,
        int failed
    ) {
    }

    /**
     * Ejecuta una operación batch genérica sobre usuarios con optimización anti-N+1.
     * <p>
     * Este helper implementa el patrón estándar de operaciones batch:
     * 1. Conversión de IDs String a Long
     * 2. Fetch único de todos los usuarios (findAllById)
     * 3. Stream pipeline: filter → peek(action) → collect
     * 4. Guardado masivo con saveAll
     * 5. Cálculo de métricas de resultado
     * <p>
     * Ventajas de este enfoque:
     * - Una sola query SELECT para obtener usuarios (anti-N+1)
     * - Una sola query UPDATE para guardar cambios (batch insert/update)
     * - Aplicación funcional de lógica de negocio
     * - Conteo preciso de resultados para feedback al usuario
     * <p>
     * Este método es utilizado por: approveUsersBatch, rejectUsersBatch,
     * deactivateAccountsBatch, reactivateAccountsBatch, grantAdminRoleBatch.
     *
     * @param userIds Lista de IDs de usuarios (como String)
     * @param filter  Predicado que determina si un usuario puede ser modificado
     * @param action  Consumer que aplica el cambio al usuario (ej: User::approve)
     * @return Resultado con conteo detallado de la operación
     */
    private BatchOperationResult executeBatchOperation(
        List<String> userIds,
        java.util.function.Predicate<User> filter,
        java.util.function.Consumer<User> action) {

        // Convertir IDs y buscar todos los usuarios de una vez (anti-N+1)
        List<Long> ids = userIds.stream()
            .map(Long::valueOf)
            .toList();

        List<User> users = userRepository.findAllById(ids);

        // Filtrar y aplicar acción en un solo stream pipeline
        List<User> usersToUpdate = users.stream()
            .filter(filter)
            .peek(action)
            .toList();

        // Guardar todos en lote (single UPDATE query)
        userRepository.saveAll(usersToUpdate);

        return new BatchOperationResult(
            usersToUpdate.size(),
            users.size() - usersToUpdate.size(),
            userIds.size() - users.size()
        );
    }

    /**
     * Record que encapsula el resultado de operaciones batch con protección.
     * <p>
     * Incluye un contador adicional para usuarios protegidos (como admin principal)
     * que no pueden ser modificados por razones de seguridad del sistema.
     *
     * @param updated        Número de usuarios actualizados
     * @param alreadyInState Número de usuarios que ya estaban en el estado correcto
     * @param protectedCount Número de usuarios protegidos que no pueden ser modificados
     * @param failed         Número de IDs inválidos o no encontrados
     */
    private record ExtendedBatchOperationResult(
        int updated,
        int alreadyInState,
        int protectedCount,
        int failed
    ) {
    }

    /**
     * Ejecuta operación batch con verificación de usuarios protegidos.
     * <p>
     * Similar a {@link #executeBatchOperation} pero incluye lógica adicional
     * para identificar y contar usuarios protegidos que no deben ser modificados.
     * <p>
     * Usuarios protegidos típicamente incluyen:
     * - Administrador principal del sistema (configurado en application.properties)
     * - Usuarios con flag protectedUser=true
     * <p>
     * Este método es utilizado por: revokeAdminRoleBatch y otras operaciones
     * que requieren protección especial contra modificación accidental.
     *
     * @param userIds          Lista de IDs de usuarios
     * @param filter           Predicado para determinar si un usuario puede ser modificado
     * @param action           Consumer que aplica el cambio
     * @param protectionFilter Predicado que identifica usuarios protegidos
     * @return Resultado extendido incluyendo contador de protegidos
     */
    private ExtendedBatchOperationResult executeBatchOperationWithProtection(
        List<String> userIds,
        java.util.function.Predicate<User> filter,
        java.util.function.Consumer<User> action,
        java.util.function.Predicate<User> protectionFilter) {

        List<Long> ids = userIds.stream()
            .map(Long::valueOf)
            .toList();

        List<User> users = userRepository.findAllById(ids);

        // Filtrar usando lógica compartida
        List<User> usersToUpdate = users.stream()
            .filter(filter)
            .peek(action)
            .toList();

        userRepository.saveAll(usersToUpdate);

        int protectedCount = (int) users.stream().filter(protectionFilter).count();
        int alreadyInState = users.size() - usersToUpdate.size() - protectedCount;

        return new ExtendedBatchOperationResult(
            usersToUpdate.size(),
            alreadyInState,
            protectedCount,
            userIds.size() - users.size()
        );
    }

    /**
     * Ejecuta operación batch de eliminación masiva de usuarios con protección.
     * <p>
     * Similar a otros helpers batch pero específico para eliminaciones:
     * - No tiene concepto de "alreadyInState" (siempre es 0)
     * - Usa deleteAll en lugar de saveAll
     * - El filter determina quiénes PUEDEN ser eliminados (admin nunca)
     * <p>
     * ⚠️ ADVERTENCIA: Operación irreversible, usar con precaución.
     *
     * @param userIds Lista de IDs de usuarios a eliminar
     * @param filter  Predicado que determina si un usuario puede ser eliminado
     * @return Resultado extendido (alreadyInState siempre es 0)
     */
    private ExtendedBatchOperationResult executeBatchDeletion(
        List<String> userIds,
        java.util.function.Predicate<User> filter) {

        List<Long> ids = userIds.stream()
            .map(Long::valueOf)
            .toList();

        List<User> users = userRepository.findAllById(ids);

        // Filtrar usuarios que pueden ser eliminados
        List<User> usersToDelete = users.stream()
            .filter(filter)
            .toList();

        // Eliminar todos en lote
        userRepository.deleteAll(usersToDelete);

        int protectedCount = users.size() - usersToDelete.size();

        return new ExtendedBatchOperationResult(
            usersToDelete.size(),
            0, // No hay "alreadyInState" para eliminación
            protectedCount,
            userIds.size() - users.size()
        );
    }

    // ========================================
    // VALIDADORES DE LÓGICA DE NEGOCIO
    // ========================================
    /*
     * Estos métodos encapsulan reglas de negocio reutilizables
     * entre operaciones singulares y batch. Garantizan que
     * ambos tipos de operaciones aplican las mismas validaciones.
     */

    /**
     * Determina si un usuario puede ser aprobado.
     * Un usuario solo puede aprobarse si no está ya aprobado.
     *
     * @param user Usuario a validar
     * @return true si el usuario puede ser aprobado
     */
    private boolean canBeApproved(User user) {
        return !user.isApproved();
    }

    /**
     * Determina si un usuario puede ser rechazado.
     * Un usuario solo puede rechazarse si no está ya rechazado.
     *
     * @param user Usuario a validar
     * @return true si el usuario puede ser rechazado
     */
    private boolean canBeRejected(User user) {
        return !user.isRejected();
    }

    /**
     * Determina si a un usuario se le puede otorgar rol de admin.
     * Solo usuarios que actualmente no son admin pueden recibir el rol.
     *
     * @param user Usuario a validar
     * @return true si el usuario puede recibir rol de admin
     */
    private boolean canGrantAdminRole(User user) {
        return !user.getUserRole().getUserRoleList().equals(UserRoleList.ADMIN);
    }

    /**
     * Determina si a un usuario se le puede revocar el rol de admin.
     * <p>
     * Condiciones:
     * 1. El usuario debe tener actualmente rol ADMIN
     * 2. El usuario NO debe ser el administrador principal del sistema
     *
     * @param user Usuario a validar
     * @return true si el rol de admin puede ser revocado
     */
    private boolean canRevokeAdminRole(User user) {
        return !user.getEmail().equals(this.adminEmail) &&
            user.getUserRole().getUserRoleList().equals(UserRoleList.ADMIN);
    }

    /**
     * Determina si una cuenta de usuario puede ser desactivada.
     * Solo cuentas actualmente activas pueden ser desactivadas.
     *
     * @param user Usuario a validar
     * @return true si la cuenta puede ser desactivada
     */
    private boolean canBeDeactivated(User user) {
        return !user.isAccountDeactivated();
    }

    /**
     * Determina si una cuenta de usuario puede ser reactivada.
     * Solo cuentas actualmente desactivadas pueden ser reactivadas.
     *
     * @param user Usuario a validar
     * @return true si la cuenta puede ser reactivada
     */
    private boolean canBeReactivated(User user) {
        return user.isAccountDeactivated();
    }

    /**
     * Determina si un usuario puede ser eliminado permanentemente.
     * <p>
     * Protección: El administrador principal nunca puede ser eliminado
     * para prevenir pérdida de acceso administrativo al sistema.
     *
     * @param user Usuario a validar
     * @return true si el usuario puede ser eliminado
     */
    private boolean canBeDeleted(User user) {
        return !user.getEmail().equals(this.adminEmail);
    }

    // ========================================
    // OPERACIONES BATCH PÚBLICAS - APROBACIÓN
    // ========================================

    /**
     * Revoca la aprobación de un usuario (operación singular).
     * <p>
     * Cambia el estado del usuario de APPROVED o PENDING a REJECTED.
     * Esta operación es reversible mediante {@link #resetUserApprovalToPending}.
     *
     * @param userId ID del usuario (como String)
     * @return Mensaje de confirmación o indicación si ya estaba rechazado
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional
    public MessageResponseDTO revokeUserApproval(String userId) {
        User user = userRepository.findById(Long.valueOf(userId))
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        if (!canBeRejected(user)) {
            return new MessageResponseDTO("El usuario ya está rechazado");
        }

        user.reject();
        userRepository.save(user);

        logger.logUserOperation("user_approval_revoked", user.getEmail(), Map.of("userId", userId));
        return new MessageResponseDTO("Aprobación de usuario revocada correctamente");
    }

    /**
     * Aprueba múltiples usuarios en una sola operación batch optimizada.
     * <p>
     * Utiliza {@link #executeBatchOperation} para:
     * - Fetch único de todos los usuarios (anti-N+1)
     * - Filtrado por {@link #canBeApproved}
     * - Aplicación de {@link User#approve()} a cada uno
     * - Guardado masivo con single UPDATE query
     * <p>
     * Retorna contadores detallados:
     * - approved: Usuarios aprobados exitosamente
     * - alreadyApproved: Usuarios que ya estaban aprobados (skipped)
     * - failed: IDs inválidos o no encontrados
     *
     * @param userIds Lista de IDs de usuarios a aprobar (como Strings)
     * @return Mensaje con resumen de la operación y contadores
     */
    @Transactional
    public MessageResponseDTO approveUsersBatch(List<String> userIds) {
        logger.info("Aprobando usuarios en lote", Map.of("totalRequested", userIds.size()));

        BatchOperationResult result = executeBatchOperation(userIds, this::canBeApproved, User::approve);

        logger.info("Operación de aprobación en lote completada",
            Map.of("approved", result.updated(), "alreadyApproved", result.alreadyInState(), "failed", result.failed()));

        String message = String.format("Operación completada: %d usuarios aprobados, %d ya estaban aprobados, %d fallos",
            result.updated(), result.alreadyInState(), result.failed());
        return new MessageResponseDTO(message);
    }

    /**
     * Rechaza múltiples usuarios en una sola operación batch optimizada.
     * <p>
     * Similar a {@link #approveUsersBatch} pero cambia estado a REJECTED.
     * Usa infraestructura batch compartida para consistencia y performance.
     *
     * @param userIds Lista de IDs de usuarios a rechazar
     * @return Mensaje con resumen de la operación y contadores
     */
    @Transactional
    public MessageResponseDTO rejectUsersBatch(List<String> userIds) {
        logger.info("Rechazando usuarios en lote", Map.of("totalRequested", userIds.size()));

        BatchOperationResult result = executeBatchOperation(userIds, this::canBeRejected, User::reject);

        logger.info("Operación de rechazo en lote completada",
            Map.of("rejected", result.updated(), "alreadyRejected", result.alreadyInState(), "failed", result.failed()));

        String message = String.format("Operación completada: %d usuarios rechazados, %d ya estaban rechazados, %d fallos",
            result.updated(), result.alreadyInState(), result.failed());
        return new MessageResponseDTO(message);
    }

    /**
     * Resetea el estado de aprobación de un usuario a PENDING.
     * <p>
     * Permite dar una "segunda oportunidad" a usuarios rechazados
     * o volver a evaluar usuarios aprobados.
     * <p>
     * Típicamente usado cuando:
     * - Se rechazó un usuario por error
     * - El usuario actualizó su perfil tras rechazo
     * - Se requiere re-evaluación administrativa
     *
     * @param userId ID del usuario a resetear (como String)
     * @return Mensaje de confirmación
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional
    public MessageResponseDTO resetUserApprovalToPending(String userId) {
        User user = userRepository.findById(Long.valueOf(userId))
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        user.setPending();
        userRepository.save(user);

        logger.logUserOperation("user_reset_to_pending", user.getEmail(), Map.of("userId", userId));
        return new MessageResponseDTO("Usuario reseteado a estado pendiente correctamente");
    }

    // ========================================
    // GESTIÓN DE ROLES - Operaciones Singulares
    // ========================================

    /**
     * Otorga rol de administrador a un usuario específico.
     * <p>
     * Proceso:
     * 1. Valida que el usuario no sea ya admin ({@link #canGrantAdminRole})
     * 2. Busca el rol ADMIN en base de datos
     * 3. Asigna el rol al usuario
     * 4. Registra operación en logs de auditoría
     * <p>
     * Seguridad:
     * - Autorización verificada en Controller con @PreAuthorize("hasRole('ADMIN')")
     * - Solo administradores pueden otorgar este rol
     * - El admin que otorga el rol queda registrado en logs
     * <p>
     * Efectos:
     * - El usuario obtiene acceso completo al panel de administración
     * - Puede moderar otros usuarios, aprobar/rechazar, ver analytics
     * - Puede otorgar/revocar roles (excepto al admin principal)
     *
     * @param adminEmail Email del administrador que otorga el rol (para auditoría)
     * @param userId     ID del usuario que recibirá rol admin
     * @return Mensaje de confirmación o indicación si ya era admin
     * @throws NotFoundException Si el usuario o el rol ADMIN no existen
     */
    @Transactional
    public MessageResponseDTO grantAdminRole(String adminEmail, String userId) {
        User user = userRepository.findById(Long.valueOf(userId))
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        // Usar lógica compartida
        if (!canGrantAdminRole(user)) {
            return new MessageResponseDTO("El usuario ya tiene rol de administrador");
        }

        UserRole adminRole = roleRepository.findByUserRoleList(UserRoleList.ADMIN)
            .orElseThrow(() -> new NotFoundException("Rol de administrador no encontrado"));

        user.setUserRole(adminRole);
        userRepository.save(user);

        logger.logUserOperation("admin_role_granted", user.getEmail(),
            Map.of("grantedBy", adminEmail, "userId", userId));
        return new MessageResponseDTO("Rol de administrador otorgado correctamente");
    }

    /**
     * Otorga rol admin a múltiples usuarios en batch (optimizado).
     * Similar a {@link #grantAdminRole} pero con infraestructura batch compartida.
     *
     * @param adminEmail Email del admin que otorga (auditoría)
     * @param userIds    IDs de usuarios a promover
     * @return Mensaje con contadores de operación
     */
    @Transactional
    public MessageResponseDTO grantAdminRoleBatch(String adminEmail, List<String> userIds) {
        logger.info("Otorgando rol admin en lote", Map.of("totalRequested", userIds.size(), "grantedBy", adminEmail));

        // Obtener el rol de admin una sola vez
        UserRole adminRole = roleRepository.findByUserRoleList(UserRoleList.ADMIN)
            .orElseThrow(() -> new NotFoundException("Rol de administrador no encontrado"));

        BatchOperationResult result = executeBatchOperation(
            userIds,
            this::canGrantAdminRole,
            user -> user.setUserRole(adminRole)
        );

        logger.info("Operación de otorgar rol admin en lote completada",
            Map.of("granted", result.updated(), "alreadyAdmin", result.alreadyInState(), "failed", result.failed()));

        String message = String.format("Operación completada: %d roles admin otorgados, %d ya eran admin, %d fallos",
            result.updated(), result.alreadyInState(), result.failed());
        return new MessageResponseDTO(message);
    }

    /**
     * Revoca rol de administrador de un usuario específico.
     * <p>
     * Protecciones:
     * - NO permite revocar rol del administrador principal del sistema
     * - Valida que el usuario tenga actualmente rol ADMIN
     * <p>
     * Cambia el rol de ADMIN a CLIENT.
     *
     * @param adminEmail Email del admin que revoca (auditoría)
     * @param userId     ID del usuario a degradar
     * @return Mensaje de confirmación o error si es admin principal/ya es cliente
     * @throws BadRequestException Si se intenta revocar al admin principal
     * @throws NotFoundException   Si el usuario o rol CLIENT no existe
     */
    @Transactional
    public MessageResponseDTO revokeAdminRole(String adminEmail, String userId) {
        User user = userRepository.findById(Long.valueOf(userId))
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        // Prevenir que se revoque el rol del admin principal
        if (user.getEmail().equals(this.adminEmail)) {
            throw new BadRequestException("No se puede revocar el rol del administrador principal");
        }

        // Usar lógica compartida
        if (!canRevokeAdminRole(user)) {
            return new MessageResponseDTO("El usuario ya tiene rol de cliente");
        }

        UserRole clientRole = roleRepository.findByUserRoleList(UserRoleList.CLIENT)
            .orElseThrow(() -> new NotFoundException("Rol de cliente no encontrado"));

        user.setUserRole(clientRole);
        userRepository.save(user);

        logger.logUserOperation("admin_role_revoked", user.getEmail(),
            Map.of("revokedBy", adminEmail, "userId", userId));
        return new MessageResponseDTO("Rol de administrador revocado correctamente");
    }

    /**
     * Revoca rol admin de múltiples usuarios en batch con protección de admin principal.
     * Usa {@link #executeBatchOperationWithProtection} para contar usuarios protegidos.
     *
     * @param adminEmail Email del admin que revoca
     * @param userIds    IDs de usuarios a degradar
     * @return Mensaje con contadores (revoked, protected, alreadyClient, failed)
     */
    @Transactional
    public MessageResponseDTO revokeAdminRoleBatch(String adminEmail, List<String> userIds) {
        logger.info("Revocando rol admin en lote", Map.of("totalRequested", userIds.size(), "revokedBy", adminEmail));

        // Obtener el rol de cliente una sola vez
        UserRole clientRole = roleRepository.findByUserRoleList(UserRoleList.CLIENT)
            .orElseThrow(() -> new NotFoundException("Rol de cliente no encontrado"));

        ExtendedBatchOperationResult result = executeBatchOperationWithProtection(
            userIds,
            this::canRevokeAdminRole,
            user -> user.setUserRole(clientRole),
            user -> user.getEmail().equals(this.adminEmail)
        );

        logger.info("Operación de revocar rol admin en lote completada",
            Map.of("revoked", result.updated(), "protected", result.protectedCount(),
                "alreadyClient", result.alreadyInState(), "failed", result.failed()));

        String message = String.format("Operación completada: %d roles admin revocados, %d protegidos, %d ya eran cliente, %d fallos",
            result.updated(), result.protectedCount(), result.alreadyInState(), result.failed());
        return new MessageResponseDTO(message);
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

        // Usar lógica compartida
        if (!canBeDeactivated(user)) {
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

        // Usar lógica compartida
        if (!canBeReactivated(user)) {
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
        logger.info("Desactivando cuentas en lote", Map.of("totalRequested", userIds.size(), "reason", reason != null ? reason : "No especificada"));

        BatchOperationResult result = executeBatchOperation(userIds, this::canBeDeactivated, user -> user.deactivateAccount(reason));

        logger.info("Operación de desactivación en lote completada",
            Map.of("deactivated", result.updated(), "alreadyDeactivated", result.alreadyInState(), "failed", result.failed()));

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
        logger.info("Reactivando cuentas en lote", Map.of("totalRequested", userIds.size()));

        BatchOperationResult result = executeBatchOperation(userIds, this::canBeReactivated, User::reactivateAccount);

        logger.info("Operación de reactivación en lote completada",
            Map.of("reactivated", result.updated(), "alreadyActive", result.alreadyInState(), "failed", result.failed()));

        String message = String.format("Operación completada: %d cuentas reactivadas, %d ya estaban activas, %d fallos",
            result.updated(), result.alreadyInState(), result.failed());
        return new MessageResponseDTO(message);
    }

    /**
     * Envía emails de recordatorio de completar perfil en batch (optimizado anti-N+1).
     * <p>
     * Optimizaciones:
     * - Fetch único de todos los usuarios
     * - Filtrado en memoria (usuarios no aprobados + perfil incompleto)
     * - Envío de emails sin queries adicionales
     * <p>
     * Manejo de errores: Fallo de email individual no rompe el batch completo.
     *
     * @param userIds IDs de usuarios a notificar
     * @return Mensaje con contadores (sent, skipped, failed)
     */
    public MessageResponseDTO sendEmailsBatch(List<Long> userIds) {
        logger.info("Enviando correos en lote", Map.of("totalRequested", userIds.size()));

        // Buscar todos los usuarios de una vez (evitar N+1)
        List<User> users = userRepository.findAllById(userIds);

        // Filtrar usuarios que necesitan completar perfil
        List<User> usersNeedingReminder = users.stream()
            .filter(user -> !user.isApproved() && !user.isProfileComplete())
            .toList();

        int sent = 0;
        int skipped = users.size() - usersNeedingReminder.size();
        int failed = userIds.size() - users.size();

        // Enviar correos
        for (User user : usersNeedingReminder) {
            try {
                emailService.sendProfileCompletionReminder(user);
                logger.logUserOperation("profile_completion_reminder_sent", user.getEmail(), null);
                sent++;
            } catch (Exception e) {
                logger.error("Error enviando correo a: " + user.getEmail(), e);
                failed++;
            }
        }

        logger.info("Operación de envío de correos completada",
            Map.of("sent", sent, "skipped", skipped, "failed", failed));

        String message = String.format("Operación completada: %d correos enviados, %d omitidos (perfil completo/aprobado), %d fallos",
            sent, skipped, failed);
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
        if (user.getEmail().equals(this.adminEmail)) {
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
     * Utiliza {@link #executeBatchDeletion} que:
     * - Protege al administrador principal
     * - Cuenta usuarios protegidos
     * - Realiza eliminación masiva optimizada
     *
     * @param userIds IDs de usuarios a eliminar
     * @return Mensaje con contadores (deleted, protected, failed)
     */
    @Transactional
    public MessageResponseDTO deleteUsersBatch(List<String> userIds) {
        logger.info("Eliminando usuarios en lote", Map.of("totalRequested", userIds.size()));

        ExtendedBatchOperationResult result = executeBatchDeletion(userIds, this::canBeDeleted);

        logger.info("Operación de eliminación en lote completada",
            Map.of("deleted", result.updated(), "protected", result.protectedCount(), "failed", result.failed()));

        String message = String.format("Operación completada: %d usuarios eliminados, %d protegidos (admin principal), %d fallos",
            result.updated(), result.protectedCount(), result.failed());
        return new MessageResponseDTO(message);
    }
}
