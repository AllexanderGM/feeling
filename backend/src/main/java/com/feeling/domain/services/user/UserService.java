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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private static final StructuredLoggerFactory.StructuredLogger logger = 
            StructuredLoggerFactory.create(UserService.class);
    private static final Map<String, String> tokenBlacklist = new ConcurrentHashMap<>();
    private final IUserRepository userRepository;
    private final IUserRoleRepository rolRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final IUserTokenRepository tokenRepository;
    private final StorageService storageService;
    private final UserTagService userTagService;
    private final IUserAttributeRepository userAttributeRepository;
    private final IUserCategoryInterestRepository userCategoryInterestRepository;
    private final CachedUserService cachedUserService;
    private final EmailService emailService;
    
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

    public Page<UserResponseDTO> getUserSuggestions(String userEmail, Pageable pageable) {
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

        return suggestedUsers.map(UserResponseDTO::new);
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

    public MessageResponseDTO grantAdminRole(String adminEmail, String userId) {
        // Verificar que el solicitante sea admin (ya verificado por Spring Security)
        User adminUser = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UnauthorizedException("Usuario administrador no encontrado"));
        
        if (!adminUser.getUserRole().getUserRoleList().equals(UserRoleList.ADMIN)) {
            throw new UnauthorizedException("No tienes permisos de administrador");
        }

        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        // No permitir que un admin se modifique a sí mismo
        if (user.getEmail().equals(adminEmail)) {
            throw new UnauthorizedException("No puedes modificar tu propio rol");
        }

        UserRole adminUserRole = rolRepository.findByUserRoleList(UserRoleList.ADMIN)
                .orElseThrow(() -> new UnauthorizedException("Rol ADMIN no encontrado"));

        user.setUserRole(adminUserRole);
        userRepository.save(user);
        
        // Invalidar cache para que los cambios se reflejen inmediatamente
        cachedUserService.evictUserCache(user.getEmail());
        
        logger.logUserOperation("user_promoted_admin", user.getEmail(), Map.of("promotedBy", adminEmail));

        return new MessageResponseDTO("El usuario ahora es ADMIN");
    }

    public MessageResponseDTO revokeAdminRole(String adminEmail, String userId) {
        // Verificar que el solicitante sea admin (ya verificado por Spring Security)
        User adminUser = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UnauthorizedException("Usuario administrador no encontrado"));
        
        if (!adminUser.getUserRole().getUserRoleList().equals(UserRoleList.ADMIN)) {
            throw new UnauthorizedException("No tienes permisos de administrador");
        }

        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));

        // No permitir que un admin se revoque a sí mismo
        if (user.getEmail().equals(adminEmail)) {
            throw new UnauthorizedException("No puedes modificar tu propio rol");
        }

        UserRole userRole = rolRepository.findByUserRoleList(UserRoleList.CLIENT)
                .orElseThrow(() -> new UnauthorizedException("Rol CLIENT no encontrado"));

        user.setUserRole(userRole);
        userRepository.save(user);
        
        // Invalidar cache para que los cambios se reflejen inmediatamente
        cachedUserService.evictUserCache(user.getEmail());
        
        logger.logUserOperation("user_demoted_admin", user.getEmail(), Map.of("demotedBy", adminEmail));

        return new MessageResponseDTO("El usuario ya no es ADMIN");
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

        user.setApproved(true);
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
        
        logger.logUserOperation("user_approved", user.getEmail(), Map.of("approved", true));

        return new MessageResponseDTO("Usuario aprobado correctamente");
    }

    /**
     * Revoca la aprobación de un usuario
     */
    public MessageResponseDTO revokeUserApproval(String userId) {
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        user.setApproved(false);
        userRepository.save(user);
        
        // Invalidar cache para que los cambios se reflejen inmediatamente
        cachedUserService.evictUserCache(user.getEmail());
        
        logger.logUserOperation("user_approval_revoked", user.getEmail(), Map.of("approved", false));

        return new MessageResponseDTO("Aprobación del usuario revocada");
    }

    /**
     * Obtiene usuarios pendientes de aprobación (perfil completo pero no aprobados)
     */
    public Page<UserResponseDTO> getPendingApprovalUsers(Pageable pageable) {
        Page<User> pendingUsers = userRepository.findByProfileCompleteAndApproved(true, false, pageable);
        logger.info("Usuarios pendientes de aprobación encontrados", Map.of(
                "page", pageable.getPageNumber(),
                "size", pageable.getPageSize(),
                "total", pendingUsers.getTotalElements()));
        return pendingUsers.map(UserResponseDTO::new);
    }

    /**
     * Permite al usuario desactivar su propia cuenta
     */
    @Transactional
    public MessageResponseDTO deactivateOwnAccount(String userEmail, String reason) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        if (user.isAccountDeactivated()) {
            throw new RuntimeException("La cuenta ya está desactivada");
        }

        user.deactivateAccount(reason != null ? reason : "Desactivado por el usuario");
        userRepository.save(user);
        
        // Invalidar cache para que los cambios se reflejen inmediatamente
        cachedUserService.evictUserCache(user.getEmail());
        
        logger.logUserOperation("account_deactivated_by_user", userEmail, Map.of("reason", reason != null ? reason : "N/A"));

        return new MessageResponseDTO("Cuenta desactivada correctamente");
    }

    /**
     * Permite al administrador reactivar una cuenta
     */
    @Transactional
    public MessageResponseDTO reactivateAccount(String userId) {
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        if (!user.isAccountDeactivated()) {
            throw new RuntimeException("La cuenta no está desactivada");
        }

        user.reactivateAccount();
        userRepository.save(user);
        
        // Invalidar cache para que los cambios se reflejen inmediatamente
        cachedUserService.evictUserCache(user.getEmail());
        
        logger.logUserOperation("account_reactivated_by_admin", user.getEmail(), null);

        return new MessageResponseDTO("Cuenta reactivada correctamente");
    }

    /**
     * Convierte una entidad User a UserPublicResponseDTO usando el mapper
     */
    public UserPublicResponseDTO convertToUserPublicResponseDTO(User user) {
        return UserDTOMapper.toUserPublicResponseDTO(user);
    }
}
