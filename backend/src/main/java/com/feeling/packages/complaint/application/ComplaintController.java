package com.feeling.packages.complaint.application;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.complaint.domain.dto.request.ComplaintAdminActionDTO;
import com.feeling.packages.complaint.domain.dto.request.ComplaintRequestDTO;
import com.feeling.packages.complaint.domain.dto.response.ComplaintResponseDTO;
import com.feeling.packages.complaint.domain.dto.response.ComplaintStatsResponseDTO;
import com.feeling.packages.complaint.domain.enums.ComplaintPriority;
import com.feeling.packages.complaint.domain.enums.ComplaintType;
import com.feeling.packages.complaint.domain.services.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


/**
 * Controlador REST para la gestión de denuncias y quejas entre usuarios.
 * <p>
 * Este controlador maneja todas las operaciones relacionadas con el sistema de
 * reportes y denuncias entre usuarios de la plataforma, incluyendo:
 * <ul>
 *   <li>Creación de denuncias por parte de usuarios</li>
 *   <li>Consulta de denuncias propias</li>
 *   <li>Gestión y moderación de denuncias (admin)</li>
 *   <li>Revisión y resolución de denuncias (admin)</li>
 *   <li>Acciones disciplinarias sobre usuarios reportados (admin)</li>
 * </ul>
 * <p>
 * Endpoints para clientes (autenticados):
 * - Crear denuncias contra otros usuarios
 * - Consultar el historial de sus denuncias realizadas
 * <p>
 * Endpoints para administradores:
 * - Consultar todas las denuncias (pendientes, resueltas)
 * - Revisar detalles completos de denuncias
 * - Marcar denuncias como revisadas
 * - Desestimar denuncias sin fundamento
 * - Tomar acciones disciplinarias (suspensión, advertencia, etc.)
 * <p>
 * Tipos de denuncias soportadas:
 * - Comportamiento inapropiado
 * - Contenido ofensivo
 * - Spam o publicidad
 * - Suplantación de identidad
 * - Acoso o intimidación
 * - Otro (especificar razón)
 * <p>
 * Características de seguridad:
 * - Validación de existencia de ambos usuarios (denunciante y denunciado)
 * - Prevención de auto-denuncias
 * - Anonimización parcial de denunciantes para protección
 * - Logging completo de todas las acciones para auditoría
 * - Sistema de puntos/strikes para usuarios con múltiples denuncias
 * <p>
 * Arquitectura:
 * - Sigue principios DDD (Domain-Driven Design)
 * - No contiene lógica de negocio (delegada a ComplaintService)
 * - Manejo de errores consistente con try-catch
 * - Logging estructurado para auditoría de moderación
 * - Documentación completa con Swagger/OpenAPI
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @see ComplaintService
 * @see Complaint
 * @since 1.0
 */
@RestController
@RequestMapping("/complaints")
@RequiredArgsConstructor
@Tag(name = "Complaints", description = "Endpoints para gestión de denuncias y quejas entre usuarios")
public class ComplaintController {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(ComplaintController.class);

    private final ComplaintService userComplaintService;

    // ========================================
    // ESTADÍSTICAS
    // ========================================

