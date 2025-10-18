package com.feeling.packages.user.application;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.user.domain.dto.mapper.UserDTOMapper;
import com.feeling.packages.user.domain.dto.profile.response.UserEssentialDTO;
import com.feeling.packages.user.domain.enums.UserRoleList;
import com.feeling.packages.user.domain.services.UserRoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestión de roles y permisos de usuarios.
 * <p>
 * Este controlador maneja todas las operaciones relacionadas con la asignación,
 * revocación y consulta de roles en la plataforma, incluyendo:
 * <ul>
 *   <li>Otorgar rol de administrador (individual y batch)</li>
 *   <li>Revocar rol de administrador (individual y batch)</li>
 *   <li>Consultar usuarios por rol (ADMIN, CLIENT)</li>
 *   <li>Contar usuarios por rol</li>
 * </ul>
 * <p>
 * Todos los endpoints requieren rol de administrador (ADMIN) para su acceso.
 * <p>
 * Protecciones de seguridad:
 * - El administrador principal del sistema no puede perder su rol
 * - Operaciones batch protegen automáticamente al admin principal
 * - Logging completo de todas las operaciones de cambio de roles
 * <p>
 * Arquitectura:
 * - Sigue principios DDD (Domain-Driven Design)
 * - No contiene lógica de negocio (delegada a UserRoleService)
 * - Manejo de errores consistente con try-catch
 * - Logging estructurado para auditoría de seguridad
 * - Documentación completa con Swagger/OpenAPI
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @see UserRoleService
 * @see UserRoleList
 * @see com.feeling.packages.user.infrastructure.entities.UserRole
 * @since 1.0
 */
@RestController
@RequestMapping("/user-roles")
@RequiredArgsConstructor
@Tag(name = "User Roles", description = "Endpoints para gestión de roles y permisos de usuarios (solo administradores)")
@PreAuthorize("hasAuthority('ADMIN')")
public class UserRoleController {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(UserRoleController.class);

    private final UserRoleService userRoleService;

    // ========================================
    // CONSULTAS - USUARIOS POR ROL
    // ========================================

