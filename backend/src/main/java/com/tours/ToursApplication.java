package com.tours;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.context.WebServerInitializedEvent;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ToursApplication extends SpringBootServletInitializer {

	public static void main(String[] args) {
		// Cargar las variables de entorno del archivo .env
		Dotenv dotenv = Dotenv.configure().load();
		dotenv.entries().forEach(entry -> {
			System.setProperty(entry.getKey(), entry.getValue());
		});

		SpringApplication.run(ToursApplication.class, args);
	}

	@Bean
	public ApplicationListener<WebServerInitializedEvent> webServerListener() {
		return event -> {
			int port = event.getWebServer().getPort();
			System.setProperty("local.server.port", String.valueOf(port));
		};
	}

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(ToursApplication.class);
	}

}
