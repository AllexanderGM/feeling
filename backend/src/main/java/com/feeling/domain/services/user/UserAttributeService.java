package com.feeling.domain.services.user;

import com.feeling.domain.dto.user.UserAttributeCreateDTO;
import com.feeling.domain.dto.user.UserAttributeDTO;
import com.feeling.infrastructure.entities.user.UserAttribute;
import com.feeling.infrastructure.repositories.user.IUserAttributeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.HashMap;
import com.feeling.domain.dto.user.UserPublicResponseDTO;
import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.services.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserAttributeService {

    private final IUserAttributeRepository userAttributeRepository;

    // Tipos de atributos válidos
    private static final Set<String> VALID_ATTRIBUTE_TYPES = Set.of(
            "GENDER", "EYE_COLOR", "HAIR_COLOR", "BODY_TYPE", "RELIGION",
            "MARITAL_STATUS", "EDUCATION_LEVEL", "RELATIONSHIP_TYPE", "SEXUAL_ROLE"
    );

    /**
     * Obtiene todos los atributos agrupados por tipo
     */
    public Map<String, List<UserAttributeDTO>> getAllAttributesGrouped() {
        List<UserAttribute> attributes = userAttributeRepository.findByActiveTrue();

        return attributes.stream()
                .map(UserAttributeDTO::new)
                .collect(Collectors.groupingBy(UserAttributeDTO::attributeType));
    }

    /**
     * Obtiene atributos de un tipo específico
     */
    public List<UserAttributeDTO> getAttributesByType(String attributeType) {
        return userAttributeRepository.findByAttributeTypeOrderedByDisplay(attributeType.toUpperCase())
                .stream()
                .map(UserAttributeDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un atributo por ID
     */
    public UserAttributeDTO getAttributeById(Long id) {
        return userAttributeRepository.findById(id)
                .map(UserAttributeDTO::new)
                .orElse(null);
    }

    /**
     * Crea un nuevo atributo de usuario con validaciones
     * Por defecto se crea como inactivo (active=false) para aprobación
     */
    public UserAttributeDTO createAttribute(String attributeType, UserAttributeCreateDTO createDTO) {
        log.info("Iniciando creación de atributo tipo: {}, datos: {}", attributeType, createDTO);

        // Validar tipo de atributo
        validateAttributeType(attributeType);

        // Validar datos del DTO
        validateAttributeData(createDTO);

        // Generar código único
        String code = generateCodeFromName(createDTO.name());

        // Validar duplicados
        validateNoDuplicates(attributeType, code, createDTO.name());

        try {
            UserAttribute newAttribute = UserAttribute.builder()
                    .code(code)
                    .name(createDTO.name().trim())
                    .attributeType(attributeType.toUpperCase())
                    .detail(createDTO.detail() != null ? createDTO.detail().trim() : null)
                    .displayOrder(getNextDisplayOrder(attributeType))
                    .active(false) // Por defecto inactivo hasta aprobación
                    .build();

            UserAttribute saved = userAttributeRepository.save(newAttribute);
            log.info("Atributo creado exitosamente: {}", saved);

            return new UserAttributeDTO(saved);

        } catch (DataIntegrityViolationException e) {
            log.error("Error de integridad de datos al crear atributo: {}", e.getMessage());
            throw new RuntimeException("Ya existe un atributo con ese código o nombre");
        } catch (Exception e) {
            log.error("Error inesperado al crear atributo", e);
            throw new RuntimeException("Error al guardar el atributo en la base de datos");
        }
    }

    /**
     * Valida que el tipo de atributo sea válido
     */
    private void validateAttributeType(String attributeType) {
        if (!StringUtils.hasText(attributeType)) {
            throw new IllegalArgumentException("El tipo de atributo es requerido");
        }

        if (!VALID_ATTRIBUTE_TYPES.contains(attributeType.toUpperCase())) {
            throw new IllegalArgumentException(
                    String.format("Tipo de atributo no válido: %s. Tipos válidos: %s",
                            attributeType, String.join(", ", VALID_ATTRIBUTE_TYPES))
            );
        }
    }

    /**
     * Valida los datos del DTO
     */
    private void validateAttributeData(UserAttributeCreateDTO createDTO) {
        if (!StringUtils.hasText(createDTO.name())) {
            throw new IllegalArgumentException("El nombre del atributo es requerido");
        }

        if (createDTO.name().trim().length() < 2) {
            throw new IllegalArgumentException("El nombre debe tener al menos 2 caracteres");
        }

        if (createDTO.name().trim().length() > 100) {
            throw new IllegalArgumentException("El nombre no puede superar los 100 caracteres");
        }

        // Validar detail si es un color
        if (StringUtils.hasText(createDTO.detail()) && createDTO.detail().startsWith("#")) {
            if (!isValidHexColor(createDTO.detail())) {
                throw new IllegalArgumentException("El código de color no es válido");
            }
        }
    }

    /**
     * Valida que no existan duplicados
     */
    private void validateNoDuplicates(String attributeType, String code, String name) {
        // Verificar código duplicado
        if (userAttributeRepository.findByCodeAndAttributeType(code, attributeType.toUpperCase()).isPresent()) {
            throw new RuntimeException(String.format("Ya existe un atributo con el código '%s' para el tipo '%s'", code, attributeType));
        }

        // Verificar nombre duplicado (case-insensitive)
        List<UserAttribute> existingWithSameName = userAttributeRepository
                .findByAttributeTypeOrderedByDisplay(attributeType.toUpperCase())
                .stream()
                .filter(attr -> attr.getName().trim().equalsIgnoreCase(name.trim()))
                .toList();

        if (!existingWithSameName.isEmpty()) {
            throw new RuntimeException(String.format("Ya existe un atributo con el nombre '%s' para el tipo '%s'", name, attributeType));
        }
    }

    /**
     * Valida si un string es un color hexadecimal válido
     */
    private boolean isValidHexColor(String color) {
        return color.matches("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");
    }

    /**
     * Genera un código basado en el nombre del atributo
     */
    private String generateCodeFromName(String name) {
        if (!StringUtils.hasText(name)) {
            throw new IllegalArgumentException("No se puede generar código sin nombre");
        }

        return name.trim()
                .toUpperCase()
                .replaceAll("[\\s-]+", "_")
                .replaceAll("[^A-Z0-9_]", "")
                .replaceAll("_{2,}", "_") // Remover múltiples guiones bajos consecutivos
                .replaceAll("^_|_$", ""); // Remover guiones bajos al inicio y final
    }

    /**
     * Obtiene el siguiente displayOrder para un tipo de atributo
     */
    private Integer getNextDisplayOrder(String attributeType) {
        return userAttributeRepository.findByAttributeTypeOrderedByDisplay(attributeType.toUpperCase())
                .stream()
                .mapToInt(UserAttribute::getDisplayOrder)
                .max()
                .orElse(0) + 1;
    }

    /**
     * Obtiene usuarios filtrados por atributo específico
     */
    public Page<UserPublicResponseDTO> getUsersByAttribute(Long attributeId, Pageable pageable) {
        try {
            // For now, return empty page since we don't have the user filtering logic here
            // This should be implemented by injecting UserRepository and filtering users
            log.warn("getUsersByAttribute not fully implemented - returning empty page");
            return Page.empty(pageable);
        } catch (Exception e) {
            log.error("Error obteniendo usuarios por atributo: {}", attributeId, e);
            return Page.empty(pageable);
        }
    }

    /**
     * Actualiza un atributo existente
     */
    public UserAttributeDTO updateAttribute(Long attributeId, UserAttributeCreateDTO updateDTO) {
        try {
            UserAttribute attribute = userAttributeRepository.findById(attributeId)
                    .orElseThrow(() -> new RuntimeException("Atributo no encontrado: " + attributeId));

            // Validar datos del DTO
            validateAttributeData(updateDTO);

            // Actualizar campos
            attribute.setName(updateDTO.name().trim());
            if (updateDTO.detail() != null) {
                attribute.setDetail(updateDTO.detail().trim());
            }

            UserAttribute saved = userAttributeRepository.save(attribute);
            log.info("Atributo actualizado exitosamente: {}", saved);

            return new UserAttributeDTO(saved);
        } catch (Exception e) {
            log.error("Error actualizando atributo: {}", attributeId, e);
            throw new RuntimeException("Error al actualizar atributo");
        }
    }

    /**
     * Elimina un atributo
     */
    public MessageResponseDTO deleteAttribute(Long attributeId) {
        try {
            UserAttribute attribute = userAttributeRepository.findById(attributeId)
                    .orElseThrow(() -> new RuntimeException("Atributo no encontrado: " + attributeId));

            userAttributeRepository.delete(attribute);
            log.info("Atributo eliminado exitosamente: {}", attributeId);

            return new MessageResponseDTO("Atributo eliminado exitosamente");
        } catch (Exception e) {
            log.error("Error eliminando atributo: {}", attributeId, e);
            throw new RuntimeException("Error al eliminar atributo");
        }
    }

    /**
     * Obtiene estadísticas completas de los atributos de usuario
     */
    public Map<String, Object> getAttributeStatistics() {
        try {
            Map<String, Object> statistics = new HashMap<>();
            
            // Obtener todos los atributos
            List<UserAttribute> allAttributes = userAttributeRepository.findAll();
            
            // Estadísticas generales
            statistics.put("totalAttributes", allAttributes.size());
            statistics.put("activeAttributes", allAttributes.stream().mapToInt(attr -> attr.isActive() ? 1 : 0).sum());
            statistics.put("inactiveAttributes", allAttributes.stream().mapToInt(attr -> !attr.isActive() ? 1 : 0).sum());
            
            // Distribución por tipo
            Map<String, Long> distributionByType = allAttributes.stream()
                    .collect(Collectors.groupingBy(
                            UserAttribute::getAttributeType,
                            Collectors.counting()
                    ));
            statistics.put("distributionByType", distributionByType);
            
            // Atributos activos por tipo
            Map<String, Long> activeByType = allAttributes.stream()
                    .filter(UserAttribute::isActive)
                    .collect(Collectors.groupingBy(
                            UserAttribute::getAttributeType,
                            Collectors.counting()
                    ));
            statistics.put("activeByType", activeByType);
            
            // Tipos de atributos disponibles
            statistics.put("availableTypes", VALID_ATTRIBUTE_TYPES);
            
            return statistics;
            
        } catch (Exception e) {
            log.error("Error obteniendo estadísticas de atributos", e);
            return Map.of(
                    "error", "Error al obtener estadísticas",
                    "message", e.getMessage()
            );
        }
    }
}