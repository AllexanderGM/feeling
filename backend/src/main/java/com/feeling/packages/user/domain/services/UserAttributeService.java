package com.feeling.packages.user.domain.services;

import com.feeling.exception.AttributeNotFoundException;
import com.feeling.exception.DuplicateAttributeException;
import com.feeling.exception.InvalidAttributeTypeException;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.user.domain.dto.UserAttributeDTO;
import com.feeling.packages.user.domain.dto.attributes.UserAttributeStatisticsResponseDTO;
import com.feeling.packages.user.domain.dto.request.UserAttributeCreateDTO;
import com.feeling.packages.user.infrastructure.entities.UserAttribute;
import com.feeling.packages.user.infrastructure.repositories.IUserAttributeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Servicio para gestión de atributos de usuario del sistema.
 * <p>
 * Responsabilidades:
 * - CRUD de atributos (género, color de ojos, cabello, tipo de cuerpo, etc.)
 * - Validación de tipos de atributos permitidos
 * - Generación automática de códigos únicos
 * - Agrupación y ordenamiento de atributos por tipo
 * - Estadísticas de uso de atributos
 * - Gestión de atributos activos/inactivos para aprobación
 * <p>
 * Los atributos se crean inactivos por defecto hasta aprobación administrativa.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserAttributeService {

    private final IUserAttributeRepository userAttributeRepository;

    // Tipos de atributos válidos en el sistema
    private static final Set<String> VALID_ATTRIBUTE_TYPES = Set.of(
        "GENDER", "EYE_COLOR", "HAIR_COLOR", "BODY_TYPE", "RELIGION",
        "MARITAL_STATUS", "EDUCATION_LEVEL", "RELATIONSHIP_TYPE", "SEXUAL_ROLE", "CHURCH"
    );

    // Tipos de atributos que los usuarios pueden crear (requieren aprobación)
    private static final Set<String> USER_CREATABLE_TYPES = Set.of(
        "CHURCH", "RELIGION" // Los usuarios pueden proponer nuevas iglesias o religiones
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
     * Obtiene atributos activos de un tipo específico ordenados por displayOrder.
     *
     * @param attributeType Tipo de atributo (GENDER, EYE_COLOR, etc.)
     * @return Lista de atributos activos del tipo especificado
     */
    public List<UserAttributeDTO> getAttributesByType(String attributeType) {
        return userAttributeRepository.findByAttributeTypeAndActiveTrueOrderByDisplayOrderAsc(attributeType.toUpperCase())
            .stream()
            .map(UserAttributeDTO::new)
            .collect(Collectors.toList());
    }

    /**
     * Obtiene un atributo por ID.
     *
     * @param id ID del atributo
     * @return DTO del atributo o null si no existe
     */
    public UserAttributeDTO getAttributeById(Long id) {
        return userAttributeRepository.findById(id)
            .map(UserAttributeDTO::new)
            .orElse(null);
    }

    /**
     * Crea un nuevo atributo de usuario con validaciones de negocio.
     * <p>
     * Los atributos creados por usuarios (createdByAdmin=false) se crean como inactivos
     * y requieren aprobación administrativa. Los creados por admin se crean activos.
     * Las validaciones de formato son manejadas por el DTO (@Valid).
     *
     * @param attributeType  Tipo de atributo (GENDER, EYE_COLOR, etc.)
     * @param createDTO      DTO con datos del nuevo atributo (ya validado)
     * @param createdByAdmin true si es creado por admin, false si es creado por usuario
     * @return DTO del atributo creado
     * @throws InvalidAttributeTypeException Si el tipo de atributo no es válido
     * @throws DuplicateAttributeException   Si ya existe un atributo duplicado
     * @throws IllegalArgumentException      Si un usuario intenta crear un tipo no permitido
     */
    public UserAttributeDTO createAttribute(String attributeType, UserAttributeCreateDTO createDTO, boolean createdByAdmin) {
        log.info("Iniciando creación de atributo tipo: {}, datos: {}, createdByAdmin: {}",
            attributeType, createDTO, createdByAdmin);

        // Validar tipo de atributo (validación de negocio)
        validateAttributeType(attributeType);

        // Si es creado por usuario, validar que el tipo sea permitido para usuarios
        if (!createdByAdmin) {
            validateUserCanCreateType(attributeType);
        }

        // Generar código único basado en el nombre
        String code = generateCodeFromName(createDTO.name());

        // Validar que no existan duplicados (validación de negocio)
        validateNoDuplicates(attributeType, code, createDTO.name());

        // Construir y guardar el nuevo atributo
        // Admin crea activos, usuarios crean inactivos (pendientes de aprobación)
        UserAttribute newAttribute = buildNewAttribute(attributeType, createDTO, code, createdByAdmin);
        UserAttribute saved = userAttributeRepository.save(newAttribute);

        log.info("Atributo creado exitosamente: {} (activo: {})", saved, saved.isActive());
        return new UserAttributeDTO(saved);
    }

    /**
     * Construye una nueva entidad UserAttribute a partir del DTO.
     *
     * @param attributeType  Tipo de atributo
     * @param createDTO      DTO con datos
     * @param code           Código generado
     * @param createdByAdmin Si fue creado por admin (activo) o usuario (inactivo)
     * @return Nueva instancia de UserAttribute
     */
    private UserAttribute buildNewAttribute(String attributeType, UserAttributeCreateDTO createDTO, String code, boolean createdByAdmin) {
        return UserAttribute.builder()
            .code(code)
            .name(createDTO.name()) // Ya viene trimmed del DTO
            .attributeType(attributeType.toUpperCase())
            .detail(createDTO.detail()) // Ya viene trimmed del DTO
            .displayOrder(getNextDisplayOrder(attributeType))
            .active(createdByAdmin) // Admin: activo inmediatamente, Usuario: inactivo hasta aprobación
            .build();
    }

    /**
     * Valida que el tipo de atributo sea válido en el sistema.
     *
     * @param attributeType Tipo de atributo a validar
     * @throws InvalidAttributeTypeException Si el tipo no es válido
     */
    private void validateAttributeType(String attributeType) {
        if (!StringUtils.hasText(attributeType)) {
            throw new InvalidAttributeTypeException(
                "El tipo de atributo es requerido",
                attributeType,
                VALID_ATTRIBUTE_TYPES
            );
        }

        if (!VALID_ATTRIBUTE_TYPES.contains(attributeType.toUpperCase())) {
            throw new InvalidAttributeTypeException(
                String.format("Tipo de atributo no válido: '%s'. Tipos válidos: %s",
                    attributeType, String.join(", ", VALID_ATTRIBUTE_TYPES)),
                attributeType,
                VALID_ATTRIBUTE_TYPES
            );
        }
    }

    /**
     * Valida que un usuario normal pueda crear un atributo del tipo especificado.
     * Solo ciertos tipos de atributos pueden ser propuestos por usuarios.
     *
     * @param attributeType Tipo de atributo a validar
     * @throws IllegalArgumentException Si el tipo no está permitido para usuarios
     */
    private void validateUserCanCreateType(String attributeType) {
        if (!USER_CREATABLE_TYPES.contains(attributeType.toUpperCase())) {
            throw new IllegalArgumentException(
                String.format("Los usuarios no pueden crear atributos del tipo '%s'. " +
                        "Tipos permitidos para usuarios: %s",
                    attributeType, String.join(", ", USER_CREATABLE_TYPES))
            );
        }
    }


    /**
     * Valida que no existan duplicados de código o nombre para un tipo de atributo.
     * Verifica tanto atributos activos como inactivos.
     *
     * @param attributeType Tipo de atributo
     * @param code          Código del atributo
     * @param name          Nombre del atributo
     * @throws DuplicateAttributeException si existe un duplicado
     */
    private void validateNoDuplicates(String attributeType, String code, String name) {
        // Verificar código duplicado (activos e inactivos)
        if (userAttributeRepository.existsByCodeAndAttributeType(code, attributeType.toUpperCase())) {
            throw new DuplicateAttributeException(
                String.format("Ya existe un atributo con el código '%s' para el tipo '%s'", code, attributeType),
                attributeType,
                code
            );
        }

        // Verificar nombre duplicado (case-insensitive)
        List<UserAttribute> existingWithSameName = userAttributeRepository
            .findActiveByAttributeType(attributeType.toUpperCase())
            .stream()
            .filter(attr -> attr.getName().equalsIgnoreCase(name))
            .toList();

        if (!existingWithSameName.isEmpty()) {
            throw new DuplicateAttributeException(
                String.format("Ya existe un atributo con el nombre '%s' para el tipo '%s'", name, attributeType),
                attributeType,
                name
            );
        }
    }


    /**
     * Genera un código único basado en el nombre del atributo.
     * <p>
     * Normaliza el nombre: convierte a mayúsculas, reemplaza espacios/guiones por guiones bajos,
     * elimina caracteres especiales.
     *
     * @param name Nombre del atributo
     * @return Código normalizado (ej: "Ojos Azules" → "OJOS_AZULES")
     * @throws IllegalArgumentException Si el nombre está vacío
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
     * Actualiza un atributo existente.
     *
     * @param attributeId ID del atributo a actualizar
     * @param updateDTO   DTO con nuevos datos (ya validado)
     * @return DTO del atributo actualizado
     * @throws AttributeNotFoundException Si el atributo no existe
     */
    public UserAttributeDTO updateAttribute(Long attributeId, UserAttributeCreateDTO updateDTO) {
        UserAttribute attribute = userAttributeRepository.findById(attributeId)
            .orElseThrow(() -> new AttributeNotFoundException(
                "Atributo no encontrado con ID: " + attributeId,
                attributeId
            ));

        // Actualizar campos (valores ya vienen trimmed del DTO)
        attribute.setName(updateDTO.name());
        attribute.setDetail(updateDTO.detail());

        UserAttribute saved = userAttributeRepository.save(attribute);
        log.info("Atributo actualizado exitosamente: {}", saved);

        return new UserAttributeDTO(saved);
    }

    /**
     * Elimina un atributo del sistema.
     *
     * @param attributeId ID del atributo a eliminar
     * @return Mensaje de confirmación
     * @throws AttributeNotFoundException Si el atributo no existe
     */
    public MessageResponseDTO deleteAttribute(Long attributeId) {
        UserAttribute attribute = userAttributeRepository.findById(attributeId)
            .orElseThrow(() -> new AttributeNotFoundException(
                "Atributo no encontrado con ID: " + attributeId,
                attributeId
            ));

        userAttributeRepository.delete(attribute);
        log.info("Atributo eliminado exitosamente: {}", attributeId);

        return new MessageResponseDTO("Atributo eliminado exitosamente");
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
     * Obtiene todos los atributos (activos e inactivos) con paginación.
     *
     * @param pageable Configuración de paginación
     * @return Página de UserAttributeDTO
     */
    public Page<UserAttributeDTO> getAllAttributesPaged(Pageable pageable) {
        return userAttributeRepository.findAll(pageable)
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
     * @return DTO con estadísticas de atributos
     */
    public UserAttributeStatisticsResponseDTO getAttributeStatistics() {
        try {
            // Obtener todos los atributos
            List<UserAttribute> allAttributes = userAttributeRepository.findAll();

            // Estadísticas generales
            int totalAttributes = allAttributes.size();
            int activeAttributes = (int) allAttributes.stream().filter(UserAttribute::isActive).count();
            int inactiveAttributes = totalAttributes - activeAttributes;

            // Distribución por tipo
            Map<String, Long> distributionByType = allAttributes.stream()
                .collect(Collectors.groupingBy(
                    UserAttribute::getAttributeType,
                    Collectors.counting()
                ));

            // Atributos activos por tipo
            Map<String, Long> activeByType = allAttributes.stream()
                .filter(UserAttribute::isActive)
                .collect(Collectors.groupingBy(
                    UserAttribute::getAttributeType,
                    Collectors.counting()
                ));

            return new UserAttributeStatisticsResponseDTO(
                totalAttributes,
                activeAttributes,
                inactiveAttributes,
                distributionByType,
                activeByType,
                List.copyOf(VALID_ATTRIBUTE_TYPES)
            );

        } catch (Exception e) {
            log.error("Error obteniendo estadísticas de atributos", e);
            return new UserAttributeStatisticsResponseDTO(0, 0, 0, Map.of(), Map.of(), List.of());
        }
    }

    /**
     * Busca un atributo por ID con manejo de errores
     * Método usado internamente por el mapper para validar atributos
     *
     * @param id            ID del atributo a buscar
     * @param attributeName Nombre descriptivo del atributo para mensajes de error
     * @return UserAttribute encontrado
     * @throws AttributeNotFoundException si el atributo no se encuentra
     */
    public UserAttribute findAttributeById(Long id, String attributeName) {
        return userAttributeRepository.findById(id)
            .orElseThrow(() -> new AttributeNotFoundException(
                attributeName + " no encontrado con ID: " + id,
                attributeName
            ));
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

    /**
     * Activa un atributo haciéndolo visible para los usuarios.
     *
     * @param attributeId ID del atributo a activar
     * @return DTO del atributo activado
     * @throws AttributeNotFoundException Si el atributo no existe
     */
    public UserAttributeDTO activateAttribute(Long attributeId) {
        UserAttribute attribute = userAttributeRepository.findById(attributeId)
            .orElseThrow(() -> new AttributeNotFoundException(
                "Atributo no encontrado con ID: " + attributeId,
                attributeId
            ));

        if (attribute.isActive()) {
            log.info("Atributo ya estaba activo: {}", attributeId);
            return new UserAttributeDTO(attribute);
        }

        attribute.setActive(true);
        UserAttribute saved = userAttributeRepository.save(attribute);
        log.info("Atributo activado exitosamente: {}", attributeId);

        return new UserAttributeDTO(saved);
    }

    /**
     * Desactiva un atributo ocultándolo de los usuarios sin eliminarlo.
     *
     * @param attributeId ID del atributo a desactivar
     * @return DTO del atributo desactivado
     * @throws AttributeNotFoundException Si el atributo no existe
     */
    public UserAttributeDTO deactivateAttribute(Long attributeId) {
        UserAttribute attribute = userAttributeRepository.findById(attributeId)
            .orElseThrow(() -> new AttributeNotFoundException(
                "Atributo no encontrado con ID: " + attributeId,
                attributeId
            ));

        if (!attribute.isActive()) {
            log.info("Atributo ya estaba inactivo: {}", attributeId);
            return new UserAttributeDTO(attribute);
        }

        attribute.setActive(false);
        UserAttribute saved = userAttributeRepository.save(attribute);
        log.info("Atributo desactivado exitosamente: {}", attributeId);

        return new UserAttributeDTO(saved);
    }
}
