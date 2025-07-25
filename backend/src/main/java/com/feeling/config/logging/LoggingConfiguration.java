package com.feeling.config.logging;

import com.feeling.infrastructure.logging.RequestLoggingFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

/**
 * Configuración para el sistema de logging estructurado
 */
@Configuration
@EnableAspectJAutoProxy
public class LoggingConfiguration {

    /**
     * Bean del filtro de logging para inyección en SecurityConfiguration
     * Solo se registra a través de la cadena de filtros de seguridad para evitar duplicación
     */
    @Bean
    public RequestLoggingFilter loggingFilter() {
        return new RequestLoggingFilter();
    }
}