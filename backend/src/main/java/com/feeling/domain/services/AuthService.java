package com.feeling.domain.services;

import com.feeling.domain.dto.auth.AuthRequestDTO;
import com.feeling.domain.dto.auth.AuthResponseDTO;
import com.feeling.domain.dto.auth.AuthVerifyCodeDTO;
import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.UserRequestDTO;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.infrastructure.entities.user.*;
import com.feeling.infrastructure.repositories.user.IRoleUserRepository;
import com.feeling.infrastructure.repositories.user.ITokenRepository;
import com.feeling.infrastructure.repositories.user.IUserRepository;
import com.feeling.infrastructure.repositories.user.IVerificationCodeRepository;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private static final int CODE_LENGTH = 6;
    private static final int EXPIRATION_MINUTES = 30;
    private static final Map<String, String> tokenBlacklist = new ConcurrentHashMap<>();

    private final ITokenRepository tokenRepository;
    private final JwtService jwtService;
    private final IRoleUserRepository roleUserRepository;
    private final AuthenticationManager authenticationManager;
    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final IVerificationCodeRepository verificationCodeRepository;
    private final EmailService emailService;

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

    public MessageResponseDTO resendCode(String email) {

    }

    public String generateVerificationCode() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();

        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }

        return code.toString();
    }

    @Async
    public void createAndSendVerificationCode(User user) {
        // Revocar códigos anteriores si existen
        Optional<VerificationCode> existingCode = verificationCodeRepository.findByUserId(user.getId());
        existingCode.ifPresent(verificationCodeRepository::delete);

        // Crear nuevo código
        String code = generateVerificationCode();
        LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES);

        VerificationCode verificationCode = VerificationCode.builder()
                .code(code)
                .user(user)
                .expirationTime(expirationTime)
                .verified(false)
                .build();

        verificationCodeRepository.save(verificationCode);

        // Enviar correo con el código
        try {
            sendVerificationEmail(user.getEmail(), user.getName() + " " + user.getLastname(), code);
            logger.info("Código de verificación enviado a {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Error al enviar código de verificación: {}", e.getMessage(), e);
        }
    }

    private void sendVerificationEmail(String email, String name, String code) throws MessagingException {
        try {
            // Crear contexto para la plantilla Thymeleaf
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("verificationCode", code);

            // Usar el servicio de correo existente
            emailService.sendVerificationEmail(email, name, code);
        } catch (Exception e) {
            logger.error("Error al enviar el correo de verificación: {}", e.getMessage());
            throw new MessagingException("Error al enviar el correo de verificación", e);
        }
    }

    public MessageResponseDTO verifyCode(AuthVerifyCodeDTO authVerifyCodeDTO) {
        User user = userRepository.findByEmail(authVerifyCodeDTO.email())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        VerificationCode verificationCode = verificationCodeRepository.findByCode(authVerifyCodeDTO.code())
                .orElseThrow(() -> new UnauthorizedException("Código de verificación inválido"));

        if (!verificationCode.getUser().getId().equals(user.getId())) {
            logger.error("El código no pertenece al usuario {}", authVerifyCodeDTO.email());
            throw new UnauthorizedException("Código de verificación inválido");
        }

        if (verificationCode.isVerified()) {
            logger.info("El código ya ha sido verificado para {}", authVerifyCodeDTO.email());
            return new MessageResponseDTO("La cuenta ya está verificada");
        }

        if (verificationCode.getExpirationTime().isBefore(LocalDateTime.now())) {
            logger.error("Código expirado para {}", authVerifyCodeDTO.email());
            throw new UnauthorizedException("El código ha expirado");
        }

        // Actualizar estado de verificación
        verificationCode.setVerified(true);
        verificationCodeRepository.save(verificationCode);

        user.setVerified(true);
        userRepository.save(user);

        logger.info("Usuario verificado correctamente {}", email);
        return new MessageResponseDTO("Cuenta verificada correctamente");
    }

    public MessageResponseDTO resendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (user.isVerified()) {
            logger.info("La cuenta ya está verificada {}", email);
            return new MessageResponseDTO("La cuenta ya está verificada");
        }

        createAndSendVerificationCode(user);

        return new MessageResponseDTO("Código de verificación reenviado");
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
