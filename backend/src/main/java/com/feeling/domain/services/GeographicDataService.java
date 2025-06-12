// Servicio mejorado para datos geográficos
package com.feeling.domain.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.feeling.domain.dto.location.CityResponseDTO;
import com.feeling.domain.dto.location.CountryResponseDTO;
import com.feeling.domain.dto.location.GeographicDataResponseDTO;
import com.feeling.domain.dto.location.LocalityResponseDTO;
import com.feeling.domain.dto.tour.CountryRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GeographicDataService {

    private static final Logger logger = LoggerFactory.getLogger(GeographicDataService.class);
    // Países prioritarios
    private static final Set<String> PRIORITY_COUNTRIES = Set.of("CO");
    // Ciudades prioritarias por país
    private static final Map<String, Set<String>> PRIORITY_CITIES = Map.of(
            "Colombia", Set.of("Bogotá D.C.", "Bogotá")
    );
    private final ObjectMapper objectMapper;

    public GeographicDataService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Obtiene todos los países ordenados con Colombia primero
     */
    @Cacheable("countries")
    public List<CountryResponseDTO> getAllCountries() {
        try {
            Map<String, CountryRequestDTO> countriesData = loadCountriesData();
            Map<String, List<String>> citiesData = loadCitiesData();
            Map<String, List<String>> localitiesData = loadLocalitiesData();

            List<CountryResponseDTO> countries = countriesData.entrySet().stream()
                    .map(entry -> {
                        String countryCode = entry.getKey();
                        CountryRequestDTO country = entry.getValue();
                        boolean isPriority = PRIORITY_COUNTRIES.contains(countryCode);

                        List<CityResponseDTO> cities = getCitiesForCountry(
                                country.name(),
                                citiesData,
                                localitiesData
                        );

                        return new CountryResponseDTO(
                                countryCode,
                                country.name(),
                                country.emoji(),
                                country.phone() != null && !country.phone().isEmpty() ?
                                        country.phone().get(0) : "",
                                country.region(),
                                isPriority,
                                cities
                        );
                    })
                    .sorted((a, b) -> {
                        // Países prioritarios primero
                        if (a.priority() && !b.priority()) return -1;
                        if (!a.priority() && b.priority()) return 1;
                        // Luego ordenar alfabéticamente
                        return a.name().compareTo(b.name());
                    })
                    .collect(Collectors.toList());

            return countries;

        } catch (Exception e) {
            logger.error("Error al cargar países", e);
            return getDefaultCountries();
        }
    }

    /**
     * Obtiene las ciudades de un país específico
     */
    @Cacheable("cities")
    public List<CityResponseDTO> getCitiesByCountry(String countryName) {
        try {
            Map<String, List<String>> citiesData = loadCitiesData();
            Map<String, List<String>> localitiesData = loadLocalitiesData();

            return getCitiesForCountry(countryName, citiesData, localitiesData);

        } catch (Exception e) {
            logger.error("Error al cargar ciudades para {}", countryName, e);
            return Collections.emptyList();
        }
    }

    /**
     * Obtiene las localidades de una ciudad específica
     */
    @Cacheable("localities")
    public List<LocalityResponseDTO> getLocalitiesByCity(String cityName) {
        try {
            Map<String, List<String>> localitiesData = loadLocalitiesData();

            List<String> localities = localitiesData.getOrDefault(cityName, Collections.emptyList());

            return localities.stream()
                    .map(LocalityResponseDTO::new)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("Error al cargar localidades para {}", cityName, e);
            return Collections.emptyList();
        }
    }

    /**
     * Obtiene todos los datos geográficos en una sola respuesta
     */
    @Cacheable("geographic-data")
    public GeographicDataResponseDTO getAllGeographicData() {
        List<CountryResponseDTO> countries = getAllCountries();

        // Extraer todas las ciudades únicas
        List<CityResponseDTO> allCities = countries.stream()
                .flatMap(country -> country.cities().stream())
                .distinct()
                .collect(Collectors.toList());

        // Extraer todas las localidades únicas
        List<LocalityResponseDTO> allLocalities = allCities.stream()
                .flatMap(city -> city.localities().stream())
                .distinct()
                .collect(Collectors.toList());

        return new GeographicDataResponseDTO(countries, allCities, allLocalities);
    }

    // Métodos privados auxiliares

    private List<CityResponseDTO> getCitiesForCountry(
            String countryName,
            Map<String, List<String>> citiesData,
            Map<String, List<String>> localitiesData
    ) {
        List<String> cityNames = citiesData.getOrDefault(countryName, Collections.emptyList());
        Set<String> priorityCities = PRIORITY_CITIES.getOrDefault(countryName, Collections.emptySet());

        return cityNames.stream()
                .map(cityName -> {
                    boolean isPriority = priorityCities.contains(cityName);
                    List<LocalityResponseDTO> localities = localitiesData
                            .getOrDefault(cityName, Collections.emptyList())
                            .stream()
                            .map(LocalityResponseDTO::new)
                            .collect(Collectors.toList());

                    return new CityResponseDTO(cityName, isPriority, localities);
                })
                .sorted((a, b) -> {
                    // Ciudades prioritarias primero
                    if (a.priority() && !b.priority()) return -1;
                    if (!a.priority() && b.priority()) return 1;
                    // Luego ordenar alfabéticamente
                    return a.name().compareTo(b.name());
                })
                .collect(Collectors.toList());
    }

    private Map<String, CountryRequestDTO> loadCountriesData() throws IOException {
        return objectMapper.readValue(
                new ClassPathResource("countries.json").getInputStream(),
                new TypeReference<Map<String, CountryRequestDTO>>() {
                }
        );
    }

    private Map<String, List<String>> loadCitiesData() throws IOException {
        return objectMapper.readValue(
                new ClassPathResource("cities.json").getInputStream(),
                new TypeReference<Map<String, List<String>>>() {
                }
        );
    }

    private Map<String, List<String>> loadLocalitiesData() throws IOException {
        try {
            Object localitiesObj = objectMapper.readValue(
                    new ClassPathResource("localities.json").getInputStream(),
                    Object.class
            );

            if (localitiesObj instanceof List) {
                // Si es un array directo, asumimos que son las localidades de Bogotá
                @SuppressWarnings("unchecked")
                List<String> localities = (List<String>) localitiesObj;
                Map<String, List<String>> result = new HashMap<>();
                result.put("Bogotá D.C.", localities);
                result.put("Bogotá", localities);
                return result;
            } else {
                // Si es un objeto, usar tal como está
                return objectMapper.convertValue(
                        localitiesObj,
                        new TypeReference<Map<String, List<String>>>() {
                        }
                );
            }
        } catch (Exception e) {
            logger.warn("Error al cargar localidades, usando datos por defecto", e);
            return getDefaultLocalitiesMap();
        }
    }

    private List<CountryResponseDTO> getDefaultCountries() {
        return List.of(
                new CountryResponseDTO(
                        "CO",
                        "Colombia",
                        "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/CO.svg",
                        "+57",
                        "South America",
                        true,
                        getDefaultCities()
                )
        );
    }

    private List<CityResponseDTO> getDefaultCities() {
        return List.of(
                new CityResponseDTO("Bogotá D.C.", true, getDefaultLocalityDTOs()),
                new CityResponseDTO("Medellín", false, Collections.emptyList()),
                new CityResponseDTO("Cali", false, Collections.emptyList()),
                new CityResponseDTO("Barranquilla", false, Collections.emptyList()),
                new CityResponseDTO("Cartagena", false, Collections.emptyList())
        );
    }

    private List<LocalityResponseDTO> getDefaultLocalityDTOs() {
        return List.of(
                new LocalityResponseDTO("Chapinero"),
                new LocalityResponseDTO("Zona Rosa"),
                new LocalityResponseDTO("La Candelaria"),
                new LocalityResponseDTO("Suba"),
                new LocalityResponseDTO("Engativá")
        );
    }

    private Map<String, List<String>> getDefaultLocalitiesMap() {
        List<String> bogotaLocalities = List.of(
                "Chapinero", "Zona Rosa", "La Candelaria", "Suba", "Engativá"
        );

        Map<String, List<String>> result = new HashMap<>();
        result.put("Bogotá D.C.", bogotaLocalities);
        result.put("Bogotá", bogotaLocalities);
        return result;
    }
}
