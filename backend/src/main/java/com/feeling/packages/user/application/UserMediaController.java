package com.feeling.packages.user.application;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.user.domain.dto.response.UserResponseDTO;
import com.feeling.packages.user.domain.services.UserMediaService;
import com.feeling.packages.user.domain.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestión de imágenes de perfil de usuarios.
 * <p>
 * Este controlador maneja todas las operaciones relacionadas con la gestión de
 * multimedia en perfiles de usuario, incluyendo:
 * <ul>
 *   <li>Subida de imágenes de perfil (multipart/form-data)</li>
 *   <li>Consulta de imágenes de un usuario</li>
 *   <li>Cambio de imagen principal</li>
 *   <li>Eliminación de imágenes (usuario y admin)</li>
 *   <li>Moderación de contenido inapropiado (admin)</li>
 * </ul>
 * <p>
 * Endpoints para clientes (autenticados):
 * - Gestión completa de sus propias imágenes de perfil
 * - Configuración de imagen principal
 * <p>
 * Endpoints para administradores:
 * - Consulta de imágenes de cualquier usuario
 * - Eliminación de imágenes por moderación
 * - Reporte y gestión de contenido inapropiado
 * <p>
 * Validaciones:
 * - Formatos soportados: JPEG, PNG, WEBP
 * - Tamaño máximo por imagen: Configurado en application.properties
 * - Validación automática de contenido (StorageService)
 * <p>
 * Arquitectura:
 * - Sigue principios DDD (Domain-Driven Design)
 * - No contiene lógica de negocio (delegada a UserMediaService)
 * - Manejo de errores específico para operaciones de I/O
 * - Logging estructurado de operaciones multimedia
 * - Documentación completa con Swagger/OpenAPI
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @see UserMediaService
 * @see com.feeling.packages.common.domain.services.storage.StorageService
 * @since 1.0
 */
@RestController
@RequestMapping("/user-media")
@RequiredArgsConstructor
@Tag(name = "User Media", description = "Endpoints para gestión de imágenes de perfil de usuarios")
public class UserMediaController {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(UserMediaController.class);

    private final UserMediaService userMediaService;
    private final UserService userService;

    // ========================================
    // CLIENTE - GESTIÓN DE PROPIAS IMÁGENES
    // ========================================

