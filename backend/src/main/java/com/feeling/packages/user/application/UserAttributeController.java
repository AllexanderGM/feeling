package com.feeling.packages.user.application;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.common.domain.validation.ValidAttributeType;
import com.feeling.packages.user.domain.dto.attributes.UserAttributeRequestDTO;
import com.feeling.packages.user.domain.dto.attributes.UserAttributeResponseDTO;
import com.feeling.packages.user.domain.dto.attributes.UserAttributeStatisticsResponseDTO;
import com.feeling.packages.user.domain.services.UserAttributeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
 * Controlador REST para gestión de atributos de usuario.
 * <p>
 * Este controlador maneja todas las operaciones relacionadas con atributos
 * de usuario que son propiedades catalogadas como género, color de ojos,
 * iglesia, nivel educativo, etc.
 * <p>
 * Funcionalidades:
 * <ul>
 *   <li>Consulta pública de atributos activos por tipo (usuarios autenticados)</li>
 *   <li>Propuesta de nuevos atributos por usuarios (CHURCH, RELIGION) - requiere aprobación</li>
 *   <li>CRUD completo de atributos (solo administradores)</li>
 *   <li>Activación/desactivación de atributos (aprobación de propuestas)</li>
 *   <li>Estadísticas de atributos</li>
 * </ul>
 * <p>
 * Arquitectura:
 * - Sigue principios DDD (Domain-Driven Design)
 * - Validaciones en DTO con Bean Validation
 * - Manejo de errores con GlobalExceptionHandler
 * - Logging estructurado para auditoría
 * - Documentación completa con Swagger/OpenAPI
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @see UserAttributeService
 * @see UserAttributeResponseDTO
 * @since 1.0
 */
@RestController
@RequestMapping("/user-attributes")
@RequiredArgsConstructor
@Tag(name = "User Attributes", description = "Endpoints de gestión de atributos de usuario")
public class UserAttributeController {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(UserAttributeController.class);

    private final UserAttributeService userAttributeService;

    // ========================================
    // CONSULTAS PÚBLICAS (CLIENTES)
    // ========================================

    /**
     * Obtiene todos los atributos activos agrupados por tipo.
     *
     * @return Mapa con atributos agrupados por tipo
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener todos los atributos agrupados por tipo",
        description = "Retorna todos los atributos activos agrupados por tipo para formularios de usuario")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Atributos obtenidos exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    public ResponseEntity<Map<String, List<UserAttributeResponseDTO>>> getAllAttributes() {
        logger.info("Consultando todos los atributos agrupados");
        Map<String, List<UserAttributeResponseDTO>> attributes = userAttributeService.getAllAttributesGrouped();
        return ResponseEntity.ok(attributes);
    }

    /**
     * Obtiene atributos activos de un tipo específico.
     *
     * @param attributeType Tipo de atributo (GENDER, EYE_COLOR, etc.)
     * @return Lista de atributos del tipo especificado
     */
    @GetMapping("/{attributeType}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener atributos por tipo",
        description = "Retorna lista de atributos activos de un tipo específico")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Atributos obtenidos exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    public ResponseEntity<List<UserAttributeResponseDTO>> getAttributesByType(
        @Parameter(description = "Tipo de atributo") @PathVariable String attributeType) {
        logger.info("Consultando atributos por tipo", Map.of("attributeType", attributeType));
        List<UserAttributeResponseDTO> attributes = userAttributeService.getAttributesByType(attributeType);
        return ResponseEntity.ok(attributes);
    }

