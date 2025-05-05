package com.tours.domain.dto.info;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class InfoSystemResponseDTO {
    private String platform;
    private String release;
    private String uptime;
    private String hostname;
    private String arch;
    private Integer cpus;
    private Map<String, String> memory;

    public InfoSystemResponseDTO(String platform, String release, String uptime, String hostname, String arch, Integer cpus, String totalMemory, String freeMemory) {
        this.platform = platform;
        this.release = release;
        this.uptime = uptime;
        this.hostname = hostname;
        this.arch = arch;
        this.cpus = cpus;
        this.memory = new HashMap<>();

        memory.put("total", totalMemory);
        memory.put("free", freeMemory);
    }
}
