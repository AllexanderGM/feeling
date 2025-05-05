package com.tours.domain.services;

import com.tours.domain.dto.auth.AuthRequestDTO;
import com.tours.domain.dto.auth.AuthResponseDTO;
import com.tours.domain.dto.response.MessageResponseDTO;
import com.tours.domain.dto.user.UserRequestDTO;
import com.tours.exception.UnauthorizedException;
import com.tours.infrastructure.entities.user.Role;
import com.tours.infrastructure.entities.user.Token;
import com.tours.infrastructure.entities.user.User;
import com.tours.infrastructure.entities.user.UserRol;
import com.tours.infrastructure.repositories.user.IRoleUserRepository;
import com.tours.infrastructure.repositories.user.ITokenRepository;
import com.tours.infrastructure.repositories.user.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private static final Map<String, String> tokenBlacklist = new ConcurrentHashMap<>();
    private final ITokenRepository tokenRepository;
    private final JwtService jwtService;
    private final IRoleUserRepository roleUserRepository;
    private final AuthenticationManager authenticationManager;
    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public MessageResponseDTO register(UserRequestDTO newUser) {
        try {
            Optional<User> user = userRepository.findByEmail(newUser.email());

            if (user.isPresent()) {
                logger.error("Error: Usuario ya registrado - {}", newUser.email());
                throw new UnauthorizedException("Usuario ya registrado");
            }

            Role role = roleUserRepository.findByUserRol(UserRol.CLIENT)
                    .orElseGet(() -> roleUserRepository.save(new Role(UserRol.CLIENT)));

            User userEntity = User.builder()
                    .image(newUser.image())
                    .name(newUser.name())
                    .lastname(newUser.lastName())
                    .document(newUser.document())
                    .phone(newUser.phone())
                    .dateOfBirth(newUser.dateOfBirth())
                    .email(newUser.email())
                    .password(passwordEncoder.encode(newUser.password()))
                    .dateOfJoin(LocalDate.now())
                    .address(newUser.address())
                    .city(newUser.city())
                    .role(role)
                    .build();

            User savedUser = userRepository.save(userEntity);
            var jwtToken = jwtService.generateToken(savedUser);
            saveUserToken(savedUser, jwtToken);
            logger.info("Usuario registrado correctamente {}", newUser.email());

            return new MessageResponseDTO("Usuario registrado correctamente");
        } catch (Exception e) {
            logger.error("Error al registrar usuario: {}", e.getMessage(), e);
            return new MessageResponseDTO(String.format("Error al registrar usuario: %s", e.getMessage()));
        }
    }

    public AuthResponseDTO login(AuthRequestDTO auth) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            auth.email(),
                            auth.password()
                    )
            );
        } catch (BadCredentialsException e) {
            logger.error("Error de autenticación: Credenciales incorrectas para {}", auth.email());
            throw new UnauthorizedException("Credenciales incorrectas");
        }

        Optional<User> user = userRepository.findByEmail(auth.email());
        if (user.isEmpty()) {
            logger.error("Error: Usuario no encontrado - {}", auth.email());
            throw new UnauthorizedException("Usuario no encontrado");
        }

        var jwtToken = jwtService.generateToken(user.get());
        revokeAllUserTokens(user.get());
        saveUserToken(user.get(), jwtToken);
        logger.info("Usuario autenticado correctamente - {}", auth.email());

        return new AuthResponseDTO(
                user.get().getImage(),
                user.get().getEmail(),
                user.get().getName(),
                user.get().getLastname(),
                user.get().getRole().getUserRol().name(),
                jwtToken
        );
    }

    public MessageResponseDTO refreshToken(final String authHeader) throws BadRequestException {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.error("Token no válido");
            throw new BadRequestException("Token no válido");
        }

        final String refreshToken = authHeader.substring(7);
        final String userEmail = jwtService.extractUsername(refreshToken);

        if (userEmail == null) {
            logger.error("Token no válido");
            throw new BadRequestException("Token no válido");
        }

        final Optional<User> user = userRepository.findByEmail(userEmail);

        if (!jwtService.isTokenValid(refreshToken, user.get())) {
            logger.error("Token no válido");
            throw new BadRequestException("Token no válido");
        }

        final String newToken = jwtService.generateToken(user.get());
        revokeAllUserTokens(user.get());
        saveUserToken(user.get(), newToken);
        logger.info("Token refrescado correctamente");
        return new MessageResponseDTO(newToken);
    }

    private void saveUserToken(User user, String token) {
        Token userToken = Token.builder()
                .token(token)
                .user(user)
                .build();


        tokenRepository.save(userToken);
    }

    private void revokeAllUserTokens(User user) {
        final List<Token> validUserTokens = tokenRepository
                .findAllValidIsFalseOrRevokedIsFalseByUserId(user.getId());

        if (!validUserTokens.isEmpty()) {
            validUserTokens.forEach(token -> {
                token.setExpired(true);
                token.setRevoked(true);
                tokenRepository.save(token);
            });
            tokenRepository.saveAll(validUserTokens);
        }
    }
}
