package com.feeling.packages.common.domain.services.media;

import com.feeling.exception.BadRequestException;
import com.feeling.packages.common.domain.services.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Servicio genérico para gestión de imágenes en toda la aplicación.
 * <p>
 * Proporciona operaciones comunes de manejo de imágenes que pueden ser
 * reutilizadas por diferentes módulos (usuarios, eventos, lugares, etc.).
 * <p>
 * Responsabilidades:
 * - Validación de imágenes (formato, tamaño)
 * - Subida de imágenes al storage
 * - Eliminación de imágenes
 * - Reordenamiento de listas de imágenes
 * - Extracción de metadatos básicos
 * <p>
 * Este servicio es stateless y no mantiene referencias a entidades específicas,
 * delegando la persistencia a los servicios de dominio que lo utilicen.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
public class ImageManagementService {

    private static final Logger logger = LoggerFactory.getLogger(ImageManagementService.class);

    private final StorageService storageService;

    // Constantes configurables (pueden ser externalizadas a properties)
    public static final int DEFAULT_MAX_IMAGES = 6;
    public static final long DEFAULT_MAX_IMAGE_SIZE_MB = 10;
    public static final List<String> DEFAULT_ALLOWED_CONTENT_TYPES = List.of(
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    );

    // ========================================
    // VALIDACIÓN DE IMÁGENES
    // ========================================

    /**
     * Valida una lista de archivos de imagen con límites personalizados.
     *
     * @param images              Lista de archivos a validar
     * @param maxImages           Máximo número de imágenes permitidas
     * @param maxSizeMB           Tamaño máximo por imagen en MB
     * @param allowedContentTypes Tipos MIME permitidos
     * @throws BadRequestException Si alguna validación falla
     */
    public void validateImages(List<MultipartFile> images, int maxImages, long maxSizeMB, List<String> allowedContentTypes) {
        if (images == null || images.isEmpty()) {
            throw new BadRequestException("La lista de imágenes no puede estar vacía");
        }

        if (images.size() > maxImages) {
            throw new BadRequestException(
                String.format("No se pueden subir más de %d imágenes a la vez", maxImages)
            );
        }

        for (MultipartFile image : images) {
            validateImageSize(image, maxSizeMB);
            validateImageFormat(image, allowedContentTypes);
        }
    }

    /**
     * Valida imágenes con configuración por defecto.
     *
     * @param images Lista de archivos a validar
     * @throws BadRequestException Si alguna validación falla
     */
    public void validateImages(List<MultipartFile> images) {
        validateImages(images, DEFAULT_MAX_IMAGES, DEFAULT_MAX_IMAGE_SIZE_MB, DEFAULT_ALLOWED_CONTENT_TYPES);
    }

    /**
     * Valida el tamaño de un archivo de imagen.
     *
     * @param image     Archivo a validar
     * @param maxSizeMB Tamaño máximo permitido en MB
     * @throws BadRequestException Si el tamaño excede el límite
     */
    public void validateImageSize(MultipartFile image, long maxSizeMB) {
        long maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (image.getSize() > maxSizeBytes) {
            throw new BadRequestException(
                String.format("La imagen '%s' excede el tamaño máximo permitido de %dMB",
                    image.getOriginalFilename(), maxSizeMB)
            );
        }
    }

    /**
     * Valida el formato/tipo MIME de una imagen.
     *
     * @param image               Archivo a validar
     * @param allowedContentTypes Lista de tipos MIME permitidos
     * @throws BadRequestException Si el formato no está permitido
     */
    public void validateImageFormat(MultipartFile image, List<String> allowedContentTypes) {
        String contentType = image.getContentType();
        if (contentType == null || !allowedContentTypes.contains(contentType.toLowerCase())) {
            throw new BadRequestException(
                String.format("Formato de imagen no permitido: %s. Formatos aceptados: JPEG, PNG, WEBP",
                    contentType)
            );
        }
    }

