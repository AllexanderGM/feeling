package com.feeling.domain.services;

import com.sun.management.OperatingSystemMXBean;
import com.feeling.domain.dto.info.InfoGeneralResponseDTO;
import com.feeling.domain.dto.info.InfoSystemResponseDTO;
import com.feeling.utils.MemoryFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.net.InetAddress;
import java.sql.Connection;
import java.sql.SQLException;

@Service
public class InfoService {

    final MemoryFormatter memoryFormatter;
    @Autowired
    private DataSource dataSource;

    public InfoService(MemoryFormatter memoryFormatter) {
        this.memoryFormatter = memoryFormatter;
    }

    public InfoGeneralResponseDTO getInfoGeneral() {
        InfoGeneralResponseDTO info = new InfoGeneralResponseDTO(
                this.getUpdate(),
                "Glocal Topur API - DH-G2-Final",
                "OK");

        info.addService("Spring Boot", "servicio disponible");

        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(2)) {
                info.addService("SQL Server", "servicio disponible");
            } else {
                info.addService("SQL Server", "Conexión no valida");
            }
        } catch (SQLException e) {
            info.addService("SQL Server", "Error al verificar la conexión: " + e.getMessage());
        }


        return info;
    }

    public InfoSystemResponseDTO getInfoSystem() {
        try {
            InetAddress ip = InetAddress.getLocalHost();
            OperatingSystemMXBean osBean = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();

            return new InfoSystemResponseDTO(
                    ip.getHostName(),
                    System.getProperty("os.version"),
                    this.getUpdate(),
                    ip.getHostName(),
                    System.getProperty("os.arch"),
                    Runtime.getRuntime().availableProcessors(),
                    MemoryFormatter.formatMemorySize(osBean.getTotalMemorySize()),
                    MemoryFormatter.formatMemorySize(osBean.getFreeMemorySize())
            );
        } catch (java.net.UnknownHostException e) {
            e.printStackTrace();
            return new InfoSystemResponseDTO(
                    "Unknown",
                    "Unknown",
                    "Unknown",
                    "Unknown",
                    "Unknown",
                    -1,
                    "Unknown",
                    "Unknown"
            );
        }
    }

    private String getUpdate() {
        long uptimeMillis = ManagementFactory.getRuntimeMXBean().getUptime();
        long hours = uptimeMillis / (1000 * 60 * 60);
        long minutes = (uptimeMillis % (1000 * 60 * 60)) / (1000 * 60);
        long seconds = (uptimeMillis % (1000 * 60)) / 1000;

        return String.format("%d hours, %d minutes, %d seconds", hours, minutes, seconds);
    }
}
