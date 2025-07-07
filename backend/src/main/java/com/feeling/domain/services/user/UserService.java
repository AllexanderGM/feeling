package com.feeling.domain.services.user;

import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.UserModifyDTO;
import com.feeling.domain.dto.user.UserProfileRequestDTO;
import com.feeling.domain.dto.user.UserResponseDTO;
import com.feeling.domain.services.storage.StorageService;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.infrastructure.entities.user.*;
import com.feeling.infrastructure.repositories.user.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private static final Map<String, String> tokenBlacklist = new ConcurrentHashMap<>();
    private final IUserRepository userRepository;
    private final IUserRoleRepository rolRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final IUserTokenRepository tokenRepository;
    private final StorageService storageService;
    private final UserTagService userTagService;
    private final IUserAttributeRepository userAttributeRepository;
    private final IUserCategoryInterestRepository userCategoryInterestRepository;
    @Value("${ADMIN_USERNAME}")
    private String superAdminEmail;

    public UserResponseDTO get(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));
        logger.info("Usuario encontrado correctamente {}", user.getEmail());
        return new UserResponseDTO(user);
    }

    public List<UserResponseDTO> getList() {
        List<User> users = userRepository.findAll();
        logger.info("Usuarios encontrados correctamente");
        return users.stream()
                .map(UserResponseDTO::new)
                .collect(Collectors.toList());
    }

    public Page<UserResponseDTO> getListPaginated(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        logger.info("Usuarios paginados encontrados correctamente - Página: {}, Tamaño: {}, Total: {}",
                pageable.getPageNumber(), pageable.getPageSize(), users.getTotalElements());
        return users.map(UserResponseDTO::new);
    }

    public Page<UserResponseDTO> searchUsers(String searchTerm, Pageable pageable) {
        Page<User> users = userRepository.findBySearchTerm(searchTerm, pageable);
        logger.info("Búsqueda de usuarios completada - Término: '{}', Página: {}, Resultados: {}",
                searchTerm, pageable.getPageNumber(), users.getTotalElements());
        return users.map(UserResponseDTO::new);
    }


    /**
     * Completa el perfil del usuario y retorna el usuario actualizado
     *
     * @param email       Email del usuario
     * @param profileData Datos del perfil
     * @param images      Imágenes del perfil
     * @return Usuario completo actualizado
     */
    @Transactional
    public UserResponseDTO completeUser(String email, UserProfileRequestDTO profileData, List<MultipartFile> images) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + email));

        // ========================================
        // PROCESAR DATOS PERSONALES BÁSICOS
        // ========================================

        List<String> imageUrls = new ArrayList<>();

        // Subir imágenes
        if (images != null && !images.isEmpty()) {
            List<String> additionalImageUrls = storageService.uploadImages(
                    images.stream()
                            .filter(file -> file != null && !file.isEmpty())
                            .collect(Collectors.toList()),
                    "profiles/" + user.getId() + "/images"
            );
            imageUrls.addAll(additionalImageUrls);
            logger.info("Imágenes subidas: {}", additionalImageUrls.size());
        }
        if (!imageUrls.isEmpty()) user.setImages(imageUrls);
        if (profileData.name() != null) user.setName(profileData.name().trim());
        if (profileData.lastName() != null) user.setLastName(profileData.lastName().trim());
        if (profileData.document() != null) user.setDocument(profileData.document());
        if (profileData.phone() != null) user.setPhone(profileData.phone());
        if (profileData.phoneCode() != null) user.setPhoneCode(profileData.phoneCode());
        if (profileData.dateOfBirth() != null) user.setDateOfBirth(profileData.dateOfBirth());
        if (profileData.description() != null) user.setDescription(profileData.description());

        // ========================================
        // PROCESAR UBICACIÓN GEOGRÁFICA
        // ========================================
        if (profileData.country() != null) user.setCountry(profileData.country());
        if (profileData.city() != null) user.setCity(profileData.city());
        if (profileData.department() != null) user.setDepartment(profileData.department());
        if (profileData.locality() != null) user.setLocality(profileData.locality());

        // ========================================
        // PROCESAR CARACTERÍSTICAS
        // ========================================
        if (profileData.categoryInterest() != null) {
            // Convertir String a enum
            UserCategoryInterestList categoryEnum;
            try {
                categoryEnum = UserCategoryInterestList.valueOf(profileData.categoryInterest().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Categoría de interés no válida: " + profileData.categoryInterest() + ". Valores válidos: ESSENCE, ROUSE, SPIRIT");
            }

            // Buscar en la base de datos usando el enum
            UserCategoryInterest categoryInterest = userCategoryInterestRepository
                    .findByCategoryInterestEnum(categoryEnum)
                    .orElseThrow(() -> new NotFoundException("Categoría de interés no encontrada: " + categoryEnum));

            user.setUserCategoryInterest(categoryInterest);
        }

        if (profileData.genderId() != null) {
            UserAttribute gender = userAttributeRepository.findById(profileData.genderId())
                    .orElseThrow(() -> new NotFoundException("Género no encontrado"));
            user.setGender(gender);
        }

        if (profileData.maritalStatusId() != null) {
            UserAttribute maritalStatus = userAttributeRepository.findById(profileData.maritalStatusId())
                    .orElseThrow(() -> new NotFoundException("Estado civil no encontrado"));
            user.setMaritalStatus(maritalStatus);
        }

        if (profileData.height() != null) {
            if (profileData.height() < 0) {
                throw new IllegalArgumentException("La altura no puede ser negativa");
            }
            user.setHeight(profileData.height());
        }

        if (profileData.eyeColorId() != null) {
            UserAttribute eyeColor = userAttributeRepository.findById(profileData.eyeColorId())
                    .orElseThrow(() -> new NotFoundException("Color de ojos no encontrado"));
            user.setEyeColor(eyeColor);
        }

        if (profileData.hairColorId() != null) {
            UserAttribute hairColor = userAttributeRepository.findById(profileData.hairColorId())
                    .orElseThrow(() -> new NotFoundException("Color de cabello no encontrado"));
            user.setHairColor(hairColor);
        }

        if (profileData.bodyTypeId() != null) {
            UserAttribute bodyType = userAttributeRepository.findById(profileData.bodyTypeId())
                    .orElseThrow(() -> new NotFoundException("Tipo de cuerpo no encontrado"));
            user.setBodyType(bodyType);
        }

        if (profileData.educationId() != null) {
            UserAttribute educationLevel = userAttributeRepository.findById(profileData.educationId())
                    .orElseThrow(() -> new NotFoundException("Nivel educativo no encontrado"));
            user.setEducation(educationLevel);
        }

        if (profileData.profession() != null) {
            user.setProfession(profileData.profession().trim());
        }

        // PROCESAR TAGS DE INTERESES
        if (profileData.tags() != null && !profileData.tags().isEmpty()) {
            // Limpiar tags existentes
            user.getTags().clear();

            // Agregar nuevos tags
            for (String tagName : profileData.tags()) {
                UserTag tag = userTagService.findOrCreateTag(tagName.trim().toLowerCase());
                user.addTag(tag);
            }
        }

        // ========================================
        // PROCESAR DATOS PARA SPIRIT
        // ========================================

        if (profileData.religionId() != null) {
            UserAttribute religion = userAttributeRepository.findById(profileData.religionId())
                    .orElseThrow(() -> new NotFoundException("Religión no encontrada"));
            user.setReligion(religion);
        }

        if (profileData.spiritualMoments() != null) {
            user.setSpiritualMoments(profileData.spiritualMoments().trim());
        }

        if (profileData.spiritualPractices() != null) {
            user.setSpiritualPractices(profileData.spiritualPractices().trim());
        }

        // ========================================
        // PROCESAR DATOS PARA ROUSE
        // ========================================

        if (profileData.sexualRoleId() != null) {
            UserAttribute sexualRole = userAttributeRepository.findById(profileData.sexualRoleId())
                    .orElseThrow(() -> new NotFoundException("Rol sexual no encontrado"));
            user.setSexualRole(sexualRole);
        }

        if (profileData.relationshipId() != null) {
            UserAttribute relationshipStatus = userAttributeRepository.findById(profileData.relationshipId())
                    .orElseThrow(() -> new NotFoundException("Estado de relación no encontrado"));
            user.setRelationshipType(relationshipStatus);
        }

        // ========================================
        // CONFIGURAR PREFERENCIAS DE MATCHING
        // ========================================
        if (profileData.agePreferenceMin() != null) {
            user.setAgePreferenceMin(profileData.agePreferenceMin());
        }
        if (profileData.agePreferenceMax() != null) {
            user.setAgePreferenceMax(profileData.agePreferenceMax());
        }
        if (profileData.locationPreferenceRadius() != null) {
            user.setLocationPreferenceRadius(profileData.locationPreferenceRadius());
        }

        // ========================================
        // CONFIGURAR PRIVACIDAD
        // ========================================
        if (profileData.allowNotifications() != null) {
            user.setAllowNotifications(profileData.allowNotifications());
        }
        if (profileData.showAge() != null) {
            user.setShowAge(profileData.showAge());
        }
        if (profileData.showLocation() != null) {
            user.setShowLocation(profileData.showLocation());
        }
        if (profileData.showMeInSearch() != null) {
            user.setShowMeInSearch(profileData.showMeInSearch());
        }

        // MARCAR PERFIL COMO COMPLETO
        user.setProfileComplete(true);
        user.setUpdatedAt(LocalDateTime.now());

        // ========================================
        // GUARDAR Y RETORNAR
        // ========================================
        User savedUser = userRepository.save(user);

        logger.info("Perfil completado correctamente para el usuario {}: {} imágenes subidas, {} tags agregados",
                email, imageUrls.size(), profileData.tags() != null ? profileData.tags().size() : 0);

        return new UserResponseDTO(savedUser);
    }

    public UserResponseDTO update(String email, UserModifyDTO userRequestDTO) {
        try {
            User user = userRepository.findByEmail(email).orElseThrow(() -> {
                logger.error("Error: Usuario con email {} no encontrado", email);
                return new UnauthorizedException("Usuario no encontrado");
            });

            user.setEmail(userRequestDTO.email());
            user.setName(userRequestDTO.name());
            user.setLastName(userRequestDTO.lastName());
            user.setDocument(userRequestDTO.document());
            user.setPhone(userRequestDTO.phone());
            user.setDateOfBirth(userRequestDTO.dateOfBirth());
            user.setEmail(userRequestDTO.email());
            user.setPassword(bCryptPasswordEncoder.encode(userRequestDTO.password()));
            user.setCity(userRequestDTO.city());

            User userEdit = userRepository.save(user);
            logger.info("Usuario actualizado correctamente {}", user.getEmail());
            return new UserResponseDTO(userEdit);

        } catch (UnauthorizedException e) {
            logger.error("Error al actualizar el usuario: {}", e.getMessage());
            throw e;
        }
    }

    public MessageResponseDTO delete(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));
        //Eliminar los tokens del usuario
        List<UserToken> userTokens = tokenRepository.findByUser(user);
        tokenRepository.deleteAll(userTokens);
        userRepository.delete(user);
        logger.info("Usuario eliminado correctamente {}", user.getEmail());
        return new MessageResponseDTO("Usuario eliminado correctamente");
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void cleanBlacklist() {
        tokenBlacklist.clear();
    }

    public MessageResponseDTO grantAdminRole(String superAdminEmail, String userId) {
        if (this.superAdminEmail != null && this.superAdminEmail.equals(superAdminEmail)) {
            // Lógica para Super Admin
        } else {
            throw new UnauthorizedException("No tienes permisos de Super Admin");
        }
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        UserRole adminUserRole = rolRepository.findByUserRoleList(UserRoleList.ADMIN)
                .orElseThrow(() -> new UnauthorizedException("Rol ADMIN no encontrado"));

        user.setUserRole(adminUserRole);
        userRepository.save(user);
        logger.info("El usuario {} ahora es ADMIN", user.getEmail());

        return new MessageResponseDTO("El usuario ahora es ADMIN");
    }

    public MessageResponseDTO revokeAdminRole(String superAdminEmail, String userId) {
        if (!this.superAdminEmail.equals(superAdminEmail)) {
            throw new UnauthorizedException("No tienes permisos para modificar roles");
        }

        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        UserRole userRole = rolRepository.findByUserRoleList(UserRoleList.CLIENT)
                .orElseThrow(() -> new UnauthorizedException("Rol CLIENT no encontrado"));

        user.setUserRole(userRole);
        userRepository.save(user);
        logger.info("El usuario {} ya no es ADMIN", user.getEmail());

        return new MessageResponseDTO("El usuario ya no es ADMIN");
    }
}
