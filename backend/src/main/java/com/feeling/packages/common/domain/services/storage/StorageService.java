package com.feeling.packages.common.domain.services.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
            .collect(Collectors.toList());
    }

    public boolean deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return false;
        }

        return switch (storageType.toLowerCase()) {
            case "s3" -> s3StorageService != null && s3StorageService.deleteFileByUrl(imageUrl);
            case "minio" -> minioStorageService != null && minioStorageService.deleteFileByUrl(imageUrl);
            default -> false;
        };
    }

    public void deleteImages(List<String> imageUrls) {
        imageUrls.forEach(this::deleteImage);
    }

    public List<String> listImages(String folder) {
        try {
            return switch (storageType.toLowerCase()) {
                case "s3" -> {
                    if (s3StorageService == null) {
                        yield List.of();
                    }
                    yield s3StorageService.listFiles(folder);
                }
                case "minio" -> {
                    if (minioStorageService == null) {
                        yield List.of();
                    }
                    yield minioStorageService.listFiles(folder);
                }
                default -> List.of();
            };
        } catch (Exception e) {
            return List.of();
        }
    }

    private String generateUniqueFileName(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID() + extension;
    }

}
