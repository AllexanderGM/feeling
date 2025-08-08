package com.feeling.domain.services.user;

import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.*;
import com.feeling.domain.services.email.EmailService;
import com.feeling.domain.services.storage.StorageService;
import com.feeling.exception.BadRequestException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.infrastructure.entities.user.*;
import com.feeling.infrastructure.repositories.user.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import com.feeling.infrastructure.logging.StructuredLoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private static final StructuredLoggerFactory.StructuredLogger logger = 
            StructuredLoggerFactory.create(UserService.class);
    private static final Map<String, String> tokenBlacklist = new ConcurrentHashMap<>();
    private final IUserRepository userRepository;
    private final IUserRoleRepository roleRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final IUserTokenRepository tokenRepository;
    private final StorageService storageService;
    private final UserTagService userTagService;
    private final IUserAttributeRepository userAttributeRepository;
    private final IUserCategoryInterestRepository userCategoryInterestRepository;
    private final CachedUserService cachedUserService;
    private final EmailService emailService;
    // private final UserAnalyticsService userAnalyticsService;
    
    @Value("${admin.username}")
    private String adminEmail;

    public UserResponseDTO get(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));
        logger.logUserOperation("GET_USER", user.getEmail(), Map.of("found", true));
        return new UserResponseDTO(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    public User getUserById(String userId) {
        return userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
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
        logger.info("Usuarios paginados encontrados correctamente", Map.of(
                "page", pageable.getPageNumber(), 
                "size", pageable.getPageSize(), 
                "total", users.getTotalElements()));
        return users.map(UserResponseDTO::new);
    }

    public Page<UserResponseDTO> searchUsers(String searchTerm, Pageable pageable) {
        Page<User> users = userRepository.findBySearchTerm(searchTerm, pageable);
        logger.info("Búsqueda de usuarios completada", Map.of(
                "searchTerm", searchTerm, 
                "page", pageable.getPageNumber(), 
                "results", users.getTotalElements()));
        return users.map(UserResponseDTO::new);
    }

    public Page<UserPublicResponseDTO> getUserSuggestions(String userEmail, Pageable pageable) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        if (!currentUser.isProfileComplete()) {
            throw new RuntimeException("Debes completar tu perfil antes de ver sugerencias");
        }

        // Obtener usuarios compatibles con paginación optimizada
        Page<User> suggestedUsers = userRepository.findCompatibleUsersOptimized(
                currentUser.getId(),
                currentUser.getCategoryInterest() != null ? 
                    currentUser.getCategoryInterest().getId() : null,
                currentUser.getAgePreferenceMin(),
                currentUser.getAgePreferenceMax(),
                currentUser.getCity(),
                currentUser.getDepartment(),
                pageable
        );

        logger.logMatching(userEmail, "suggestions", (int) suggestedUsers.getTotalElements(), 
                Map.of("page", (int) pageable.getPageNumber()));

        return suggestedUsers.map(this::convertToUserPublicResponseDTO);
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
            logger.logUserOperation("images_uploaded", email, Map.of("count", additionalImageUrls.size()));
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

            user.setCategoryInterest(categoryInterest);
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

            // Agregar nuevos tags (los nuevos quedarán pendientes de aprobación)
            for (String tagName : profileData.tags()) {
                UserTag tag = userTagService.findOrCreateTagForProfile(tagName.trim().toLowerCase(), email);
                user.addTag(tag);
            }
            
            Map<String, Object> details = Map.of("tagsCount", profileData.tags().size());
            logger.logUserOperation("PROFILE_COMPLETION", email, details);
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

        // ACTUALIZAR TIMESTAMPS (profileComplete se calculará automáticamente en @PreUpdate)
        user.setUpdatedAt(LocalDateTime.now());

        // ========================================
        // GUARDAR Y RETORNAR
        // ========================================
        User savedUser = userRepository.save(user);

        logger.logUserOperation("profile_completed", email, Map.of(
                "images", imageUrls.size(), 
                "tags", profileData.tags() != null ? profileData.tags().size() : 0));

        return new UserResponseDTO(savedUser);
    }

    public UserResponseDTO update(String email, UserModifyDTO userRequestDTO) {
        try {
            User user = userRepository.findByEmail(email).orElseThrow(() -> {
                logger.error("Error: Usuario con email " + email + " no encontrado");
                return new UnauthorizedException("Usuario no encontrado");
            });

            // Actualizar datos básicos si están presentes
            if (userRequestDTO.email() != null) user.setEmail(userRequestDTO.email());
            if (userRequestDTO.name() != null) user.setName(userRequestDTO.name());
            if (userRequestDTO.lastName() != null) user.setLastName(userRequestDTO.lastName());
            if (userRequestDTO.document() != null) user.setDocument(userRequestDTO.document());
            if (userRequestDTO.phone() != null) user.setPhone(userRequestDTO.phone());
            if (userRequestDTO.dateOfBirth() != null) user.setDateOfBirth(userRequestDTO.dateOfBirth());
            if (userRequestDTO.password() != null) user.setPassword(bCryptPasswordEncoder.encode(userRequestDTO.password()));
            if (userRequestDTO.city() != null) user.setCity(userRequestDTO.city());

            // Actualizar configuración de privacidad extendida
            if (userRequestDTO.hasExtendedPrivacyChanges()) {
                if (userRequestDTO.publicAccount() != null) user.setPublicAccount(userRequestDTO.publicAccount());
                if (userRequestDTO.searchVisibility() != null) user.setSearchVisibility(userRequestDTO.searchVisibility());
                if (userRequestDTO.locationPublic() != null) user.setLocationPublic(userRequestDTO.locationPublic());
            }

            // Actualizar configuración de notificaciones
            if (userRequestDTO.hasNotificationChanges()) {
                if (userRequestDTO.notificationsEmailEnabled() != null) user.setNotificationsEmailEnabled(userRequestDTO.notificationsEmailEnabled());
                if (userRequestDTO.notificationsPhoneEnabled() != null) user.setNotificationsPhoneEnabled(userRequestDTO.notificationsPhoneEnabled());
                if (userRequestDTO.notificationsMatchesEnabled() != null) user.setNotificationsMatchesEnabled(userRequestDTO.notificationsMatchesEnabled());
                if (userRequestDTO.notificationsEventsEnabled() != null) user.setNotificationsEventsEnabled(userRequestDTO.notificationsEventsEnabled());
                if (userRequestDTO.notificationsLoginEnabled() != null) user.setNotificationsLoginEnabled(userRequestDTO.notificationsLoginEnabled());
                if (userRequestDTO.notificationsPaymentsEnabled() != null) user.setNotificationsPaymentsEnabled(userRequestDTO.notificationsPaymentsEnabled());
            }

            // Actualizar estado de cuenta (solo administradores)
            if (userRequestDTO.hasAccountStatusChanges()) {
                if (userRequestDTO.accountDeactivated() != null) {
                    if (userRequestDTO.accountDeactivated() && !user.isAccountDeactivated()) {
                        user.deactivateAccount(userRequestDTO.deactivationReason() != null ? 
                                userRequestDTO.deactivationReason() : "Desactivado por administrador");
                    } else if (!userRequestDTO.accountDeactivated() && user.isAccountDeactivated()) {
                        user.reactivateAccount();
                    }
                }
            }

            User userEdit = userRepository.save(user);
            logger.logUserOperation("user_updated", user.getEmail(), null);
            return new UserResponseDTO(userEdit);

        } catch (UnauthorizedException e) {
            logger.error("Error al actualizar el usuario: " + e.getMessage());
            throw e;
        }
    }

    public MessageResponseDTO delete(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));
        
        // Primera línea de defensa: Verificar si el usuario está protegido contra eliminación
        if (user.isProtectedUser()) {
            logger.logUserOperation("user_deletion_blocked_protected", user.getEmail(), null);
            throw new BadRequestException("Este usuario está protegido y no puede ser eliminado por seguridad del sistema");
        }
        
        // Segunda línea de defensa: Verificar si es el email del administrador principal
        if (adminEmail != null && adminEmail.equalsIgnoreCase(email)) {
            logger.logUserOperation("user_deletion_blocked_admin_email", email, null);
            throw new BadRequestException("El usuario administrador principal no puede ser eliminado por seguridad del sistema");
        }
        
        //Eliminar los tokens del usuario
        List<UserToken> userTokens = tokenRepository.findByUser(user);
        tokenRepository.deleteAll(userTokens);
        userRepository.delete(user);
        logger.logUserOperation("user_deleted", user.getEmail(), null);
        return new MessageResponseDTO("Usuario eliminado correctamente");
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void cleanBlacklist() {
        tokenBlacklist.clear();
    }



    /**
     * Aprueba un usuario para que pueda usar la plataforma
     */
    public MessageResponseDTO approveUser(String userId) {
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        if (!user.isProfileComplete()) {
            throw new RuntimeException("El usuario debe completar su perfil antes de ser aprobado");
        }

        user.approve();
        userRepository.save(user);
        
        // Invalidar cache para que los cambios se reflejen inmediatamente
        cachedUserService.evictUserCache(user.getEmail());
        
        // Enviar email de bienvenida para usuario validado por admin
        try {
            boolean isGoogleUser = user.getUserAuthProvider() == UserAuthProvider.GOOGLE;
            String profilePicture = isGoogleUser ? user.getExternalAvatarUrl() : null;
            
            emailService.sendWelcomeEmailForApprovedUser(
                    user.getEmail(),
                    user.getName() + " " + user.getLastName(),
                    isGoogleUser,
                    profilePicture
            );
            logger.logUserOperation("approval_welcome_email_sent", user.getEmail(), 
                    Map.of("provider", user.getUserAuthProvider().toString()));
        } catch (Exception emailError) {
            logger.warn("Error al enviar email de bienvenida de aprobación", 
                    Map.of("userEmail", user.getEmail(), "error", emailError.getMessage()));
            // No lanzar excepción porque la aprobación ya fue exitosa
        }
        
        logger.logUserOperation("user_approved", user.getEmail(), Map.of("approvalStatus", user.getApprovalStatus().name()));

        return new MessageResponseDTO("Usuario aprobado correctamente");
    }

    

    /**
     * Obtiene usuarios pendientes de aprobación (email verificado, perfil completo, no cerrado, estado PENDING)
     */
    public Page<UserResponseDTO> getPendingApprovalUsers(Pageable pageable) {
        Page<User> pendingUsers = userRepository.findPendingApprovalUsers(pageable);
        logger.info("Usuarios pendientes de aprobación encontrados", Map.of(
                "page", pageable.getPageNumber(),
                "size", pageable.getPageSize(),
                "total", pendingUsers.getTotalElements()));
        return pendingUsers.map(UserResponseDTO::new);
    }

    public Page<UserResponseDTO> getPendingApprovalUsers(Pageable pageable, String searchTerm) {
        Page<User> pendingUsers;
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            pendingUsers = userRepository.findPendingApprovalUsersWithSearch(searchTerm.trim(), pageable);
            logger.info("Usuarios pendientes de aprobación encontrados con búsqueda", Map.of(
                    "searchTerm", searchTerm,
                    "page", pageable.getPageNumber(),
                    "size", pageable.getPageSize(),
                    "total", pendingUsers.getTotalElements()));
        } else {
            pendingUsers = userRepository.findPendingApprovalUsers(pageable);
            logger.info("Usuarios pendientes de aprobación encontrados", Map.of(
                    "page", pageable.getPageNumber(),
                    "size", pageable.getPageSize(),
                    "total", pendingUsers.getTotalElements()));
        }
        return pendingUsers.map(UserResponseDTO::new);
    }
    
    /**
     * Obtiene usuarios activos (aprobados, perfil completo, email verificado, cuenta no cerrada)
     */
    public Page<UserResponseDTO> getActiveUsers(Pageable pageable) {
        Page<User> activeUsers = userRepository.findActiveUsers(pageable);
        logger.info("Usuarios activos encontrados", Map.of(
                "page", pageable.getPageNumber(),
                "size", pageable.getPageSize(),
                "total", activeUsers.getTotalElements()));
        return activeUsers.map(UserResponseDTO::new);
    }

    public Page<UserResponseDTO> getActiveUsers(Pageable pageable, String searchTerm) {
        Page<User> activeUsers;
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            activeUsers = userRepository.findActiveUsersWithSearch(searchTerm.trim(), pageable);
            logger.info("Usuarios activos encontrados con búsqueda", Map.of(
                    "searchTerm", searchTerm,
                    "page", pageable.getPageNumber(),
                    "size", pageable.getPageSize(),
                    "total", activeUsers.getTotalElements()));
        } else {
            activeUsers = userRepository.findActiveUsers(pageable);
            logger.info("Usuarios activos encontrados", Map.of(
                    "page", pageable.getPageNumber(),
                    "size", pageable.getPageSize(),
                    "total", activeUsers.getTotalElements()));
        }
        return activeUsers.map(UserResponseDTO::new);
    }
    
    /**
     * Obtiene usuarios con email no verificado (que no han cerrado su cuenta)
     */
    public Page<UserResponseDTO> getUnverifiedUsers(Pageable pageable) {
        Page<User> unverifiedUsers = userRepository.findUnverifiedUsers(pageable);
        logger.info("Usuarios con email no verificado encontrados", Map.of(
                "page", pageable.getPageNumber(),
                "size", pageable.getPageSize(),
                "total", unverifiedUsers.getTotalElements()));
        return unverifiedUsers.map(UserResponseDTO::new);
    }

    public Page<UserResponseDTO> getUnverifiedUsers(Pageable pageable, String searchTerm) {
        Page<User> unverifiedUsers;
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            unverifiedUsers = userRepository.findUnverifiedUsersWithSearch(searchTerm.trim(), pageable);
            logger.info("Usuarios con email no verificado encontrados con búsqueda", Map.of(
                    "searchTerm", searchTerm,
                    "page", pageable.getPageNumber(),
                    "size", pageable.getPageSize(),
                    "total", unverifiedUsers.getTotalElements()));
        } else {
            unverifiedUsers = userRepository.findUnverifiedUsers(pageable);
            logger.info("Usuarios con email no verificado encontrados", Map.of(
                    "page", pageable.getPageNumber(),
                    "size", pageable.getPageSize(),
                    "total", unverifiedUsers.getTotalElements()));
        }
        return unverifiedUsers.map(UserResponseDTO::new);
    }
    
    
    /**
     * Obtiene usuarios no aprobados (email verificado, cuenta no cerrada, estado PENDING o REJECTED)
     */
    public Page<UserResponseDTO> getNonApprovedUsers(Pageable pageable) {
        Page<User> nonApprovedUsers = userRepository.findNonApprovedUsers(pageable);
        logger.info("Usuarios no aprobados encontrados", Map.of(
                "page", pageable.getPageNumber(),
                "size", pageable.getPageSize(),
                "total", nonApprovedUsers.getTotalElements()));
        return nonApprovedUsers.map(UserResponseDTO::new);
    }

    public Page<UserResponseDTO> getNonApprovedUsers(Pageable pageable, String searchTerm) {
        Page<User> nonApprovedUsers;
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            nonApprovedUsers = userRepository.findNonApprovedUsersWithSearch(searchTerm.trim(), pageable);
            logger.info("Usuarios no aprobados encontrados con búsqueda", Map.of(
                    "searchTerm", searchTerm,
                    "page", pageable.getPageNumber(),
                    "size", pageable.getPageSize(),
                    "total", nonApprovedUsers.getTotalElements()));
        } else {
            nonApprovedUsers = userRepository.findNonApprovedUsers(pageable);
            logger.info("Usuarios no aprobados encontrados", Map.of(
                    "page", pageable.getPageNumber(),
                    "size", pageable.getPageSize(),
                    "total", nonApprovedUsers.getTotalElements()));
        }
        return nonApprovedUsers.map(UserResponseDTO::new);
    }
    
    /**
     * Obtiene usuarios desactivados/eliminados
     */
    public Page<UserResponseDTO> getDeactivatedUsers(Pageable pageable) {
        Page<User> deactivatedUsers = userRepository.findDeactivatedUsers(pageable);
        logger.info("Usuarios desactivados encontrados", Map.of(
                "page", pageable.getPageNumber(),
                "size", pageable.getPageSize(),
                "total", deactivatedUsers.getTotalElements()));
        return deactivatedUsers.map(UserResponseDTO::new);
    }

    public Page<UserResponseDTO> getDeactivatedUsers(Pageable pageable, String searchTerm) {
        Page<User> deactivatedUsers;
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            deactivatedUsers = userRepository.findDeactivatedUsersWithSearch(searchTerm.trim(), pageable);
            logger.info("Usuarios desactivados encontrados con búsqueda", Map.of(
                    "searchTerm", searchTerm,
                    "page", pageable.getPageNumber(),
                    "size", pageable.getPageSize(),
                    "total", deactivatedUsers.getTotalElements()));
        } else {
            deactivatedUsers = userRepository.findDeactivatedUsers(pageable);
            logger.info("Usuarios desactivados encontrados", Map.of(
                    "page", pageable.getPageNumber(),
                    "size", pageable.getPageSize(),
                    "total", deactivatedUsers.getTotalElements()));
        }
        return deactivatedUsers.map(UserResponseDTO::new);
    }




    /**
     * Convierte una entidad User a UserPublicResponseDTO usando el mapper
     */
    public UserPublicResponseDTO convertToUserPublicResponseDTO(User user) {
        return UserDTOMapper.toUserPublicResponseDTO(user);
    }

    /**
     * Obtiene usuarios que no están aprobados y no han completado su perfil
     */
    public Page<UserExtendedResponseDTO> getIncompleteUsers(Pageable pageable, String searchTerm) {
        try {
            Page<User> users;
            
            // Usar el método que filtra por perfil incompleto y no aprobados
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                users = userRepository.findIncompleteProfileUsersWithSearch(searchTerm.trim(), pageable);
                logger.info("Usuarios con perfil incompleto encontrados con búsqueda", Map.of(
                        "searchTerm", searchTerm,
                        "page", pageable.getPageNumber(),
                        "size", pageable.getPageSize(),
                        "total", users.getTotalElements()));
            } else {
                users = userRepository.findIncompleteProfileUsers(pageable);
                logger.info("Usuarios con perfil incompleto encontrados", Map.of(
                        "page", pageable.getPageNumber(),
                        "size", pageable.getPageSize(),
                        "total", users.getTotalElements()));
            }
            
            logger.info("Encontrados " + users.getTotalElements() + " usuarios con perfil incompleto (página " + 
                pageable.getPageNumber() + ", tamaño " + pageable.getPageSize() + ")");
            
            // Mostrar algunos usuarios para debugging
            if (users.getTotalElements() > 0) {
                logger.info("Primer usuario incompleto: id=" + users.getContent().get(0).getId() + 
                    ", email=" + users.getContent().get(0).getEmail());
            }

            return users.map(user -> {
                UserExtendedResponseDTO dto = UserDTOMapper.toUserExtendedResponseDTO(user);
                return dto;
            });

        } catch (Exception e) {
            logger.error("Error al obtener usuarios incompletos", e);
            throw new RuntimeException("Error al obtener usuarios incompletos", e);
        }
    }

    /**
     * Obtiene usuarios que no están aprobados y no han completado su perfil como UserResponseDTO (incluye ID)
     */
    public Page<UserResponseDTO> getIncompleteUsersAsResponseDTO(Pageable pageable, String searchTerm) {
        try {
            Page<User> users;
            
            // Usar el método que filtra por perfil incompleto y no aprobados
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                users = userRepository.findIncompleteProfileUsersWithSearch(searchTerm.trim(), pageable);
                logger.info("Usuarios con perfil incompleto encontrados con búsqueda", Map.of(
                        "searchTerm", searchTerm,
                        "page", pageable.getPageNumber(),
                        "size", pageable.getPageSize(),
                        "total", users.getTotalElements()));
            } else {
                users = userRepository.findIncompleteProfileUsers(pageable);
                logger.info("Usuarios con perfil incompleto encontrados", Map.of(
                        "page", pageable.getPageNumber(),
                        "size", pageable.getPageSize(),
                        "total", users.getTotalElements()));
            }
            
            logger.info("Encontrados " + users.getTotalElements() + " usuarios con perfil incompleto (página " + 
                pageable.getPageNumber() + ", tamaño " + pageable.getPageSize() + ")");
            
            // Mostrar algunos usuarios para debugging
            if (users.getTotalElements() > 0) {
                logger.info("Primer usuario incompleto: id=" + users.getContent().get(0).getId() + 
                    ", email=" + users.getContent().get(0).getEmail());
            }

            return users.map(UserResponseDTO::new);

        } catch (Exception e) {
            logger.error("Error al obtener usuarios incompletos", e);
            throw new RuntimeException("Error al obtener usuarios incompletos", e);
        }
    }

    /**
     * Envía un correo recordatorio para completar el perfil
     */
    public boolean sendProfileCompletionReminder(Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                logger.warn("Usuario no encontrado con ID: " + userId);
                return false;
            }

            User user = userOpt.get();

            // Verificar que el usuario realmente necesita completar el perfil
            if (user.isApproved() || user.isProfileComplete()) {
                logger.warn("El usuario ya está aprobado o tiene perfil completo: " + user.getEmail());
                return false;
            }

            // Enviar correo
            emailService.sendProfileCompletionReminder(user);

            logger.logUserOperation("profile_completion_reminder_sent", user.getEmail(), null);
            return true;

        } catch (Exception e) {
            logger.error("Error al enviar correo recordatorio al usuario: " + userId, e);
            return false;
        }
    }

    /**
     * Calcula el porcentaje de completitud del perfil
     */
    private int calculateProfileCompleteness(User user) {
        int totalFields = 15; // Campos importantes del perfil
        int completedFields = 0;

        // Campos básicos obligatorios
        if (user.getName() != null && !user.getName().trim().isEmpty()) completedFields++;
        if (user.getLastName() != null && !user.getLastName().trim().isEmpty()) completedFields++;
        if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) completedFields++;
        if (user.getDateOfBirth() != null) completedFields++;
        if (user.getPhone() != null && !user.getPhone().trim().isEmpty()) completedFields++;
        if (user.getDocument() != null && !user.getDocument().trim().isEmpty()) completedFields++;

        // Ubicación
        if (user.getCountry() != null && !user.getCountry().trim().isEmpty()) completedFields++;
        if (user.getCity() != null && !user.getCity().trim().isEmpty()) completedFields++;

        // Perfil personal
        if (user.getGender() != null) completedFields++;
        if (user.getDescription() != null && !user.getDescription().trim().isEmpty()) completedFields++;
        if (user.getCategoryInterest() != null) completedFields++;

        // Características físicas
        if (user.getHeight() != null && user.getHeight() > 0) completedFields++;
        if (user.getEyeColor() != null) completedFields++;
        if (user.getHairColor() != null) completedFields++;

        // Información adicional
        if (user.getProfession() != null && !user.getProfession().trim().isEmpty()) completedFields++;

        return Math.round((float) completedFields / totalFields * 100);
    }

    // ========================================
    // MÉTODOS DE ANALYTICS BÁSICOS
    // ========================================

    public Map<String, Object> getAnalyticsOverview() {
        Map<String, Object> result = new HashMap<>();
        
        // Contadores básicos del sistema
        Map<String, Object> systemCounts = new HashMap<>();
        systemCounts.put("totalUsers", userRepository.count());
        systemCounts.put("verifiedUsers", userRepository.countByVerifiedTrue());
        systemCounts.put("unverifiedUsers", userRepository.countByVerifiedFalse());
        systemCounts.put("approvedUsers", userRepository.countByApprovedTrue());
        systemCounts.put("pendingUsers", userRepository.countByApprovedFalse());
        systemCounts.put("completeProfiles", userRepository.countByProfileCompleteTrue());
        systemCounts.put("incompleteProfiles", userRepository.countByProfileCompleteFalse());
        
        // Usuarios activos en diferentes períodos
        LocalDateTime now = LocalDateTime.now();
        systemCounts.put("activeUsersLast7Days", userRepository.countActiveUsersSince(now.minusDays(7)));
        systemCounts.put("activeUsersLast30Days", userRepository.countActiveUsersSince(now.minusDays(30)));
        
        result.put("systemCounts", systemCounts);
        
        // Métricas de calidad básicas
        Map<String, Object> qualityMetrics = new HashMap<>();
        long totalUsers = userRepository.count();
        if (totalUsers > 0) {
            long verified = userRepository.countByVerifiedTrue();
            long approved = userRepository.countByApprovedTrue();
            long complete = userRepository.countByProfileCompleteTrue();
            
            qualityMetrics.put("verificationRate", Math.round((double) verified / totalUsers * 100));
            qualityMetrics.put("approvalRate", Math.round((double) approved / totalUsers * 100));
            qualityMetrics.put("completionRate", Math.round((double) complete / totalUsers * 100));
        } else {
            qualityMetrics.put("verificationRate", 0);
            qualityMetrics.put("approvalRate", 0);
            qualityMetrics.put("completionRate", 0);
        }
        result.put("qualityMetrics", qualityMetrics);
        
        return result;
    }

    public UserMetricsDTO getUserDetailedMetrics(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        
        return new UserMetricsDTO(
            user.getProfileViews() != null ? user.getProfileViews() : 0L,
            user.getLikesReceived() != null ? user.getLikesReceived() : 0L,
            user.getMatchesCount() != null ? user.getMatchesCount() : 0L,
            user.getPopularityScore() != null ? user.getPopularityScore() : 0.0,
            user.getProfileCompletenessPercentage() != null ? user.getProfileCompletenessPercentage() : 0.0
        );
    }

    public Map<String, Object> getGeographicDistribution() {
        Map<String, Object> result = new HashMap<>();
        
        // Distribución por países
        List<Object[]> countryData = userRepository.getUserCountByCountry();
        Map<String, Long> usersByCountry = new LinkedHashMap<>();
        for (Object[] row : countryData) {
            usersByCountry.put((String) row[0], (Long) row[1]);
        }
        result.put("usersByCountry", usersByCountry);
        
        // Distribución por ciudades
        List<Object[]> cityData = userRepository.getUserCountByCity();
        Map<String, Long> usersByCity = new LinkedHashMap<>();
        for (Object[] row : cityData) {
            usersByCity.put((String) row[0], (Long) row[1]);
        }
        result.put("usersByCity", usersByCity);
        
        // Top 5 de cada categoría
        Map<String, Long> topCountries = usersByCountry.entrySet().stream()
                .limit(5)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (oldValue, newValue) -> oldValue,
                        LinkedHashMap::new
                ));
        
        Map<String, Long> topCities = usersByCity.entrySet().stream()
                .limit(5)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (oldValue, newValue) -> oldValue,
                        LinkedHashMap::new
                ));
        
        Map<String, Object> topLocations = new HashMap<>();
        topLocations.put("topCountries", topCountries);
        topLocations.put("topCities", topCities);
        result.put("topLocations", topLocations);
        
        return result;
    }

    public Map<String, Object> getEngagementStats() {
        Map<String, Object> result = new HashMap<>();
        
        // Estadísticas básicas de engagement
        long totalUsers = userRepository.count();
        long verifiedUsers = userRepository.countByVerifiedTrue();
        long completeProfiles = userRepository.countByProfileCompleteTrue();
        
        result.put("totalUsers", totalUsers);
        result.put("verifiedUsers", verifiedUsers);
        result.put("completeProfiles", completeProfiles);
        
        if (totalUsers > 0) {
            result.put("averageVerificationRate", Math.round((double) verifiedUsers / totalUsers * 100));
            result.put("averageCompletionRate", Math.round((double) completeProfiles / totalUsers * 100));
        } else {
            result.put("averageVerificationRate", 0);
            result.put("averageCompletionRate", 0);
        }
        
        return result;
    }

    public Map<String, Object> getTopUsers(int limit) {
        Map<String, Object> result = new HashMap<>();
        
        // Para esta implementación básica, simplemente devolvemos información básica
        result.put("message", "Funcionalidad de rankings disponible en versión futura");
        result.put("totalUsers", userRepository.count());
        
        return result;
    }

    public Map<String, Object> getGrowthStats(String period) {
        Map<String, Object> result = new HashMap<>();
        
        LocalDateTime now = LocalDateTime.now();
        
        // Estadísticas de crecimiento básicas
        long usersLast24Hours = userRepository.countNewUsersSince(now.minusDays(1));
        long usersLast7Days = userRepository.countNewUsersSince(now.minusDays(7));
        long usersLast30Days = userRepository.countNewUsersSince(now.minusDays(30));
        
        result.put("usersLast24Hours", usersLast24Hours);
        result.put("usersLast7Days", usersLast7Days);
        result.put("usersLast30Days", usersLast30Days);
        
        // Retención básica
        long activeUsersLast7Days = userRepository.countActiveUsersSince(now.minusDays(7));
        long activeUsersLast30Days = userRepository.countActiveUsersSince(now.minusDays(30));
        
        result.put("activeUsersLast7Days", activeUsersLast7Days);
        result.put("activeUsersLast30Days", activeUsersLast30Days);
        
        long totalUsers = userRepository.count();
        if (totalUsers > 0) {
            result.put("retentionRate7Days", Math.round((double) activeUsersLast7Days / totalUsers * 100));
            result.put("retentionRate30Days", Math.round((double) activeUsersLast30Days / totalUsers * 100));
        } else {
            result.put("retentionRate7Days", 0);
            result.put("retentionRate30Days", 0);
        }
        
        return result;
    }

    /**
     * Obtiene el conteo de usuarios para cada pestaña del panel de administración
     * @return Map con el conteo de usuarios por categoría
     */
    public Map<String, Object> getUserTabsCount() {
        Map<String, Object> tabsCounts = new HashMap<>();
        
        try {
            // Conteo para usuarios activos (verified=true, approved, profileComplete=true, accountDeactivated=false)
            long activeCount = userRepository.findActiveUsers(Pageable.unpaged()).getTotalElements();
            tabsCounts.put("active", activeCount);
            
            // Conteo para usuarios pendientes de aprobación
            long pendingCount = userRepository.findPendingApprovalUsers(Pageable.unpaged()).getTotalElements();
            tabsCounts.put("pending", pendingCount);
            
            // Conteo para usuarios con perfiles incompletos
            long incompleteCount = userRepository.findIncompleteProfileUsers(Pageable.unpaged()).getTotalElements();
            tabsCounts.put("incomplete", incompleteCount);
            
            // Conteo para usuarios sin verificar
            long unverifiedCount = userRepository.findUnverifiedUsers(Pageable.unpaged()).getTotalElements();
            tabsCounts.put("unverified", unverifiedCount);
            
            // Conteo para usuarios no aprobados (verified pero no approved)
            long nonApprovedCount = userRepository.findNonApprovedUsers(Pageable.unpaged()).getTotalElements();
            tabsCounts.put("nonApproved", nonApprovedCount);
            
            // Conteo para usuarios rechazados específicamente (mismo que nonApproved)
            // Ya lo tenemos en nonApprovedCount, así que evitamos duplicación
            tabsCounts.put("rejected", nonApprovedCount);
            
            // Conteo para usuarios desactivados
            long deactivatedCount = userRepository.findDeactivatedUsers(Pageable.unpaged()).getTotalElements();
            tabsCounts.put("deactivated", deactivatedCount);
            
            // Total general para verificación
            long totalUsers = userRepository.count();
            tabsCounts.put("total", totalUsers);
            
            logger.info("Conteos de pestañas de usuarios calculados exitosamente");
            
        } catch (Exception e) {
            logger.error("Error al obtener conteos de pestañas de usuarios", e);
            
            // Valores por defecto en caso de error
            tabsCounts.put("active", 0L);
            tabsCounts.put("pending", 0L);
            tabsCounts.put("incomplete", 0L);
            tabsCounts.put("unverified", 0L);
            tabsCounts.put("nonApproved", 0L);
            tabsCounts.put("rejected", 0L);
            tabsCounts.put("deactivated", 0L);
            tabsCounts.put("total", 0L);
        }
        
        return tabsCounts;
    }

    // ========================================
    // MÉTODOS FALTANTES PARA EL CONTROLLER
    // ========================================

    /**
     * Obtiene el perfil completo del usuario actual
     */
    public UserExtendedResponseDTO getCurrentUserComplete(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        return UserDTOMapper.toUserExtendedResponseDTO(user);
    }

    /**
     * Obtiene el perfil público de un usuario (sin información sensible)
     */
    public UserPublicResponseDTO getUserPublicProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        return convertToUserPublicResponseDTO(user);
    }

    /**
     * Obtiene el perfil completo de un usuario para match (con información adicional)
     */  
    public UserStandardResponseDTO getUserCompleteProfileForMatch(String email, String currentUserEmail) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        
        // Verificar que los usuarios pueden verse (están matcheados o es perfil público)
        // Por ahora simplemente devolvemos el perfil - la lógica de match se puede implementar después
        return UserDTOMapper.toUserStandardResponseDTO(user);
    }

    /**
     * Calcula la compatibilidad entre dos usuarios
     */
    public double calculateUserCompatibility(String currentUserEmail, String otherUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new NotFoundException("Usuario actual no encontrado"));
        User otherUser = userRepository.findByEmail(otherUserEmail)
                .orElseThrow(() -> new NotFoundException("Otro usuario no encontrado"));

        // Implementación básica de compatibilidad
        double compatibility = 0.0;
        int factors = 0;

        // Factor 1: Misma categoría de interés (40% peso)
        if (currentUser.getCategoryInterest() != null && otherUser.getCategoryInterest() != null) {
            if (currentUser.getCategoryInterest().equals(otherUser.getCategoryInterest())) {
                compatibility += 0.4;
            }
            factors++;
        }

        // Factor 2: Rango de edad similar (20% peso)
        if (currentUser.getDateOfBirth() != null && otherUser.getDateOfBirth() != null) {
            int ageUser1 = currentUser.getAge();
            int ageUser2 = otherUser.getAge();
            int ageDifference = Math.abs(ageUser1 - ageUser2);
            
            if (ageDifference <= 2) compatibility += 0.2;
            else if (ageDifference <= 5) compatibility += 0.15;
            else if (ageDifference <= 10) compatibility += 0.1;
            factors++;
        }

        // Factor 3: Misma ubicación (20% peso)
        if (currentUser.getCity() != null && otherUser.getCity() != null) {
            if (currentUser.getCity().equals(otherUser.getCity())) {
                compatibility += 0.2;
            } else if (currentUser.getCountry() != null && otherUser.getCountry() != null &&
                       currentUser.getCountry().equals(otherUser.getCountry())) {
                compatibility += 0.1;
            }
            factors++;
        }

        // Factor 4: Tags comunes (20% peso)
        // Esta lógica se puede implementar consultando los tags de usuario
        // Por ahora agregamos un valor base
        compatibility += 0.1;
        factors++;

        // Normalizar resultado
        return Math.min(1.0, compatibility);
    }

    /**
     * Actualiza el perfil del usuario actual
     */
    @Transactional
    public UserExtendedResponseDTO updateUserProfile(String userEmail, UserProfileRequestDTO profileRequest, 
                                                   List<MultipartFile> profileImages) throws IOException {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        // Actualizar datos básicos
        user.setName(profileRequest.name());
        user.setLastName(profileRequest.lastName());
        user.setDocument(profileRequest.document());
        user.setPhone(profileRequest.phone());
        user.setDateOfBirth(profileRequest.dateOfBirth());
        // Set gender attribute if provided
        if (profileRequest.genderId() != null) {
            UserAttribute gender = userAttributeRepository.findById(profileRequest.genderId()).orElse(null);
            user.setGender(gender);
        }
        user.setDescription(profileRequest.description());
        // Note: address field doesn't exist in UserProfileRequestDTO, using department/locality instead
        user.setCity(profileRequest.city());
        user.setCountry(profileRequest.country());
        // Set category interest if provided
        if (profileRequest.categoryInterest() != null) {
            UserCategoryInterest categoryInterest = userCategoryInterestRepository
                    .findByCategoryInterestEnum(UserCategoryInterestList.valueOf(profileRequest.categoryInterest()))
                    .orElse(null);
            user.setCategoryInterest(categoryInterest);
        }
        user.setProfession(profileRequest.profession());
        user.setHeight(profileRequest.height());
        // Set eye color attribute if provided
        if (profileRequest.eyeColorId() != null) {
            UserAttribute eyeColor = userAttributeRepository.findById(profileRequest.eyeColorId()).orElse(null);
            user.setEyeColor(eyeColor);
        }
        // Set hair color attribute if provided
        if (profileRequest.hairColorId() != null) {
            UserAttribute hairColor = userAttributeRepository.findById(profileRequest.hairColorId()).orElse(null);
            user.setHairColor(hairColor);
        }

        // Procesar imágenes si se proporcionan
        if (profileImages != null && !profileImages.isEmpty()) {
            try {
                List<String> imageUrls = storageService.uploadImages(profileImages, "profiles");
                if (!imageUrls.isEmpty()) {
                    user.setImages(imageUrls); // Set all uploaded images
                }
            } catch (Exception e) {
                logger.error("Error al subir imágenes de perfil", e);
                // Continúar sin fallar, las imágenes son opcionales
            }
        }

        // Actualizar porcentaje de completitud
        // Note: profileCompletenessPercentage not found in User entity, calculating internally
        user.setProfileComplete(user.getProfileCompletenessPercentage() >= 80);

        User savedUser = userRepository.save(user);
        logger.logUserOperation("profile_updated", userEmail, null);
        
        return UserDTOMapper.toUserExtendedResponseDTO(savedUser);
    }

    /**
     * Desactiva la cuenta del usuario actual
     */
    @Transactional
    public MessageResponseDTO deactivateOwnAccount(String userEmail, String reason) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        user.setAccountDeactivated(true);
        user.setDeactivationDate(LocalDateTime.now());
        user.setDeactivationReason(reason);
        
        userRepository.save(user);
        logger.logUserOperation("account_deactivated_self", userEmail, Map.of("reason", reason != null ? reason : "No especificada"));
        
        return new MessageResponseDTO("Cuenta desactivada correctamente");
    }

    /**
     * Obtiene un usuario completo por email (admin)
     */
    public UserExtendedResponseDTO getUserCompleteByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        return UserDTOMapper.toUserExtendedResponseDTO(user);
    }

    /**
     * Obtiene usuarios filtrados por estado
     */
    public Page<UserResponseDTO> getUsersByStatus(String status, String search, Pageable pageable) {
        Page<User> users;
        
        switch (status.toLowerCase()) {
            case "active":
                users = search != null && !search.trim().isEmpty() ? 
                    userRepository.findActiveUsersWithSearch(search, pageable) :
                    userRepository.findActiveUsers(pageable);
                break;
            case "pending-approval":
                users = search != null && !search.trim().isEmpty() ?
                    userRepository.findPendingApprovalUsersWithSearch(search, pageable) :
                    userRepository.findPendingApprovalUsers(pageable);
                break;
            case "unverified":
                users = search != null && !search.trim().isEmpty() ?
                    userRepository.findUnverifiedUsersWithSearch(search, pageable) :
                    userRepository.findUnverifiedUsers(pageable);
                break;
            case "non-approved":
                users = search != null && !search.trim().isEmpty() ?
                    userRepository.findNonApprovedUsersWithSearch(search, pageable) :
                    userRepository.findNonApprovedUsers(pageable);
                break;
            case "deactivated":
                users = search != null && !search.trim().isEmpty() ?
                    userRepository.findDeactivatedUsersWithSearch(search, pageable) :
                    userRepository.findDeactivatedUsers(pageable);
                break;
            case "incomplete-profiles":
                users = search != null && !search.trim().isEmpty() ?
                    userRepository.findIncompleteProfileUsersWithSearch(search, pageable) :
                    userRepository.findIncompleteProfileUsers(pageable);
                break;
            default:
                throw new BadRequestException("Estado de usuario no válido: " + status);
        }
        
        return users.map(UserResponseDTO::new);
    }

    /**
     * Actualiza el perfil de un usuario (admin)
     */
    @Transactional
    public UserExtendedResponseDTO updateUserProfileByAdmin(String userId, UserProfileRequestDTO profileRequest,
                                                          List<MultipartFile> profileImages) throws IOException {
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        // Actualizar datos igual que updateUserProfile
        user.setName(profileRequest.name());
        user.setLastName(profileRequest.lastName());
        user.setDocument(profileRequest.document());
        user.setPhone(profileRequest.phone());
        user.setDateOfBirth(profileRequest.dateOfBirth());
        // Set gender attribute if provided
        if (profileRequest.genderId() != null) {
            UserAttribute gender = userAttributeRepository.findById(profileRequest.genderId()).orElse(null);
            user.setGender(gender);
        }
        user.setDescription(profileRequest.description());
        // Note: address field doesn't exist in UserProfileRequestDTO, using department/locality instead
        user.setCity(profileRequest.city());
        user.setCountry(profileRequest.country());
        // Set category interest if provided
        if (profileRequest.categoryInterest() != null) {
            UserCategoryInterest categoryInterest = userCategoryInterestRepository
                    .findByCategoryInterestEnum(UserCategoryInterestList.valueOf(profileRequest.categoryInterest()))
                    .orElse(null);
            user.setCategoryInterest(categoryInterest);
        }
        user.setProfession(profileRequest.profession());
        user.setHeight(profileRequest.height());
        // Set eye color attribute if provided
        if (profileRequest.eyeColorId() != null) {
            UserAttribute eyeColor = userAttributeRepository.findById(profileRequest.eyeColorId()).orElse(null);
            user.setEyeColor(eyeColor);
        }
        // Set hair color attribute if provided
        if (profileRequest.hairColorId() != null) {
            UserAttribute hairColor = userAttributeRepository.findById(profileRequest.hairColorId()).orElse(null);
            user.setHairColor(hairColor);
        }

        // Procesar imágenes
        if (profileImages != null && !profileImages.isEmpty()) {
            try {
                List<String> imageUrls = storageService.uploadImages(profileImages, "profiles");
                if (!imageUrls.isEmpty()) {
                    user.setImages(imageUrls); // Set all uploaded images
                }
            } catch (Exception e) {
                logger.error("Error al subir imágenes de perfil", e);
            }
        }

        // Note: profileCompletenessPercentage not found in User entity, calculating internally
        user.setProfileComplete(user.getProfileCompletenessPercentage() >= 80);

        User savedUser = userRepository.save(user);
        logger.logUserOperation("profile_updated_by_admin", user.getEmail(), Map.of("adminAction", true));
        
        return UserDTOMapper.toUserExtendedResponseDTO(savedUser);
    }

    /**
     * Revoca la aprobación de un usuario
     */
    @Transactional
    public MessageResponseDTO revokeUserApproval(String userId) {
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        user.setApprovalStatus(UserApprovalStatusList.REJECTED);
        userRepository.save(user);

        logger.logUserOperation("user_approval_revoked", user.getEmail(), Map.of("userId", userId));
        return new MessageResponseDTO("Aprobación de usuario revocada correctamente");
    }

    /**
     * Operaciones en lote para aprobación
     */
    @Transactional
    public MessageResponseDTO approveUsersBatch(List<String> userIds) {
        int approved = 0;
        int failed = 0;

        for (String userId : userIds) {
            try {
                User user = userRepository.findById(Long.valueOf(userId)).orElse(null);
                if (user != null) {
                    user.setApprovalStatus(UserApprovalStatusList.APPROVED);
                    userRepository.save(user);
                    approved++;
                    logger.logUserOperation("user_approved_batch", user.getEmail(), Map.of("userId", userId));
                } else {
                    failed++;
                }
            } catch (Exception e) {
                logger.error("Error aprobando usuario en lote: " + userId, e);
                failed++;
            }
        }

        String message = String.format("Operación completada: %d usuarios aprobados, %d fallos", approved, failed);
        return new MessageResponseDTO(message);
    }

    @Transactional
    public MessageResponseDTO rejectUsersBatch(List<String> userIds) {
        int rejected = 0;
        int failed = 0;

        for (String userId : userIds) {
            try {
                User user = userRepository.findById(Long.valueOf(userId)).orElse(null);
                if (user != null) {
                    user.setApprovalStatus(UserApprovalStatusList.REJECTED);
                    userRepository.save(user);
                    rejected++;
                    logger.logUserOperation("user_rejected_batch", user.getEmail(), Map.of("userId", userId));
                } else {
                    failed++;
                }
            } catch (Exception e) {
                logger.error("Error rechazando usuario en lote: " + userId, e);
                failed++;
            }
        }

        String message = String.format("Operación completada: %d usuarios rechazados, %d fallos", rejected, failed);
        return new MessageResponseDTO(message);
    }

    /**
     * Resetea el estado de aprobación a pendiente
     */
    @Transactional
    public MessageResponseDTO resetUserApprovalToPending(String userId) {
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        user.setApprovalStatus(UserApprovalStatusList.REJECTED);
        userRepository.save(user);

        logger.logUserOperation("user_reset_to_pending", user.getEmail(), Map.of("userId", userId));
        return new MessageResponseDTO("Usuario reseteado a estado pendiente correctamente");
    }

    /**
     * Otorga rol de administrador
     */
    @Transactional
    public MessageResponseDTO grantAdminRole(String adminEmail, String userId) {
        // Verificar que quien ejecuta la acción es admin
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UnauthorizedException("Administrador no encontrado"));
        
        if (!admin.getUserRole().getUserRoleList().equals(UserRoleList.ADMIN)) {
            throw new UnauthorizedException("Solo los administradores pueden otorgar roles");
        }

        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        UserRole adminRole = roleRepository.findByUserRoleList(UserRoleList.ADMIN).orElseThrow();
        user.setUserRole(adminRole);
        userRepository.save(user);

        logger.logUserOperation("admin_role_granted", user.getEmail(), 
            Map.of("grantedBy", adminEmail, "userId", userId));
        return new MessageResponseDTO("Rol de administrador otorgado correctamente");
    }

    @Transactional
    public MessageResponseDTO grantAdminRoleBatch(String adminEmail, List<String> userIds) {
        // Verificar admin
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UnauthorizedException("Administrador no encontrado"));
        
        if (!admin.getUserRole().getUserRoleList().equals(UserRoleList.ADMIN)) {
            throw new UnauthorizedException("Solo los administradores pueden otorgar roles");
        }

        int granted = 0;
        int failed = 0;

        for (String userId : userIds) {
            try {
                User user = userRepository.findById(Long.valueOf(userId)).orElse(null);
                if (user != null) {
                    UserRole adminRole = roleRepository.findByUserRoleList(UserRoleList.ADMIN).orElseThrow();
                    user.setUserRole(adminRole);
                    userRepository.save(user);
                    granted++;
                    logger.logUserOperation("admin_role_granted_batch", user.getEmail(), 
                        Map.of("grantedBy", adminEmail, "userId", userId));
                } else {
                    failed++;
                }
            } catch (Exception e) {
                logger.error("Error otorgando rol admin en lote: " + userId, e);
                failed++;
            }
        }

        String message = String.format("Operación completada: %d roles admin otorgados, %d fallos", granted, failed);
        return new MessageResponseDTO(message);
    }

    /**
     * Revoca rol de administrador
     */
    @Transactional
    public MessageResponseDTO revokeAdminRole(String adminEmail, String userId) {
        // Verificar admin
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UnauthorizedException("Administrador no encontrado"));
        
        if (!admin.getUserRole().getUserRoleList().equals(UserRoleList.ADMIN)) {
            throw new UnauthorizedException("Solo los administradores pueden revocar roles");
        }

        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        // Prevenir que se revoque el rol del admin principal
        if (user.getEmail().equals(this.adminEmail)) {
            throw new BadRequestException("No se puede revocar el rol del administrador principal");
        }

        UserRole clientRole = roleRepository.findByUserRoleList(UserRoleList.CLIENT).orElseThrow();
        user.setUserRole(clientRole);
        userRepository.save(user);

        logger.logUserOperation("admin_role_revoked", user.getEmail(), 
            Map.of("revokedBy", adminEmail, "userId", userId));
        return new MessageResponseDTO("Rol de administrador revocado correctamente");
    }

    @Transactional
    public MessageResponseDTO revokeAdminRoleBatch(String adminEmail, List<String> userIds) {
        // Verificar admin
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UnauthorizedException("Administrador no encontrado"));
        
        if (!admin.getUserRole().getUserRoleList().equals(UserRoleList.ADMIN)) {
            throw new UnauthorizedException("Solo los administradores pueden revocar roles");
        }

        int revoked = 0;
        int failed = 0;

        for (String userId : userIds) {
            try {
                User user = userRepository.findById(Long.valueOf(userId)).orElse(null);
                if (user != null && !user.getEmail().equals(this.adminEmail)) {
                    UserRole clientRole = roleRepository.findByUserRoleList(UserRoleList.CLIENT).orElseThrow();
                    user.setUserRole(clientRole);
                    userRepository.save(user);
                    revoked++;
                    logger.logUserOperation("admin_role_revoked_batch", user.getEmail(), 
                        Map.of("revokedBy", adminEmail, "userId", userId));
                } else {
                    failed++;
                }
            } catch (Exception e) {
                logger.error("Error revocando rol admin en lote: " + userId, e);
                failed++;
            }
        }

        String message = String.format("Operación completada: %d roles admin revocados, %d fallos", revoked, failed);
        return new MessageResponseDTO(message);
    }

    /**
     * Desactiva cuenta de usuario (admin)
     */
    @Transactional
    public MessageResponseDTO deactivateAccount(String userId, String reason) {
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        user.setAccountDeactivated(true);
        user.setDeactivationDate(LocalDateTime.now());
        user.setDeactivationReason(reason);
        userRepository.save(user);

        logger.logUserOperation("account_deactivated_by_admin", user.getEmail(), 
            Map.of("reason", reason != null ? reason : "No especificada", "userId", userId));
        return new MessageResponseDTO("Cuenta desactivada correctamente");
    }

    /**
     * Reactiva cuenta de usuario
     */
    @Transactional
    public MessageResponseDTO reactivateAccount(String userId) {
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        user.setAccountDeactivated(false);
        user.setDeactivationDate(null);
        user.setDeactivationReason(null);
        userRepository.save(user);

        logger.logUserOperation("account_reactivated", user.getEmail(), Map.of("userId", userId));
        return new MessageResponseDTO("Cuenta reactivada correctamente");
    }

    @Transactional
    public MessageResponseDTO deactivateAccountsBatch(List<String> userIds, String reason) {
        int deactivated = 0;
        int failed = 0;

        for (String userId : userIds) {
            try {
                User user = userRepository.findById(Long.valueOf(userId)).orElse(null);
                if (user != null) {
                    user.setAccountDeactivated(true);
                    user.setDeactivationDate(LocalDateTime.now());
                    user.setDeactivationReason(reason);
                    userRepository.save(user);
                    deactivated++;
                    logger.logUserOperation("account_deactivated_batch", user.getEmail(), 
                        Map.of("reason", reason != null ? reason : "No especificada", "userId", userId));
                } else {
                    failed++;
                }
            } catch (Exception e) {
                logger.error("Error desactivando cuenta en lote: " + userId, e);
                failed++;
            }
        }

        String message = String.format("Operación completada: %d cuentas desactivadas, %d fallos", deactivated, failed);
        return new MessageResponseDTO(message);
    }

    @Transactional
    public MessageResponseDTO reactivateAccountsBatch(List<String> userIds) {
        int reactivated = 0;
        int failed = 0;

        for (String userId : userIds) {
            try {
                User user = userRepository.findById(Long.valueOf(userId)).orElse(null);
                if (user != null) {
                    user.setAccountDeactivated(false);
                    user.setDeactivationDate(null);
                    user.setDeactivationReason(null);
                    userRepository.save(user);
                    reactivated++;
                    logger.logUserOperation("account_reactivated_batch", user.getEmail(), Map.of("userId", userId));
                } else {
                    failed++;
                }
            } catch (Exception e) {
                logger.error("Error reactivando cuenta en lote: " + userId, e);
                failed++;
            }
        }

        String message = String.format("Operación completada: %d cuentas reactivadas, %d fallos", reactivated, failed);
        return new MessageResponseDTO(message);
    }

    /**
     * Envía correos en lote
     */
    public MessageResponseDTO sendEmailsBatch(List<Long> userIds) {
        int sent = 0;
        int failed = 0;

        for (Long userId : userIds) {
            try {
                boolean emailSent = sendProfileCompletionReminder(userId);
                if (emailSent) {
                    sent++;
                } else {
                    failed++;
                }
            } catch (Exception e) {
                logger.error("Error enviando correo en lote: " + userId, e);
                failed++;
            }
        }

        String message = String.format("Operación completada: %d correos enviados, %d fallos", sent, failed);
        return new MessageResponseDTO(message);
    }

    /**
     * Elimina usuario permanentemente
     */
    @Transactional
    public MessageResponseDTO deleteUser(String userId) {
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        // Prevenir eliminación del admin principal
        if (user.getEmail().equals(this.adminEmail)) {
            throw new BadRequestException("No se puede eliminar el administrador principal");
        }

        String userEmail = user.getEmail();
        userRepository.delete(user);

        logger.logUserOperation("user_deleted", userEmail, Map.of("userId", userId));
        return new MessageResponseDTO("Usuario eliminado correctamente");
    }

    @Transactional
    public MessageResponseDTO deleteUsersBatch(List<String> userIds) {
        int deleted = 0;
        int failed = 0;

        for (String userId : userIds) {
            try {
                User user = userRepository.findById(Long.valueOf(userId)).orElse(null);
                if (user != null && !user.getEmail().equals(this.adminEmail)) {
                    String userEmail = user.getEmail();
                    userRepository.delete(user);
                    deleted++;
                    logger.logUserOperation("user_deleted_batch", userEmail, Map.of("userId", userId));
                } else {
                    failed++;
                }
            } catch (Exception e) {
                logger.error("Error eliminando usuario en lote: " + userId, e);
                failed++;
            }
        }

        String message = String.format("Operación completada: %d usuarios eliminados, %d fallos", deleted, failed);
        return new MessageResponseDTO(message);
    }
}
