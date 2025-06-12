package com.feeling.domain.services;

import com.feeling.domain.dto.auth.*;
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
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
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
    private final GoogleOAuthService googleOAuthService;

    // ==============================
    // REGISTRO
    // ==============================

    /**
     * REGISTRO DE USUARIO
     * Registra un usuario tradicional (MODIFICADO para validar Google)
     */
    @Transactional
    public MessageResponseDTO register(UserRequestDTO newUser) {
        try {
            // Validar que no existe un usuario con el mismo email
            Optional<User> existingUser = userRepository.findByEmail(newUser.email());
            if (existingUser.isPresent()) {
                User user = existingUser.get();

                // Mensaje específico según el proveedor
                String conflictMessage = switch (user.getUserAuthProvider()) {
                    case GOOGLE -> "Esta cuenta ya está registrada con Google. " +
                            "Ve a 'Iniciar Sesión' y usa el botón 'Continuar con Google'.";
                    case FACEBOOK -> "Esta cuenta ya está registrada con Facebook. " +
                            "Ve a 'Iniciar Sesión' y usa el botón 'Continuar con Facebook'.";
                    case LOCAL -> "El correo electrónico ya está registrado. " +
                            "Ve a 'Iniciar Sesión' si ya tienes una cuenta.";
                    default -> "El correo electrónico ya está registrado con otro método.";
                };

                logger.error("Error: Usuario ya registrado - {} ({})", newUser.email(), user.getUserAuthProvider());
                throw new ExistEmailException(conflictMessage);
            }

            // Validar datos mínimos
            validateMinimumRegistrationData(newUser);

            // Obtener o crear rol de cliente
            UserRole clientRole = roleUserRepository.findByUserRoleList(UserRoleList.CLIENT)
                    .orElseGet(() -> {
                        UserRole newRole = new UserRole(UserRoleList.CLIENT);
                        return roleUserRepository.save(newRole);
                    });

            // Construir usuario con datos mínimos (LOCAL por defecto)
            User userEntity = User.builder()
                    .name(newUser.name().trim())
                    .lastname(newUser.lastName().trim())
                    .email(newUser.email().toLowerCase().trim())
                    .password(passwordEncoder.encode(newUser.password()))
                    .userRole(clientRole)
                    .userAuthProvider(UserAuthProvider.LOCAL) // ← EXPLÍCITAMENTE LOCAL
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

            // Generar y enviar código de verificación (solo para LOCAL)
            createAndSendVerificationCode(savedUser);

            logger.info("Usuario registrado correctamente (LOCAL): {}", newUser.email());
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
     * REGISTRO CON GOOGLE
     * Registra un nuevo usuario específicamente usando Google OAuth
     */
    @Transactional
    public AuthResponseDTO registerWithGoogle(GoogleTokenRequestDTO request) {
        try {
            logger.info("Iniciando registro con Google");

            // 1. Obtener información del usuario de Google
            GoogleUserInfoDTO googleUser = googleOAuthService.getUserInfo(request.accessToken());

            // 2. Verificar si el usuario YA EXISTE
            Optional<User> existingUser = userRepository.findByEmail(googleUser.email().toLowerCase().trim());

            if (existingUser.isPresent()) {
                User user = existingUser.get();
                String conflictMessage = switch (user.getUserAuthProvider()) {
                    case LOCAL -> "Esta cuenta ya está registrada con email y contraseña. " +
                            "Ve a 'Iniciar Sesión' y usa tu email y contraseña, " +
                            "o usa 'Iniciar Sesión con Google' para vincular tu cuenta.";
                    case GOOGLE -> "Esta cuenta ya está registrada con Google. " +
                            "Ve a 'Iniciar Sesión' y usa el botón 'Continuar con Google'.";
                    case FACEBOOK -> "Esta cuenta ya está registrada con Facebook. " +
                            "Ve a 'Iniciar Sesión' y usa el botón 'Continuar con Facebook'.";
                    default -> "Esta cuenta ya existe con otro método de autenticación.";
                };
                throw new ExistEmailException(conflictMessage);
            }

            // 3. Crear nuevo usuario desde Google
            logger.info("Creando nuevo usuario desde Google (registro): {}", googleUser.email());

            UserRole clientRole = roleUserRepository.findByUserRoleList(UserRoleList.CLIENT)
                    .orElseGet(() -> roleUserRepository.save(new UserRole(UserRoleList.CLIENT)));

            User newUser = User.builder()
                    .name(googleUser.getFirstName())
                    .lastname(googleUser.getLastName())
                    .email(googleUser.email().toLowerCase().trim())
                    .password(passwordEncoder.encode(
                            googleOAuthService.generateOAuthPassword("GOOGLE", googleUser.sub())
                    ))
                    .userRole(clientRole)
                    .userAuthProvider(UserAuthProvider.GOOGLE)
                    .externalId(googleUser.sub())
                    .externalAvatarUrl(googleUser.picture())
                    .verified(true) // Google ya verificó el email
                    .profileComplete(false) // Necesita completar perfil en Feeling
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .lastExternalSync(LocalDateTime.now())
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

            if (googleUser.picture() != null && !googleUser.picture().trim().isEmpty()) {
                newUser.setImages(new ArrayList<>(List.of(googleUser.picture())));
            }

            // 4. Guardar usuario
            newUser = userRepository.save(newUser);

            // 5. NUEVO: Enviar email de bienvenida para usuarios de Google
            try {
                emailService.sendWelcomeEmailForGoogleUser(
                        newUser.getEmail(),
                        newUser.getName() + " " + newUser.getLastname(),
                        googleUser.picture()
                );
                logger.info("Email de bienvenida enviado a usuario de Google: {}", newUser.getEmail());
            } catch (Exception emailError) {
                logger.warn("Error al enviar email de bienvenida a usuario de Google: {}", emailError.getMessage());
            }

            // 6. Generar JWT
            String jwtToken = jwtService.generateToken(newUser);
            saveUserToken(newUser, jwtToken);

            // 7. Actualizar última actividad
            newUser.setLastActive(LocalDateTime.now());
            userRepository.save(newUser);

            logger.info("Usuario registrado con Google correctamente: {}", googleUser.email());

            return new AuthResponseDTO(
                    newUser.getMainImage(),
                    newUser.getEmail(),
                    newUser.getName(),
                    newUser.getLastname(),
                    newUser.getUserRole().getUserRoleList().name(),
                    jwtToken
            );

        } catch (ExistEmailException e) {
            logger.error("Error: Usuario ya registrado con Google - {}", e.getMessage());
            throw e;
        } catch (UnauthorizedException e) {
            logger.error("Error de autorización con Google en registro: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado durante registro con Google: {}", e.getMessage(), e);
            throw new RuntimeException("Error durante el registro con Google. Inténtalo de nuevo.");
        }
    }

    // ==============================
    // AUTENTICACIÓN
    // ==============================

    /**
     * LOGIN CON GOOGLE
     * Autentica o registra un usuario usando Google OAuth
     */
    @Transactional
    public AuthResponseDTO loginWithGoogle(GoogleTokenRequestDTO request) {
        try {
            logger.info("Iniciando autenticación con Google");

            // 1. Obtener información del usuario de Google
            GoogleUserInfoDTO googleUser = googleOAuthService.getUserInfo(request.accessToken());

            // 2. Buscar si el usuario ya existe
            Optional<User> existingUser = userRepository.findByEmail(googleUser.email().toLowerCase().trim());

            User user;
            boolean isNewUser = false;

            if (existingUser.isPresent()) {
                user = existingUser.get();

                // Verificar el método de autenticación
                if (user.getUserAuthProvider() == UserAuthProvider.LOCAL) {
                    // Usuario registrado con email/contraseña quiere usar Google
                    logger.info("Usuario existente con cuenta local quiere usar Google: {}", googleUser.email());

                    // Opción 1: Permitir la migración automática
                    user.setUserAuthProvider(UserAuthProvider.GOOGLE);
                    user.setExternalId(googleUser.sub());
                    user.updateFromOAuthProvider(
                            googleUser.sub(),
                            googleUser.getFirstName(),
                            googleUser.getLastName(),
                            googleUser.email(),
                            googleUser.picture()
                    );

                    // Opción 2: Lanzar excepción para requerir confirmación
                    // throw new AuthMethodConflictException(
                    //     AuthMethodConflictDTO.create(googleUser.email(), "LOCAL", "GOOGLE")
                    // );

                } else if (user.getUserAuthProvider() == UserAuthProvider.GOOGLE) {
                    // Usuario Google existente - actualizar información
                    user.updateFromOAuthProvider(
                            googleUser.sub(),
                            googleUser.getFirstName(),
                            googleUser.getLastName(),
                            googleUser.email(),
                            googleUser.picture()
                    );
                } else {
                    // Usuario con otro proveedor OAuth
                    throw new UnauthorizedException(
                            "Esta cuenta está registrada con " + user.getUserAuthProvider().getDisplayName() +
                                    ". " + user.getAuthMethodMessage()
                    );
                }

            } else {
                // 3. Crear nuevo usuario desde Google
                logger.info("Creando nuevo usuario desde Google: {}", googleUser.email());
                isNewUser = true;

                // Obtener rol de cliente
                UserRole clientRole = roleUserRepository.findByUserRoleList(UserRoleList.CLIENT)
                        .orElseGet(() -> roleUserRepository.save(new UserRole(UserRoleList.CLIENT)));

                // Crear usuario
                user = User.builder()
                        .name(googleUser.getFirstName())
                        .lastname(googleUser.getLastName())
                        .email(googleUser.email().toLowerCase().trim())
                        .password(passwordEncoder.encode(
                                googleOAuthService.generateOAuthPassword("GOOGLE", googleUser.sub())
                        ))
                        .userRole(clientRole)
                        .userAuthProvider(UserAuthProvider.GOOGLE)
                        .externalId(googleUser.sub())
                        .externalAvatarUrl(googleUser.picture())
                        .verified(true) // Google ya verificó el email
                        .profileComplete(false) // Necesita completar perfil en Feeling
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .lastExternalSync(LocalDateTime.now())
                        // Configuración por defecto
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

                // Añadir imagen de Google si existe
                if (googleUser.picture() != null && !googleUser.picture().trim().isEmpty()) {
                    user.setImages(new ArrayList<>(List.of(googleUser.picture())));
                }
            }

            // 4. Guardar usuario
            user = userRepository.save(user);

            // 5. Generar JWT
            String jwtToken = jwtService.generateToken(user);
            revokeAllUserTokens(user);
            saveUserToken(user, jwtToken);

            // 6. Actualizar última actividad
            user.setLastActive(LocalDateTime.now());
            userRepository.save(user);

            logger.info("Usuario autenticado con Google correctamente: {}", googleUser.email());

            return new AuthResponseDTO(
                    user.getMainImage(),
                    user.getEmail(),
                    user.getName(),
                    user.getLastname(),
                    user.getUserRole().getUserRoleList().name(),
                    jwtToken
            );

        } catch (UnauthorizedException e) {
            logger.error("Error de autorización con Google: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado durante autenticación con Google: {}", e.getMessage(), e);
            throw new UnauthorizedException("Error durante la autenticación con Google");
        }
    }

    /**
     * LOGIN
     * Autentica un usuario con email y contraseña
     */
    public AuthResponseDTO login(AuthRequestDTO auth) {
        try {
            // Buscar usuario ANTES de la autenticación para verificar el proveedor
            Optional<User> userOptional = userRepository.findByEmail(auth.email().toLowerCase().trim());
            if (userOptional.isEmpty()) {
                throw new UnauthorizedException("Usuario no encontrado");
            }

            User user = userOptional.get();

            // Verificar que el usuario pueda usar login tradicional
            if (user.getUserAuthProvider() != UserAuthProvider.LOCAL) {
                logger.warn("Intento de login tradicional con cuenta OAuth: {} ({})",
                        auth.email(), user.getUserAuthProvider());
                throw new UnauthorizedException(
                        "Esta cuenta está registrada con " + user.getUserAuthProvider().getDisplayName() +
                                ". " + user.getAuthMethodMessage()
                );
            }

            // Validar credenciales
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            auth.email().toLowerCase().trim(),
                            auth.password()
                    )
            );

            // Verificar que el usuario esté verificado
            if (!user.isVerified()) {
                logger.warn("Intento de login con usuario no verificado: {}", auth.email());
                throw new UnauthorizedException(
                        "Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada."
                );
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
                    user.getMainImage(),
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
     * GENERACIÓN DE CÓDIGO
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
     * CREACIÓN Y ENVÍO DE CÓDIGO
     * Crea y envía un código de verificación para un usuario
     */
    @Transactional
    public void createAndSendVerificationCode(User user) {
        try {
            // 1. ELIMINAR códigos anteriores si existen
            Optional<UserVerificationCode> existingCode = verificationCodeRepository.findByUserId(user.getId());
            if (existingCode.isPresent()) {
                verificationCodeRepository.delete(existingCode.get());
                logger.info("Código de verificación anterior eliminado para usuario: {}", user.getEmail());
            }

            // 2. Crear nuevo código único
            String code;
            int attempts = 0;
            do {
                code = generateVerificationCode();
                attempts++;
                // Evitar bucle infinito
                if (attempts > 10) {
                    throw new RuntimeException("No se pudo generar un código único");
                }
            } while (verificationCodeRepository.findByCode(code).isPresent());

            LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES);

            UserVerificationCode verificationCode = UserVerificationCode.builder()
                    .code(code)
                    .user(user)
                    .expirationTime(expirationTime)
                    .verified(false)
                    .build();

            verificationCodeRepository.save(verificationCode);
            logger.info("Nuevo código de verificación creado para usuario: {}", user.getEmail());

            // 3. Enviar correo con el código
            emailService.sendVerificationEmail(
                    user.getEmail(),
                    user.getName() + " " + user.getLastname(),
                    code
            );

            logger.info("Código de verificación enviado a: {}", user.getEmail());

        } catch (Exception e) {
            logger.error("Error inesperado al crear y enviar código de verificación: {}", e.getMessage(), e);
            throw new RuntimeException("Error al generar código de verificación", e);
        }
    }

    /**
     * VERIFICACIÓN DE CÓDIGO
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

        // NUEVO: Enviar email de bienvenida para usuarios locales
        try {
            emailService.sendWelcomeEmailForLocalUser(
                    user.getEmail(),
                    user.getName() + " " + user.getLastname()
            );
            logger.info("Email de bienvenida enviado a usuario local verificado: {}", user.getEmail());
        } catch (Exception emailError) {
            logger.warn("Error al enviar email de bienvenida a usuario local: {}", emailError.getMessage());
            // No lanzamos excepción aquí porque la verificación ya fue exitosa
        }

        logger.info("Usuario verificado exitosamente: {}", authVerifyCodeDTO.email());
        return new MessageResponseDTO("¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.");
    }

    /**
     * REENVÍO DE CÓDIGO
     * Reenvía un código de verificación al correo del usuario
     */
    @Transactional
    public MessageResponseDTO resendCode(String email) {
        try {
            User user = userRepository.findByEmail(email.toLowerCase().trim())
                    .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

            if (user.isVerified()) {
                logger.info("Intento de reenvío de código para usuario ya verificado: {}", email);
                return new MessageResponseDTO("La cuenta ya está verificada");
            }

            // Verificar límite de tiempo para anti-spam
            Optional<UserVerificationCode> lastCode = verificationCodeRepository.findByUserId(user.getId());
            if (lastCode.isPresent() && !lastCode.get().isVerified()) {
                // Calcular tiempo transcurrido desde el último código
                LocalDateTime lastCodeTime = lastCode.get().getExpirationTime().minusMinutes(EXPIRATION_MINUTES);
                LocalDateTime now = LocalDateTime.now();
                long minutesElapsed = java.time.Duration.between(lastCodeTime, now).toMinutes();

                if (minutesElapsed < 2) {
                    long waitTime = 2 - minutesElapsed;
                    throw new UnauthorizedException(
                            String.format("Debes esperar %d minuto(s) antes de solicitar un nuevo código", waitTime)
                    );
                }
            }

            // Generar y enviar nuevo código
            createAndSendVerificationCode(user);

            logger.info("Código de verificación reenviado a: {}", email);
            return new MessageResponseDTO("Se ha enviado un nuevo código de verificación a tu correo electrónico");

        } catch (NotFoundException | UnauthorizedException e) {
            // Re-lanzar excepciones conocidas
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado al reenviar código: {}", e.getMessage(), e);
            throw new RuntimeException("Error al reenviar código de verificación", e);
        }
    }
    // ==============================
    // GESTIÓN DE TOKENS JWT
    // ==============================

    /**
     * REFRESH TOKEN
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
     * GUARDAR TOKEN
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
     * REVOCAR TODOS LOS TOKENS DE USUARIO
     * Revoca todos los tokens de un usuario
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
     * VALIDACIÓN DE DATOS MÍNIMOS
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
     * VALIDACIÓN DE EMAIL
     * Validación básica de formato de email
     */
    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

    /**
     * VERIFICACIÓN DE USUARIO
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
     * OBTENER USUARIO POR EMAIL
     * Obtiene información básica del usuario por email
     */
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim());
    }
}
