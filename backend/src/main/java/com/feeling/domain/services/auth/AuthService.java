package com.feeling.domain.services.auth;

import com.feeling.domain.dto.auth.*;
import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.services.email.EmailService;
import com.feeling.exception.ExistEmailException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.infrastructure.entities.user.*;
import com.feeling.infrastructure.repositories.user.*;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private static final int CODE_LENGTH = 6;
    private static final int EXPIRATION_MINUTES = 30;

    @Value("${cors.allowed.origins}")
    private String frontendUrl;

    private final IUserTokenRepository tokenRepository;
    private final JwtService jwtService;
    private final IUserRoleRepository roleUserRepository;
    private final AuthenticationManager authenticationManager;
    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final IUserVerificationCodeRepository verificationCodeRepository;
    private final EmailService emailService;
    private final GoogleOAuthService googleOAuthService;
    private final IUserPasswordResetTokenRepository userPasswordResetTokenRepository;

    // ==============================
    // REGISTRO
    // ==============================

    /**
     * REGISTRO DE USUARIO
     * Registra un usuario tradicional (LOCAL)
     */
    @Transactional
    public MessageResponseDTO register(AuthRegisterRequestDTO newUser) {
        try {
            Optional<User> existingUser = userRepository.findByEmail(newUser.email());
            if (existingUser.isPresent()) {
                User user = existingUser.get();

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

            validateMinimumRegistrationData(newUser);

            UserRole clientRole = roleUserRepository.findByUserRoleList(UserRoleList.CLIENT)
                    .orElseGet(() -> {
                        UserRole newRole = new UserRole(UserRoleList.CLIENT);
                        return roleUserRepository.save(newRole);
                    });

            User userEntity = User.builder()
                    .name(newUser.name().trim())
                    .lastName(newUser.lastName().trim())
                    .email(newUser.email().toLowerCase().trim())
                    .password(passwordEncoder.encode(newUser.password()))
                    .userRole(clientRole)
                    .userAuthProvider(UserAuthProvider.LOCAL)
                    .verified(false)
                    .profileComplete(false)
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
    public AuthLoginResponseDTO registerWithGoogle(GoogleTokenRequestDTO request) {
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
                    .lastName(googleUser.getLastName())
                    .email(googleUser.email().toLowerCase().trim())
                    .password(passwordEncoder.encode(
                            googleOAuthService.generateOAuthPassword("GOOGLE", googleUser.sub())
                    ))
                    .userRole(clientRole)
                    .userAuthProvider(UserAuthProvider.GOOGLE)
                    .externalId(googleUser.sub())
                    .externalAvatarUrl(googleUser.picture())
                    .verified(true)
                    .profileComplete(false)
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

            // La imagen de Google ya se estableció en externalAvatarUrl durante el builder
            // No necesitamos agregarla a la lista de images

            newUser = userRepository.save(newUser);

            try {
                emailService.sendWelcomeEmailForGoogleUser(
                        newUser.getEmail(),
                        newUser.getName() + " " + newUser.getLastName(),
                        googleUser.picture()
                );
                logger.info("Email de bienvenida enviado a usuario de Google: {}", newUser.getEmail());
            } catch (Exception emailError) {
                logger.warn("Error al enviar email de bienvenida a usuario de Google: {}", emailError.getMessage());
            }

            // 4. Generar tokens y crear respuesta
            AuthLoginResponseDTO response = generateTokensAndCreateResponse(newUser);

            logger.info("Usuario registrado con Google correctamente: {}", googleUser.email());
            return response;

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
    @Transactional(rollbackFor = Exception.class)
    public AuthLoginResponseDTO loginWithGoogle(GoogleTokenRequestDTO request) {
        try {
            logger.info("Iniciando autenticación con Google");

            // 1. Obtener información del usuario de Google
            GoogleUserInfoDTO googleUser = googleOAuthService.getUserInfo(request.accessToken());

            // 2. Buscar si el usuario ya existe
            Optional<User> existingUser = userRepository.findByEmail(googleUser.email().toLowerCase().trim());

            User user;

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

                // Obtener rol de cliente - usar transacción separada para evitar conflictos
                UserRole clientRole = roleUserRepository.findByUserRoleList(UserRoleList.CLIENT)
                        .orElseGet(() -> {
                            UserRole newRole = new UserRole(UserRoleList.CLIENT);
                            return roleUserRepository.save(newRole);
                        });

                // Crear usuario
                user = User.builder()
                        .name(googleUser.getFirstName())
                        .lastName(googleUser.getLastName())
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

                // La imagen de Google ya se estableció en externalAvatarUrl durante el builder
                // No necesitamos agregarla a la lista de images
            }

            // 4. Guardar usuario
            user = userRepository.save(user);

            // 5. Enviar email de bienvenida (fuera de la transacción crítica)
            if (existingUser.isEmpty()) {
                try {
                    emailService.sendWelcomeEmailForGoogleUser(
                            user.getEmail(),
                            user.getName() + " " + user.getLastName(),
                            googleUser.picture()
                    );
                    logger.info("Email de bienvenida enviado a usuario de Google: {}", user.getEmail());
                } catch (Exception emailError) {
                    logger.warn("Error al enviar email de bienvenida a usuario de Google: {}", emailError.getMessage());
                    // No lanzar excepción - el usuario ya fue creado exitosamente
                }
            }

            // 6. Generar tokens y crear respuesta
            AuthLoginResponseDTO response = generateTokensAndCreateResponse(user);

            logger.info("Usuario autenticado con Google correctamente: {}", googleUser.email());
            return response;

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
    public AuthLoginResponseDTO login(AuthLoginRequestDTO auth) {
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

            // Generar tokens y crear respuesta
            AuthLoginResponseDTO response = generateTokensAndCreateResponse(user);

            logger.info("Usuario autenticado correctamente: {}", auth.email());
            return response;

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
                    user.getName() + " " + user.getLastName(),
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
                    user.getName() + " " + user.getLastName()
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
// RECUPERACIÓN DE CONTRASEÑA
// ==============================

    /**
     * SOLICITAR RECUPERACIÓN DE CONTRASEÑA
     * Genera y envía un token de recuperación por email
     */
    @Transactional
    public MessageResponseDTO forgotPassword(ForgotPasswordRequestDTO request) {
        try {
            // Buscar usuario por email
            User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                    .orElseThrow(() -> new NotFoundException("No encontramos ninguna cuenta asociada a este email"));

            // Verificar que el usuario esté verificado
            if (!user.isVerified()) {
                throw new UnauthorizedException("Debes verificar tu correo electrónico antes de recuperar tu contraseña");
            }

            // Verificar que sea usuario LOCAL (no OAuth)
            if (user.getUserAuthProvider() != UserAuthProvider.LOCAL) {
                String message = switch (user.getUserAuthProvider()) {
                    case GOOGLE ->
                            "Esta cuenta está registrada con Google. Usa 'Iniciar Sesión con Google' en su lugar.";
                    case FACEBOOK ->
                            "Esta cuenta está registrada con Facebook. Usa 'Iniciar Sesión con Facebook' en su lugar.";
                    default -> "Esta cuenta usa un método de autenticación externo.";
                };
                throw new UnauthorizedException(message);
            }

            // Generar token único
            String resetToken = generatePasswordResetToken();
            LocalDateTime expirationTime = LocalDateTime.now().plusHours(1); // 1 hora de validez

            // Eliminar tokens anteriores si existen
            userPasswordResetTokenRepository.deleteByUserId(user.getId());

            // Crear nuevo token de recuperación
            UserPasswordResetToken passwordResetToken = UserPasswordResetToken.builder()
                    .token(resetToken)
                    .user(user)
                    .expirationTime(expirationTime)
                    .used(false)
                    .build();

            userPasswordResetTokenRepository.save(passwordResetToken);

            // Enviar email con el enlace de recuperación
            String resetLink = frontendUrl + "/reset-password/" + resetToken;
            emailService.sendPasswordResetEmail(
                    user.getEmail(),
                    user.getName() + " " + user.getLastName(),
                    resetLink,
                    60 // minutos de validez
            );

            logger.info("Token de recuperación creado y enviado para: {}", request.email());
            return new MessageResponseDTO(
                    "Hemos enviado un enlace de recuperación a tu correo electrónico. " +
                            "Revisa tu bandeja de entrada y spam. El enlace expira en 1 hora."
            );

        } catch (NotFoundException | UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado en recuperación de contraseña: {}", e.getMessage(), e);
            throw new RuntimeException("Error al procesar la solicitud de recuperación de contraseña");
        }
    }

    /**
     * RESTABLECER CONTRASEÑA
     * Restablece la contraseña usando un token válido
     */
    @Transactional
    public MessageResponseDTO resetPassword(ResetPasswordRequestDTO request) {
        try {
            // Validar que las contraseñas coincidan
            if (!request.passwordsMatch()) {
                throw new IllegalArgumentException("Las contraseñas no coinciden");
            }

            // Buscar y validar token
            UserPasswordResetToken resetToken = userPasswordResetTokenRepository.findByToken(request.token())
                    .orElseThrow(() -> new UnauthorizedException("Token de recuperación inválido"));

            // Verificar expiración
            if (resetToken.getExpirationTime().isBefore(LocalDateTime.now())) {
                throw new UnauthorizedException("El token de recuperación ha expirado. Solicita uno nuevo.");
            }

            // Verificar que no se haya usado
            if (resetToken.isUsed()) {
                throw new UnauthorizedException("Este token de recuperación ya ha sido utilizado");
            }

            User user = resetToken.getUser();

            // Verificar que el usuario siga siendo LOCAL
            if (user.getUserAuthProvider() != UserAuthProvider.LOCAL) {
                throw new UnauthorizedException("No puedes cambiar la contraseña de una cuenta OAuth");
            }

            // Actualizar contraseña
            user.setPassword(passwordEncoder.encode(request.password()));
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            // Marcar token como usado
            resetToken.setUsed(true);
            userPasswordResetTokenRepository.save(resetToken);

            // Revocar todas las sesiones activas por seguridad
            revokeAllUserTokens(user);

            // Enviar email de confirmación
            try {
                emailService.sendPasswordChangeConfirmationEmail(
                        user.getEmail(),
                        user.getName() + " " + user.getLastName()
                );
            } catch (Exception emailError) {
                logger.warn("Error al enviar email de confirmación de cambio de contraseña: {}", emailError.getMessage());
            }

            logger.info("Contraseña restablecida exitosamente para usuario: {}", user.getEmail());
            return new MessageResponseDTO(
                    "Tu contraseña ha sido restablecida exitosamente. " +
                            "Ya puedes iniciar sesión con tu nueva contraseña."
            );

        } catch (IllegalArgumentException | UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado al restablecer contraseña: {}", e.getMessage(), e);
            throw new RuntimeException("Error al restablecer la contraseña");
        }
    }

    /**
     * VALIDAR TOKEN DE RECUPERACIÓN
     * Verifica si un token de recuperación es válido
     */
    public TokenValidationDTO validateResetToken(String token) {
        try {
            Optional<UserPasswordResetToken> resetTokenOpt = userPasswordResetTokenRepository.findByToken(token);

            if (resetTokenOpt.isEmpty()) {
                return new TokenValidationDTO(
                        false,
                        null,
                        "Token de recuperación inválido",
                        null
                );
            }

            UserPasswordResetToken resetToken = resetTokenOpt.get();

            // Verificar si ya fue usado
            if (resetToken.isUsed()) {
                return new TokenValidationDTO(
                        false,
                        resetToken.getUser().getEmail(),
                        "Este token ya ha sido utilizado",
                        null
                );
            }

            // Verificar expiración
            LocalDateTime now = LocalDateTime.now();
            if (resetToken.getExpirationTime().isBefore(now)) {
                return new TokenValidationDTO(
                        false,
                        resetToken.getUser().getEmail(),
                        "El token ha expirado",
                        null
                );
            }

            // Calcular tiempo restante
            long minutesRemaining = java.time.Duration.between(now, resetToken.getExpirationTime()).toMinutes();

            return new TokenValidationDTO(
                    true,
                    resetToken.getUser().getEmail(),
                    "Token válido",
                    minutesRemaining
            );

        } catch (Exception e) {
            logger.error("Error validando token de recuperación: {}", e.getMessage(), e);
            throw new RuntimeException("Error al validar token de recuperación");
        }
    }


    // ==============================
    // GESTIÓN DE TOKENS JWT
    // ==============================

    /**
     * REFRESH TOKEN
     * Refresca un access token usando un refresh token válido
     */
    public RefreshTokenResponseDTO refreshToken(final RefreshTokenRequestDTO request) throws BadRequestException {
        final String refreshToken = request.refreshToken();

        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            logger.error("Intento de refresh con token vacío");
            throw new BadRequestException("Refresh token requerido");
        }

        // Verificar que es un REFRESH token
        if (!jwtService.isRefreshToken(refreshToken)) {
            logger.error("Token no es de tipo REFRESH");
            throw new BadRequestException("Token inválido - se requiere refresh token");
        }

        final String userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail == null) {
            logger.error("No se pudo extraer email del refresh token");
            throw new BadRequestException("Refresh token inválido");
        }

        final Optional<User> userOptional = userRepository.findByEmail(userEmail);
        if (userOptional.isEmpty()) {
            logger.error("Usuario no encontrado durante refresh: {}", userEmail);
            throw new BadRequestException("Usuario no encontrado");
        }

        User user = userOptional.get();

        // Verificar que el refresh token es válido
        if (!jwtService.isTokenValid(refreshToken, user)) {
            logger.error("Refresh token inválido para usuario: {}", userEmail);
            throw new BadRequestException("Refresh token inválido");
        }

        // Verificar que el refresh token existe en BD y no está revocado
        Optional<UserToken> storedToken = tokenRepository.findByToken(refreshToken);
        if (storedToken.isEmpty() || storedToken.get().isRevoked() || storedToken.get().isExpired()) {
            logger.error("Refresh token revocado o no encontrado en BD: {}", userEmail);
            throw new BadRequestException("Refresh token inválido");
        }

        // Generar nuevo ACCESS token (mantener el refresh token)
        final String newAccessToken = jwtService.generateToken(user);

        // Revocar todos los access tokens anteriores (pero mantener refresh tokens)
        revokeAllAccessTokens(user);

        // Guardar el nuevo access token
        saveUserToken(user, newAccessToken, UserToken.TokenType.ACCESS);

        logger.info("Access token refrescado correctamente para: {}", userEmail);
        return new RefreshTokenResponseDTO(newAccessToken, "Token refrescado exitosamente");
    }

    /**
     * GENERAR TOKEN DE RECUPERACIÓN
     * Genera un token único para recuperación de contraseña
     */
    private String generatePasswordResetToken() {
        return UUID.randomUUID().toString().replace("-", "") +
                System.currentTimeMillis();
    }

    // ==============================
    // MÉTODOS PRIVADOS OPTIMIZADOS
    // ==============================

    /**
     * GENERAR TOKENS Y CREAR RESPUESTA
     * Método unificado para generar tokens y crear respuesta de login
     */
    @Transactional
    AuthLoginResponseDTO generateTokensAndCreateResponse(User user) {
        try {
            logger.debug("Generando tokens para usuario: {}", user.getEmail());

            // Validar que el usuario tenga rol asignado
            if (user.getUserRole() == null) {
                throw new IllegalStateException("Usuario no tiene rol asignado");
            }

            // Generar tokens
            String accessToken = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            logger.debug("Tokens generados, revocando tokens anteriores para usuario: {}", user.getEmail());

            // Revocar todos los tokens anteriores y guardar los nuevos
            revokeAllUserTokens(user);

            logger.debug("Guardando nuevos tokens para usuario: {}", user.getEmail());
            saveUserToken(user, accessToken, UserToken.TokenType.ACCESS);
            saveUserToken(user, refreshToken, UserToken.TokenType.REFRESH);

            // Actualizar última actividad
            updateUserLastActive(user);

            logger.debug("Tokens y usuario guardados exitosamente para: {}", user.getEmail());

            // Crear y retornar respuesta
            return new AuthLoginResponseDTO(
                    user.getId(),
                    user.getName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getUserRole().getUserRoleList().name(),
                    accessToken,
                    refreshToken,
                    user.isVerified(),
                    user.isProfileComplete(),
                    user.getDateOfBirth(),
                    user.getAge(),
                    user.getDocument(),
                    user.getPhone(),
                    user.getCity(),
                    user.getDepartment(),
                    user.getCountry(),
                    user.getDescription(),
                    user.getImages(),
                    user.getMainImage(),
                    user.getUserCategoryInterest() != null ?
                            user.getUserCategoryInterest().getCategoryInterestEnum().name() : null,
                    user.getCreatedAt(),
                    user.getLastActive(),
                    user.getAvailableAttempts(),
                    user.getProfileViews(),
                    user.getLikesReceived(),
                    user.getMatchesCount(),
                    user.getTagNames()
            );
        } catch (Exception e) {
            logger.error("Error al generar tokens para usuario {}: {}", user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Error al generar tokens de autenticación: " + e.getMessage(), e);
        }
    }

    /**
     * GUARDAR TOKEN ACTUALIZADO
     * Guarda un token con su tipo específico
     */
    private void saveUserToken(User user, String token, UserToken.TokenType tokenType) {
        try {
            UserToken userToken = UserToken.builder()
                    .token(token)
                    .user(user)
                    .type(tokenType)
                    .expired(false)
                    .revoked(false)
                    .build();

            tokenRepository.save(userToken);
            logger.debug("Token {} guardado exitosamente para usuario: {}", tokenType, user.getEmail());
        } catch (Exception e) {
            logger.error("Error al guardar token {} para usuario {}: {}", tokenType, user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Error al guardar token " + tokenType + ": " + e.getMessage(), e);
        }
    }

    /**
     * REVOCAR SOLO ACCESS TOKENS
     * Revoca solo los access tokens, mantiene los refresh tokens
     */
    private void revokeAllAccessTokens(User user) {
        final List<UserToken> validAccessTokens = tokenRepository
                .findAllValidAccessTokensByUserId(user.getId());

        if (!validAccessTokens.isEmpty()) {
            validAccessTokens.forEach(token -> {
                token.setExpired(true);
                token.setRevoked(true);
            });
            tokenRepository.saveAll(validAccessTokens);
        }
    }

    /**
     * REVOCAR TODOS LOS TOKENS
     * Revoca tanto access como refresh tokens (para logout completo)
     */
    private void revokeAllUserTokens(User user) {
        try {
            final List<UserToken> validUserTokens = tokenRepository
                    .findAllValidTokensByUserId(user.getId());

            if (!validUserTokens.isEmpty()) {
                logger.debug("Revocando {} tokens existentes para usuario: {}", validUserTokens.size(), user.getEmail());
                validUserTokens.forEach(token -> {
                    token.setExpired(true);
                    token.setRevoked(true);
                });
                tokenRepository.saveAll(validUserTokens);
                logger.debug("Tokens revocados exitosamente para usuario: {}", user.getEmail());
            } else {
                logger.debug("No hay tokens válidos para revocar para usuario: {}", user.getEmail());
            }
        } catch (Exception e) {
            logger.error("Error al revocar tokens para usuario {}: {}", user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Error al revocar tokens existentes: " + e.getMessage(), e);
        }
    }

    // ==============================
    // MÉTODOS DE UTILIDAD
    // ==============================

    /**
     * VALIDACIÓN DE DATOS MÍNIMOS
     * Valida que los datos mínimos de registro estén presentes
     */
    private void validateMinimumRegistrationData(AuthRegisterRequestDTO userData) {
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

    /**
     * ACTUALIZAR ÚLTIMA ACTIVIDAD
     * Actualiza solo el campo lastActive sin activar validaciones
     */
    @Transactional
    void updateUserLastActive(User user) {
        try {
            LocalDateTime now = LocalDateTime.now();
            int updated = userRepository.updateLastActive(user.getId(), now, now);
            if (updated > 0) {
                user.setLastActive(now);
                user.setUpdatedAt(now);
                logger.debug("Última actividad actualizada para usuario: {}", user.getEmail());
            }
        } catch (Exception e) {
            logger.warn("Error al actualizar última actividad para usuario {}: {}", user.getEmail(), e.getMessage());
            // No lanzar excepción - esto es opcional y no debe afectar el login
        }
    }
}