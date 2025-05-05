package com.tours.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.context.annotation.Bean;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync // Habilita la ejecución asíncrona en la aplicación
public class AsyncConfig {

}