    /**
     * Obtiene estadísticas completas de quejas para dashboard.
     *
     * @return Map con estadísticas detalladas
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtener estadísticas de quejas (admin)",
        description = "Retorna estadísticas completas: contadores, distribución por tipo/prioridad, métricas temporales, etc.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Estadísticas obtenidas exitosamente"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ComplaintStatsResponseDTO> getComplaintStats() {
        logger.info("Admin consultando estadísticas de quejas");
        ComplaintStatsResponseDTO stats = userComplaintService.getComplaintStats();
        return ResponseEntity.ok(stats);
    }

    // ========================================
    // CLIENTE - OPERACIONES CRUD
    // ========================================

    // ----- LECTURAS (Cliente) -----

    /**
     * Obtiene todas las quejas del usuario autenticado.
     *
     * @param pageable       Configuración de paginación y ordenamiento
     * @param authentication Usuario autenticado
     * @return Página de quejas del usuario
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener mis quejas",
        description = "Retorna todas las quejas/denuncias creadas por el usuario autenticado")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Quejas obtenidas exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Page<ComplaintResponseDTO>> getMyComplaints(
        @PageableDefault(size = 20) Pageable pageable,
        Authentication authentication
    ) {
        String userEmail = authentication.getName();
        logger.info("Consultando quejas de usuario", Map.of("userEmail", userEmail));
        Page<ComplaintResponseDTO> complaints =
            userComplaintService.getUserComplaints(userEmail, pageable);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Obtiene una queja específica del usuario autenticado.
     *
     * @param complaintId    ID de la queja
     * @param authentication Usuario autenticado
     * @return DTO de la queja
     */
    @GetMapping("/me/{complaintId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener detalle de mi queja",
        description = "Retorna detalles completos de una queja específica del usuario autenticado")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Queja obtenida exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado"),
        @ApiResponse(responseCode = "403", description = "La queja no pertenece al usuario"),
        @ApiResponse(responseCode = "404", description = "Queja no encontrada"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ComplaintResponseDTO> getMyComplaint(
        @Parameter(description = "ID de la queja") @PathVariable Long complaintId,
        Authentication authentication
    ) {
        String userEmail = authentication.getName();
        logger.info("Consultando queja de usuario", Map.of(
            "complaintId", complaintId,
            "userEmail", userEmail
        ));
        ComplaintResponseDTO complaint =
            userComplaintService.getUserComplaint(userEmail, complaintId);
        return ResponseEntity.ok(complaint);
    }

    // ----- CREACIÓN (Cliente) -----

    /**
     * Crea una nueva queja/denuncia de usuario.
     *
     * @param requestDTO     DTO con datos de la queja
     * @param authentication Usuario autenticado que crea la queja
     * @param request        HttpServletRequest para capturar contexto (IP, User-Agent)
     * @return DTO de la queja creada
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Crear queja/denuncia",
        description = "Crea una nueva queja, denuncia o consulta de soporte. Captura contexto (IP, User-Agent) para auditoría")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Queja creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos de queja inválidos"),
        @ApiResponse(responseCode = "401", description = "No autenticado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ComplaintResponseDTO> createComplaint(
        @Parameter(description = "Datos de la queja")
        @Valid @RequestBody ComplaintRequestDTO requestDTO,
        Authentication authentication,
        HttpServletRequest request
    ) {
        String userEmail = authentication.getName();
        logger.info("Creando queja para usuario", Map.of(
            "userEmail", userEmail,
            "complaintType", requestDTO.complaintType()
        ));
        String clientIp = extractClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        ComplaintResponseDTO complaint =
            userComplaintService.createComplaint(userEmail, requestDTO, clientIp, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED).body(complaint);
    }

    // ========================================
    // ADMIN - OPERACIONES CRUD
    // ========================================

    // ----- LECTURAS (Admin) -----

    /**
     * Obtiene todas las quejas para administradores con búsqueda opcional.
     *
     * @param pageable Configuración de paginación y ordenamiento
     * @param search   Término de búsqueda opcional (busca en subject y message)
     * @return Página de quejas
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar todas las quejas (admin)",
        description = "Retorna lista paginada de todas las quejas con búsqueda opcional en subject y message")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Quejas obtenidas exitosamente"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Page<ComplaintResponseDTO>> getAllComplaints(
        @PageableDefault(size = 20) Pageable pageable,
        @Parameter(description = "Término de búsqueda opcional") @RequestParam(required = false) String search
    ) {
        logger.info("Admin consultando todas las quejas", Map.of(
            "searchTerm", search != null ? search : "N/A"
        ));
        Page<ComplaintResponseDTO> complaints =
            userComplaintService.getAllComplaints(pageable, search);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Obtiene quejas pendientes de resolución.
     *
     * @param pageable Configuración de paginación y ordenamiento
     * @return Página de quejas pendientes (OPEN, IN_PROGRESS, WAITING_USER, ESCALATED)
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar quejas pendientes (admin)",
        description = "Retorna quejas con estados OPEN, IN_PROGRESS, WAITING_USER o ESCALATED")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Quejas pendientes obtenidas exitosamente"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Page<ComplaintResponseDTO>> getPendingComplaints(
        @PageableDefault(size = 20) Pageable pageable
    ) {
        logger.info("Admin consultando quejas pendientes");
        Page<ComplaintResponseDTO> complaints =
            userComplaintService.getPendingComplaints(pageable);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Obtiene quejas urgentes sin resolver.
     *
     * @param pageable Configuración de paginación y ordenamiento
     * @return Página de quejas con prioridad URGENT sin resolver
     */
    @GetMapping("/urgent")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar quejas urgentes (admin)",
        description = "Retorna quejas con prioridad URGENT que no han sido resueltas")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Quejas urgentes obtenidas exitosamente"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Page<ComplaintResponseDTO>> getUrgentComplaints(
        @PageableDefault(size = 20) Pageable pageable
    ) {
        logger.info("Admin consultando quejas urgentes");
        Page<ComplaintResponseDTO> complaints =
            userComplaintService.getUrgentComplaints(pageable);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Obtiene quejas atrasadas (más de 24 horas sin resolver).
     *
     * @param pageable Configuración de paginación y ordenamiento
     * @return Página de quejas atrasadas
     */
    @GetMapping("/overdue")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar quejas atrasadas (admin)",
        description = "Retorna quejas pendientes con más de 24 horas desde su creación")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Quejas atrasadas obtenidas exitosamente"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Page<ComplaintResponseDTO>> getOverdueComplaints(
        @PageableDefault(size = 20) Pageable pageable
    ) {
        logger.info("Admin consultando quejas atrasadas");
        Page<ComplaintResponseDTO> complaints =
            userComplaintService.getOverdueComplaints(pageable);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Obtiene quejas resueltas.
     *
     * @param pageable Configuración de paginación y ordenamiento
     * @return Página de quejas con estado RESOLVED
     */
    @GetMapping("/resolved")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar quejas resueltas (admin)",
        description = "Retorna quejas con estado RESOLVED")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Quejas resueltas obtenidas exitosamente"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Page<ComplaintResponseDTO>> getResolvedComplaints(
        @PageableDefault(size = 20) Pageable pageable
    ) {
        logger.info("Admin consultando quejas resueltas");
        Page<ComplaintResponseDTO> complaints =
            userComplaintService.getResolvedComplaints(pageable);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Obtiene quejas por tipo específico.
     *
     * @param type     Tipo de queja (GENERAL, TECHNICAL_ISSUE, ACCOUNT_ISSUE, etc.)
     * @param pageable Configuración de paginación y ordenamiento
     * @return Página de quejas del tipo especificado
     */
    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar quejas por tipo (admin)",
        description = "Filtra quejas por tipo: GENERAL, TECHNICAL_ISSUE, ACCOUNT_ISSUE, PAYMENT_ISSUE, USER_REPORT, etc.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Quejas obtenidas exitosamente"),
        @ApiResponse(responseCode = "400", description = "Tipo de queja inválido"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Page<ComplaintResponseDTO>> getComplaintsByType(
        @Parameter(description = "Tipo de queja") @PathVariable ComplaintType type,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        logger.info("Admin consultando quejas por tipo", Map.of("type", type));
        Page<ComplaintResponseDTO> complaints =
            userComplaintService.getComplaintsByType(type, pageable);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Obtiene quejas por prioridad específica.
     *
     * @param complaintPriority Prioridad (LOW, MEDIUM, HIGH, URGENT)
     * @param pageable          Configuración de paginación y ordenamiento
     * @return Página de quejas con la prioridad especificada
     */
    @GetMapping("/priority/{complaintPriority}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar quejas por prioridad (admin)",
        description = "Filtra quejas por prioridad: LOW, MEDIUM, HIGH, URGENT")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Quejas obtenidas exitosamente"),
        @ApiResponse(responseCode = "400", description = "Prioridad inválida"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Page<ComplaintResponseDTO>> getComplaintsByPriority(
        @Parameter(description = "Prioridad") @PathVariable ComplaintPriority complaintPriority,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        logger.info("Admin consultando quejas por prioridad", Map.of("complaintPriority", complaintPriority));
        Page<ComplaintResponseDTO> complaints =
            userComplaintService.getComplaintsByPriority(complaintPriority, pageable);
        return ResponseEntity.ok(complaints);
    }

    // ----- ACTUALIZACIONES (Admin) -----

    /**
     * Actualiza el estado de una queja (solo administradores).
     *
     * @param complaintId    ID de la queja
     * @param actionDTO      DTO con acción administrativa (estado, prioridad, notas, respuesta)
     * @param authentication Administrador que realiza la acción
     * @return DTO de la queja actualizada
     */
    @PutMapping("/{complaintId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar estado de queja (admin)",
        description = "Permite cambiar estado, prioridad, agregar notas administrativas y responder quejas. Valida que estados RESOLVED requieran respuesta")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Queja actualizada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos de acción inválidos o falta respuesta para resolución"),
        @ApiResponse(responseCode = "404", description = "Queja no encontrada"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ComplaintResponseDTO> updateComplaintStatus(
        @Parameter(description = "ID de la queja") @PathVariable Long complaintId,
        @Parameter(description = "Acción administrativa") @RequestBody ComplaintAdminActionDTO actionDTO,
        Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        logger.info("Admin actualizando queja", Map.of(
            "adminEmail", adminEmail,
            "complaintId", complaintId,
            "complaintStatus", actionDTO.complaintStatus()
        ));
        ComplaintResponseDTO complaint =
            userComplaintService.updateComplaintStatus(complaintId, actionDTO, adminEmail);
        return ResponseEntity.ok(complaint);
    }

    // ----- ELIMINACIONES (Admin) -----

    /**
     * Elimina una queja del sistema (solo administradores - usar con precaución).
     *
     * @param complaintId    ID de la queja
     * @param authentication Administrador que realiza la acción
     * @return Mensaje de confirmación
     */
    @DeleteMapping("/{complaintId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar queja (admin)",
        description = "Elimina permanentemente una queja del sistema. Acción irreversible, usar con precaución")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Queja eliminada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Queja no encontrada"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> deleteComplaint(
        @Parameter(description = "ID de la queja") @PathVariable Long complaintId,
        Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        logger.info("Admin eliminando queja", Map.of(
            "adminEmail", adminEmail,
            "complaintId", complaintId
        ));
        MessageResponseDTO response = userComplaintService.deleteComplaint(complaintId, adminEmail);
        return ResponseEntity.ok(response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}
