package com.feeling.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@ConditionalOnProperty(name = "storage.type", havingValue = "s3")
@Slf4j
public class S3Configuration {

    @Value("${s3.region}")
    private String region;

    @Value("${s3.access-key}")
    private String accessKey;

    @Value("${s3.secret-key}")
    private String secretKey;

    @Value("${s3.bucket}")
    private String bucketName;

    @Bean
    public S3Client s3Client() {
        try {
            // Validar que las credenciales no estén vacías
            if (accessKey == null || accessKey.trim().isEmpty()) {
                throw new IllegalArgumentException("AWS_ACCESS_KEY_ID no puede estar vacío");
            }
            if (secretKey == null || secretKey.trim().isEmpty()) {
                throw new IllegalArgumentException("AWS_SECRET_ACCESS_KEY no puede estar vacío");
            }

            log.info("🔧 Configurando AWS S3...");
            log.info("📍 Región: {}", region);
            log.info("🗂️  Bucket: {}", bucketName);
            log.info("🔑 Access Key: {}", accessKey.substring(0, Math.min(6, accessKey.length())) + "***");

            AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);

            S3Client client = S3Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(credentials))
                    .build();

            // Verificar conectividad (opcional)
            verifyConnection(client);

            log.info("✅ S3 configurado para PRODUCCIÓN");
            log.info("🌐 Región: {}", region);

            return client;

        } catch (Exception e) {
            log.error("❌ Error configurando S3: {}", e.getMessage());
            log.error("🔍 Verifica que las credenciales AWS sean correctas y tengan permisos de S3");
            throw new RuntimeException("No se pudo conectar con S3 en producción", e);
        }
    }

    private void verifyConnection(S3Client client) {
        try {
            // Verificar que el cliente puede hacer una operación básica
            client.listBuckets();
            log.info("🔗 Conexión con S3 verificada correctamente");
        } catch (Exception e) {
            log.warn("⚠️  No se pudo verificar la conexión con S3: {}", e.getMessage());
            // No lanzamos excepción aquí, ya que podría ser un problema de permisos específicos
        }
    }
}