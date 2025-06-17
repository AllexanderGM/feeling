package com.feeling.domain.services;

import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.UserModifyDTO;
import com.feeling.domain.dto.user.UserProfileDTO;
import com.feeling.domain.dto.user.UserResponseDTO;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.infrastructure.entities.user.User;
import com.feeling.infrastructure.entities.user.UserRole;
import com.feeling.infrastructure.entities.user.UserRoleList;
import com.feeling.infrastructure.entities.user.UserToken;
import com.feeling.infrastructure.repositories.user.IUserRepository;
import com.feeling.infrastructure.repositories.user.IUserRoleRepository;
import com.feeling.infrastructure.repositories.user.IUserTokenRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

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

    @Transactional
    public UserResponseDTO completeProfile(String email, UserProfileDTO profileData) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        // Actualizar solo los campos proporcionados
        if (profileData.image() != null) user.setImages(profileData.image());
        if (profileData.document() != null) user.setDocument(profileData.document());
        if (profileData.phone() != null) user.setPhone(profileData.phone());
        if (profileData.dateOfBirth() != null) user.setDateOfBirth(profileData.dateOfBirth());
        if (profileData.city() != null) user.setCity(profileData.city());

        User updatedUser = userRepository.save(user);
        logger.info("Perfil completado correctamente para el usuario {}", email);

        return new UserResponseDTO(updatedUser);
    }

    public UserResponseDTO update(String email, UserModifyDTO userRequestDTO) {
        try {
            User user = userRepository.findByEmail(email).orElseThrow(() -> {
                logger.error("Error: Usuario con email {} no encontrado", email);
                return new UnauthorizedException("Usuario no encontrado");
            });

            user.setEmail(userRequestDTO.email());
            user.setName(userRequestDTO.name());
            user.setLastname(userRequestDTO.lastName());
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
