package com.feeling.domain.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.feeling.domain.dto.tour.CountryRequestDTO;
import com.feeling.infrastructure.entities.location.Location;
import com.feeling.infrastructure.repositories.location.ILocationRepository;
import jakarta.transaction.Transactional;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Data
@Service
public class LocationService {
    private static final Logger logger = LoggerFactory.getLogger(LocationService.class);
    private final ObjectMapper objectMapper;
    private final ILocationRepository locationRepository;

    @Transactional
    public void loadDestinations() {
        try {
            if (locationRepository.count() > 0) {
                logger.info("Los destinos ya están cargados en la base de datos.");
                return;
            }

            // Leer países
            logger.info("Cargando datos de países y ciudades...");
            Map<String, CountryRequestDTO> countries = objectMapper.readValue(
                    new ClassPathResource("countries.json").getInputStream(),
                    new TypeReference<>() {
                    }
            );

            // Leer ciudades
            Map<String, List<String>> citiesByCountry = objectMapper.readValue(
                    new ClassPathResource("cities.json").getInputStream(),
                    new TypeReference<>() {
                    }
            );

            for (Map.Entry<String, CountryRequestDTO> entry : countries.entrySet()) {
                CountryRequestDTO country = entry.getValue();

                // Buscar ciudades usando el nombre del país
                List<String> cities = citiesByCountry.getOrDefault(country.name(), new ArrayList<>());

                Location location = new Location();
                location.setRegion(country.region());
                location.setCountry(country.name());
                location.setCity(cities);
                location.setImage(country.emoji());
                location.setPhone(Optional.ofNullable(country.phone()).orElse(new ArrayList<>()));
                locationRepository.save(location);
                logger.info("Destino guardado: {} - {}", country.region(), country.name());
            }
            logger.info("Carga de destinos completada correctamente.");
        } catch (IOException e) {
            logger.error("Error al cargar los destinos: {}", e.getMessage(), e);
        }
    }
}