    /**
     * Obtiene usuarios con rol de administrador.
     *
     * @param pageable Configuración de paginación y ordenamiento
     * @return Página de usuarios administradores
     */
    @GetMapping("/admins")
    @Operation(summary = "Listar administradores",
        description = "Retorna lista paginada de usuarios con rol ADMIN")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Page<UserEssentialDTO>> getAdminUsers(
        @PageableDefault(size = 20) Pageable pageable
    ) {
        try {
            logger.info("Consultando usuarios con rol ADMIN", Map.of("page", pageable.getPageNumber()));
            Page<UserEssentialDTO> admins = userRoleService.getUsersByRole(UserRoleList.ADMIN, pageable)
                .map(UserDTOMapper::toUserEssentialDTO);
            return ResponseEntity.ok(admins);
        } catch (Exception e) {
            logger.error("Error obteniendo usuarios administradores", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene usuarios con rol de cliente.
     *
     * @param pageable Configuración de paginación y ordenamiento
     * @return Página de usuarios clientes
     */
    @GetMapping("/clients")
    @Operation(summary = "Listar clientes",
        description = "Retorna lista paginada de usuarios con rol CLIENT")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Page<UserEssentialDTO>> getClientUsers(
        @PageableDefault(size = 20) Pageable pageable
    ) {
        try {
            logger.info("Consultando usuarios con rol CLIENT", Map.of("page", pageable.getPageNumber()));
            Page<UserEssentialDTO> clients = userRoleService.getUsersByRole(UserRoleList.CLIENT, pageable)
                .map(UserDTOMapper::toUserEssentialDTO);
            return ResponseEntity.ok(clients);
        } catch (Exception e) {
            logger.error("Error obteniendo usuarios clientes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========================================
    // OTORGAR ROL ADMIN - OPERACIONES SINGULARES
    // ========================================

    /**
     * Otorga rol de administrador a un usuario específico.
     *
     * @param userId         ID del usuario que recibirá rol admin
     * @param authentication Email del admin que otorga el rol (auditoría)
     * @return Mensaje de confirmación o información si ya era admin
     * @throws NotFoundException Si el usuario o el rol ADMIN no existen
     */
    @PutMapping("/{userId}/grant-admin")
    @Operation(summary = "Otorgar rol de administrador",
        description = "Otorga privilegios de administrador a un usuario. Requiere validación de que el usuario existe y no tiene ya el rol")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Rol otorgado exitosamente o ya tenía el rol"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> grantAdminRole(
        @Parameter(description = "ID del usuario") @PathVariable String userId,
        Authentication authentication
    ) {
        try {
            String adminEmail = authentication.getName();
            logger.info("Otorgando rol admin al usuario", Map.of(
                "userId", userId,
                "adminEmail", adminEmail
            ));
            MessageResponseDTO response = userRoleService.grantAdminRole(adminEmail, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error otorgando rol admin al usuario", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al otorgar rol de administrador"));
        }
    }

    // ========================================
    // OTORGAR ROL ADMIN - OPERACIONES BATCH
    // ========================================

    /**
     * Otorga rol admin a múltiples usuarios en batch.
     *
     * @param userIds        Lista de IDs de usuarios a promover
     * @param authentication Email del admin que otorga (auditoría)
     * @return Mensaje con resumen (otorgados, ya admin, fallos)
     */
    @PostMapping("/grant-admin-batch")
    @Operation(summary = "Otorgar rol admin en lote",
        description = "Otorga rol de administrador a múltiples usuarios. Retorna contadores de éxito/fallo")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Operación completada (revisar contadores)"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> grantAdminRoleBatch(
        @Parameter(description = "Lista de IDs de usuarios")
        @RequestBody List<String> userIds,
        Authentication authentication
    ) {
        try {
            String adminEmail = authentication.getName();
            logger.info("Otorgando rol admin en lote", Map.of(
                "total", userIds.size(),
                "adminEmail", adminEmail
            ));
            MessageResponseDTO response = userRoleService.grantAdminRoleBatch(adminEmail, userIds);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error otorgando rol admin en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al otorgar roles de administrador en lote"));
        }
    }

    // ========================================
    // REVOCAR ROL ADMIN - OPERACIONES SINGULARES
    // ========================================

    /**
     * Revoca rol de administrador de un usuario específico.
     *
     * @param userId         ID del usuario a degradar
     * @param authentication Email del admin que revoca (auditoría)
     * @return Mensaje de confirmación o error si es admin principal/ya es cliente
     * @throws BadRequestException Si se intenta revocar al admin principal
     * @throws NotFoundException   Si el usuario no existe
     */
    @PutMapping("/{userId}/revoke-admin")
    @Operation(summary = "Revocar rol de administrador",
        description = "Revoca privilegios de administrador de un usuario. Protege al admin principal del sistema")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Rol revocado exitosamente o ya era cliente"),
        @ApiResponse(responseCode = "400", description = "No se puede revocar al admin principal"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> revokeAdminRole(
        @Parameter(description = "ID del usuario") @PathVariable String userId,
        Authentication authentication
    ) {
        try {
            String adminEmail = authentication.getName();
            logger.info("Revocando rol admin al usuario", Map.of(
                "userId", userId,
                "adminEmail", adminEmail
            ));
            MessageResponseDTO response = userRoleService.revokeAdminRole(adminEmail, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error revocando rol admin al usuario", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al revocar rol de administrador"));
        }
    }

    // ========================================
    // REVOCAR ROL ADMIN - OPERACIONES BATCH
    // ========================================

    /**
     * Revoca rol admin de múltiples usuarios en batch con protección.
     *
     * @param userIds        Lista de IDs de usuarios a degradar
     * @param authentication Email del admin que revoca (auditoría)
     * @return Mensaje con contadores (revocados, protegidos, ya cliente, fallos)
     */
    @PostMapping("/revoke-admin-batch")
    @Operation(summary = "Revocar rol admin en lote",
        description = "Revoca rol de administrador de múltiples usuarios. El admin principal está protegido automáticamente")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Operación completada (revisar contadores)"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> revokeAdminRoleBatch(
        @Parameter(description = "Lista de IDs de usuarios")
        @RequestBody List<String> userIds,
        Authentication authentication
    ) {
        try {
            String adminEmail = authentication.getName();
            logger.info("Revocando rol admin en lote", Map.of(
                "total", userIds.size(),
                "adminEmail", adminEmail
            ));
            MessageResponseDTO response = userRoleService.revokeAdminRoleBatch(adminEmail, userIds);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error revocando rol admin en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al revocar roles de administrador en lote"));
        }
    }

    // ========================================
    // MÉTRICAS - CONTADORES POR ROL
    // ========================================

    /**
     * Cuenta usuarios por rol específico.
     *
     * @param role Rol a contar (ADMIN o CLIENT)
     * @return Número de usuarios con ese rol
     */
    @GetMapping("/count")
    @Operation(summary = "Contar usuarios por rol",
        description = "Retorna el número total de usuarios con un rol específico")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Conteo obtenido exitosamente"),
        @ApiResponse(responseCode = "400", description = "Rol inválido"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Long> countUsersByRole(
        @Parameter(description = "Rol a contar (ADMIN o CLIENT)")
        @RequestParam UserRoleList role
    ) {
        try {
            logger.info("Contando usuarios con rol", Map.of("role", role));
            long count = userRoleService.countUsersByRole(role);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            logger.error("Error contando usuarios por rol", Map.of("role", role), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
