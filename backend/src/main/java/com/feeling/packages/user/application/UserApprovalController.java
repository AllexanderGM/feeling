package com.feeling.packages.user.application;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.user.domain.dto.response.UserResponseDTO;
import com.feeling.packages.user.domain.enums.UserApprovalStatus;
import com.feeling.packages.user.domain.services.UserApprovalService;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestión de aprobación y moderación de usuarios.
 * <p>
 * Este controlador maneja todas las operaciones relacionadas con el proceso de
 * aprobación de usuarios en la plataforma, incluyendo:
 * <ul>
 *   <li>Aprobación individual y batch de usuarios pendientes</li>
 *   <li>Rechazo individual y batch de usuarios</li>
 *   <li>Consulta de usuarios pendientes de aprobación</li>
 *   <li>Consulta de usuarios rechazados</li>
 *   <li>Reset de estado de aprobación a pendiente</li>
 * </ul>
 * <p>
 * Todos los endpoints requieren rol de administrador (ADMIN) para su acceso.
 * <p>
 * Arquitectura:
 * - Sigue principios DDD (Domain-Driven Design)
 * - No contiene lógica de negocio (delegada a UserApprovalService)
 * - Manejo de errores consistente con try-catch
 * - Logging estructurado para auditoría
 * - Documentación completa con Swagger/OpenAPI
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @see UserApprovalService
 * @see UserApprovalStatus
 * @since 1.0
 */
@RestController
@RequestMapping("/user-approval")
@RequiredArgsConstructor
@Tag(name = "User Approval", description = "Endpoints para aprobación y moderación de usuarios (solo administradores)")
@PreAuthorize("hasAuthority('ADMIN')")
public class UserApprovalController {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(UserApprovalController.class);

    private final UserApprovalService userApprovalService;

    // ========================================
    // CONSULTAS POR ESTADO DE APROBACIÓN
    // ========================================

    /**
     * Obtiene usuarios pendientes de aprobación con búsqueda opcional.
     *
     * @param pageable   Configuración de paginación y ordenamiento
     * @param searchTerm Término de búsqueda opcional (nombre, email, ciudad)
     * @return Página de usuarios pendientes de aprobación
     */
    @GetMapping("/pending")
    @Operation(summary = "Obtener usuarios pendientes de aprobación",
        description = "Retorna lista paginada de usuarios pendientes con búsqueda opcional por nombre, email o ciudad")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Page<UserResponseDTO>> getPendingApprovalUsers(
        @PageableDefault(size = 20) Pageable pageable,
        @Parameter(description = "Término de búsqueda opcional") @RequestParam(required = false) String searchTerm
    ) {
        try {
            logger.info("Consultando usuarios pendientes de aprobación", Map.of(
                "searchTerm", searchTerm != null ? searchTerm : "N/A",
                "page", pageable.getPageNumber()
            ));
            Page<UserResponseDTO> users = userApprovalService.getPendingApprovalUsers(pageable, searchTerm);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error obteniendo usuarios pendientes de aprobación", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene usuarios rechazados con búsqueda opcional.
     *
     * @param pageable   Configuración de paginación y ordenamiento
     * @param searchTerm Término de búsqueda opcional (nombre, email, ciudad)
     * @return Página de usuarios rechazados
     */
    @GetMapping("/rejected")
    @Operation(summary = "Obtener usuarios rechazados",
        description = "Retorna lista paginada de usuarios rechazados con búsqueda opcional por nombre, email o ciudad")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Page<UserResponseDTO>> getRejectedUsers(
        @PageableDefault(size = 20) Pageable pageable,
        @Parameter(description = "Término de búsqueda opcional") @RequestParam(required = false) String searchTerm
    ) {
        try {
            logger.info("Consultando usuarios rechazados", Map.of(
                "searchTerm", searchTerm != null ? searchTerm : "N/A",
                "page", pageable.getPageNumber()
            ));
            Page<UserResponseDTO> users = userApprovalService.getRejectedUsers(pageable, searchTerm);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error obteniendo usuarios rechazados", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========================================
    // OPERACIONES SINGULARES
    // ========================================

    /**
     * Aprueba un usuario específico para usar la plataforma.
     *
     * @param userId ID del usuario a aprobar
     * @return Mensaje de confirmación o información si ya estaba aprobado
     * @throws NotFoundException   Si el usuario no existe
     * @throws BadRequestException Si el perfil no está completo
     */
    @PutMapping("/{userId}/approve")
    @Operation(summary = "Aprobar usuario",
        description = "Aprueba un usuario pendiente para permitirle usar la plataforma completa")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario aprobado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Perfil incompleto o ya aprobado"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> approveUser(
        @Parameter(description = "ID del usuario a aprobar") @PathVariable String userId
    ) {
        try {
            logger.info("Aprobando usuario", Map.of("userId", userId));
            MessageResponseDTO response = userApprovalService.approveUser(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error aprobando usuario", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al aprobar usuario"));
        }
    }

    /**
     * Rechaza un usuario específico (revoca su aprobación).
     *
     * @param userId ID del usuario a rechazar
     * @return Mensaje de confirmación o información si ya estaba rechazado
     * @throws NotFoundException Si el usuario no existe
     */
    @PutMapping("/{userId}/reject")
    @Operation(summary = "Rechazar usuario",
        description = "Rechaza o revoca la aprobación de un usuario, impidiendo su acceso a la plataforma")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario rechazado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> rejectUser(
        @Parameter(description = "ID del usuario a rechazar") @PathVariable String userId
    ) {
        try {
            logger.info("Rechazando usuario", Map.of("userId", userId));
            MessageResponseDTO response = userApprovalService.revokeUserApproval(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error rechazando usuario", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al rechazar usuario"));
        }
    }

    /**
     * Resetea el estado de aprobación de un usuario a PENDING.
     *
     * @param userId ID del usuario a resetear
     * @return Mensaje de confirmación
     * @throws NotFoundException Si el usuario no existe
     */
    @PutMapping("/{userId}/pending")
    @Operation(summary = "Resetear usuario a pendiente",
        description = "Cambia el estado de aprobación de un usuario a PENDING para revisión")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Estado reseteado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> resetUserToPending(
        @Parameter(description = "ID del usuario a resetear") @PathVariable String userId
    ) {
        try {
            logger.info("Reseteando usuario a pendiente", Map.of("userId", userId));
            MessageResponseDTO response = userApprovalService.resetUserApprovalToPending(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error reseteando usuario a pendiente", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al resetear estado del usuario"));
        }
    }

