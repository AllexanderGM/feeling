package com.feeling.packages.user.application;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.match.domain.dto.MatchCompatibilityDTO;
import com.feeling.packages.match.domain.dto.UserSuggestionDTO;
import com.feeling.packages.match.domain.services.MatchDiscoveryService;
import com.feeling.packages.user.domain.dto.analytics.UserCountDTO;
import com.feeling.packages.user.domain.dto.attributes.UserAttributeResponseDTO;
import com.feeling.packages.user.domain.dto.user.UserResponseDTO;
import com.feeling.packages.user.domain.dto.views.UserViews;
import com.feeling.packages.user.domain.enums.UserResponseLevel;
import com.feeling.packages.user.domain.services.*;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Controlador principal para gestión de usuarios.
 * <p>
 * Responsabilidades:
 * - Consultas de perfil (actual, público, completo)
 * - Cálculo de compatibilidad entre usuarios
 * - Sugerencias de usuarios para matching
 * - Actualización de perfil (PUT, PATCH)
 * - Desactivación/reactivación de cuentas
 * - Gestión administrativa de usuarios (listar, filtrar, actualizar)
 * - Eliminación de usuarios (individual y batch)
 * - Consultas de atributos de usuario
 * <p>
 * NOTA IMPORTANTE: Varios endpoints han sido movidos a controladores especializados
 * siguiendo principios DDD:
 * - Aprobación de usuarios → UserApprovalController (/user-approval)
 * - Gestión de roles → UserRoleController (/user-roles)
 * - Gestión de imágenes → UserMediaController (/user-media)
 * - Notificaciones → UserNotificationController (/user-notifications)
 * - Denuncias → ComplaintController (/user-complaints)
 * <p>
 * Ver documentación de cada controlador especializado para endpoints específicos.
 *
 * @author J. Alexander Gavilán M.
 * @version 2.0
 * @since 1.0
 */
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Endpoints de gestión de usuarios para clientes y administradores")
public class UserController {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(UserController.class);

    private final UserService userService;
    private final UserTagService userTagService;
    private final UserAttributeService userAttributeService;
    private final MatchDiscoveryService matchDiscoveryService;

    // Servicios especializados para operaciones específicas
    private final UserMediaService userMediaService;
    private final UserProfileOrchestrator userProfileOrchestrator;

