package com.feeling.packages.common.domain.services.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "storage.type", havingValue = "s3")
public class S3StorageService {

    private final S3Client s3Client; // Inyectar el bean configurado

    @Value("${s3.region}")
    private String region;

    @Value("${s3.bucket}")
    private String bucketName;

    public String uploadFile(MultipartFile file, String filePath) throws IOException {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(filePath)
                .contentType(file.getContentType())
                .build();

            s3Client.putObject(putObjectRequest,
                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return String.format("https://%s.s3.%s.amazonaws.com/%s",
                bucketName, region, filePath);

        } catch (Exception e) {
            throw new IOException("Error subiendo archivo a S3: " + e.getMessage(), e);
        }
    }

    public boolean deleteFile(String fileName) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build();

            s3Client.deleteObject(deleteObjectRequest);
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

    public List<String> listFiles(String folder) {
        List<String> fileUrls = new ArrayList<>();
        try {
            ListObjectsV2Request request = ListObjectsV2Request.builder()
                .bucket(bucketName)
                .prefix(folder + "/")
                .build();

            ListObjectsV2Response response = s3Client.listObjectsV2(request);

            for (S3Object object : response.contents()) {
                String objectKey = object.key();
                // Filter for image files
                if (isImageFile(objectKey)) {
                    String url = String.format("https://%s.s3.%s.amazonaws.com/%s",
                        bucketName, region, objectKey);
                    fileUrls.add(url);
                }
            }
        } catch (Exception e) {
            // Log error but return empty list
        }
        return fileUrls;
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

            // Remove leading slash
            if (path.startsWith("/")) {
                path = path.substring(1);
            }

            // When using path-style URLs the first segment is the bucket name
            if (path.startsWith(bucketName + "/")) {
                path = path.substring(bucketName.length() + 1);
            }

            return path;
        } catch (URISyntaxException e) {
            // Fall back to simple substring search
            String marker = bucketName + "/";
            int index = fileUrl.indexOf(marker);
            if (index >= 0) {
                return fileUrl.substring(index + marker.length());
            }
            return null;
        }
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
