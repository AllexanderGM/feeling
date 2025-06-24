package com.feeling.application.controllers.user;

import com.feeling.domain.dto.user.UserAttributeCreateDTO;
import com.feeling.domain.dto.user.UserAttributeDTO;
import com.feeling.domain.services.user.UserAttributeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/user-attributes")
@RequiredArgsConstructor
public class UserAttributeController {

    private final UserAttributeService userAttributeService;

    /**
     * Obtiene todos los atributos agrupados por tipo
     * GET /user-attributes
     */
    @GetMapping
    public ResponseEntity<Map<String, List<UserAttributeDTO>>> getAllAttributes() {
        try {
            Map<String, List<UserAttributeDTO>> attributes = userAttributeService.getAllAttributesGrouped();
            return ResponseEntity.ok(attributes);
        } catch (Exception e) {
            log.error("Error obteniendo todos los atributos", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene atributos de un tipo específico
     * GET /user-attributes/gender
     */
    @GetMapping("/{attributeType}")
    public ResponseEntity<List<UserAttributeDTO>> getAttributesByType(@PathVariable String attributeType) {
        try {
            List<UserAttributeDTO> attributes = userAttributeService.getAttributesByType(attributeType);
            return ResponseEntity.ok(attributes);
        } catch (Exception e) {
            log.error("Error obteniendo atributos del tipo: {}", attributeType, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene solo los tipos disponibles
     * GET /user-attributes/types
     */
    @GetMapping("/types")
    public ResponseEntity<List<String>> getAttributeTypes() {
        try {
            Map<String, List<UserAttributeDTO>> grouped = userAttributeService.getAllAttributesGrouped();
            List<String> types = List.copyOf(grouped.keySet());
            return ResponseEntity.ok(types);
        } catch (Exception e) {
            log.error("Error obteniendo tipos de atributos", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Crea un nuevo atributo de usuario
     * POST /user-attributes/{attributeType}
     */
    @PostMapping("/{attributeType}")
    public ResponseEntity<?> createAttribute(
            @PathVariable String attributeType,
            @Valid @RequestBody UserAttributeCreateDTO createDTO,
            BindingResult bindingResult) {

        log.info("Creando nuevo atributo del tipo: {} con datos: {}", attributeType, createDTO);

        // Validar errores de binding
        if (bindingResult.hasErrors()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "VALIDATION_ERROR");
            errorResponse.put("message", "Error de validación en los datos enviados");
            errorResponse.put("details", bindingResult.getFieldErrors().stream()
                    .collect(Collectors.toMap(
                            error -> error.getField(),
                            error -> error.getDefaultMessage()
                    )));

            log.warn("Error de validación creando atributo {}: {}", attributeType, errorResponse);
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            UserAttributeDTO createdAttribute = userAttributeService.createAttribute(attributeType, createDTO);
            log.info("Atributo creado exitosamente: {}", createdAttribute);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAttribute);

        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "INVALID_ATTRIBUTE_TYPE");
            errorResponse.put("message", "Tipo de atributo no válido: " + attributeType);
            errorResponse.put("details", e.getMessage());

            log.warn("Tipo de atributo inválido: {}", attributeType, e);
            return ResponseEntity.badRequest().body(errorResponse);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "DUPLICATE_ATTRIBUTE");
            errorResponse.put("message", "Ya existe un atributo con ese código o nombre");
            errorResponse.put("details", e.getMessage());

            log.warn("Error de duplicado creando atributo {}: {}", attributeType, e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "INTERNAL_SERVER_ERROR");
            errorResponse.put("message", "Error interno del servidor al crear el atributo");
            errorResponse.put("details", "Contacta al administrador del sistema");

            log.error("Error inesperado creando atributo {}: {}", attributeType, createDTO, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}