package com.feeling.packages.user.domain.services;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.common.domain.services.media.ImageManagementService;
import com.feeling.packages.user.domain.dto.mapper.UserResponseFactory;
import com.feeling.packages.user.domain.dto.user.UserResponseDTO;
import com.feeling.packages.user.domain.enums.UserResponseLevel;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Servicio especializado para gestión de imágenes y archivos multimedia de usuarios.
 * <p>
 * Responsabilidades:
 * - Subida de imágenes de perfil
 * - Eliminación de imágenes
 * - Reordenamiento de imágenes
 * - Configuración de imagen principal (user picture)
 * - Validación de formato y tamaño de archivos
 * - Gestión de avatares externos (OAuth providers)
 * - Metadatos de imágenes
 * <p>
 * Este servicio encapsula toda la lógica de negocio relacionada con
 * multimedia de usuarios, delegando el almacenamiento físico al StorageService.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
public class UserMediaService {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(UserMediaService.class);

    private final IUserRepository userRepository;
    private final ImageManagementService imageManagementService;
    private final UserCachedService userCachedService;
    private final UserResponseFactory userResponseFactory;

    // Constantes de validación específicas para usuarios
    private static final int MAX_IMAGES_PER_USER = 6;
    private static final int MIN_IMAGES_PER_USER = 1;

    // ========================================
    // SUBIDA DE IMÁGENES
    // ========================================

    /**
     * Sube múltiples imágenes de perfil para un usuario.
     * <p>
     * Validaciones aplicadas:
     * - Usuario debe existir y estar autenticado
     * - Máximo {@value MAX_IMAGES_PER_USER} imágenes por usuario
     * - Tamaño máximo por imagen: 10MB
     * - Formatos soportados: JPEG, PNG, WEBP
     * <p>
     * Efectos:
     * - Agrega las nuevas URLs a la lista de imágenes del usuario
     * - Invalida cache del usuario
     * - Recalcula estado de completitud del perfil
     * <p>
     * Comportamiento:
     * - Si el usuario ya tiene imágenes, las nuevas se agregan a la lista existente
     * - Si el total de imágenes supera MAX_IMAGES_PER_USER, se rechaza la operación
     * <p>
     * Transaccional: Rollback si falla la subida al storage
     *
     * @param email  Email del usuario que sube las imágenes
     * @param images Lista de archivos MultipartFile con las imágenes
     * @return DTO con la información actualizada del usuario incluyendo URLs de imágenes
     * @throws UnauthorizedException Si el usuario no existe
     * @throws BadRequestException   Si se excede el límite de imágenes o validación falla
     * @throws IOException           Si ocurre un error durante la subida o procesamiento
     */
    @Transactional
    @CacheEvict(
        value = {"userProfiles", "userSuggestions", "userMetrics"},
        key = "#email",
        allEntries = false
    )
    public UserResponseDTO uploadImages(String email, List<MultipartFile> images) throws IOException {
        return uploadImages(email, images, false);
    }