    /**
     * Obtiene lista de tipos de atributos disponibles.
     *
     * @return Lista de tipos de atributos únicos
     */
    @GetMapping("/types")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener tipos de atributos disponibles",
        description = "Retorna lista de tipos de atributos configurados en el sistema")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tipos obtenidos exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    public ResponseEntity<List<String>> getAttributeTypes() {
        logger.info("Consultando tipos de atributos disponibles");
        Map<String, List<UserAttributeResponseDTO>> grouped = userAttributeService.getAllAttributesGrouped();
        List<String> types = List.copyOf(grouped.keySet());
        return ResponseEntity.ok(types);
    }

    // ========================================
    // CONSULTAS ADMINISTRATIVAS
    // ========================================

    /**
     * Obtiene todos los atributos (activos e inactivos) paginados para administración.
     *
     * @param pageable Configuración de paginación y ordenamiento
     * @return Página de atributos
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener todos los atributos paginados (admin)",
        description = "Retorna lista paginada de todos los atributos (activos e inactivos) para panel de administración")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado - requiere rol ADMIN")
    })
    public ResponseEntity<Page<UserAttributeResponseDTO>> getAllAttributesPaged(
        @PageableDefault(size = 20, sort = {"attributeType", "displayOrder"}) Pageable pageable) {
        logger.info("Admin consultando todos los atributos paginados", Map.of("page", pageable.getPageNumber()));
        Page<UserAttributeResponseDTO> attributes = userAttributeService.getAllAttributesPaged(pageable);
        return ResponseEntity.ok(attributes);
    }

    /**
     * Obtiene un atributo específico por ID.
     *
     * @param id ID del atributo
     * @return Atributo encontrado
     */
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener atributo por ID (admin)",
        description = "Retorna un atributo específico por su ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Atributo encontrado"),
        @ApiResponse(responseCode = "404", description = "Atributo no encontrado"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado - requiere rol ADMIN")
    })
    public ResponseEntity<UserAttributeResponseDTO> getAttributeById(
        @Parameter(description = "ID del atributo") @PathVariable Long id) {
        logger.info("Admin consultando atributo por ID", Map.of("attributeId", id));
        UserAttributeResponseDTO attribute = userAttributeService.getAttributeById(id);
        return ResponseEntity.ok(attribute);
    }

    /**
     * Obtiene todos los atributos inactivos pendientes de aprobación.
     *
     * @return Lista de atributos inactivos
     */
    @GetMapping("/admin/inactive")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener atributos inactivos (admin)",
        description = "Retorna lista de atributos inactivos pendientes de aprobación")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado - requiere rol ADMIN")
    })
    public ResponseEntity<List<UserAttributeResponseDTO>> getInactiveAttributes() {
        logger.info("Admin consultando atributos inactivos");
        List<UserAttributeResponseDTO> inactiveAttributes = userAttributeService.getInactiveAttributes();
        return ResponseEntity.ok(inactiveAttributes);
    }

    /**
     * Obtiene estadísticas completas de los atributos del sistema.
     *
     * @return Estadísticas de atributos
     */
    @GetMapping("/admin/statistics")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener estadísticas de atributos (admin)",
        description = "Retorna estadísticas completas sobre atributos del sistema")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Estadísticas obtenidas exitosamente"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado - requiere rol ADMIN")
    })
    public ResponseEntity<UserAttributeStatisticsResponseDTO> getAttributeStatistics() {
        logger.info("Admin consultando estadísticas de atributos");
        UserAttributeStatisticsResponseDTO statistics = userAttributeService.getAttributeStatistics();
        return ResponseEntity.ok(statistics);
    }

    // ========================================
    // OPERACIONES DE USUARIOS
    // ========================================

    /**
     * Permite a usuarios autenticados proponer nuevos atributos de ciertos tipos.
     * Solo tipos permitidos: CHURCH, RELIGION.
     * Los atributos creados quedan inactivos hasta aprobación administrativa.
     *
     * @param attributeType Tipo de atributo a crear (CHURCH, RELIGION)
     * @param createDTO     Datos del nuevo atributo
     * @return Atributo creado (inactivo, pendiente de aprobación)
     */
    @PostMapping("/user/{attributeType}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Proponer nuevo atributo (usuario)",
        description = "Permite a usuarios proponer nuevos atributos de tipos específicos (CHURCH, RELIGION). " +
            "Quedan pendientes de aprobación administrativa.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Atributo propuesto exitosamente (pendiente de aprobación)"),
        @ApiResponse(responseCode = "400", description = "Tipo no permitido, datos inválidos o atributo duplicado"),
        @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    public ResponseEntity<UserAttributeResponseDTO> createAttributeByUser(
        @Parameter(description = "Tipo de atributo (CHURCH, RELIGION)")
        @PathVariable @ValidAttributeType String attributeType,
        @Valid @RequestBody UserAttributeRequestDTO createDTO) {

        logger.info("Usuario proponiendo nuevo atributo", Map.of(
            "attributeType", attributeType,
            "name", createDTO.name()
        ));

        // createdByAdmin = false, se crea inactivo
        UserAttributeResponseDTO createdAttribute = userAttributeService.createAttribute(attributeType, createDTO, false);

        logger.info("Atributo propuesto exitosamente (pendiente de aprobación)", Map.of(
            "id", createdAttribute.id(),
            "type", createdAttribute.attributeType(),
            "active", createdAttribute.active()
        ));

        return ResponseEntity.status(HttpStatus.CREATED).body(createdAttribute);
    }

    // ========================================
    // OPERACIONES ADMINISTRATIVAS - CRUD
    // ========================================

    /**
     * Crea un nuevo atributo de un tipo específico.
     * Solo administradores pueden crear atributos del sistema.
     *
     * @param attributeType Tipo de atributo a crear
     * @param createDTO     Datos del nuevo atributo
     * @return Atributo creado
     */
    @PostMapping("/admin/{attributeType}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Crear nuevo atributo (admin)",
        description = "Crea un nuevo atributo de un tipo específico")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Atributo creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Tipo inválido o atributo duplicado"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado - requiere rol ADMIN")
    })
    public ResponseEntity<UserAttributeResponseDTO> createAttribute(
        @Parameter(description = "Tipo de atributo")
        @PathVariable @ValidAttributeType String attributeType,
        @Valid @RequestBody UserAttributeRequestDTO createDTO) {

        logger.info("Admin creando atributo", Map.of(
            "attributeType", attributeType,
            "name", createDTO.name()
        ));

        // createdByAdmin = true, se crea activo
        UserAttributeResponseDTO createdAttribute = userAttributeService.createAttribute(attributeType, createDTO, true);

        logger.info("Atributo creado exitosamente por admin (activo)", Map.of(
            "id", createdAttribute.id(),
            "type", createdAttribute.attributeType(),
            "active", createdAttribute.active()
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAttribute);
    }

    /**
     * Actualiza un atributo existente.
     *
     * @param attributeId ID del atributo a actualizar
     * @param updateDTO   Nuevos datos del atributo
     * @return Atributo actualizado
     */
    @PutMapping("/admin/{attributeId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Actualizar atributo (admin)",
        description = "Modifica los datos de un atributo existente")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Atributo actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Atributo no encontrado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado - requiere rol ADMIN")
    })
    public ResponseEntity<UserAttributeResponseDTO> updateAttribute(
        @Parameter(description = "ID del atributo") @PathVariable Long attributeId,
        @Valid @RequestBody UserAttributeRequestDTO updateDTO) {

        logger.info("Admin actualizando atributo", Map.of(
            "attributeId", attributeId,
            "newName", updateDTO.name()
        ));

        UserAttributeResponseDTO updatedAttribute = userAttributeService.updateAttribute(attributeId, updateDTO);

        logger.info("Atributo actualizado exitosamente", Map.of("attributeId", attributeId));
        return ResponseEntity.ok(updatedAttribute);
    }

    /**
     * Elimina un atributo del sistema.
     *
     * @param attributeId ID del atributo a eliminar
     * @return Mensaje de confirmación
     */
    @DeleteMapping("/admin/{attributeId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Eliminar atributo (admin)",
        description = "Elimina permanentemente un atributo del sistema")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Atributo eliminado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Atributo no encontrado"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado - requiere rol ADMIN")
    })
    public ResponseEntity<MessageResponseDTO> deleteAttribute(
        @Parameter(description = "ID del atributo") @PathVariable Long attributeId) {

        logger.info("Admin eliminando atributo", Map.of("attributeId", attributeId));
        MessageResponseDTO response = userAttributeService.deleteAttribute(attributeId);
        logger.info("Atributo eliminado exitosamente", Map.of("attributeId", attributeId));
        return ResponseEntity.ok(response);
    }

    // ========================================
    // OPERACIONES ADMINISTRATIVAS - ACTIVACIÓN
    // ========================================

    /**
     * Activa un atributo inactivo (lo hace visible para usuarios).
     *
     * @param attributeId ID del atributo a activar
     * @return Atributo activado
     */
    @PutMapping("/admin/{attributeId}/activate")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Activar atributo (admin)",
        description = "Activa un atributo inactivo haciéndolo visible para los usuarios")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Atributo activado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Atributo no encontrado"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado - requiere rol ADMIN")
    })
    public ResponseEntity<UserAttributeResponseDTO> activateAttribute(
        @Parameter(description = "ID del atributo") @PathVariable Long attributeId) {

        logger.info("Admin activando atributo", Map.of("attributeId", attributeId));
        UserAttributeResponseDTO activatedAttribute = userAttributeService.activateAttribute(attributeId);
        logger.info("Atributo activado exitosamente", Map.of("attributeId", attributeId));
        return ResponseEntity.ok(activatedAttribute);
    }

    /**
     * Desactiva un atributo (lo oculta de los usuarios sin eliminarlo).
     *
     * @param attributeId ID del atributo a desactivar
     * @return Atributo desactivado
     */
    @PutMapping("/admin/{attributeId}/deactivate")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Desactivar atributo (admin)",
        description = "Desactiva un atributo ocultándolo de los usuarios sin eliminarlo")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Atributo desactivado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Atributo no encontrado"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado - requiere rol ADMIN")
    })
    public ResponseEntity<UserAttributeResponseDTO> deactivateAttribute(
        @Parameter(description = "ID del atributo") @PathVariable Long attributeId) {

        logger.info("Admin desactivando atributo", Map.of("attributeId", attributeId));
        UserAttributeResponseDTO deactivatedAttribute = userAttributeService.deactivateAttribute(attributeId);
        logger.info("Atributo desactivado exitosamente", Map.of("attributeId", attributeId));
        return ResponseEntity.ok(deactivatedAttribute);
    }
}
