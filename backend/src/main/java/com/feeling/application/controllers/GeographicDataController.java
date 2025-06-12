package com.feeling.application.controllers;

import com.feeling.domain.dto.location.CityResponseDTO;
import com.feeling.domain.dto.location.CountryResponseDTO;
import com.feeling.domain.dto.location.GeographicDataResponseDTO;
import com.feeling.domain.dto.location.LocalityResponseDTO;
import com.feeling.domain.services.GeographicDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/geographic")
@RequiredArgsConstructor
@Tag(name = "Geographic Data", description = "Endpoints para datos geográficos (países, ciudades, localidades)")
public class GeographicDataController {

    private final GeographicDataService geographicDataService;

    @Operation(
            summary = "Obtener todos los países",
            description = "Retorna la lista completa de países ordenados con Colombia primero, incluyendo sus ciudades y localidades"
    )
    @ApiResponse(responseCode = "200", description = "Lista de países obtenida exitosamente")
    @GetMapping("/countries")
    public ResponseEntity<List<CountryResponseDTO>> getAllCountries() {
        List<CountryResponseDTO> countries = geographicDataService.getAllCountries();
        return ResponseEntity.ok(countries);
    }

    @Operation(
            summary = "Obtener ciudades por país",
            description = "Retorna las ciudades de un país específico ordenadas con las principales primero"
    )
    @ApiResponse(responseCode = "200", description = "Lista de ciudades obtenida exitosamente")
    @ApiResponse(responseCode = "404", description = "País no encontrado")
    @GetMapping("/countries/{countryName}/cities")
    public ResponseEntity<List<CityResponseDTO>> getCitiesByCountry(
            @Parameter(description = "Nombre del país", example = "Colombia")
            @PathVariable String countryName
    ) {
        List<CityResponseDTO> cities = geographicDataService.getCitiesByCountry(countryName);
        return ResponseEntity.ok(cities);
    }

    @Operation(
            summary = "Obtener localidades por ciudad",
            description = "Retorna las localidades de una ciudad específica"
    )
    @ApiResponse(responseCode = "200", description = "Lista de localidades obtenida exitosamente")
    @ApiResponse(responseCode = "404", description = "Ciudad no encontrada")
    @GetMapping("/cities/{cityName}/localities")
    public ResponseEntity<List<LocalityResponseDTO>> getLocalitiesByCity(
            @Parameter(description = "Nombre de la ciudad", example = "Bogotá D.C.")
            @PathVariable String cityName
    ) {
        List<LocalityResponseDTO> localities = geographicDataService.getLocalitiesByCity(cityName);
        return ResponseEntity.ok(localities);
    }

    @Operation(
            summary = "Obtener todos los datos geográficos",
            description = "Retorna todos los datos geográficos (países, ciudades y localidades) en una sola respuesta optimizada"
    )
    @ApiResponse(responseCode = "200", description = "Datos geográficos obtenidos exitosamente")
    @GetMapping("/all")
    public ResponseEntity<GeographicDataResponseDTO> getAllGeographicData() {
        GeographicDataResponseDTO data = geographicDataService.getAllGeographicData();
        return ResponseEntity.ok(data);
    }

    @Operation(
            summary = "Obtener países simplificados",
            description = "Retorna solo los países sin datos anidados para selectores simples"
    )
    @ApiResponse(responseCode = "200", description = "Lista simplificada de países")
    @GetMapping("/countries/simple")
    public ResponseEntity<List<CountryResponseDTO>> getSimpleCountries() {
        List<CountryResponseDTO> countries = geographicDataService.getAllCountries()
                .stream()
                .map(country -> new CountryResponseDTO(
                        country.code(),
                        country.name(),
                        country.emoji(),
                        country.phoneCode(),
                        country.region(),
                        country.priority(),
                        List.of() // Sin ciudades para respuesta simple
                ))
                .toList();

        return ResponseEntity.ok(countries);
    }
}