    /**
     * Sube múltiples imágenes de perfil para un usuario con opción de reemplazar.
     * <p>
     * Validaciones aplicadas:
     * - Usuario debe existir y estar autenticado
     * - Máximo {@value MAX_IMAGES_PER_USER} imágenes por usuario
     * - Tamaño máximo por imagen: 10MB
     * - Formatos soportados: JPEG, PNG, WEBP
     * <p>
     * Efectos:
     * - Si replaceExisting=true: Elimina las imágenes antiguas y reemplaza con las nuevas
     * - Si replaceExisting=false: Agrega las nuevas URLs a la lista de imágenes existente
     * - Invalida cache del usuario
     * - Recalcula estado de completitud del perfil
     * <p>
     * Comportamiento:
     * - replaceExisting=false: Si el total de imágenes supera MAX_IMAGES_PER_USER, se rechaza
     * - replaceExisting=true: Solo valida que las nuevas imágenes no superen MAX_IMAGES_PER_USER
     * <p>
     * Transaccional: Rollback si falla la subida al storage
     *
     * @param email           Email del usuario que sube las imágenes
     * @param images          Lista de archivos MultipartFile con las imágenes
     * @param replaceExisting Si es true, reemplaza todas las imágenes existentes; si es false, las agrega
     * @return DTO con la información actualizada del usuario incluyendo URLs de imágenes
     * @throws UnauthorizedException Si el usuario no existe
     * @throws BadRequestException   Si se excede el límite de imágenes o validación falla
     * @throws IOException           Si ocurre un error durante la subida o procesamiento
     */
    @Transactional
    @CacheEvict(
        value = {"userProfiles", "userSuggestions", "userMetrics"},
        key = "#email",
        allEntries = false
    )
    public UserResponseDTO uploadImages(String email, List<MultipartFile> images, boolean replaceExisting) throws IOException {
        logger.info("Subiendo imágenes de usuario", Map.of(
            "email", email,
            "count", images.size(),
            "replaceExisting", replaceExisting
        ));

        User user = getUserByEmail(email);
        List<String> oldImages = user.getImages() != null ? new java.util.ArrayList<>(user.getImages()) : null;

        // Validar que no se exceda el límite de imágenes
        if (replaceExisting) {
            // Si vamos a reemplazar, solo validamos que las nuevas imágenes no excedan el límite
            imageManagementService.validateImageCount(0, images.size(), MAX_IMAGES_PER_USER);
        } else {
            // Si vamos a agregar, validamos que el total no exceda el límite
            int currentCount = user.getImages() != null ? user.getImages().size() : 0;
            imageManagementService.validateImageCount(currentCount, images.size(), MAX_IMAGES_PER_USER);
        }

        try {
            // Delegar la subida al ImageManagementService
            List<String> imageUrls = imageManagementService.uploadImages(images, "user", MAX_IMAGES_PER_USER);

            if (!imageUrls.isEmpty()) {
                if (replaceExisting) {
                    // Reemplazar completamente la lista de imágenes
                    user.setImages(imageUrls);
                    logger.info("Reemplazando imágenes existentes", Map.of(
                        "email", email,
                        "old_count", oldImages != null ? oldImages.size() : 0,
                        "new_count", imageUrls.size()
                    ));
                } else {
                    // Agregar nuevas URLs a las existentes
                    List<String> currentImages = user.getImages();
                    if (currentImages == null) {
                        currentImages = new java.util.ArrayList<>();
                    }
                    currentImages.addAll(imageUrls);
                    user.setImages(currentImages);
                }

                // Recalcular completitud del perfil
                user.setProfileComplete(user.isProfileComplete());
                userRepository.save(user);

                // Invalidar cache
                userCachedService.evictUserCache(email);

                // Si reemplazamos, eliminar las imágenes antiguas del storage
                if (replaceExisting && oldImages != null && !oldImages.isEmpty()) {
                    for (String oldImageUrl : oldImages) {
                        try {
                            imageManagementService.deleteImage(oldImageUrl);
                            logger.debug("Imagen antigua eliminada del storage", Map.of("imageUrl", oldImageUrl));
                        } catch (Exception e) {
                            logger.warn("No se pudo eliminar imagen antigua del storage", Map.of(
                                "imageUrl", oldImageUrl,
                                "error", e.getMessage()
                            ));
                            // No lanzamos error aquí, las nuevas imágenes ya fueron guardadas
                        }
                    }
                }

                logger.logUserOperation("user_images_uploaded", email,
                    Map.of(
                        "images_count", imageUrls.size(),
                        "total_images", user.getImages().size(),
                        "operation", replaceExisting ? "replace" : "add"
                    ));
            }
        } catch (Exception e) {
            logger.error("Error al subir imágenes de perfil", Map.of("email", email), e);
            throw new IOException("Error al subir imágenes de perfil: " + e.getMessage(), e);
        }

        return userResponseFactory.create(user, UserResponseLevel.FULL);
    }

    // ========================================
    // ELIMINACIÓN DE IMÁGENES
    // ========================================

    /**
     * Elimina una imagen específica del perfil del usuario.
     * <p>
     * Validaciones:
     * - El usuario debe existir
     * - La URL de la imagen debe pertenecer al usuario
     * - No se puede eliminar si es la última imagen (perfil quedaría incompleto)
     * <p>
     * Efectos:
     * - Elimina la imagen del storage físico
     * - Elimina la URL de la lista de imágenes del usuario
     * - Invalida cache del usuario
     * - Recalcula estado de completitud del perfil
     *
     * @param email    Email del usuario propietario de la imagen
     * @param imageUrl URL completa de la imagen a eliminar
     * @return Mensaje de confirmación
     * @throws NotFoundException     Si el usuario no existe
     * @throws BadRequestException   Si la imagen no pertenece al usuario o es la última
     * @throws UnauthorizedException Si el usuario no tiene permiso
     */
    @Transactional
    @CacheEvict(
        value = {"userProfiles", "userSuggestions", "userMetrics"},
        key = "#email",
        allEntries = false
    )
    public MessageResponseDTO deleteImage(String email, String imageUrl) {
        logger.info("Eliminando imagen de usuario", Map.of("email", email, "imageUrl", imageUrl));

        User user = getUserByEmail(email);

        // Delegar validación y eliminación de lista al ImageManagementService
        List<String> updatedImages = imageManagementService.removeImageFromList(
            user.getImages(),
            imageUrl,
            MIN_IMAGES_PER_USER
        );

        try {
            // Eliminar del storage
            imageManagementService.deleteImage(imageUrl);

            // Actualizar la lista del usuario
            user.setImages(updatedImages);

            // Recalcular completitud del perfil
            user.setProfileComplete(user.isProfileComplete());
            userRepository.save(user);

            // Invalidar cache
            userCachedService.evictUserCache(email);

            logger.logUserOperation("user_image_deleted", email,
                Map.of("imageUrl", imageUrl, "remaining_images", updatedImages.size()));

            return new MessageResponseDTO("Imagen eliminada correctamente");
        } catch (Exception e) {
            logger.error("Error al eliminar imagen de perfil", Map.of("email", email, "imageUrl", imageUrl), e);
            throw new BadRequestException("Error al eliminar imagen: " + e.getMessage());
        }
    }