    /**
     * Valida que agregar nuevas imágenes no exceda el límite total.
     *
     * @param currentCount   Número actual de imágenes
     * @param newImagesCount Número de imágenes nuevas a agregar
     * @param maxImages      Límite máximo de imágenes permitidas
     * @throws BadRequestException Si se excede el límite
     */
    public void validateImageCount(int currentCount, int newImagesCount, int maxImages) {
        int totalCount = currentCount + newImagesCount;

        if (totalCount > maxImages) {
            throw new BadRequestException(
                String.format("Límite de imágenes excedido. Máximo permitido: %d. Actuales: %d. Intentando agregar: %d",
                    maxImages, currentCount, newImagesCount)
            );
        }
    }

    // ========================================
    // OPERACIONES DE ALMACENAMIENTO
    // ========================================

    /**
     * Sube múltiples imágenes al storage.
     *
     * @param images    Lista de archivos a subir
     * @param folder    Carpeta de destino en el storage (ej: "profile", "events")
     * @param maxImages Máximo número de imágenes en el batch
     * @return Lista de URLs de las imágenes subidas
     * @throws IOException         Si ocurre un error durante la subida
     * @throws BadRequestException Si la validación falla
     */
    public List<String> uploadImages(List<MultipartFile> images, String folder, int maxImages) throws IOException {
        logger.info("Subiendo {} imágenes a la carpeta: {}", images.size(), folder);

        // Validar antes de subir
        validateImages(images, maxImages, DEFAULT_MAX_IMAGE_SIZE_MB, DEFAULT_ALLOWED_CONTENT_TYPES);

        try {
            List<String> imageUrls = storageService.uploadImages(images, folder);
            logger.info("Imágenes subidas exitosamente: {} URLs generadas", imageUrls.size());
            return imageUrls;
        } catch (Exception e) {
            logger.error("Error al subir imágenes a {}: {}", folder, e.getMessage(), e);
            throw new IOException("Error al subir imágenes: " + e.getMessage(), e);
        }
    }

    /**
     * Sube imágenes con configuración por defecto.
     *
     * @param images Lista de archivos a subir
     * @param folder Carpeta de destino
     * @return Lista de URLs de las imágenes subidas
     * @throws IOException Si ocurre un error durante la subida
     */
    public List<String> uploadImages(List<MultipartFile> images, String folder) throws IOException {
        return uploadImages(images, folder, DEFAULT_MAX_IMAGES);
    }

    /**
     * Elimina una imagen del storage.
     *
     * @param imageUrl URL de la imagen a eliminar
     * @throws BadRequestException Si ocurre un error durante la eliminación
     */
    public void deleteImage(String imageUrl) {
        try {
            logger.info("Eliminando imagen: {}", imageUrl);
            storageService.deleteImage(imageUrl);
            logger.info("Imagen eliminada exitosamente");
        } catch (Exception e) {
            logger.error("Error al eliminar imagen {}: {}", imageUrl, e.getMessage(), e);
            throw new BadRequestException("Error al eliminar imagen: " + e.getMessage());
        }
    }

    // ========================================
    // OPERACIONES DE LISTA
    // ========================================

    /**
     * Reordena una lista de URLs de imágenes.
     * <p>
     * Valida que todas las URLs en la nueva lista estén presentes en la lista actual.
     *
     * @param currentImages Lista actual de URLs
     * @param newOrder      Nuevo orden deseado
     * @return Lista reordenada (nueva instancia)
     * @throws BadRequestException Si las listas no coinciden
     */
    public List<String> reorderImages(List<String> currentImages, List<String> newOrder) {
        if (currentImages == null || currentImages.isEmpty()) {
            throw new BadRequestException("No hay imágenes para reordenar");
        }

        if (newOrder.size() != currentImages.size()) {
            throw new BadRequestException(
                String.format("El número de URLs proporcionadas (%d) no coincide con las imágenes actuales (%d)",
                    newOrder.size(), currentImages.size())
            );
        }

        // Validar que todas las URLs pertenezcan a la lista actual
        for (String url : newOrder) {
            if (!currentImages.contains(url)) {
                throw new BadRequestException("Una o más URLs no están en la lista actual: " + url);
            }
        }

        logger.info("Reordenando {} imágenes", currentImages.size());
        return new ArrayList<>(newOrder);
    }

