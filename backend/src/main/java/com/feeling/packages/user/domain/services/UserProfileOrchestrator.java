package com.feeling.packages.user.domain.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.exception.BadRequestException;
import com.feeling.packages.user.domain.dto.user.UserRequestDTO;
import com.feeling.packages.user.domain.dto.user.UserResponseDTO;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Servicio orquestador para actualizaciones de perfil de usuario.
 * <p>
 * Responsabilidades:
 * - Parsear y validar datos de entrada (JSON → DTO)
 * - Orquestar actualizaciones de datos, tags e imágenes en el orden correcto
 * - Coordinar múltiples servicios especializados
 * - Manejar transacciones complejas
 * - Logging de operaciones de negocio
 * <p>
 * Este servicio implementa el patrón Orchestrator/Facade para mantener
 * los controladores delgados y centrados en HTTP, delegando la lógica
 * de negocio compleja a servicios especializados.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
public class UserProfileOrchestrator {

    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(UserProfileOrchestrator.class);

    private final UserService userService;
    private final UserTagService userTagService;
    private final UserMediaService userMediaService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    /**
     * Orquesta la actualización completa de un perfil de usuario.
     * <p>
     * Este método coordina la actualización de:
     * 1. Datos del perfil (nombre, email, ubicación, etc.)
     * 2. Tags del usuario
     * 3. Imágenes del perfil
     * <p>
     * El orden es importante para mantener consistencia de datos.
     *
     * @param userEmail        Email del usuario a actualizar
     * @param profileDataJson  JSON con los datos del perfil
     * @param profileImages    Lista de imágenes (opcional)
     * @param replaceImages    Si true, reemplaza todas las imágenes; si false, las agrega
     * @return DTO con el perfil actualizado
     * @throws IOException          Si hay error parseando JSON o subiendo imágenes
     * @throws BadRequestException  Si la validación falla o no hay datos para actualizar
     */
    @Transactional
    public UserResponseDTO updateProfile(
        String userEmail,
        String profileDataJson,
        List<MultipartFile> profileImages,
        boolean replaceImages
    ) throws IOException {

        logger.info("Iniciando actualización de perfil", Map.of(
            "userEmail", userEmail,
            "hasProfileData", profileDataJson != null && !profileDataJson.trim().isEmpty(),
            "hasImages", profileImages != null && !profileImages.isEmpty(),
            "replaceImages", replaceImages
        ));

        // 1. Validar que hay datos para actualizar
        if (profileDataJson == null || profileDataJson.trim().isEmpty()) {
            throw new BadRequestException("No se enviaron datos para actualizar");
        }

        // 2. Parsear JSON a DTO
        UserRequestDTO profileUpdate = parseAndValidate(profileDataJson);

        // 3. Orquestar actualizaciones
        UserResponseDTO updatedUser = null;

        // 3.1. Actualizar datos del perfil
        if (profileUpdate.hasAnyUpdate()) {
            logger.debug("Actualizando datos del perfil", Map.of(
                "userEmail", userEmail,
                "fieldsToUpdate", profileUpdate.countUpdates()
            ));
            updatedUser = userService.update(userEmail, profileUpdate);
        }

        // 3.2. Actualizar tags si se proporcionan
        if (profileUpdate.tags().isPresent()) {
            List<String> tagNames = profileUpdate.tags().get();
            if (!tagNames.isEmpty()) {
                logger.debug("Actualizando tags del usuario", Map.of(
                    "userEmail", userEmail,
                    "tagsCount", tagNames.size()
                ));
                userTagService.addTagsToUser(userEmail, tagNames);
                // Recargar usuario con los tags actualizados
                updatedUser = userService.get(userEmail);
            }
        }

        // 3.3. Actualizar imágenes si se proporcionan
        if (profileImages != null && !profileImages.isEmpty()) {
            logger.debug("Actualizando imágenes del usuario", Map.of(
                "userEmail", userEmail,
                "imagesCount", profileImages.size(),
                "replaceImages", replaceImages
            ));
            updatedUser = userMediaService.uploadImages(userEmail, profileImages, replaceImages);
        }

        // 4. Validar que al menos se actualizó algo
        if (updatedUser == null) {
            throw new BadRequestException("No se enviaron campos para actualizar");
        }

        logger.info("Perfil actualizado exitosamente", Map.of(
            "userEmail", userEmail,
            "updatedFields", profileUpdate.countUpdates()
        ));

        return updatedUser;
    }

    /**
     * Parsea JSON a UserRequestDTO y valida usando Jakarta Validation.
     *
     * @param profileDataJson JSON con los datos del perfil
     * @return DTO validado
     * @throws IOException         Si hay error parseando el JSON
     * @throws BadRequestException Si la validación falla
     */
    private UserRequestDTO parseAndValidate(String profileDataJson) throws IOException {
        // Parsear JSON
        UserRequestDTO dto = objectMapper.readValue(profileDataJson, UserRequestDTO.class);

        // Validar usando Jakarta Validation
        Set<ConstraintViolation<UserRequestDTO>> violations = validator.validate(dto);

        if (!violations.isEmpty()) {
            String validationErrors = violations.stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", "));

            logger.warn("Validación de perfil fallida", Map.of(
                "errors", validationErrors,
                "violationsCount", violations.size()
            ));

            throw new BadRequestException(validationErrors);
        }

        return dto;
    }
}