    // ========================================
    // CLIENT ENDPOINTS (AUTHENTICATED)
    // ========================================

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    @JsonView(UserViews.Internal.class)
    @Operation(
        summary = "Obtener mi perfil (usuario actual)",
        description = "Recupera el perfil completo del usuario autenticado actual con todos sus datos incluyendo información privada.",
        tags = {"User Profile Management"}
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Perfil recuperado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Nivel de inclusión inválido"),
        @ApiResponse(responseCode = "401", description = "Usuario no autenticado")
    })
    public ResponseEntity<UserResponseDTO> getCurrentUserProfile(
        @Parameter(description = "Nivel de inclusión: basic, standard, extended, full")
        @RequestParam(name = "include", defaultValue = "extended") String includeLevel,
        Authentication authentication) {
        try {
            // Validar nivel de inclusión
            if (!UserResponseLevel.isValidLevel(includeLevel)) {
                return ResponseEntity.badRequest().build();
            }

            String currentUserEmail = authentication.getName();

            // Obtener perfil del usuario actual (con vista Internal - incluye datos sensibles)
            UserResponseDTO user = userService.get(currentUserEmail, currentUserEmail, includeLevel);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.error("Error obteniendo perfil del usuario actual", Map.of(
                "includeLevel", includeLevel
            ), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/profile/public")
    @PreAuthorize("isAuthenticated()")
    @JsonView(UserViews.Public.class)
    @Operation(
        summary = "Obtener perfil público de otro usuario",
        description = "Recupera el perfil público de otro usuario sin información sensible (sin email, teléfono).",
        tags = {"User Profile Management"}
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Perfil público recuperado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "401", description = "Usuario no autenticado")
    })
    public ResponseEntity<UserResponseDTO> getPublicUserProfile(
        @Parameter(description = "Email del usuario a consultar", required = true)
        @RequestParam(name = "email") String targetEmail,
        Authentication authentication) {
        String currentUserEmail = authentication.getName();

        // Obtener perfil público de otro usuario (con vista Public - sin datos sensibles)
        // Si el usuario no existe, NotFoundException se propagará automáticamente (404)
        UserResponseDTO user = userService.get(targetEmail, currentUserEmail, "public");
        return ResponseEntity.ok(user);
    }

    @GetMapping("/compatibility/{otherUserEmail}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Calcular compatibilidad de usuario",
        description = "Calcula el puntaje de compatibilidad detallado con desglose por factores (categoría, edad, ubicación, tags)")
    public ResponseEntity<MatchCompatibilityDTO> calculateCompatibility(
        @Parameter(description = "Email del otro usuario") @PathVariable String otherUserEmail,
        Authentication authentication) {
        try {
            String currentUserEmail = authentication.getName();
            MatchCompatibilityDTO compatibility = matchDiscoveryService.calculateUserCompatibility(currentUserEmail, otherUserEmail);
            return ResponseEntity.ok(compatibility);
        } catch (Exception e) {
            logger.error("Error calculando compatibilidad", Map.of(
                "currentUser", authentication.getName(),
                "otherUser", otherUserEmail
            ), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/suggestions")
    @PreAuthorize("isAuthenticated()")
    @JsonView(UserViews.Suggestions.class)
    @Operation(summary = "Obtener sugerencias de usuarios",
        description = "Sugerencias paginadas basadas en compatibilidad con nivel de detalle configurable")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Sugerencias recuperadas exitosamente"),
        @ApiResponse(responseCode = "400", description = "Parámetros inválidos"),
        @ApiResponse(responseCode = "401", description = "Usuario no autenticado")
    })
    public ResponseEntity<Page<UserSuggestionDTO>> getUserSuggestions(
        @Parameter(description = "Nivel de inclusión: public, basic, standard")
        @RequestParam(name = "include", defaultValue = "public") String includeLevel,
        @PageableDefault(size = 10) Pageable pageable,
        Authentication authentication) {
        try {
            // Validar nivel de inclusión
            if (!UserResponseLevel.isValidLevel(includeLevel)) {
                return ResponseEntity.badRequest().build();
            }

            String currentUserEmail = authentication.getName();
            Page<UserSuggestionDTO> suggestions = matchDiscoveryService.getUserSuggestions(currentUserEmail, includeLevel, pageable);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            logger.error("Error obteniendo sugerencias para el usuario", Map.of(
                "userEmail", authentication.getName(),
                "includeLevel", includeLevel
            ), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Actualizar perfil del usuario actual",
        description = "Actualiza el perfil del usuario actual con imágenes")
    public ResponseEntity<UserResponseDTO> updateCurrentUser(
        @RequestParam("profileData") String profileDataJson,
        @RequestParam(value = "profileImages", required = false) List<MultipartFile> profileImages,
        @RequestParam(value = "replaceImages", defaultValue = "false") boolean replaceImages,
        Authentication authentication
    ) throws IOException {
        String userEmail = authentication.getName();

        // Delegar al Orchestrator (PUT y PATCH usan la misma lógica)
        UserResponseDTO updatedUser = userProfileOrchestrator.updateProfile(
            userEmail,
            profileDataJson,
            profileImages,
            replaceImages
        );

        return ResponseEntity.ok(updatedUser);
    }

    @PatchMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Actualización parcial del perfil de usuario",
        description = "Actualiza campos específicos del perfil de usuario usando operación PATCH. " +
            "Soporta multipart/form-data con imágenes. " +
            "Solo los campos proporcionados serán actualizados. Usa campos Optional para distinguir entre " +
            "valores nulos y campos no enviados. Soporta actualizaciones anidadas para ubicación, preferencias, privacidad, etc. " +
            "Con replaceImages=true, reemplaza todas las imágenes existentes con las nuevas (útil para eliminar imágenes).",
        tags = {"User Profile Management"}
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Perfil actualizado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos (manejado por GlobalExceptionHandler)"),
        @ApiResponse(responseCode = "401", description = "Usuario no autenticado (manejado por GlobalExceptionHandler)")
    })
    public ResponseEntity<UserResponseDTO> update(
        @RequestParam(value = "profileData", required = false) String profileDataJson,
        @RequestParam(value = "profileImages", required = false) List<MultipartFile> profileImages,
        @RequestParam(value = "replaceImages", defaultValue = "false") boolean replaceImages,
        Authentication authentication
    ) throws IOException {
        String userEmail = authentication.getName();

        UserResponseDTO updatedUser = userProfileOrchestrator.updateProfile(
            userEmail,
            profileDataJson,
            profileImages,
            replaceImages
        );

        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/deactivate")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Desactivar cuenta del usuario actual",
        description = "Desactiva la cuenta del usuario actual")
    public ResponseEntity<MessageResponseDTO> deactivateCurrentAccount(
        @RequestParam(required = false) String reason,
        Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            MessageResponseDTO response = userService.deactivateOwnAccount(userEmail, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error desactivando cuenta del usuario", Map.of(
                "userEmail", authentication.getName()
            ), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al desactivar cuenta"));
        }
    }

    // ========================================
    // ADMIN ENDPOINTS
    // ========================================

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener todos los usuarios",
        description = "Obtiene todos los usuarios con paginación y búsqueda")
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
        @RequestParam(required = false) String search,
        @PageableDefault(size = 20) Pageable pageable) {
        try {
            Page<UserResponseDTO> users;
            if (search != null && !search.trim().isEmpty()) {
                users = userService.searchUsers(search, pageable);
            } else {
                users = userService.getListPaginated(pageable);
            }
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error obteniendo todos los usuarios", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener usuarios por estado",
        description = "Obtiene usuarios filtrados por estado (active, pending-approval, unverified, non-approved, deactivated, incomplete-user)")
    public ResponseEntity<Page<UserResponseDTO>> getUsersByStatus(
        @Parameter(description = "Estado del usuario") @PathVariable String status,
        @RequestParam(required = false) String search,
        @PageableDefault(size = 20) Pageable pageable) {
        try {
            Page<UserResponseDTO> users = userService.getUsersByStatus(status, search, pageable);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error obteniendo usuarios por estado", Map.of("complaintStatus", status), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Actualizar perfil de usuario (admin)",
        description = "Actualiza el perfil de usuario con imágenes (solo admin)")
    public ResponseEntity<UserResponseDTO> updateUserProfile(
        @Parameter(description = "ID del usuario") @PathVariable String userId,
        @RequestParam("profileData") String profileDataJson,
        @RequestParam(value = "profileImages", required = false) List<MultipartFile> profileImages,
        @RequestParam(value = "replaceImages", defaultValue = "false") boolean replaceImages
    ) throws IOException {
        // Obtener email del usuario
        String userEmail = userService.getUserEmailById(userId);

        // Delegar al Orchestrator
        UserResponseDTO updatedUser = userProfileOrchestrator.updateProfile(
            userEmail,
            profileDataJson,
            profileImages,
            replaceImages
        );

        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{userId}/deactivate")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Desactivar cuenta de usuario",
        description = "Desactiva una cuenta de usuario (solo admin)")
    public ResponseEntity<MessageResponseDTO> deactivateAccount(
        @Parameter(description = "ID del usuario") @PathVariable String userId,
        @RequestParam(required = false) String reason) {
        try {
            MessageResponseDTO response = userService.deactivateAccount(userId, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error desactivando cuenta del usuario", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al desactivar cuenta"));
        }
    }

    @PutMapping("/{userId}/reactivate")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Reactivar cuenta de usuario",
        description = "Reactiva una cuenta de usuario desactivada")
    public ResponseEntity<MessageResponseDTO> reactivateAccount(
        @Parameter(description = "ID del usuario") @PathVariable String userId) {
        try {
            MessageResponseDTO response = userService.reactivateAccount(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error reactivando cuenta del usuario", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al reactivar cuenta"));
        }
    }

    @PostMapping("/deactivate-batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Desactivar cuentas en lote",
        description = "Desactiva múltiples cuentas de usuarios a la vez")
    public ResponseEntity<MessageResponseDTO> deactivateAccountsBatch(
        @RequestBody List<String> userIds,
        @RequestParam(required = false) String reason) {
        try {
            MessageResponseDTO response = userService.deactivateAccountsBatch(userIds, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error desactivando cuentas en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al desactivar cuentas en lote"));
        }
    }

    @PostMapping("/reactivate-batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Reactivar cuentas en lote",
        description = "Reactiva múltiples cuentas de usuarios desactivadas a la vez")
    public ResponseEntity<MessageResponseDTO> reactivateAccountsBatch(
        @RequestBody List<String> userIds) {
        try {
            MessageResponseDTO response = userService.reactivateAccountsBatch(userIds);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error reactivando cuentas en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al reactivar cuentas en lote"));
        }
    }


    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Eliminar usuario",
        description = "Elimina permanentemente una cuenta de usuario")
    public ResponseEntity<MessageResponseDTO> deleteUser(
        @Parameter(description = "ID o email del usuario") @PathVariable String userId) {
        try {
            MessageResponseDTO response = userService.deleteUser(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error eliminando usuario", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al eliminar usuario"));
        }
    }

    @DeleteMapping("/delete-batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Eliminar usuarios en lote",
        description = "Elimina permanentemente múltiples cuentas de usuarios a la vez")
    public ResponseEntity<MessageResponseDTO> deleteUsersBatch(
        @RequestBody List<String> userIds) {
        try {
            MessageResponseDTO response = userService.deleteUsersBatch(userIds);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error eliminando usuarios en lote", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al eliminar usuarios en lote"));
        }
    }

    // ========================================
    // MÉTODOS HELPER PRIVADOS
    // ========================================
    // NOTA: Los métodos parseProfileData y validateProfileRequest fueron movidos
    // al UserProfileOrchestrator para mantener el controlador delgado y centrado en HTTP.

    // ========================================
    // ADMINISTRACIÓN DE ATRIBUTOS
    // ========================================

    /**
     * Obtiene todos los atributos activos con paginación para panel de administración.
     *
     * @param pageable Configuración de paginación
     * @return Página de atributos ordenados por tipo y displayOrder
     */
    @GetMapping("/attributes/admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener todos los atributos paginados", description = "Obtiene todos los atributos activos con paginación para panel de administración")
    public ResponseEntity<Page<UserAttributeResponseDTO>> getAllAttributesPaged(
        @PageableDefault(size = 20, sort = {"attributeType", "displayOrder"}) Pageable pageable) {
        try {
            Page<UserAttributeResponseDTO> attributes = userAttributeService.getActiveAttributesPaged(pageable);
            return ResponseEntity.ok(attributes);
        } catch (Exception e) {
            logger.error("Error obteniendo atributos paginados", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene atributos activos de múltiples tipos en una sola consulta.
     * Útil para formularios que necesitan varios tipos de atributos a la vez.
     *
     * @param types Lista de tipos separados por coma (ej: GENDER,EYE_COLOR,HAIR_COLOR)
     * @return DTO con atributos agrupados por tipo
     */
    @GetMapping("/attributes/multiple")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener atributos por múltiples tipos", description = "Obtiene atributos activos de múltiples tipos en una sola consulta")
    public ResponseEntity<Map<String, List<UserAttributeResponseDTO>>> getAttributesByTypes(
        @Parameter(description = "Tipos de atributos separados por coma") @RequestParam String types) {
        try {
            List<String> typeList = List.of(types.split(","));
            Map<String, List<UserAttributeResponseDTO>> attributes = userAttributeService.getAttributesByTypes(typeList);
            return ResponseEntity.ok(attributes);
        } catch (Exception e) {
            logger.error("Error obteniendo atributos por tipos", Map.of("types", types), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene lista de tipos de atributos activos disponibles.
     *
     * @return DTO con lista de tipos de atributos únicos
     */
    @GetMapping("/attributes/types")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener tipos de atributos activos", description = "Obtiene lista de tipos de atributos activos disponibles")
    public ResponseEntity<List<String>> getActiveAttributeTypes() {
        try {
            List<String> types = userAttributeService.getActiveAttributeTypes();
            return ResponseEntity.ok(types);
        } catch (Exception e) {
            logger.error("Error obteniendo tipos de atributos activos", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene cantidad de atributos inactivos pendientes de aprobación.
     *
     * @return DTO con cantidad de atributos inactivos
     */
    @GetMapping("/attributes/inactive/count")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Contar atributos inactivos", description = "Obtiene la cantidad de atributos inactivos pendientes de aprobación")
    public ResponseEntity<UserCountDTO> countInactiveAttributes() {
        try {
            long count = userAttributeService.countInactiveAttributes();
            return ResponseEntity.ok(new UserCountDTO(count));
        } catch (Exception e) {
            logger.error("Error contando atributos inactivos", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene todos los atributos inactivos para revisión administrativa.
     *
     * @return Lista de atributos inactivos
     */
    @GetMapping("/attributes/inactive")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener atributos inactivos", description = "Obtiene todos los atributos inactivos para revisión administrativa")
    public ResponseEntity<List<UserAttributeResponseDTO>> getInactiveAttributes() {
        try {
            List<UserAttributeResponseDTO> attributes = userAttributeService.getInactiveAttributes();
            return ResponseEntity.ok(attributes);
        } catch (Exception e) {
            logger.error("Error obteniendo atributos inactivos", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