    // ========================================
    // OPERACIONES BATCH / MASIVAS
    // ========================================

    /**
     * Aprueba múltiples usuarios en una sola operación batch optimizada.
     *
     * @param userIds Lista de IDs de usuarios a aprobar
     * @return Mensaje con resumen de operación (aprobados, ya aprobados, fallos)
     */
    @PostMapping("/approve-batch")
    @Operation(summary = "Aprobar usuarios en lote",
        description = "Aprueba múltiples usuarios de una vez. Retorna contadores de éxito/fallo")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Operación completada (revisar contadores)"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> approveUsersBatch(
        @Parameter(description = "Lista de IDs de usuarios a aprobar")
        @RequestBody List<String> userIds
    ) {
        try {
            logger.info("Aprobando usuarios en lote", Map.of("total", userIds.size()));
            MessageResponseDTO response = userApprovalService.approveUsersBatch(userIds);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error aprobando usuarios en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al aprobar usuarios en lote"));
        }
    }

    /**
     * Rechaza múltiples usuarios en una sola operación batch optimizada.
     *
     * @param userIds Lista de IDs de usuarios a rechazar
     * @return Mensaje con resumen de operación (rechazados, ya rechazados, fallos)
     */
    @PostMapping("/reject-batch")
    @Operation(summary = "Rechazar usuarios en lote",
        description = "Rechaza múltiples usuarios de una vez. Retorna contadores de éxito/fallo")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Operación completada (revisar contadores)"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> rejectUsersBatch(
        @Parameter(description = "Lista de IDs de usuarios a rechazar")
        @RequestBody List<String> userIds
    ) {
        try {
            logger.info("Rechazando usuarios en lote", Map.of("total", userIds.size()));
            MessageResponseDTO response = userApprovalService.rejectUsersBatch(userIds);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error rechazando usuarios en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al rechazar usuarios en lote"));
        }
    }
}