    // ========================================
    // REORDENAMIENTO DE IMÁGENES
    // ========================================

    /**
     * Reordena las imágenes de un usuario según una nueva lista ordenada.
     * <p>
     * Validaciones:
     * - Todas las URLs deben pertenecer al usuario
     * - El número de URLs debe coincidir con las imágenes actuales
     * - No se pueden agregar ni eliminar URLs, solo reordenar
     * <p>
     * Uso típico:
     * - Cambiar la foto principal (primera posición)
     * - Reorganizar el orden de visualización del perfil
     * <p>
     * La primera imagen de la lista se considerará la foto principal.
     *
     * @param email     Email del usuario propietario de las imágenes
     * @param imageUrls Lista ordenada con las URLs en el nuevo orden deseado
     * @return Mensaje de confirmación
     * @throws NotFoundException   Si el usuario no existe
     * @throws BadRequestException Si las URLs no coinciden con las actuales
     */
    @Transactional
    @CacheEvict(
        value = {"userProfiles", "userSuggestions", "userMetrics"},
        key = "#email",
        allEntries = false
    )
    public MessageResponseDTO reorderImages(String email, List<String> imageUrls) {
        logger.info("Reordenando imágenes de usuario", Map.of("email", email, "count", imageUrls.size()));

        User user = getUserByEmail(email);

        // Delegar validación y reordenamiento al ImageManagementService
        List<String> reorderedImages = imageManagementService.reorderImages(user.getImages(), imageUrls);

        // Aplicar nuevo orden
        user.setImages(reorderedImages);
        userRepository.save(user);

        // Invalidar cache
        userCachedService.evictUserCache(email);

        logger.logUserOperation("user_images_reordered", email,
            Map.of("new_profile_picture", imageUrls.getFirst()));

        return new MessageResponseDTO("Imágenes reordenadas correctamente");
    }

    /**
     * Establece una imagen específica como foto principal (primera posición).
     * <p>
     * Atajo conveniente para reordenar poniendo una imagen específica al inicio.
     *
     * @param email    Email del usuario propietario de las imágenes
     * @param imageUrl URL de la imagen que será la foto principal
     * @return Mensaje de confirmación
     * @throws NotFoundException   Si el usuario no existe
     * @throws BadRequestException Si la imagen no pertenece al usuario
     */
    @Transactional
    @CacheEvict(
        value = {"userProfiles", "userSuggestions", "userMetrics"},
        key = "#email",
        allEntries = false
    )
    public MessageResponseDTO setProfilePicture(String email, String imageUrl) {
        logger.info("Estableciendo foto principal", Map.of("email", email, "imageUrl", imageUrl));

        User user = getUserByEmail(email);

        // Delegar al ImageManagementService
        List<String> reorderedImages = imageManagementService.setImageAsFirst(user.getImages(), imageUrl);

        // Si no hubo cambio (ya era la primera), retornar sin guardar
        if (reorderedImages.equals(user.getImages())) {
            return new MessageResponseDTO("La imagen ya es la foto principal");
        }

        user.setImages(reorderedImages);
        userRepository.save(user);

        // Invalidar cache
        userCachedService.evictUserCache(email);

        logger.logUserOperation("profile_picture_set", email, Map.of("imageUrl", imageUrl));

        return new MessageResponseDTO("Foto principal establecida correctamente");
    }

    // ========================================
    // METADATOS Y CONSULTAS
    // ========================================

    /**
     * Obtiene metadatos de una imagen específica.
     * <p>
     * Retorna información sobre:
     * - URL completa de la imagen
     * - Nombre del archivo en el storage
     * - Tamaño aproximado (si está disponible)
     * - Tipo MIME
     * - Es foto principal (primera en la lista)
     * - Posición en el perfil
     *
     * @param email    Email del usuario propietario
     * @param imageUrl URL de la imagen a consultar
     * @return Map con metadatos de la imagen
     * @throws NotFoundException   Si el usuario no existe
     * @throws BadRequestException Si la imagen no pertenece al usuario
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getImageMetadata(String email, String imageUrl) {
        User user = getUserByEmail(email);

        // Delegar al ImageManagementService
        return imageManagementService.getImageMetadata(user.getImages(), imageUrl);
    }

    /**
     * Obtiene todas las imágenes del usuario con sus metadatos.
     *
     * @param email Email del usuario
     * @return Lista de mapas con metadatos de cada imagen
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllImagesMetadata(String email) {
        User user = getUserByEmail(email);

        // Delegar al ImageManagementService
        return imageManagementService.getAllImagesMetadata(user.getImages());
    }

    // ========================================
    // HELPERS PRIVADOS
    // ========================================

    /**
     * Obtiene un usuario por email con manejo de error.
     *
     * @param email Email del usuario
     * @return Usuario encontrado
     * @throws UnauthorizedException Si el usuario no existe
     */
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));
    }
}
