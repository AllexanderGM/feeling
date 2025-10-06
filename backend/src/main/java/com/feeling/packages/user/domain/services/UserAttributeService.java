package com.feeling.packages.user.domain.services;

import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.user.domain.dto.UserAttributeCreateDTO;
import com.feeling.packages.user.domain.dto.UserAttributeDTO;
import com.feeling.packages.user.domain.dto.UserResponseDTO;
import com.feeling.packages.user.infrastructure.entities.UserAttribute;
import com.feeling.packages.user.infrastructure.repositories.IUserAttributeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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
     * Obtiene todos los atributos agrupados por tipo.
     *
     * @return Map con atributos agrupados por tipo y ordenados
     */
    public Map<String, List<UserAttributeDTO>> getAllAttributesGrouped() {
        List<UserAttribute> attributes = userAttributeRepository.findAllActiveOrdered();

        return attributes.stream()
            .map(UserAttributeDTO::new)
            .collect(Collectors.groupingBy(UserAttributeDTO::attributeType));
    }

    /**
     * Obtiene atributos de un tipo específico
     */
    public List<UserAttributeDTO> getAttributesByType(String attributeType) {
        return userAttributeRepository.findByAttributeTypeAndActiveTrueOrderByDisplayOrderAsc(attributeType.toUpperCase())
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
     * Valida que no existan duplicados de código o nombre para un tipo de atributo.
     * Verifica tanto atributos activos como inactivos.
     *
     * @param attributeType Tipo de atributo
     * @param code          Código del atributo
     * @param name          Nombre del atributo
     * @throws RuntimeException si existe un duplicado
     */
    private void validateNoDuplicates(String attributeType, String code, String name) {
        // Verificar código duplicado (activos e inactivos)
        if (userAttributeRepository.existsByCodeAndAttributeType(code, attributeType.toUpperCase())) {
            throw new RuntimeException(String.format("Ya existe un atributo con el código '%s' para el tipo '%s'", code, attributeType));
        }

        // Verificar nombre duplicado (case-insensitive)
        List<UserAttribute> existingWithSameName = userAttributeRepository
            .findActiveByAttributeType(attributeType.toUpperCase())
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
     * Obtiene el siguiente displayOrder para un tipo de atributo.
     *
     * @param attributeType Tipo de atributo
     * @return Siguiente número de orden disponible
     */
    private Integer getNextDisplayOrder(String attributeType) {
        return userAttributeRepository.findActiveByAttributeType(attributeType.toUpperCase())
            .stream()
            .mapToInt(UserAttribute::getDisplayOrder)
            .max()
            .orElse(0) + 1;
    }

    /**
     * Obtiene usuarios filtrados por atributo específico
     *
     * @deprecated Use {@link #getUsersByAttributeWithResponseDTO(Long, Pageable)} instead
     */
    @Deprecated(since = "1.8", forRemoval = true)
    public Page<UserResponseDTO> getUsersByAttribute(Long attributeId, Pageable pageable) {
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
     * Obtiene usuarios filtrados por atributo específico (with UserResponseDTO)
     */
    public Page<UserResponseDTO> getUsersByAttributeWithResponseDTO(Long attributeId, Pageable pageable) {
        try {
            // For now, return empty page since we don't have the user filtering logic here
            // This should be implemented by injecting UserRepository and filtering users
            log.warn("getUsersByAttributeWithResponseDTO not fully implemented - returning empty page");
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
     * Obtiene todos los atributos activos con paginación para panel de administración.
     *
     * @param pageable Configuración de paginación
     * @return Página de UserAttributeDTO ordenados por tipo y displayOrder
     */
    public Page<UserAttributeDTO> getActiveAttributesPaged(Pageable pageable) {
        return userAttributeRepository.findActiveAttributesPaged(pageable)
            .map(UserAttributeDTO::new);
    }

    /**
     * Obtiene atributos activos de múltiples tipos en una sola consulta.
     *
     * @param attributeTypes Lista de tipos de atributos
     * @return Map con atributos agrupados por tipo
     */
    public Map<String, List<UserAttributeDTO>> getAttributesByTypes(List<String> attributeTypes) {
        List<String> normalizedTypes = attributeTypes.stream()
            .map(String::toUpperCase)
            .toList();

        return userAttributeRepository.findByAttributeTypeIn(normalizedTypes)
            .stream()
            .map(UserAttributeDTO::new)
            .collect(Collectors.groupingBy(UserAttributeDTO::attributeType));
    }

    /**
     * Obtiene estadísticas completas de los atributos de usuario.
     *
     * @return Map con estadísticas de atributos
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

    /**
     * Busca un atributo por ID con manejo de errores
     * Método usado internamente por el mapper para validar atributos
     *
     * @param id            ID del atributo a buscar
     * @param attributeName Nombre descriptivo del atributo para mensajes de error
     * @return UserAttribute encontrado
     * @throws RuntimeException si el atributo no se encuentra
     */
    public UserAttribute findAttributeById(Long id, String attributeName) {
        return userAttributeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException(attributeName + " no encontrado"));
    }

    /**
     * Busca un atributo activo por código y tipo.
     *
     * @param code          Código del atributo
     * @param attributeType Tipo de atributo
     * @return Optional con el UserAttribute activo, vacío si no existe o está inactivo
     */
    public java.util.Optional<UserAttribute> findByCodeAndAttributeType(String code, String attributeType) {
        return userAttributeRepository.findActiveByCodeAndType(code, attributeType);
    }

    /**
     * Busca todos los atributos activos de un tipo específico ordenados por displayOrder.
     *
     * @param attributeType Tipo de atributo
     * @return Lista de UserAttribute activos ordenados
     */
    public List<UserAttribute> findByAttributeTypeAndActiveTrue(String attributeType) {
        return userAttributeRepository.findByAttributeTypeAndActiveTrueOrderByDisplayOrderAsc(attributeType.toUpperCase());
    }

    /**
     * Guarda un atributo en el repositorio.
     * Usado principalmente por DataInitializer.
     *
     * @param attribute Atributo a guardar
     * @return UserAttribute guardado
     */
    public UserAttribute save(UserAttribute attribute) {
        return userAttributeRepository.save(attribute);
    }

    /**
     * Obtiene lista de tipos de atributos activos disponibles.
     *
     * @return Lista de tipos de atributos únicos
     */
    public List<String> getActiveAttributeTypes() {
        return userAttributeRepository.findActiveAttributeTypes();
    }

    /**
     * Cuenta atributos inactivos pendientes de aprobación.
     *
     * @return Cantidad de atributos inactivos
     */
    public long countInactiveAttributes() {
        return userAttributeRepository.countInactiveAttributes();
    }

    /**
     * Obtiene todos los atributos inactivos para revisión administrativa.
     *
     * @return Lista de UserAttributeDTO inactivos
     */
    public List<UserAttributeDTO> getInactiveAttributes() {
        return userAttributeRepository.findInactiveAttributes()
            .stream()
            .map(UserAttributeDTO::new)
            .collect(Collectors.toList());
    }
}
