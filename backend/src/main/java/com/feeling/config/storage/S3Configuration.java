package com.feeling.config.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;

@Configuration
@ConditionalOnProperty(name = "storage.type", havingValue = "s3")
@Slf4j
public class S3Configuration {

    private static final String DEFAULT_REGION = "us-east-1";

    @Value("${s3.region}")
    private String region;

    @Value("${s3.access-key:}")
    private String accessKey;

    @Value("${s3.secret-key:}")
    private String secretKey;

    @Value("${s3.bucket}")
    private String bucketName;

    @Bean
    public S3Client s3Client() {
        try {
            final String resolvedRegion = StringUtils.hasText(region) ? region : DEFAULT_REGION;

            log.info("🔧 Configurando AWS S3...");
            log.info("📍 Región: {}", resolvedRegion);
            log.info("🗂️  Bucket: {}", bucketName);

            AwsCredentialsProvider credentialsProvider;
            if (StringUtils.hasText(accessKey) && StringUtils.hasText(secretKey)) {
                log.info("🔑 Usando credenciales estáticas proporcionadas por variables de entorno.");
                AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey.trim(), secretKey.trim());
                credentialsProvider = StaticCredentialsProvider.create(credentials);
            } else {
                log.info("🔑 Usando DefaultCredentialsProvider (IAM Role / AWS CLI profile).");
                credentialsProvider = DefaultCredentialsProvider.create();
            }

            S3Client client = S3Client.builder()
                    .region(Region.of(resolvedRegion))
                    .credentialsProvider(credentialsProvider)
                    .build();

            // Verificar conectividad (opcional)
            verifyConnection(client);

            log.info("✅ S3 configurado para PRODUCCIÓN");
            return client;

        } catch (Exception e) {
            log.error("❌ Error configurando S3: {}", e.getMessage());
            log.error("🔍 Verifica que las credenciales AWS sean correctas y tengan permisos de S3");
            throw new RuntimeException("No se pudo conectar con S3 en producción", e);
        }
    }

    private void verifyConnection(S3Client client) {
        try {
            // Verificar que el cliente puede hacer una operación básica sobre el bucket configurado
            if (!StringUtils.hasText(bucketName)) {
                log.warn("⚠️  Bucket no configurado, se omite la verificación de S3");
                return;
            }

            HeadBucketRequest request = HeadBucketRequest.builder()
                .bucket(bucketName)
                .build();

            client.headBucket(request);
            log.info("🔗 Conexión con S3 verificada correctamente para el bucket {}", bucketName);
        } catch (Exception e) {
            log.warn("⚠️  No se pudo verificar la conexión con S3: {}", e.getMessage());
            // No lanzamos excepción aquí, ya que podría ser un problema de permisos específicos
        }
    }
}
