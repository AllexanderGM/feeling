package com.feeling.packages.common.domain.services.storage;

import io.minio.*;
import io.minio.http.Method;
import io.minio.messages.Item;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "storage.type", havingValue = "minio")
@Slf4j
public class MinioStorageService {

    private final MinioClient minioClient; // Inyectar el bean configurado

    @Value("${minio.url}")
    private String minioUrl;

    @Value("${minio.bucket}")
    private String bucketName;

    @Value("${minio.public-url:#{null}}")
    private String publicUrl;

    public String uploadFile(MultipartFile file, String filePath) throws IOException {
        try {
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(filePath)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build()
            );

            // Generar URL pública para MinIO
            return generatePublicUrl(filePath);

        } catch (Exception e) {
            throw new IOException("Error subiendo archivo a MinIO: " + e.getMessage(), e);
        }
    }

    public boolean deleteFile(String fileName) {
        try {
            minioClient.removeObject(
                RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(fileName)
                    .build()
            );

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean deleteFileByUrl(String fileUrl) {
        String objectKey = extractKeyFromUrl(fileUrl);
        if (objectKey == null) {
            return false;
        }
        return deleteFile(objectKey);
    }

    /**
     * Genera URL pública para acceder a archivos en MinIO
     */
    public String generatePublicUrl(String filePath) {
        try {
            // Si hay una URL pública configurada, usarla
            if (publicUrl != null && !publicUrl.trim().isEmpty()) {
                return String.format("%s/%s/%s", publicUrl, bucketName, filePath);
            }

            // Generar URL con acceso directo (para MinIO con bucket público)
            String directUrl = String.format("%s/%s/%s", minioUrl, bucketName, filePath);

            // Verificar si el bucket está configurado como público
            // Si no, generar URL pre-firmada
            try {
                return directUrl;
            } catch (Exception e) {
                log.warn("Error accediendo URL directa, generando URL pre-firmada: {}", e.getMessage());
                return generatePresignedUrl(filePath);
            }

        } catch (Exception e) {
            log.error("Error generando URL pública para {}: {}", filePath, e.getMessage());
            return null;
        }
    }

    private String extractKeyFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return null;
        }

        try {
            URI uri = new URI(fileUrl);
            String path = uri.getPath();
            if (path == null || path.isBlank()) {
                return null;
            }

            if (path.startsWith("/")) {
                path = path.substring(1);
            }

            if (path.startsWith(bucketName + "/")) {
                path = path.substring(bucketName.length() + 1);
            }

            return path;
        } catch (URISyntaxException e) {
            int index = fileUrl.indexOf(bucketName + "/");
            if (index >= 0) {
                return fileUrl.substring(index + bucketName.length() + 1);
            }
            return null;
        }
    }

    /**
     * Genera URL pre-firmada para archivos privados
     */
    public String generatePresignedUrl(String filePath) {
        try {
            return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucketName)
                    .object(filePath)
                    .expiry(7, TimeUnit.DAYS) // URL válida por 7 días
                    .build()
            );
        } catch (Exception e) {
            log.error("Error generando URL pre-firmada para {}: {}", filePath, e.getMessage());
            return null;
        }
    }

    public List<String> listFiles(String folder) {
        List<String> fileUrls = new ArrayList<>();
        try {
            Iterable<Result<Item>> results = minioClient.listObjects(
                ListObjectsArgs.builder()
                    .bucket(bucketName)
                    .prefix(folder + "/")
                    .recursive(true)
                    .build()
            );

            for (Result<Item> result : results) {
                Item item = result.get();
                if (!item.isDir()) { // Skip directories
                    String objectName = item.objectName();
                    // Filter for image files
                    if (isImageFile(objectName)) {
                        String url = generatePublicUrl(objectName);
                        if (url != null) {
                            fileUrls.add(url);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error listing files in folder {}: {}", folder, e.getMessage());
        }
        return fileUrls;
    }

    private boolean isImageFile(String filename) {
        String[] imageExtensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"};
        String lowerFilename = filename.toLowerCase();
        for (String ext : imageExtensions) {
            if (lowerFilename.endsWith(ext)) {
                return true;
            }
        }
        return false;
    }
}
