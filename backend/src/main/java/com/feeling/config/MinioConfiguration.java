package com.feeling.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "storage.type", havingValue = "minio")
@Slf4j
public class MinioConfiguration {

    @Value("${minio.url}")
    private String minioUrl;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Value("${minio.bucket}")
    private String bucketName;

    @Bean
    public MinioClient minioClient() {
        try {
            log.info("🔧 Configurando MinIO en: {}", minioUrl);

            MinioClient client = MinioClient.builder()
                    .endpoint(minioUrl)
                    .credentials(accessKey, secretKey)
                    .build();

            // Auto-crear bucket en desarrollo
            createBucketIfNotExists(client);

            log.info("✅ MinIO configurado correctamente - Bucket: {}", bucketName);

            return client;

        } catch (Exception e) {
            log.error("❌ Error configurando MinIO: {}", e.getMessage());
            throw new RuntimeException("No se pudo conectar con MinIO", e);
        }
    }

    private void createBucketIfNotExists(MinioClient client) {
        try {
            boolean bucketExists = client.bucketExists(
                    BucketExistsArgs.builder()
                            .bucket(bucketName)
                            .build()
            );

            if (!bucketExists) {
                client.makeBucket(
                        MakeBucketArgs.builder()
                                .bucket(bucketName)
                                .build()
                );
                log.info("📁 Bucket '{}' creado", bucketName);
            }
        } catch (Exception e) {
            log.error("❌ Error configurando bucket: {}", e.getMessage());
            throw new RuntimeException("Error configurando bucket MinIO", e);
        }
    }
}