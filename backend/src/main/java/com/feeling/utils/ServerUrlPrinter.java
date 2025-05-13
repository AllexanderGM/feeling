package com.feeling.utils;

import org.jetbrains.annotations.NotNull;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class ServerUrlPrinter implements ApplicationListener<ApplicationReadyEvent> {

    private final Environment environment;

    public ServerUrlPrinter(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void onApplicationEvent(@NotNull ApplicationReadyEvent event) {
        String port = environment.getProperty("local.server.port");
        String serverUrl = "http://localhost:" + port;
        System.out.println("Server is running at: " + serverUrl);
    }
}
