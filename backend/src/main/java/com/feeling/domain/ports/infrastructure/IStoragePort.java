package com.feeling.domain.ports.infrastructure;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

/**
 * Port para operaciones de almacenamiento según Clean Architecture
 * Abstrae las operaciones de storage (S3, MinIO, FileSystem, etc.)
 */
public interface IStoragePort {

    // ========================================
    // OPERACIONES BÁSICAS DE ARCHIVO
    // ========================================
    
    /**
     * Sube un archivo al storage
     */
    String uploadFile(MultipartFile file, String bucketName, String objectName) throws IOException;
    
    /**
     * Sube un archivo desde InputStream
     */
    String uploadFile(InputStream inputStream, String bucketName, String objectName, long size, String contentType) throws IOException;
    
    /**
     * Descarga un archivo del storage
     */
    InputStream downloadFile(String bucketName, String objectName) throws IOException;
    
    /**
     * Elimina un archivo del storage
     */
    boolean deleteFile(String bucketName, String objectName);
    
    /**
     * Verifica si existe un archivo
     */
    boolean fileExists(String bucketName, String objectName);

    // ========================================
    // OPERACIONES DE BUCKET
    // ========================================
    
    /**
     * Crea un bucket si no existe
     */
    void createBucketIfNotExists(String bucketName);
    
    /**
     * Lista todos los buckets
     */
    List<String> listBuckets();
    
    /**
     * Elimina un bucket
     */
    boolean deleteBucket(String bucketName);

    // ========================================
    // GESTIÓN DE URLs Y METADATOS
    // ========================================
    
    /**
     * Genera URL presignada para descarga
     */
    String generateDownloadUrl(String bucketName, String objectName, int expirationInSeconds);
    
    /**
     * Genera URL presignada para subida
     */
    String generateUploadUrl(String bucketName, String objectName, int expirationInSeconds);
    
    /**
     * Obtiene la URL pública de un archivo
     */
    String getPublicUrl(String bucketName, String objectName);
    
    /**
     * Obtiene información de un archivo
     */
    FileInfo getFileInfo(String bucketName, String objectName);

    // ========================================
    // OPERACIONES DE LISTADO
    // ========================================
    
    /**
     * Lista archivos en un bucket con prefijo
     */
    List<String> listFiles(String bucketName, String prefix);
    
    /**
     * Lista todos los archivos en un bucket
     */
    List<String> listAllFiles(String bucketName);

    // ========================================
    // OPERACIONES ESPECÍFICAS PARA FEELING
    // ========================================
    
    /**
     * Sube imagen de perfil de usuario
     */
    String uploadUserProfileImage(String userEmail, MultipartFile image) throws IOException;
    
    /**
     * Elimina imagen de perfil de usuario
     */
    boolean deleteUserProfileImage(String userEmail);
    
    /**
     * Obtiene URL de imagen de perfil
     */
    String getUserProfileImageUrl(String userEmail);
    
    /**
     * Sube múltiples imágenes de un tour
     */
    List<String> uploadTourImages(Long tourId, List<MultipartFile> images) throws IOException;
    
    /**
     * Elimina imágenes de un tour
     */
    boolean deleteTourImages(Long tourId);

    // ========================================
    // CONFIGURACIÓN Y POLÍTICAS
    // ========================================
    
    /**
     * Configura política de acceso público para un bucket
     */
    void setBucketPolicy(String bucketName, String policy);
    
    /**
     * Valida tipo de archivo permitido
     */
    boolean isValidFileType(MultipartFile file, String[] allowedTypes);
    
    /**
     * Valida tamaño de archivo
     */
    boolean isValidFileSize(MultipartFile file, long maxSizeInBytes);

    // ========================================
    // CLASE DE INFORMACIÓN DE ARCHIVO
    // ========================================
    
    record FileInfo(
            String name,
            String etag,
            long size,
            String lastModified,
            String contentType,
            String url
    ) {}
}