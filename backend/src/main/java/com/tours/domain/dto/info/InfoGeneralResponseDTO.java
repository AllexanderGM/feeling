package com.tours.domain.dto.info;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class InfoGeneralResponseDTO {
    private String uptime;
    private String server;
    private String health;
    private Map<String, Object> services;

    // Constructor
    public InfoGeneralResponseDTO(String uptime, String server, String health) {
        this.uptime = uptime;
        this.server = server;
        this.health = health;
        this.services = new HashMap<>();
    }

    public void addService(String name, String message) {
        this.services.put(name, message);
    }
}
