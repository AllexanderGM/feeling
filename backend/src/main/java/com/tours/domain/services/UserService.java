package com.tours.domain.services;

import com.tours.domain.dto.response.MessageResponseDTO;
import com.tours.domain.dto.user.UserModifyDTO;
import com.tours.domain.dto.user.UserResponseDTO;
import com.tours.exception.UnauthorizedException;
import com.tours.infrastructure.entities.user.Role;
import com.tours.infrastructure.entities.user.Token;
import com.tours.infrastructure.entities.user.User;
import com.tours.infrastructure.entities.user.UserRol;
import com.tours.infrastructure.repositories.user.IRoleUserRepository;
import com.tours.infrastructure.repositories.user.ITokenRepository;
import com.tours.infrastructure.repositories.user.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    @Value("${ADMIN_USERNAME}")
    private String superAdminEmail;

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private static final Map<String, String> tokenBlacklist = new ConcurrentHashMap<>();
    private final IUserRepository userRepository;
    private final IRoleUserRepository rolRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final ITokenRepository tokenRepository;

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

    public UserResponseDTO update(String email, UserModifyDTO userRequestDTO) {
        try {
            User user = userRepository.findByEmail(email).orElseThrow(() -> {
                logger.error("Error: Usuario con email {} no encontrado", email);
                return new UnauthorizedException("Usuario no encontrado");
            });

            user.setImage(userRequestDTO.image());
            user.setEmail(userRequestDTO.email());
            user.setName(userRequestDTO.name());
            user.setLastname(userRequestDTO.lastName());
            user.setDocument(userRequestDTO.document());
            user.setPhone(userRequestDTO.phone());
            user.setDateOfBirth(userRequestDTO.dateOfBirth());
            user.setEmail(userRequestDTO.email());
            user.setPassword(bCryptPasswordEncoder.encode(userRequestDTO.password()));
            user.setAddress(userRequestDTO.address());
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
        List<Token> tokens = tokenRepository.findByUser(user);
        tokenRepository.deleteAll(tokens);
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

        Role adminRole = rolRepository.findByUserRol(UserRol.ADMIN)
                .orElseThrow(() -> new UnauthorizedException("Rol ADMIN no encontrado"));

        user.setRole(adminRole);
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

        Role userRole = rolRepository.findByUserRol(UserRol.CLIENT)
                .orElseThrow(() -> new UnauthorizedException("Rol CLIENT no encontrado"));

        user.setRole(userRole);
        userRepository.save(user);
        logger.info("El usuario {} ya no es ADMIN", user.getEmail());

        return new MessageResponseDTO("El usuario ya no es ADMIN");
    }
}