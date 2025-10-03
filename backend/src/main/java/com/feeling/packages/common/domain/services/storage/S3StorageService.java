package com.feeling.domain.services.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Object;

import java.io.IOException;
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