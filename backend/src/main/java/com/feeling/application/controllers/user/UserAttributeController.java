package com.feeling.application.controllers.user;

import com.feeling.domain.dto.user.UserAttributeDTO;
import com.feeling.domain.services.user.UserAttributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

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
        Map<String, List<UserAttributeDTO>> attributes = userAttributeService.getAllAttributesGrouped();
        return ResponseEntity.ok(attributes);
    }

    /**
     * Obtiene atributos de un tipo específico
     * GET /user-attributes/gender
     */
    @GetMapping("/{attributeType}")
    public ResponseEntity<List<UserAttributeDTO>> getAttributesByType(@PathVariable String attributeType) {
        List<UserAttributeDTO> attributes = userAttributeService.getAttributesByType(attributeType);
        return ResponseEntity.ok(attributes);
    }

    /**
     * Obtiene solo los tipos disponibles
     * GET /user-attributes/types
     */
    @GetMapping("/types")
    public ResponseEntity<List<String>> getAttributeTypes() {
        Map<String, List<UserAttributeDTO>> grouped = userAttributeService.getAllAttributesGrouped();
        List<String> types = List.copyOf(grouped.keySet());
        return ResponseEntity.ok(types);
    }
}
