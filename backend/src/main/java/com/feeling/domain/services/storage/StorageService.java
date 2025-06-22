package com.feeling.domain.services.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageService {

    @Autowired(required = false)
    private S3StorageService s3StorageService;

    @Autowired(required = false)
    private MinioStorageService minioStorageService;

    @Value("${storage.type}")
    private String storageType;

    public String uploadImage(MultipartFile file, String folder) throws IOException {
        String fileName = generateUniqueFileName(file.getOriginalFilename());
        String filePath = folder + "/" + fileName;

        return switch (storageType.toLowerCase()) {
            case "s3" -> {
                if (s3StorageService == null) {
                    throw new IllegalStateException("S3StorageService no está disponible en este entorno");
                }
                yield s3StorageService.uploadFile(file, filePath);
            }
            case "minio" -> {
                if (minioStorageService == null) {
                    throw new IllegalStateException("MinioStorageService no está disponible en este entorno");
                }
                yield minioStorageService.uploadFile(file, filePath);
            }
            default ->
                    throw new IllegalStateException("Tipo de almacenamiento no configurado correctamente. Usa 'minio' para desarrollo o 's3' para producción");
        };
    }

    public List<String> uploadImages(List<MultipartFile> files, String folder) throws IOException {
        return files.stream()
                .map(file -> {
                    try {
                        return uploadImage(file, folder);
                    } catch (IOException e) {
                        throw new RuntimeException("Error subiendo archivo: " + file.getOriginalFilename(), e);
                    }
                })
                .toList();
    }

    public boolean deleteImage(String imageUrl) {
        try {
            String fileName = extractFileNameFromUrl(imageUrl);
            return switch (storageType.toLowerCase()) {
                case "s3" -> {
                    if (s3StorageService == null) {
                        yield false;
                    }
                    yield s3StorageService.deleteFile(fileName);
                }
                case "minio" -> {
                    if (minioStorageService == null) {
                        yield false;
                    }
                    yield minioStorageService.deleteFile(fileName);
                }
                default -> false;
            };
        } catch (Exception e) {
            return false;
        }
    }

    public void deleteImages(List<String> imageUrls) {
        imageUrls.forEach(this::deleteImage);
    }

    private String generateUniqueFileName(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID() + extension;
    }

    private String extractFileNameFromUrl(String url) {
        return url.substring(url.lastIndexOf("/") + 1);
    }
}