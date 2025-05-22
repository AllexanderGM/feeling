package com.feeling.domain.services;

import com.feeling.domain.dto.auth.AuthRequestDTO;
import com.feeling.domain.dto.auth.AuthResponseDTO;
import com.feeling.domain.dto.auth.AuthVerifyCodeDTO;
import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.UserRequestDTO;
import com.feeling.exception.ExistEmailException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.infrastructure.entities.user.*;
import com.feeling.infrastructure.repositories.user.IUserRepository;
import com.feeling.infrastructure.repositories.user.IUserRoleRepository;
import com.feeling.infrastructure.repositories.user.IUserTokenRepository;
import com.feeling.infrastructure.repositories.user.IUserVerificationCodeRepository;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
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

    private final IUserTokenRepository tokenRepository;
    private final JwtService jwtService;
    private final IUserRoleRepository roleUserRepository;
    private final AuthenticationManager authenticationManager;
    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final IUserVerificationCodeRepository verificationCodeRepository;
    private final EmailService emailService;

    // ==============================
    // REGISTRO CON DATOS MÍNIMOS
    // ==============================

    /**
     * Registra un nuevo usuario con datos mínimos obligatorios
     * Solo requiere: name, email, password
     */
    @Transactional
    public MessageResponseDTO register(UserRequestDTO newUser) {
        try {
            // Validar que no existe un usuario con el mismo email
            Optional<User> existingUser = userRepository.findByEmail(newUser.email());
            if (existingUser.isPresent()) {
                logger.error("Error: Usuario ya registrado - {}", newUser.email());
                throw new ExistEmailException("El correo electrónico ya está registrado");
            }

            // Validar datos mínimos
            validateMinimumRegistrationData(newUser);

            // Obtener o crear rol de cliente
            UserRole clientRole = roleUserRepository.findByUserRoleList(UserRoleList.CLIENT)
                    .orElseGet(() -> {
                        UserRole newRole = new UserRole(UserRoleList.CLIENT);
                        return roleUserRepository.save(newRole);
                    });

            // Construir usuario con datos mínimos
            User userEntity = User.builder()
                    .name(newUser.name().trim())
                    .email(newUser.email().toLowerCase().trim())
                    .password(passwordEncoder.encode(newUser.password()))
                    .userRole(clientRole)
                    .verified(false) // Usuario no verificado hasta confirmar email
                    .profileComplete(false) // Perfil incompleto hasta completar datos
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .allowNotifications(true)
                    .showMeInSearch(true)
                    .showAge(true)
                    .showLocation(true)
                    .showPhone(false)
                    .availableAttempts(0)
                    .totalAttemptsPurchased(0)
                    .profileViews(0L)
                    .likesReceived(0L)
                    .matchesCount(0L)
                    .popularityScore(0.0)
                    .build();

            User savedUser = userRepository.save(userEntity);

            // Generar y enviar código de verificación
            createAndSendVerificationCode(savedUser);

            logger.info("Usuario registrado correctamente: {}", newUser.email());
            return new MessageResponseDTO("Usuario registrado exitosamente. Por favor, verifica tu correo electrónico para activar tu cuenta.");

        } catch (ExistEmailException e) {
            logger.error("Error al registrar usuario: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado al registrar usuario: {}", e.getMessage(), e);
            throw new RuntimeException("Error al registrar usuario. Por favor, inténtalo de nuevo.");
        }
    }

    /**
     * Valida que los datos mínimos de registro estén presentes
     */
    private void validateMinimumRegistrationData(UserRequestDTO userData) {
        if (userData.name() == null || userData.name().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        if (userData.email() == null || userData.email().trim().isEmpty()) {
            throw new IllegalArgumentException("El correo electrónico es obligatorio");
        }
        if (userData.password() == null || userData.password().length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
        }
        if (!isValidEmail(userData.email())) {
            throw new IllegalArgumentException("El formato del correo electrónico no es válido");
        }
    }

    /**
     * Validación básica de formato de email
     */
    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

    // ==============================
    // AUTENTICACIÓN
    // ==============================

    /**
     * Autentica un usuario con email y contraseña
     */
    public AuthResponseDTO login(AuthRequestDTO auth) {
        try {
            // Validar credenciales
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            auth.email().toLowerCase().trim(),
                            auth.password()
                    )
            );

            // Buscar usuario
            Optional<User> userOptional = userRepository.findByEmail(auth.email().toLowerCase().trim());
            if (userOptional.isEmpty()) {
                logger.error("Usuario no encontrado después de autenticación exitosa: {}", auth.email());
                throw new UnauthorizedException("Usuario no encontrado");
            }

            User user = userOptional.get();

            // Verificar que el usuario esté verificado
            if (!user.isVerified()) {
                logger.warn("Intento de login con usuario no verificado: {}", auth.email());
                throw new UnauthorizedException("Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.");
            }

            // Generar token JWT
            String jwtToken = jwtService.generateToken(user);

            // Revocar tokens anteriores y guardar el nuevo
            revokeAllUserTokens(user);
            saveUserToken(user, jwtToken);

            // Actualizar última actividad
            user.setLastActive(LocalDateTime.now());
            userRepository.save(user);

            logger.info("Usuario autenticado correctamente: {}", auth.email());

            return new AuthResponseDTO(
                    user.getMainImage(), // Imagen principal (primera de la lista)
                    user.getEmail(),
                    user.getName(),
                    user.getLastname(),
                    user.getUserRole().getUserRoleList().name(),
                    jwtToken
            );

        } catch (BadCredentialsException e) {
            logger.error("Credenciales incorrectas para usuario: {}", auth.email());
            throw new UnauthorizedException("Email o contraseña incorrectos");
        } catch (UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado durante autenticación: {}", e.getMessage(), e);
            throw new UnauthorizedException("Error durante el inicio de sesión");
        }
    }

    // ==============================
    // VERIFICACIÓN POR EMAIL
    // ==============================

    /**
     * Genera un código de verificación numérico aleatorio
     */
    public String generateVerificationCode() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();

        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }

        return code.toString();
    }

    /**
     * Crea y envía un código de verificación para un usuario
     */
    @Async
    public void createAndSendVerificationCode(User user) {
        try {
            // Revocar códigos anteriores si existen
            Optional<UserVerificationCode> existingCode = verificationCodeRepository.findByUserId(user.getId());
            existingCode.ifPresent(verificationCodeRepository::delete);

            // Crear nuevo código
            String code = generateVerificationCode();
            LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES);

            UserVerificationCode verificationCode = UserVerificationCode.builder()
                    .code(code)
                    .user(user)
                    .expirationTime(expirationTime)
                    .verified(false)
                    .build();

            verificationCodeRepository.save(verificationCode);

            // Enviar correo con el código
            emailService.sendVerificationEmail(
                    user.getEmail(),
                    user.getName() + " " + user.getLastname(),
                    code
            );

            logger.info("Código de verificación enviado a: {}", user.getEmail());

        } catch (MessagingException e) {
            logger.error("Error al enviar código de verificación por email: {}", e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Error inesperado al crear y enviar código de verificación: {}", e.getMessage(), e);
        }
    }

    /**
     * Verifica un código de verificación enviado por el usuario
     */
    @Transactional
    public MessageResponseDTO verifyCode(AuthVerifyCodeDTO authVerifyCodeDTO) {
        // Buscar usuario
        User user = userRepository.findByEmail(authVerifyCodeDTO.email().toLowerCase().trim())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        // Buscar código de verificación
        UserVerificationCode verificationCode = verificationCodeRepository.findByCode(authVerifyCodeDTO.code())
                .orElseThrow(() -> new UnauthorizedException("Código de verificación inválido"));

        // Verificar que el código pertenece al usuario
        if (!verificationCode.getUser().getId().equals(user.getId())) {
            logger.error("Intento de verificación con código que no pertenece al usuario: {}", authVerifyCodeDTO.email());
            throw new UnauthorizedException("Código de verificación inválido");
        }

        // Verificar si ya está verificado
        if (verificationCode.isVerified()) {
            logger.info("Intento de verificación con código ya usado: {}", authVerifyCodeDTO.email());
            return new MessageResponseDTO("La cuenta ya está verificada");
        }

        // Verificar expiración
        if (verificationCode.getExpirationTime().isBefore(LocalDateTime.now())) {
            logger.error("Código expirado para usuario: {}", authVerifyCodeDTO.email());
            throw new UnauthorizedException("El código ha expirado. Solicita un nuevo código.");
        }

        // Marcar código como verificado
        verificationCode.setVerified(true);
        verificationCodeRepository.save(verificationCode);

        // Activar usuario
        user.setVerified(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        logger.info("Usuario verificado exitosamente: {}", authVerifyCodeDTO.email());
        return new MessageResponseDTO("¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.");
    }

    /**
     * Reenvía un código de verificación al correo del usuario
     */
    @Transactional
    public MessageResponseDTO resendCode(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        if (user.isVerified()) {
            logger.info("Intento de reenvío de código para usuario ya verificado: {}", email);
            return new MessageResponseDTO("La cuenta ya está verificada");
        }

        // Verificar si ha pasado suficiente tiempo desde el último envío (anti-spam)
        Optional<UserVerificationCode> lastCode = verificationCodeRepository.findByUserId(user.getId());
        if (lastCode.isPresent()) {
            LocalDateTime lastSent = lastCode.get().getExpirationTime().minusMinutes(EXPIRATION_MINUTES);
            if (lastSent.isAfter(LocalDateTime.now().minusMinutes(2))) {
                throw new UnauthorizedException("Debes esperar al menos 2 minutos antes de solicitar un nuevo código");
            }
        }

        // Generar y enviar nuevo código
        createAndSendVerificationCode(user);

        logger.info("Código de verificación reenviado a: {}", email);
        return new MessageResponseDTO("Se ha enviado un nuevo código de verificación a tu correo electrónico");
    }

    // ==============================
    // GESTIÓN DE TOKENS JWT
    // ==============================

    /**
     * Refresca un token JWT
     */
    public MessageResponseDTO refreshToken(final String authHeader) throws BadRequestException {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.error("Intento de refresh con token inválido");
            throw new BadRequestException("Token no válido");
        }

        final String refreshToken = authHeader.substring(7);
        final String userEmail = jwtService.extractUsername(refreshToken);

        if (userEmail == null) {
            logger.error("No se pudo extraer email del token");
            throw new BadRequestException("Token no válido");
        }

        final Optional<User> userOptional = userRepository.findByEmail(userEmail);
        if (userOptional.isEmpty()) {
            logger.error("Usuario no encontrado durante refresh: {}", userEmail);
            throw new BadRequestException("Usuario no encontrado");
        }

        User user = userOptional.get();

        if (!jwtService.isTokenValid(refreshToken, user)) {
            logger.error("Token inválido durante refresh: {}", userEmail);
            throw new BadRequestException("Token no válido");
        }

        // Generar nuevo token
        final String newToken = jwtService.generateToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, newToken);

        logger.info("Token refrescado correctamente para: {}", userEmail);
        return new MessageResponseDTO(newToken);
    }

    /**
     * Guarda un token para un usuario
     */
    private void saveUserToken(User user, String token) {
        UserToken userToken = UserToken.builder()
                .token(token)
                .user(user)
                .type(UserToken.TokenType.ACCESS)
                .expired(false)
                .revoked(false)
                .build();

        tokenRepository.save(userToken);
    }

    /**
     * Revoca todos los tokens activos de un usuario
     */
    private void revokeAllUserTokens(User user) {
        final List<UserToken> validUserTokens = tokenRepository
                .findAllValidIsFalseOrRevokedIsFalseByUserId(user.getId());

        if (!validUserTokens.isEmpty()) {
            validUserTokens.forEach(token -> {
                token.setExpired(true);
                token.setRevoked(true);
            });
            tokenRepository.saveAll(validUserTokens);
        }
    }

    // ==============================
    // MÉTODOS DE UTILIDAD
    // ==============================

    /**
     * Verifica si un usuario está completamente registrado y verificado
     */
    public boolean isUserFullyRegistered(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email.toLowerCase().trim());
        if (userOptional.isEmpty()) {
            return false;
        }

        User user = userOptional.get();
        return user.isVerified() && user.isEnabled();
    }

    /**
     * Obtiene información básica del usuario por email
     */
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim());
    }
}
