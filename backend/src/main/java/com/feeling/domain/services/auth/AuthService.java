package com.feeling.domain.services.auth;

import com.feeling.application.controllers.auth.PasswordController;
import com.feeling.domain.dto.auth.*;
import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.UserDTOMapper;
import com.feeling.domain.dto.user.UserPrivacyDTO;
import com.feeling.domain.dto.user.UserNotificationDTO;
import com.feeling.domain.dto.user.UserMetricsDTO;
import com.feeling.domain.dto.user.UserAuthDTO;
import com.feeling.domain.dto.user.UserAccountStatusDTO;
import com.feeling.domain.services.email.EmailService;
import com.feeling.exception.EmailNotVerifiedException;
import com.feeling.exception.ExistEmailException;
import com.feeling.exception.NotFoundException;
import com.feeling.exception.TooManyRequestsException;
import com.feeling.exception.UnauthorizedException;
import com.feeling.infrastructure.entities.user.*;
import com.feeling.infrastructure.logging.StructuredLoggerFactory;
import com.feeling.infrastructure.repositories.user.*;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
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
    private static final StructuredLoggerFactory.StructuredLogger logger =
            StructuredLoggerFactory.create(AuthService.class);
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

                // Si el usuario existe pero NO está verificado, dar mensaje específico
                if (!user.isVerified()) {
                    String unverifiedMessage = "Cuenta no verificada. Revisa tu email o solicita un nuevo código de verificación.";
                    
                    logger.logAuth("register", newUser.email(), "failed - email exists but not verified");
                    throw new EmailNotVerifiedException(unverifiedMessage);
                }

                // Si el usuario existe Y está verificado, dar mensaje según el proveedor
                String conflictMessage = switch (user.getUserAuthProvider()) {
                    case GOOGLE -> "Esta cuenta ya está registrada con Google. " +
                            "Ve a 'Iniciar Sesión' y usa el botón 'Continuar con Google'.";
                    case FACEBOOK -> "Esta cuenta ya está registrada con Facebook. " +
                            "Ve a 'Iniciar Sesión' y usa el botón 'Continuar con Facebook'.";
                    case LOCAL -> "El correo electrónico ya está registrado y verificado. " +
                            "Ve a 'Iniciar Sesión' si ya tienes una cuenta.";
                    default -> "El correo electrónico ya está registrado con otro método.";
                };

                logger.logAuth("register", newUser.email(), "failed - email already exists with provider: " + user.getUserAuthProvider());
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

            logger.logAuth("register", newUser.email(), "success - LOCAL registration");
            return new MessageResponseDTO("Usuario registrado exitosamente. Por favor, verifica tu correo electrónico para activar tu cuenta.");

        } catch (ExistEmailException | EmailNotVerifiedException e) {
            logger.error("Error al registrar usuario: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado al registrar usuario", e);
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
                
                // Si el usuario existe pero NO está verificado (solo para LOCAL), dar mensaje específico
                if (!user.isVerified() && user.getUserAuthProvider() == UserAuthProvider.LOCAL) {
                    String unverifiedMessage = "Cuenta no verificada. Revisa tu email o solicita un nuevo código de verificación.";
                    
                    logger.logAuth("google_register", googleUser.email(), "failed - email exists but not verified");
                    throw new EmailNotVerifiedException(unverifiedMessage);
                }
                
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
            logger.logAuth("google_register", googleUser.email(), "creating new user");

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

            // Enviar email de bienvenida solo si el usuario está aprobado
            if (newUser.isApproved()) {
                try {
                    emailService.sendWelcomeEmailForGoogleUser(
                            newUser.getEmail(),
                            newUser.getName() + " " + newUser.getLastName(),
                            googleUser.picture()
                    );
                    logger.logUserOperation("welcome_email_sent", newUser.getEmail(), Map.of("provider", "GOOGLE"));
                } catch (Exception emailError) {
                    logger.warn("Error al enviar email de bienvenida", Map.of("userEmail", newUser.getEmail(), "provider", "GOOGLE", "error", emailError.getMessage()));
                }
            } else {
                logger.logUserOperation("user_registered_pending_approval", newUser.getEmail(), Map.of("provider", "GOOGLE"));
            }

            // 4. Generar tokens y crear respuesta
            AuthLoginResponseDTO response = generateTokensAndCreateResponse(newUser);

            logger.logAuth("google_register", googleUser.email(), "success");
            return response;

        } catch (ExistEmailException | EmailNotVerifiedException e) {
            logger.logAuth("google_register", "unknown", "failed - email already exists: " + e.getMessage());
            throw e;
        } catch (UnauthorizedException e) {
            logger.error("Error de autorización con Google en registro: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado durante registro con Google", e);
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
                    logger.logAuth("google_login", googleUser.email(), "existing local user switching to google");

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
                logger.logAuth("google_login", googleUser.email(), "creating new user");

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

            // 5. Enviar email de bienvenida solo si el usuario está aprobado (fuera de la transacción crítica)
            if (existingUser.isEmpty() && user.isApproved()) {
                try {
                    emailService.sendWelcomeEmailForGoogleUser(
                            user.getEmail(),
                            user.getName() + " " + user.getLastName(),
                            googleUser.picture()
                    );
                    logger.logUserOperation("welcome_email_sent", user.getEmail(), Map.of("provider", "GOOGLE"));
                } catch (Exception emailError) {
                    logger.warn("Error al enviar email de bienvenida", Map.of("userEmail", user.getEmail(), "provider", "GOOGLE", "error", emailError.getMessage()));
                    // No lanzar excepción - el usuario ya fue creado exitosamente
                }
            } else if (existingUser.isEmpty() && !user.isApproved()) {
                logger.logUserOperation("user_created_pending_approval", user.getEmail(), Map.of("provider", "GOOGLE"));
            }

            // 6. Generar tokens y crear respuesta
            AuthLoginResponseDTO response = generateTokensAndCreateResponse(user);

            logger.logAuth("google_login", googleUser.email(), "success");
            return response;

        } catch (UnauthorizedException e) {
            logger.error("Error de autorización con Google: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado durante autenticación con Google", e);
            throw new UnauthorizedException("Error durante la autenticación con Google");
        }
    }

    /**
     * LOGIN
     * Autentica un usuario con email y contraseña
     */
    @Transactional
    public AuthLoginResponseDTO login(AuthLoginRequestDTO auth) {
        try {
            // Buscar usuario ANTES de la autenticación para verificar el proveedor
            String normalizedEmail = auth.email().toLowerCase().trim();
            logger.info("Debug login", Map.of(
                "originalEmail", auth.email(),
                "normalizedEmail", normalizedEmail,
                "category", "LOGIN_DEBUG"
            ));
            
            Optional<User> userOptional = userRepository.findByEmail(normalizedEmail);
            if (userOptional.isEmpty()) {
                logger.warn("Usuario no encontrado", Map.of(
                    "normalizedEmail", normalizedEmail,
                    "category", "LOGIN_ERROR"
                ));
                throw new UnauthorizedException("Usuario no encontrado");
            }

            User user = userOptional.get();

            // Verificar que el usuario pueda usar login tradicional
            if (user.getUserAuthProvider() != UserAuthProvider.LOCAL) {
                logger.warn("Intento de login tradicional con cuenta OAuth", Map.of(
                        "email", auth.email(),
                        "provider", user.getUserAuthProvider()));
                throw new UnauthorizedException(
                        "Esta cuenta está registrada con " + user.getUserAuthProvider().getDisplayName() +
                                ". " + user.getAuthMethodMessage()
                );
            }

            // Validar credenciales
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            normalizedEmail,
                            auth.password()
                    )
            );

            // Verificar que el usuario esté verificado
            if (!user.isVerified()) {
                logger.logAuth("login", auth.email(), "failed - user not verified");
                throw new UnauthorizedException(
                        "Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada."
                );
            }

            // Verificar estado de aprobación (informativo, no bloquea login)
            if (!user.isApproved()) {
                logger.logAuth("login", auth.email(), "success - user not approved");
                // Nota: No bloqueamos el login, solo informamos
            }

            // Cargar usuario con todas las colecciones necesarias para evitar LazyInitializationException
            User userWithCollections = userRepository.findByEmail(normalizedEmail).orElseThrow();
            
            // Inicializar collections necesarias para el DTO
            userWithCollections.getImages().size(); // Force lazy loading
            if (userWithCollections.getTags() != null) {
                userWithCollections.getTags().size(); // Force lazy loading
            }
            
            // Generar tokens y crear respuesta
            AuthLoginResponseDTO response = generateTokensAndCreateResponse(userWithCollections);

            logger.logAuth("login", auth.email(), "success");
            return response;

        } catch (BadCredentialsException e) {
            logger.logAuth("login", auth.email(), "failed - bad credentials");
            throw new UnauthorizedException("Email o contraseña incorrectos");
        } catch (UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado durante autenticación", e);
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
                logger.logUserOperation("verification_code_cleanup", user.getEmail(), Map.of("action", "removed_old_code"));
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
            logger.logUserOperation("verification_code_created", user.getEmail(), Map.of("code_length", CODE_LENGTH));

            // 3. Enviar correo con el código
            emailService.sendVerificationEmail(
                    user.getEmail(),
                    user.getName() + " " + user.getLastName(),
                    code
            );

            logger.logUserOperation("verification_code_sent", user.getEmail(), null);

        } catch (Exception e) {
            logger.error("Error inesperado al crear y enviar código de verificación", e);
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
            logger.logSecurityEvent("verification_attempt", authVerifyCodeDTO.email(), "code does not belong to user");
            throw new UnauthorizedException("Código de verificación inválido");
        }

        // Verificar si ya está verificado
        if (verificationCode.isVerified()) {
            logger.logSecurityEvent("verification_attempt", authVerifyCodeDTO.email(), "code already used");
            return new MessageResponseDTO("La cuenta ya está verificada");
        }

        // Verificar expiración
        if (verificationCode.getExpirationTime().isBefore(LocalDateTime.now())) {
            logger.logAuth("verify_email", authVerifyCodeDTO.email(), "failed - code expired");
            throw new UnauthorizedException("El código ha expirado. Solicita un nuevo código.");
        }

        // Marcar código como verificado
        verificationCode.setVerified(true);
        verificationCodeRepository.save(verificationCode);

        // Activar usuario
        user.setVerified(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Enviar email de bienvenida para usuarios locales solo si están aprobados
        if (user.isApproved()) {
            try {
                emailService.sendWelcomeEmailForLocalUser(
                        user.getEmail(),
                        user.getName() + " " + user.getLastName()
                );
                logger.logUserOperation("welcome_email_sent", user.getEmail(), Map.of("provider", "LOCAL"));
            } catch (Exception emailError) {
                logger.warn("Error al enviar email de bienvenida", Map.of("userEmail", user.getEmail(), "provider", "LOCAL", "error", emailError.getMessage()));
                // No lanzamos excepción aquí porque la verificación ya fue exitosa
            }
        } else {
            logger.logUserOperation("user_verified_pending_approval", user.getEmail(), Map.of("provider", "LOCAL"));
        }

        logger.logAuth("verify_email", authVerifyCodeDTO.email(), "success");
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
                logger.logUserOperation("resend_code_attempt", email, Map.of("status", "already_verified"));
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
                    throw new TooManyRequestsException(
                            String.format("Debes esperar %d minuto(s) antes de solicitar un nuevo código", waitTime)
                    );
                }
            }

            // Generar y enviar nuevo código
            createAndSendVerificationCode(user);

            logger.logUserOperation("verification_code_resent", email, null);
            return new MessageResponseDTO("Se ha enviado un nuevo código de verificación a tu correo electrónico");

        } catch (NotFoundException | TooManyRequestsException e) {
            // Re-lanzar excepciones conocidas
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado al reenviar código", e);
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

            logger.logUserOperation("password_reset_token_sent", request.email(), null);
            return new MessageResponseDTO(
                    "Hemos enviado un enlace de recuperación a tu correo electrónico. " +
                            "Revisa tu bandeja de entrada y spam. El enlace expira en 1 hora."
            );

        } catch (NotFoundException | UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado en recuperación de contraseña", e);
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
                logger.warn("Error al enviar email de confirmación", Map.of("error", emailError.getMessage()));
            }

            logger.logUserOperation("password_reset_complete", user.getEmail(), null);
            return new MessageResponseDTO(
                    "Tu contraseña ha sido restablecida exitosamente. " +
                            "Ya puedes iniciar sesión con tu nueva contraseña."
            );

        } catch (IllegalArgumentException | UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado al restablecer contraseña", e);
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
            logger.error("Error validando token de recuperación", e);
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
            logger.error("Usuario no encontrado durante refresh: " + userEmail);
            throw new BadRequestException("Usuario no encontrado");
        }

        User user = userOptional.get();

        // Verificar que el refresh token es válido
        if (!jwtService.isTokenValid(refreshToken, user)) {
            logger.error("Refresh token inválido para usuario: " + userEmail);
            throw new BadRequestException("Refresh token inválido");
        }

        // Verificar que el refresh token existe en BD y no está revocado
        Optional<UserToken> storedToken = tokenRepository.findByToken(refreshToken);
        if (storedToken.isEmpty() || storedToken.get().isRevoked() || storedToken.get().isExpired()) {
            logger.error("Refresh token revocado o no encontrado en BD: " + userEmail);
            throw new BadRequestException("Refresh token inválido");
        }

        // Generar nuevo ACCESS token (mantener el refresh token)
        final String newAccessToken = jwtService.generateToken(user);

        // Revocar todos los access tokens anteriores (pero mantener refresh tokens)
        revokeAllAccessTokens(user);

        // Guardar el nuevo access token
        saveUserToken(user, newAccessToken, UserToken.TokenType.ACCESS);

        logger.logAuth("refresh_token", userEmail, "success");
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
            logger.logUserOperation("token_generation", user.getEmail(), null);

            // Validar que el usuario tenga rol asignado
            if (user.getUserRole() == null) {
                throw new IllegalStateException("Usuario no tiene rol asignado");
            }

            // Generar tokens
            String accessToken = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            logger.logUserOperation("token_revocation", user.getEmail(), Map.of("action", "revoking_previous_tokens"));

            // Revocar todos los tokens anteriores y guardar los nuevos
            revokeAllUserTokens(user);

            logger.logUserOperation("token_save", user.getEmail(), null);
            saveUserToken(user, accessToken, UserToken.TokenType.ACCESS);
            saveUserToken(user, refreshToken, UserToken.TokenType.REFRESH);

            // Actualizar última actividad
            updateUserLastActive(user);

            logger.logUserOperation("tokens_saved_complete", user.getEmail(), null);

            // Crear y retornar respuesta usando el mapper con estructura completa
            UserStatusDTO status = UserDTOMapper.toUserStatusDTO(user);
            UserProfileDataDTO profile = UserDTOMapper.toUserProfileDataDTO(user);
            
            UserPrivacyDTO privacy = new UserPrivacyDTO(
                    user.isPublicAccount(),
                    user.isSearchVisibility(),
                    user.isLocationPublic(),
                    user.isShowAge(),
                    user.isShowLocation(),
                    user.isShowPhone(),
                    user.isShowMeInSearch()
            );
            
            UserNotificationDTO notifications = new UserNotificationDTO(
                    user.isNotificationsEmailEnabled(),
                    user.isNotificationsPhoneEnabled(),
                    user.isNotificationsMatchesEnabled(),
                    user.isNotificationsEventsEnabled(),
                    user.isNotificationsLoginEnabled(),
                    user.isNotificationsPaymentsEnabled()
            );
            
            UserMetricsDTO metrics = new UserMetricsDTO(
                    user.getProfileViews(),
                    user.getLikesReceived(),
                    user.getMatchesCount(),
                    user.getPopularityScore()
            );
            
            UserAuthDTO auth = new UserAuthDTO(
                    user.getUserAuthProvider(),
                    user.getExternalId(),
                    user.getExternalAvatarUrl(),
                    user.getLastExternalSync()
            );
            
            UserAccountStatusDTO account = new UserAccountStatusDTO(
                    user.isAccountDeactivated(),
                    user.getDeactivationDate(),
                    user.getDeactivationReason()
            );

            return new AuthLoginResponseDTO(
                    accessToken,
                    refreshToken,
                    status,
                    profile,
                    privacy,
                    notifications,
                    metrics,
                    auth,
                    account
            );
        } catch (Exception e) {
            logger.error("Error al generar tokens", Map.of("userEmail", user.getEmail()), e);
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
            logger.logUserOperation("token_saved", user.getEmail(), Map.of("tokenType", tokenType.toString()));
        } catch (Exception e) {
            logger.error("Error al guardar token", Map.of("tokenType", tokenType.toString(), "userEmail", user.getEmail()), e);
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
                logger.logUserOperation("tokens_revoked", user.getEmail(), Map.of("count", validUserTokens.size()));
                validUserTokens.forEach(token -> {
                    token.setExpired(true);
                    token.setRevoked(true);
                });
                tokenRepository.saveAll(validUserTokens);
                logger.logUserOperation("tokens_revoked_success", user.getEmail(), null);
            } else {
                logger.logUserOperation("no_tokens_to_revoke", user.getEmail(), null);
            }
        } catch (Exception e) {
            logger.error("Error al revocar tokens", Map.of("userEmail", user.getEmail()), e);
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
                logger.logUserOperation("last_activity_updated", user.getEmail(), null);
            }
        } catch (Exception e) {
            logger.warn("Error al actualizar última actividad", Map.of("userEmail", user.getEmail(), "error", e.getMessage()));
            // No lanzar excepción - esto es opcional y no debe afectar el login
        }
    }

    // ==============================
    // MÉTODOS FALTANTES PARA CONTROLADORES
    // ==============================

    /**
     * Valida si un token de recuperación de contraseña es válido
     */
    public boolean isPasswordResetTokenValid(String token) {
        try {
            Optional<UserPasswordResetToken> resetToken = userPasswordResetTokenRepository.findByToken(token);

            if (resetToken.isEmpty()) {
                return false;
            }

            UserPasswordResetToken passwordResetToken = resetToken.get();
            LocalDateTime now = LocalDateTime.now();

            return passwordResetToken.getExpirationTime().isAfter(now);
        } catch (Exception e) {
            logger.error("Error validando token de recuperación", e);
            return false;
        }
    }

    /**
     * Cambia la contraseña de un usuario autenticado
     */
    public MessageResponseDTO changePassword(PasswordController.ChangePasswordRequestDTO request, String authHeader) {
        try {
            String userEmail = jwtService.extractUsername(authHeader.replace("Bearer ", ""));
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

            // Verificar contraseña actual
            if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
                logger.logAuth("change_password", userEmail, "failed - incorrect current password");
                throw new UnauthorizedException("La contraseña actual es incorrecta");
            }

            // Cambiar contraseña
            user.setPassword(passwordEncoder.encode(request.newPassword()));
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            logger.logAuth("change_password", userEmail, "success");
            return new MessageResponseDTO("Contraseña cambiada exitosamente");
        } catch (NotFoundException | UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error al cambiar contraseña", e);
            throw new RuntimeException("Error inesperado al cambiar contraseña");
        }
    }

    /**
     * Verifica el email usando el código de verificación
     */
    public MessageResponseDTO verifyEmail(AuthVerifyCodeDTO verifyCodeDTO) {
        return verifyCode(verifyCodeDTO);
    }

    /**
     * Reenvía el código de verificación
     */
    public MessageResponseDTO resendVerificationCode(AuthResendCodeRequestDTO resendCodeDTO) {
        return resendCode(resendCodeDTO.email());
    }

    /**
     * Verifica la disponibilidad de un email
     */
    public EmailAvailabilityDTO checkEmailAvailability(String email) {
        try {
            Optional<User> existingUser = userRepository.findByEmail(email.toLowerCase().trim());

            if (existingUser.isEmpty()) {
                return new EmailAvailabilityDTO(email, true, null, "Email disponible", List.of("LOCAL", "GOOGLE"), "Puedes registrarte con este email");
            }

            User user = existingUser.get();
            String conflictMessage = switch (user.getUserAuthProvider()) {
                case GOOGLE -> "Este email ya está registrado con Google";
                case FACEBOOK -> "Este email ya está registrado con Facebook";
                case LOCAL -> "Este email ya está registrado";
                default -> "Este email ya está registrado con otro método";
            };

            return new EmailAvailabilityDTO(email, false, user.getUserAuthProvider().toString(), conflictMessage, List.of(), "Ve a 'Iniciar Sesión' para usar este email");
        } catch (Exception e) {
            logger.error("Error al verificar disponibilidad de email", e);
            return new EmailAvailabilityDTO(email, false, null, "Error al verificar email", List.of(), "Intenta nuevamente");
        }
    }

    /**
     * Obtiene el estado de verificación de un usuario
     */
    public AuthUserStatusDTO getUserVerificationStatus(String email) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase().trim());

            if (userOpt.isEmpty()) {
                return new AuthUserStatusDTO(email, false, false, false);
            }

            User user = userOpt.get();
            return new AuthUserStatusDTO(
                    email,
                    true,
                    user.isVerified(),
                    user.isProfileComplete()
            );
        } catch (Exception e) {
            logger.error("Error al obtener estado de verificación", e);
            return new AuthUserStatusDTO(email, false, false, false);
        }
    }

    /**
     * Valida si un código de verificación es válido para un email
     */
    public boolean isVerificationCodeValid(String email, String code) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase().trim());
            if (userOpt.isEmpty()) {
                return false;
            }

            User user = userOpt.get();
            Optional<UserVerificationCode> verificationCodeOpt =
                    verificationCodeRepository.findByUserAndCode(user, code);

            if (verificationCodeOpt.isEmpty()) {
                return false;
            }

            UserVerificationCode verificationCode = verificationCodeOpt.get();
            LocalDateTime now = LocalDateTime.now();

            return !verificationCode.isVerified() && verificationCode.getExpirationTime().isAfter(now);
        } catch (Exception e) {
            logger.error("Error validando código de verificación", e);
            return false;
        }
    }

    /**
     * Limpia códigos de verificación expirados
     */
    public int cleanupExpiredVerificationCodes() {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<UserVerificationCode> expiredCodes = verificationCodeRepository.findByExpirationTimeBefore(now);

            if (!expiredCodes.isEmpty()) {
                verificationCodeRepository.deleteAll(expiredCodes);
                logger.logUserOperation("cleanup_expired_codes", "system", Map.of("count", expiredCodes.size()));
            }

            return expiredCodes.size();
        } catch (Exception e) {
            logger.error("Error limpiando códigos expirados", e);
            return 0;
        }
    }

    /**
     * Extrae el email de un token JWT
     */
    public String extractEmailFromToken(String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            return jwtService.extractUsername(token);
        } catch (Exception e) {
            logger.error("Error extrayendo email del token", e);
            throw new UnauthorizedException("Token inválido");
        }
    }

    /**
     * Realiza el logout revocando tokens
     */
    public MessageResponseDTO logout(String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userEmail = jwtService.extractUsername(token);

            // Buscar el token en la base de datos
            Optional<UserToken> userTokenOpt = tokenRepository.findByToken(token);
            if (userTokenOpt.isPresent()) {
                UserToken userToken = userTokenOpt.get();
                userToken.setRevoked(true);
                userToken.setExpired(true);
                tokenRepository.save(userToken);
            }

            logger.logAuth("logout", userEmail, "success");
            return new MessageResponseDTO("Logout exitoso");
        } catch (Exception e) {
            logger.error("Error en logout", e);
            throw new RuntimeException("Error al realizar logout");
        }
    }

    /**
     * Valida un token JWT
     */
    public TokenValidationDTO validateToken(String token) {
        try {
            String userEmail = jwtService.extractUsername(token);
            Optional<User> userOpt = userRepository.findByEmail(userEmail);

            if (userOpt.isEmpty()) {
                return new TokenValidationDTO(false, userEmail, "Usuario no encontrado", null);
            }

            User user = userOpt.get();
            boolean isValid = jwtService.isTokenValid(token, user);

            if (isValid) {
                return new TokenValidationDTO(true, userEmail, "Token válido", null);
            } else {
                return new TokenValidationDTO(false, userEmail, "Token inválido o expirado", null);
            }
        } catch (Exception e) {
            logger.error("Error validando token", e);
            return new TokenValidationDTO(false, null, "Error validando token", null);
        }
    }

    /**
     * Obtiene información de la sesión actual
     */
    public SessionInfoDTO getSessionInfo(String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userEmail = jwtService.extractUsername(token);

            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                throw new UnauthorizedException("Usuario no encontrado");
            }

            User user = userOpt.get();
            return new SessionInfoDTO(
                    user.getId(),
                    user.getEmail(),
                    user.getName(),
                    user.getLastName(),
                    user.getUserRole().getUserRoleList().name(),
                    user.isVerified(),
                    user.getProfileComplete(),
                    user.getLastActive()
            );
        } catch (Exception e) {
            logger.error("Error obteniendo información de sesión", e);
            throw new UnauthorizedException("Error obteniendo información de sesión");
        }
    }

    /**
     * Obtiene información del método de autenticación para un email
     */
    public AuthMethodInfoDTO getAuthMethodInfo(String email) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase().trim());

            if (userOpt.isEmpty()) {
                return new AuthMethodInfoDTO(
                        email,
                        null,
                        false,
                        "Email no registrado",
                        List.of("LOCAL", "GOOGLE")
                );
            }

            User user = userOpt.get();
            String provider = user.getUserAuthProvider().toString();
            String message = switch (user.getUserAuthProvider()) {
                case GOOGLE -> "Esta cuenta está registrada con Google";
                case FACEBOOK -> "Esta cuenta está registrada con Facebook";
                case LOCAL -> "Esta cuenta está registrada con email y contraseña";
                default -> "Esta cuenta está registrada con otro método";
            };

            return new AuthMethodInfoDTO(
                    email,
                    provider,
                    true,
                    message,
                    List.of(provider)
            );
        } catch (Exception e) {
            logger.error("Error obteniendo método de autenticación", e);
            return new AuthMethodInfoDTO(
                    email,
                    null,
                    false,
                    "Error al verificar método de autenticación",
                    List.of()
            );
        }
    }

    /**
     * Desvincula una cuenta OAuth (método temporal)
     */
    public MessageResponseDTO unlinkOAuthAccount(String userEmail, String authHeader, Object unlinkRequest) {
        // Por ahora, método placeholder
        throw new UnsupportedOperationException("Funcionalidad de desvincular OAuth aún no implementada");
    }
}