    /**
     * Mueve una imagen específica a la primera posición de la lista.
     * <p>
     * Útil para establecer una foto principal/destacada.
     *
     * @param currentImages Lista actual de URLs
     * @param imageUrl      URL de la imagen a poner en primera posición
     * @return Lista reordenada con la imagen especificada al inicio
     * @throws BadRequestException Si la imagen no está en la lista
     */
    public List<String> setImageAsFirst(List<String> currentImages, String imageUrl) {
        if (currentImages == null || currentImages.isEmpty()) {
            throw new BadRequestException("No hay imágenes disponibles");
        }

        if (!currentImages.contains(imageUrl)) {
            throw new BadRequestException("La imagen especificada no está en la lista");
        }

        // Si ya es la primera, retornar la lista actual
        if (currentImages.getFirst().equals(imageUrl)) {
            return new ArrayList<>(currentImages);
        }

        // Crear nueva lista con la imagen seleccionada al inicio
        List<String> reordered = new ArrayList<>();
        reordered.add(imageUrl);
        for (String url : currentImages) {
            if (!url.equals(imageUrl)) {
                reordered.add(url);
            }
        }

        logger.info("Imagen movida a primera posición: {}", imageUrl);
        return reordered;
    }

    /**
     * Elimina una URL específica de una lista de imágenes.
     *
     * @param currentImages Lista actual de URLs
     * @param imageUrl      URL a eliminar
     * @param minImages     Mínimo de imágenes que deben quedar
     * @return Nueva lista sin la imagen especificada
     * @throws BadRequestException Si la imagen no está en la lista o se viola el mínimo
     */
    public List<String> removeImageFromList(List<String> currentImages, String imageUrl, int minImages) {
        if (currentImages == null || currentImages.isEmpty()) {
            throw new BadRequestException("No hay imágenes para eliminar");
        }

        if (!currentImages.contains(imageUrl)) {
            throw new BadRequestException("La imagen especificada no está en la lista");
        }

        if (currentImages.size() <= minImages) {
            throw new BadRequestException(
                String.format("No se puede eliminar la imagen. Debe haber al menos %d imagen(es)", minImages)
            );
        }

        List<String> updated = new ArrayList<>(currentImages);
        updated.remove(imageUrl);

        logger.info("Imagen removida de la lista. Quedan {} imágenes", updated.size());
        return updated;
    }

    // ========================================
    // METADATOS Y UTILIDADES
    // ========================================

    /**
     * Obtiene metadatos básicos de una imagen en una lista.
     *
     * @param imageList Lista de URLs de imágenes
     * @param imageUrl  URL de la imagen específica
     * @return Map con metadatos (position, isFirst, totalImages, fileName)
     * @throws BadRequestException Si la imagen no está en la lista
     */
    public Map<String, Object> getImageMetadata(List<String> imageList, String imageUrl) {
        if (imageList == null || !imageList.contains(imageUrl)) {
            throw new BadRequestException("La imagen especificada no está en la lista");
        }

        int position = imageList.indexOf(imageUrl);
        boolean isFirst = (position == 0);

        return Map.of(
            "url", imageUrl,
            "position", position,
            "isFirst", isFirst,
            "totalImages", imageList.size(),
            "fileName", extractFileName(imageUrl)
        );
    }

    /**
     * Obtiene metadatos de todas las imágenes en una lista.
     *
     * @param imageList Lista de URLs
     * @return Lista de mapas con metadatos de cada imagen
     */
    public List<Map<String, Object>> getAllImagesMetadata(List<String> imageList) {
        if (imageList == null || imageList.isEmpty()) {
            return List.of();
        }

        List<Map<String, Object>> metadata = new ArrayList<>();
        for (int i = 0; i < imageList.size(); i++) {
            String url = imageList.get(i);
            metadata.add(Map.of(
                "url", url,
                "position", i,
                "isFirst", (i == 0),
                "fileName", extractFileName(url)
            ));
        }

        return metadata;
    }

    /**
     * Extrae el nombre del archivo de una URL completa.
     *
     * @param url URL completa
     * @return Nombre del archivo
     */
    public String extractFileName(String url) {
        if (url == null || url.isEmpty()) {
            return "";
        }
        int lastSlashIndex = url.lastIndexOf('/');
        return lastSlashIndex >= 0 ? url.substring(lastSlashIndex + 1) : url;
    }
}
