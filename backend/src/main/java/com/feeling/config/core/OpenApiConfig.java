package com.feeling.config.core;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuración de OpenAPI/Swagger para documentación de API.
 * <p>
 * Esta configuración personaliza la documentación automática generada
 * por SpringDoc OpenAPI, incluyendo información del proyecto, servidores
 * y metadatos de contacto.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.port:8081}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Feeling API")
                .version("1.0.0")
                .description("API REST para la plataforma Feeling - Sistema de matching y gestión de eventos")
                .contact(new Contact()
                    .name("Feeling Development Team")
                    .email("complaint@feeling.com"))
                .license(new License()
                    .name("Proprietary")
                    .url("https://feeling.com/license")))
            .servers(List.of(
                new Server()
                    .url("http://localhost:" + serverPort)
                    .description("Servidor de desarrollo local"),
                new Server()
                    .url("https://api.feeling.com")
                    .description("Servidor de producción")
            ));
    }

}
