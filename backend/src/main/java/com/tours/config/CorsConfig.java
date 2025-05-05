package com.tours.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Aplica la configuración a todas las rutas
                .allowedOrigins("http://localhost:5173", "http://dh-g2-final-frontend.s3-website-us-east-1.amazonaws.com") // Origen permitido
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Métodos permitidos
                .allowedHeaders("*") // Headers permitidos
                .exposedHeaders("Super-Admin-Email")
                .allowCredentials(true); // Permitir credenciales (cookies, etc.
    }
}