    /**
     * Sube nuevas imágenes al perfil del usuario autenticado.
     *
     * @param images         Lista de archivos de imagen (multipart/form-data)
     * @param authentication Usuario autenticado
     * @return DTO con información actualizada del usuario incluyendo URLs de imágenes
     */
    @PostMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Subir imágenes de perfil",
        description = "Sube una o más imágenes al perfil del usuario autenticado. Formatos: JPEG, PNG, WEBP")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Imágenes subidas exitosamente"),
        @ApiResponse(responseCode = "400", description = "Formato de imagen inválido o tamaño excedido"),
        @ApiResponse(responseCode = "401", description = "No autenticado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<UserResponseDTO> uploadImages(
        @Parameter(description = "Archivos de imagen a subir")
        @RequestParam("images") List<MultipartFile> images,
        Authentication authentication
    ) {
        try {
            String userEmail = authentication.getName();
            logger.info("Subiendo imágenes para usuario", Map.of(
                "cantidad", images.size(),
                "userEmail", userEmail
            ));
            UserResponseDTO updatedUser = userMediaService.uploadImages(userEmail, images);
            return ResponseEntity.ok(updatedUser);
        } catch (IOException e) {
            logger.error("Error subiendo imágenes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            logger.error("Error procesando imágenes", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Obtiene las imágenes del perfil del usuario autenticado.
     *
     * @param authentication Usuario autenticado
     * @return DTO con información del usuario incluyendo URLs de imágenes
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener mis imágenes",
        description = "Retorna las URLs de todas las imágenes del perfil del usuario autenticado")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Imágenes obtenidas exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<UserResponseDTO> getMyImages(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            logger.info("Consultando imágenes de usuario", Map.of("userEmail", userEmail));
            UserResponseDTO user = userService.get(userEmail);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.error("Error obteniendo imágenes de usuario", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Cambia la imagen principal del perfil del usuario autenticado.
     *
     * @param imageUrl       URL de la imagen a establecer como principal
     * @param authentication Usuario autenticado
     * @return Mensaje de confirmación
     */
    @PutMapping("/me/main")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cambiar imagen principal",
        description = "Establece una de las imágenes existentes como imagen principal del perfil")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Imagen principal actualizada"),
        @ApiResponse(responseCode = "400", description = "URL de imagen inválida o no pertenece al usuario"),
        @ApiResponse(responseCode = "401", description = "No autenticado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> setMainImage(
        @Parameter(description = "URL de la imagen a establecer como principal")
        @RequestParam String imageUrl,
        Authentication authentication
    ) {
        try {
            String userEmail = authentication.getName();
            logger.info("Cambiando imagen principal para usuario", Map.of("userEmail", userEmail));
            MessageResponseDTO response = userMediaService.setProfilePicture(userEmail, imageUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error cambiando imagen principal", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al cambiar imagen principal"));
        }
    }

    /**
     * Elimina una imagen del perfil del usuario autenticado.
     *
     * @param imageUrl       URL de la imagen a eliminar
     * @param authentication Usuario autenticado
     * @return Mensaje de confirmación
     */
    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Eliminar imagen de perfil",
        description = "Elimina una imagen específica del perfil del usuario autenticado")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Imagen eliminada exitosamente"),
        @ApiResponse(responseCode = "400", description = "URL de imagen inválida o no pertenece al usuario"),
        @ApiResponse(responseCode = "401", description = "No autenticado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> deleteImage(
        @Parameter(description = "URL de la imagen a eliminar")
        @RequestParam String imageUrl,
        Authentication authentication
    ) {
        try {
            String userEmail = authentication.getName();
            logger.info("Eliminando imagen para usuario", Map.of("userEmail", userEmail));
            MessageResponseDTO response = userMediaService.deleteImage(userEmail, imageUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error eliminando imagen", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al eliminar imagen"));
        }
    }

    // ========================================
    // ADMIN - CONSULTA Y MODERACIÓN
    // ========================================

    /**
     * Obtiene las imágenes de un usuario específico (admin).
     *
     * @param userId ID del usuario
     * @return DTO con información del usuario incluyendo URLs de imágenes
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Obtener imágenes de usuario (admin)",
        description = "Retorna las URLs de todas las imágenes de un usuario específico. Solo administradores")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Imágenes obtenidas exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<UserResponseDTO> getUserImages(
        @Parameter(description = "ID del usuario") @PathVariable String userId
    ) {
        try {
            logger.info("Admin consultando imágenes de usuario", Map.of("userId", userId));
            String userEmail = userService.getUserEmailById(userId);
            UserResponseDTO user = userService.get(userEmail);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.error("Error obteniendo imágenes de usuario", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Elimina una imagen de un usuario específico por moderación (admin).
     *
     * @param userId   ID del usuario
     * @param imageUrl URL de la imagen a eliminar
     * @return Mensaje de confirmación
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Eliminar imagen de usuario por moderación (admin)",
        description = "Elimina una imagen específica de un usuario por moderación. Solo administradores")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Imagen eliminada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario o imagen no encontrada"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<MessageResponseDTO> deleteUserImage(
        @Parameter(description = "ID del usuario") @PathVariable String userId,
        @Parameter(description = "URL de la imagen a eliminar") @RequestParam String imageUrl
    ) {
        try {
            logger.info("Admin eliminando imagen de usuario", Map.of("userId", userId));
            String userEmail = userService.getUserEmailById(userId);
            MessageResponseDTO response = userMediaService.deleteImage(userEmail, imageUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error eliminando imagen de usuario", Map.of("userId", userId), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponseDTO("Error al eliminar imagen"));
        }
    }
}
