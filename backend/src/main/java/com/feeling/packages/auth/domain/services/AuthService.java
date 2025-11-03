package com.feeling.packages.auth.domain.services;

import com.feeling.config.logging.StructuredLoggerFactory;
import com.feeling.exception.*;
import com.feeling.packages.auth.domain.dto.auth.*;
import com.feeling.packages.auth.domain.dto.mapper.AuthResponseFactory;
import com.feeling.packages.auth.domain.dto.oauth.GoogleTokenRequestDTO;
import com.feeling.packages.auth.domain.dto.oauth.GoogleUserInfoDTO;
import com.feeling.packages.auth.domain.dto.oauth.UnlinkOAuthRequestDTO;
import com.feeling.packages.auth.domain.dto.verification.AuthMethodInfoDTO;
import com.feeling.packages.auth.domain.dto.verification.AuthUserStatusDTO;
import com.feeling.packages.auth.domain.dto.verification.AuthVerifyCodeDTO;
import com.feeling.packages.auth.domain.dto.verification.EmailAvailabilityDTO;
import com.feeling.packages.auth.domain.enums.AuthProvider;
import com.feeling.packages.auth.domain.enums.AuthTokenType;
import com.feeling.packages.auth.infrastructure.entities.AuthToken;
import com.feeling.packages.auth.infrastructure.entities.AuthVerificationCode;
import com.feeling.packages.auth.infrastructure.repositories.IAuthTokenRepository;
import com.feeling.packages.auth.infrastructure.repositories.IAuthVerificationCodeRepository;
import com.feeling.packages.common.domain.dto.response.MessageResponseDTO;
import com.feeling.packages.common.domain.services.email.EmailService;
import com.feeling.packages.user.domain.services.UserFactory;
import com.feeling.packages.user.domain.enums.UserAccountType;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

/**
 * Servicio principal de autenticación y autorización.
 * <p>
 * Responsabilidades:
 * - Registro y login de usuarios (LOCAL, GOOGLE, FACEBOOK)
 * - Verificación de email con códigos
 * - Gestión de tokens JWT (access y refresh)
 * - Validación y rate limiting de operaciones sensibles
 * <p>
 * Integra:
 * - JwtService: Generación y validación de tokens JWT
 * - EmailService: Envío de emails transaccionales
 * - GoogleOAuthService: Autenticación con Google
 * - Repositorios: Tokens, códigos de verificación, usuarios
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class AuthService {
    private static final StructuredLoggerFactory.StructuredLogger logger =
        StructuredLoggerFactory.create(AuthService.class);
    private static final int CODE_LENGTH = 6;
    private static final int EXPIRATION_MINUTES = 30;
    private static final String GUEST_ACCOUNT_ERROR_CODE = "ACCOUNT_REQUIRES_PASSWORD";
    private static final String GUEST_ACCOUNT_MESSAGE =
        "Este correo se utilizó para reservas de eventos. Completa tu registro creando una contraseña para acceder.";

    private final IAuthTokenRepository tokenRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final IAuthVerificationCodeRepository verificationCodeRepository;
    private final EmailService emailService;
    private final GoogleOAuthService googleOAuthService;
    private final UserFactory userFactory;
    private final AuthResponseFactory authResponseFactory;

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
            String normalizedEmail = newUser.email().toLowerCase().trim();

            Optional<User> existingUserOpt = userRepository.findByEmail(normalizedEmail);
            if (existingUserOpt.isPresent() && existingUserOpt.get().getAccountType() == UserAccountType.EVENTS_ONLY) {
                User guestUser = existingUserOpt.get();
                guestUser.setName(newUser.name().trim());
                guestUser.setLastName(newUser.lastName().trim());
                guestUser.setPassword(passwordEncoder.encode(newUser.password()));
                guestUser.setUserAuthProvider(AuthProvider.LOCAL);
                guestUser.setAccountType(UserAccountType.FULL_APP);
                guestUser.setVerified(false);
                guestUser.setConfigurationCompleted(false);
                guestUser.setProfileComplete(false);
                guestUser.setUpdatedAt(LocalDateTime.now());
                guestUser.setShowMeInSearch(true);
                guestUser.setSearchVisibility(true);
                guestUser.setPublicAccount(true);
                guestUser.setAllowNotifications(true);

                User savedUser = userRepository.save(guestUser);
                createAndSendVerificationCode(savedUser);
                logger.logAuth("register", newUser.email(), "éxito - conversión desde invitado");

                return new MessageResponseDTO("Tu cuenta se actualizó correctamente. Revisa tu correo para verificarla y completa tu perfil cuando inicies sesión.");
            }

            validateExistingUser(normalizedEmail, AuthProvider.LOCAL);

            User userEntity = userFactory.createLocalUser(newUser);
            User savedUser = userRepository.save(userEntity);

            createAndSendVerificationCode(savedUser);
            logger.logAuth("register", newUser.email(), "éxito - registro local");

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
     * Registra un nuevo usuario usando Google OAuth
     */
    @Transactional
    public AuthLoginResponseDTO registerWithGoogle(GoogleTokenRequestDTO request) {
        try {
            logger.info("Iniciando registro con Google");

            // 1. Obtener información del usuario desde Google
            GoogleUserInfoDTO googleUser = googleOAuthService.getUserInfo(request.accessToken());
            String email = googleUser.email().toLowerCase().trim();

            // 2. Verificar si existe un usuario previo (para conversión de invitados)
            Optional<User> existingUserOpt = userRepository.findByEmail(email);
            if (existingUserOpt.isPresent()) {
                User existingUser = existingUserOpt.get();

                if (isGuestAccount(existingUser)) {
                    User upgradedUser = upgradeGuestAccountWithGoogle(existingUser, googleUser);
                    User savedUser = userRepository.save(upgradedUser);

                    logger.logAuth("google_register", email, "éxito - conversión desde invitado");
                    return generateTokensAndCreateResponse(savedUser);
                }

                // Si no es cuenta invitada, delegar al validador estándar (lanzará la excepción correspondiente)
                validateExistingUser(email, AuthProvider.GOOGLE);
            } else {
                // No existe usuario, validar políticas generales
                validateExistingUser(email, AuthProvider.GOOGLE);
            }

            // 3. Crear nuevo usuario desde Google
            User newUser = userFactory.createFromGoogleOAuth(googleUser);

            newUser = userRepository.save(newUser);

            // 4. Enviar correo de bienvenida si aplica
            sendWelcomeEmailIfApproved(newUser, googleUser);

            // 5. Generar tokens y devolver respuesta
            AuthLoginResponseDTO response = generateTokensAndCreateResponse(newUser);

            logger.logAuth("google_register", email, "éxito - creando nuevo usuario");
            return response;

        } catch (ExistEmailException | EmailNotVerifiedException e) {
            logger.logAuth("google_register", "unknown", "falló - registro: " + e.getMessage());
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
            String normalizedEmail = googleUser.email().toLowerCase().trim();

            // 2. Buscar si el usuario ya existe
            Optional<User> existingUser = userRepository.findByEmail(normalizedEmail);

            User user;

            if (existingUser.isPresent()) {
                user = existingUser.get();

                // Verificar el método de autenticación
                if (isGuestAccount(user)) {
                    user = upgradeGuestAccountWithGoogle(user, googleUser);
                } else if (user.getUserAuthProvider() == AuthProvider.LOCAL) {
                    // Usuario registrado con email/contraseña quiere usar Google
                    logger.logAuth("google_login", googleUser.email(), "existing local user switching to google");

                    // Opción 1: Permitir la migración automática
                    user.setUserAuthProvider(AuthProvider.GOOGLE);
                    user.setExternalId(googleUser.sub());
                    user.updateFromOAuthProvider(
                        googleUser.sub(),
                        googleUser.getFirstName(),
                        googleUser.getLastName(),
                        googleUser.email(),
                        googleUser.picture()
                    );

                } else if (user.getUserAuthProvider() == AuthProvider.GOOGLE) {
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

                user = userFactory.createFromGoogleOAuth(googleUser);
            }

            // 4. Guardar usuario
            user = userRepository.save(user);

            // 5. Enviar email de bienvenida solo si es un usuario NUEVO y está aprobado
            if (existingUser.isEmpty()) {
                sendWelcomeEmailIfApproved(user, googleUser);
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
            if (user.getUserAuthProvider() == AuthProvider.GUEST) {
                throw buildGuestAccountException(normalizedEmail);
            }

            if (user.getUserAuthProvider() != AuthProvider.LOCAL) {
                logger.warn("Intento de login tradicional con cuenta OAuth", Map.of(
                    "email", auth.email(),
                    "provider", user.getUserAuthProvider()));
                throw new UnauthorizedException(
                    "Esta cuenta está registrada con " + user.getUserAuthProvider().getDisplayName() +
                        ". " + user.getAuthMethodMessage()
                );
            }

            // Validaciones previas a la autenticación (evitan DisabledException genérica)
            if (!user.isVerified()) {
                logger.logAuth("login", auth.email(), "failed - user not verified");
                throw new UnauthorizedException(
                    "Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada."
                );
            }

            if (user.isAccountDeactivated()) {
                logger.logAuth("login", auth.email(), "failed - account deactivated");
                throw new UnauthorizedException(
                    "Tu cuenta está desactivada. Si crees que es un error, contacta al equipo de soporte."
                );
            }

            // Validar credenciales
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    normalizedEmail,
                    auth.password()
                )
            );

            // Verificar estado de aprobación (informativo, no bloquea login)
            if (!user.isApproved()) {
                logger.logAuth("login", auth.email(), "success - usuario no aprobado");
                // Nota: No bloqueamos el login, solo informamos
            }

            // Cargar usuario con todas las colecciones necesarias para evitar LazyInitializationException
            User userWithCollections = userRepository.findByEmail(normalizedEmail).orElseThrow();

            // Inicializar collections necesarias para el DTO (forzar carga lazy)
            Hibernate.initialize(userWithCollections.getImages());
            if (userWithCollections.getTags() != null) {
                Hibernate.initialize(userWithCollections.getTags());
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
     * Crea y envía un código de verificación para un usuario.
     * Elimina códigos anteriores usando operación optimizada.
     */
    @Transactional
    public void createAndSendVerificationCode(User user) {
        try {
            // 1. ELIMINAR todos los códigos anteriores del usuario usando método optimizado @Modifying
            verificationCodeRepository.deleteByUserId(user.getId());
            logger.logUserOperation("verification_code_cleanup", user.getEmail(), Map.of("action", "removed_all_old_codes"));

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

            AuthVerificationCode verificationCode = AuthVerificationCode.builder()
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
     * Verifica un código de verificación enviado por el usuario.
     * Utiliza métodos de dominio de la entidad para validaciones.
     */
    @Transactional
    public MessageResponseDTO verifyCode(AuthVerifyCodeDTO authVerifyCodeDTO) {
        // Buscar usuario
        User user = userRepository.findByEmail(authVerifyCodeDTO.email().toLowerCase().trim())
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        // Buscar código de verificación
        AuthVerificationCode verificationCode = verificationCodeRepository.findByCode(authVerifyCodeDTO.code())
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

        // Verificar expiración usando método de dominio
        if (verificationCode.isExpired()) {
            logger.logAuth("verify_email", authVerifyCodeDTO.email(), "failed - code expired");
            throw new UnauthorizedException("El código ha expirado. Solicita un nuevo código.");
        }

        // Marcar código como verificado usando método de dominio
        verificationCode.markAsVerified();
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
     * Reenvía un código de verificación al correo del usuario.
     * Implementa rate limiting para prevenir spam.
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

            // Rate limiting: verificar cantidad de códigos creados en los últimos 15 minutos
            LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);
            long recentCodesCount = verificationCodeRepository.countCodesCreatedSince(user.getId(), fifteenMinutesAgo);

            if (recentCodesCount >= 3) {
                throw new TooManyRequestsException(
                    "Has alcanzado el límite de solicitudes. Espera 15 minutos antes de solicitar un nuevo código."
                );
            }

            // Verificar límite de tiempo desde el último código (anti-spam adicional)
            Optional<AuthVerificationCode> lastCodeOpt = verificationCodeRepository.findActiveCodeByUserId(user.getId(), LocalDateTime.now());
            if (lastCodeOpt.isPresent()) {
                AuthVerificationCode lastCode = lastCodeOpt.get();
                LocalDateTime lastCodeTime = lastCode.getCreatedAt();
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

            logger.logUserOperation("verification_code_resent", email, Map.of("recentAttempts", recentCodesCount + 1));
            return new MessageResponseDTO("Se ha enviado un nuevo código de verificación a tu correo electrónico");

        } catch (NotFoundException | TooManyRequestsException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error inesperado al reenviar código", e);
            throw new RuntimeException("Error al reenviar código de verificación", e);
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
            throw new BadRequestException("Refresh token requerido");
        }

        // Verificar que es un REFRESH token
        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new BadRequestException("Token inválido - se requiere refresh token");
        }

        final String tokenEmail = jwtService.extractUsername(refreshToken);
        if (tokenEmail == null) {
            throw new BadRequestException("Refresh token inválido");
        }

        final String normalizedEmail = tokenEmail.toLowerCase().trim();

        final Optional<User> userOptional = userRepository.findByEmail(normalizedEmail);
        if (userOptional.isEmpty()) {
            logger.warn("Usuario no encontrado durante refresh", Map.of(
                "tokenEmail", tokenEmail,
                "normalizedEmail", normalizedEmail
            ));
            throw new BadRequestException("Usuario no encontrado");
        }

        User user = userOptional.get();

        // Verificar que el refresh token es válido
        if (!jwtService.isTokenValid(refreshToken, user)) {
            logger.warn("Refresh token inválido", Map.of("email", normalizedEmail));
            throw new BadRequestException("Refresh token inválido");
        }

        // Verificar que el refresh token existe en BD y no está revocado
        Optional<AuthToken> storedToken = tokenRepository.findTopByTokenOrderByCreatedAtDesc(refreshToken);

        if (storedToken.isEmpty()) {
            logger.warn("Refresh token no encontrado en BD", Map.of("email", normalizedEmail));
            throw new BadRequestException("Refresh token inválido - no encontrado");
        }

        AuthToken token = storedToken.get();

        // Usar método de dominio para validación
        if (!token.isValid()) {
            logger.warn("Refresh token inválido", Map.of(
                "email", normalizedEmail,
                "revoked", token.isRevoked(),
                "expired", token.isExpired()
            ));
            throw new BadRequestException("Refresh token inválido - revocado o expirado");
        }

        // Generar NUEVOS tokens (rotación de refresh token)
        final String newAccessToken = jwtService.generateToken(user);
        final String newRefreshToken = jwtService.generateRefreshToken(user);

        // Revocar el refresh token usado (previene reutilización)
        AuthToken usedToken = storedToken.get();
        usedToken.setRevoked(true);
        usedToken.setExpired(true);
        tokenRepository.save(usedToken);

        // Revocar todos los access tokens anteriores
        revokeAllAccessTokens(user);

        // Guardar los nuevos tokens
        saveAuthToken(user, newAccessToken, AuthTokenType.ACCESS);
        saveAuthToken(user, newRefreshToken, AuthTokenType.REFRESH);

        logger.logAuth("refresh_token", normalizedEmail, "success - tokens rotated");
        return authResponseFactory.createRefreshTokenResponse(newAccessToken, newRefreshToken);
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
            // Validar que el usuario tenga rol asignado
            if (user.getUserRole() == null) {
                throw new IllegalStateException("Usuario no tiene rol asignado");
            }

            // Generar tokens
            String accessToken = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            // ESTRATEGIA DE TOKENS:
            // 1. Revocar todos los access tokens antiguos (solo 1 access token activo por sesión)
            revokeAllAccessTokens(user);

            // 2. Limitar refresh tokens a máximo 3 por usuario (permite 3 dispositivos simultáneos)
            limitRefreshTokensPerUser(user);

            // 3. Guardar nuevos tokens
            saveAuthToken(user, accessToken, AuthTokenType.ACCESS);
            saveAuthToken(user, refreshToken, AuthTokenType.REFRESH);

            // 4. Limpiar tokens viejos revocados/expirados (más de 7 días)
            cleanupOldTokens();

            // Actualizar última actividad
            updateUserLastActive(user);

            return authResponseFactory.createAuthLoginResponse(new TokenResponseDTO(accessToken, refreshToken), user);
        } catch (Exception e) {
            logger.error("Error al generar tokens", Map.of("userEmail", user.getEmail()), e);
            throw new RuntimeException("Error al generar tokens de autenticación: " + e.getMessage(), e);
        }
    }

    /**
     * GUARDAR TOKEN ACTUALIZADO
     * Guarda un token con su tipo específico
     */
    private void saveAuthToken(User user, String token, AuthTokenType tokenType) {
        try {
            AuthToken userToken = AuthToken.builder()
                .token(token)
                .user(user)
                .type(tokenType)
                .expired(false)
                .revoked(false)
                .build();

            tokenRepository.save(userToken);
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
        final List<AuthToken> validAccessTokens = tokenRepository
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
     * LIMITAR REFRESH TOKENS POR USUARIO
     * Mantiene solo los N refresh tokens más recientes, revocando los más antiguos
     * Esto permite sesiones simultáneas en múltiples dispositivos con un límite razonable
     */
    private void limitRefreshTokensPerUser(User user) {
        List<AuthToken> allRefreshTokens = tokenRepository
            .findAllTokensByUserIdAndType(user.getId(), AuthTokenType.REFRESH);

        // Filtrar solo tokens válidos (no expirados ni revocados)
        List<AuthToken> validRefreshTokens = allRefreshTokens.stream()
            .filter(t -> !t.isExpired() && !t.isRevoked())
            .toList();

        // Si hay más tokens válidos que el límite, revocar los más antiguos
        if (validRefreshTokens.size() >= 3) {
            int tokensToRevoke = validRefreshTokens.size() - 3 + 1; // +1 para dejar espacio al nuevo token
            List<AuthToken> tokensToDelete = validRefreshTokens.stream()
                .limit(tokensToRevoke)
                .toList();

            tokensToDelete.forEach(token -> {
                token.setExpired(true);
                token.setRevoked(true);
            });
            tokenRepository.saveAll(tokensToDelete);
        }
    }

    /**
     * Limpia tokens JWT expirados y revocados antiguos.
     * <p>
     * Elimina físicamente de la base de datos los tokens que están
     * expirados o revocados y tienen más de 7 días de antigüedad.
     * Esto previene acumulación infinita de tokens en la BD.
     * <p>
     * Este método no lanza excepciones para evitar afectar el flujo
     * de autenticación si la limpieza falla. Los errores se registran
     * como warnings.
     */
    @Transactional
    public void cleanupOldTokens() {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(7);
            tokenRepository.deleteExpiredAndRevokedTokensOlderThan(cutoffDate);
        } catch (Exception e) {
            // Log pero no fallar el login si la limpieza falla
            logger.warn("Error al limpiar tokens antiguos", Map.of("error", e.getMessage()));
        }
    }

    /**
     * REVOCAR TODOS LOS TOKENS
     * Revoca tanto access como refresh tokens (para logout completo)
     */
    private void revokeAllAuthTokens(User user) {
        try {
            final List<AuthToken> validAuthTokens = tokenRepository
                .findAllValidTokensByUserId(user.getId());

            if (!validAuthTokens.isEmpty()) {
                validAuthTokens.forEach(token -> {
                    token.setExpired(true);
                    token.setRevoked(true);
                });
                tokenRepository.saveAll(validAuthTokens);
            }
        } catch (Exception e) {
            logger.error("Error al revocar tokens", Map.of("userEmail", user.getEmail()), e);
            throw new RuntimeException("Error al revocar tokens existentes: " + e.getMessage(), e);
        }
    }

    // ==============================
    // MÉTODOS DE UTILIDAD
    // ==============================

    private GuestAccountException buildGuestAccountException(String email) {
        String normalizedEmail = email != null ? email.toLowerCase().trim() : null;
        return new GuestAccountException(
            normalizedEmail,
            GUEST_ACCOUNT_ERROR_CODE,
            GUEST_ACCOUNT_MESSAGE
        );
    }

    private boolean isGuestAccount(User user) {
        if (user == null) return false;
        return user.getUserAuthProvider() == AuthProvider.GUEST
            || user.getAccountType() == UserAccountType.EVENTS_ONLY;
    }

    private User upgradeGuestAccountWithGoogle(User guestUser, GoogleUserInfoDTO googleUser) {
        guestUser.setName(selectIfPresent(googleUser.getFirstName(), guestUser.getName()));
        guestUser.setLastName(selectIfPresent(googleUser.getLastName(), guestUser.getLastName()));
        guestUser.setUserAuthProvider(AuthProvider.GOOGLE);
        guestUser.setAccountType(UserAccountType.FULL_APP);
        guestUser.setExternalId(googleUser.sub());
        guestUser.setExternalAvatarUrl(googleUser.picture());
        guestUser.setVerified(true);
        guestUser.setConfigurationCompleted(false);
        guestUser.setProfileComplete(false);
        guestUser.setShowMeInSearch(true);
        guestUser.setSearchVisibility(true);
        guestUser.setPublicAccount(true);
        guestUser.setAllowNotifications(true);
        guestUser.setPassword(passwordEncoder.encode(
            googleOAuthService.generateOAuthPassword("GOOGLE", googleUser.sub())
        ));
        guestUser.setLastExternalSync(LocalDateTime.now());
        guestUser.setUpdatedAt(LocalDateTime.now());
        return guestUser;
    }

    private String selectIfPresent(String candidate, String fallback) {
        if (candidate != null) {
            String trimmed = candidate.trim();
            if (!trimmed.isEmpty()) {
                return trimmed;
            }
        }
        return fallback;
    }

    /**
     * Envía email de bienvenida para usuarios Google si están aprobados.
     * Método privado reutilizable para evitar duplicación de código.
     *
     * @param user       Usuario al que enviar el email
     * @param googleUser Información de Google del usuario
     */
    private void sendWelcomeEmailIfApproved(User user, GoogleUserInfoDTO googleUser) {
        if (user.isApproved()) {
            try {
                emailService.sendWelcomeEmailForGoogleUser(
                    user.getEmail(),
                    user.getName() + " " + user.getLastName(),
                    googleUser.picture()
                );
                logger.logUserOperation("welcome_email_sent", user.getEmail(), Map.of("provider", "GOOGLE"));
            } catch (Exception emailError) {
                logger.warn("Error al enviar email de bienvenida", Map.of("userEmail", user.getEmail(), "provider", "GOOGLE", "error", emailError.getMessage()));
            }
        } else {
            logger.logUserOperation("user_registered_pending_approval", user.getEmail(), Map.of("provider", "GOOGLE"));
        }
    }

    /**
     * Valida que un email no esté ya registrado para un proveedor específico.
     * <p>
     * Lanza EmailNotVerifiedException si el usuario existe pero no está verificado (solo LOCAL).
     * Lanza ExistEmailException si el usuario ya existe.
     *
     * @param email               Email a validar
     * @param registeringProvider Proveedor con el que se intenta registrar (LOCAL, GOOGLE, etc.)
     * @throws EmailNotVerifiedException si usuario existe pero no verificado
     * @throws ExistEmailException       si email ya registrado
     */
    private void validateExistingUser(String email, AuthProvider registeringProvider) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isEmpty()) return;

        User user = existingUser.get();

        // Caso especial: usuario LOCAL no verificado
        if (!user.isVerified() && user.getUserAuthProvider() == AuthProvider.LOCAL) {
            logger.logAuth(registeringProvider.name().toLowerCase() + "_register",
                email, "falló - correo existe pero no verificado");
            throw new EmailNotVerifiedException(
                "Cuenta no verificada. Revisa tu email o solicita un nuevo código de verificación."
            );
        }

        // Si ya existe, obtener mensaje de conflicto según el proveedor actual
        String conflictMessage = getConflictMessage(user, registeringProvider);

        logger.logAuth(registeringProvider.name().toLowerCase() + "_register",
            email, "falló - correo ya existe con proveedor: " + user.getUserAuthProvider());
        throw new ExistEmailException(conflictMessage);
    }

    /**
     * Genera mensaje de conflicto apropiado según el proveedor existente y el que intenta registrarse.
     * <p>
     * Diferencia entre intentar registrarse con el mismo proveedor vs otro diferente.
     *
     * @param existingUser        Usuario existente en la base de datos
     * @param registeringProvider Proveedor con el que se intenta registrar
     * @return Mensaje de error descriptivo para el usuario
     */
    private String getConflictMessage(User existingUser, AuthProvider registeringProvider) {
        AuthProvider existingProvider = existingUser.getUserAuthProvider();

        // Si intenta registrarse con el mismo proveedor
        if (existingProvider == registeringProvider) {
            return switch (existingProvider) {
                case LOCAL -> "El correo electrónico ya está registrado y verificado. " +
                    "Ve a 'Iniciar Sesión' si ya tienes una cuenta.";
                case GOOGLE -> "Esta cuenta ya está registrada con Google. " +
                    "Ve a 'Iniciar Sesión' y usa el botón 'Continuar con Google'.";
                case FACEBOOK -> "Esta cuenta ya está registrada con Facebook. " +
                    "Ve a 'Iniciar Sesión' y usa el botón 'Continuar con Facebook'.";
                case APPLE -> "Esta cuenta ya está registrada con Apple. " +
                    "Usa 'Iniciar Sesión con Apple' para continuar.";
                case GUEST -> "Este correo ya fue utilizado para reservas de eventos. Completa tu registro con el formulario principal para acceder a la plataforma.";
                default -> "Esta cuenta ya existe con otro método de autenticación.";
            };
        }

        // Si intenta registrarse con otro método
        return switch (registeringProvider) {
            case GOOGLE -> "Esta cuenta ya está registrada con " + existingProvider +
                ". Usa 'Iniciar Sesión' con ese método o vincula tu cuenta de Google.";
            case FACEBOOK -> "Esta cuenta ya está registrada con " + existingProvider +
                ". Usa 'Iniciar Sesión' con ese método o vincula tu cuenta de Facebook.";
            case LOCAL -> {
                if (existingProvider == AuthProvider.GUEST) {
                    yield "Este correo ya se utilizó para reservas de eventos. Completa tu registro e inicia sesión con tu nueva contraseña.";
                }
                yield "El correo ya está registrado con " + existingProvider +
                    ". Usa el método correspondiente para iniciar sesión.";
            }
            default -> "El correo ya está registrado con otro método.";
        };
    }

    /**
     * Busca un usuario por email.
     * <p>
     * Normaliza el email (lowercase y trim) antes de la búsqueda.
     * Útil para operaciones que requieren verificar la existencia del usuario
     * sin exponer directamente el repositorio a controladores.
     *
     * @param email Email del usuario
     * @return Optional con el usuario si existe
     */
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim());
    }

    /**
     * Verifica si un usuario está completamente registrado y verificado.
     * <p>
     * Un usuario está completamente registrado si:
     * - Existe en la base de datos
     * - Ha verificado su email
     * - Su cuenta está habilitada
     *
     * @param email Email del usuario a verificar
     * @return true si el usuario está completamente registrado
     */
    @Transactional(readOnly = true)
    public boolean isUserFullyRegistered(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email.toLowerCase().trim());
        if (userOptional.isEmpty()) {
            return false;
        }

        User user = userOptional.get();
        return user.isVerified() && user.isEnabled();
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
     * Verifica si un email está disponible para registro.
     * <p>
     * Indica si el email puede usarse para crear una cuenta nueva
     * y con qué métodos de autenticación. Si el email ya existe,
     * proporciona sugerencias sobre cómo iniciar sesión.
     *
     * @param email Email a verificar
     * @return DTO con disponibilidad, proveedor existente (si aplica) y sugerencias
     */
    @Transactional(readOnly = true)
    public EmailAvailabilityDTO checkEmailAvailability(String email) {
        try {
            Optional<User> existingUser = userRepository.findByEmail(email.toLowerCase().trim());

            if (existingUser.isEmpty()) {
                return authResponseFactory.createEmailAvailable(
                    email,
                    "Email disponible",
                    "Puedes registrarte con este email"
                );
            }

            User user = existingUser.get();
            return authResponseFactory.createEmailConflict(user, null);
        } catch (Exception e) {
            logger.error("Error al verificar disponibilidad de email", e);
            return authResponseFactory.createEmailAvailabilityError(email, "Error al verificar email", "Intenta nuevamente");
        }
    }

    /**
     * Obtiene el estado de verificación de un usuario.
     * <p>
     * Retorna información sobre si el usuario existe, está verificado
     * y tiene su perfil completo. Útil para validaciones en frontend.
     *
     * @param email Email del usuario
     * @return DTO con estado de registro, verificación y perfil completo
     */
    @Transactional(readOnly = true)
    public AuthUserStatusDTO getUserVerificationStatus(String email) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase().trim());

            if (userOpt.isEmpty()) {
                return authResponseFactory.createAuthUserStatus(email, false, Optional.empty());
            }

            User user = userOpt.get();
            return authResponseFactory.createAuthUserStatus(email, true, Optional.of(user));
        } catch (Exception e) {
            logger.error("Error al obtener estado de verificación", e);
            return authResponseFactory.createAuthUserStatus(email, false, Optional.empty());
        }
    }

    /**
     * Valida si un código de verificación es válido sin consumirlo.
     * <p>
     * Verifica que el código exista, pertenezca al usuario, no esté
     * ya verificado y no haya expirado. No marca el código como usado,
     * permitiendo validaciones previas antes de la verificación final.
     *
     * @param email Email del usuario
     * @param code  Código de verificación a validar
     * @return true si el código es válido y no ha expirado
     */
    @Transactional(readOnly = true)
    public boolean isVerificationCodeValid(String email, String code) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase().trim());
            if (userOpt.isEmpty()) {
                return false;
            }

            User user = userOpt.get();
            Optional<AuthVerificationCode> verificationCodeOpt =
                verificationCodeRepository.findByUserAndCode(user, code);

            if (verificationCodeOpt.isEmpty()) {
                return false;
            }

            AuthVerificationCode verificationCode = verificationCodeOpt.get();

            // Usar método de dominio de la entidad para validación
            return verificationCode.isValid();
        } catch (Exception e) {
            logger.error("Error validando código de verificación", e);
            return false;
        }
    }

    /**
     * Limpia códigos de verificación expirados de la base de datos.
     * <p>
     * Utiliza operación @Modifying optimizada para eliminar en batch
     * todos los códigos cuya fecha de expiración ya pasó. Diseñado
     * para ser llamado por tareas programadas (@Scheduled).
     *
     * @return Cantidad de códigos eliminados
     */
    @Transactional
    public int cleanupExpiredVerificationCodes() {
        try {
            LocalDateTime now = LocalDateTime.now();

            // Primero obtener la cantidad para logging
            List<AuthVerificationCode> expiredCodes = verificationCodeRepository.findByExpirationTimeBefore(now);
            int count = expiredCodes.size();

            if (count > 0) {
                // Usar método optimizado @Modifying
                verificationCodeRepository.deleteExpiredCodes(now);
                logger.logUserOperation("cleanup_expired_codes", "system", Map.of("count", count));
            }

            return count;
        } catch (Exception e) {
            logger.error("Error limpiando códigos expirados", e);
            return 0;
        }
    }


    /**
     * Cierra la sesión del usuario revocando todos sus tokens.
     * <p>
     * Invalida tanto access tokens como refresh tokens para forzar
     * cierre de sesión en todos los dispositivos del usuario.
     *
     * @param authHeader Header Authorization con el token JWT (formato: "Bearer {token}")
     * @return Mensaje de confirmación del cierre de sesión
     * @throws UnauthorizedException si el token es inválido
     * @throws RuntimeException      si hay un error al revocar tokens
     */
    public MessageResponseDTO logout(String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userEmail = jwtService.extractUsername(token);

            // Buscar usuario
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                throw new RuntimeException("Usuario no encontrado");
            }

            User user = userOpt.get();

            // Revocar TODOS los tokens del usuario (access + refresh)
            revokeAllAuthTokens(user);

            logger.logAuth("logout", userEmail, "success - all sessions closed");
            return new MessageResponseDTO("Logout exitoso - todas las sesiones cerradas");
        } catch (Exception e) {
            logger.error("Error en logout", e);
            throw new RuntimeException("Error al realizar logout");
        }
    }

    /**
     * Valida un token JWT
     */
    @Transactional(readOnly = true)
    public TokenValidationDTO validateToken(String token) {
        try {
            String userEmail = jwtService.extractUsername(token);
            Optional<User> userOpt = userRepository.findByEmail(userEmail);

            if (userOpt.isEmpty()) {
                return authResponseFactory.createTokenValidation(false, userEmail, "Usuario no encontrado", null);
            }

            User user = userOpt.get();
            boolean isValid = jwtService.isTokenValid(token, user);

            if (isValid) {
                return authResponseFactory.createTokenValidation(true, userEmail, "Token válido", null);
            } else {
                return authResponseFactory.createTokenValidation(false, userEmail, "Token inválido o expirado", null);
            }
        } catch (Exception e) {
            logger.error("Error validando token", e);
            return authResponseFactory.createTokenValidation(false, null, "Error validando token", null);
        }
    }

    /**
     * Obtiene información de la sesión actual
     */
    @Transactional(readOnly = true)
    public SessionInfoDTO getSessionInfo(String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userEmail = jwtService.extractUsername(token);

            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                throw new UnauthorizedException("Usuario no encontrado");
            }

            User user = userOpt.get();
            return authResponseFactory.createSessionInfo(user);
        } catch (Exception e) {
            logger.error("Error obteniendo información de sesión", e);
            throw new UnauthorizedException("Error obteniendo información de sesión");
        }
    }

    /**
     * Obtiene información del método de autenticación para un email.
     * <p>
     * Identifica con qué proveedor (LOCAL, GOOGLE, FACEBOOK) está registrado
     * el email y qué métodos de autenticación puede usar para iniciar sesión.
     * Si el email no está registrado, retorna que puede usar cualquier método.
     *
     * @param email Email a verificar
     * @return DTO con proveedor actual, mensaje descriptivo y métodos disponibles
     */
    @Transactional(readOnly = true)
    public AuthMethodInfoDTO getAuthMethodInfo(String email) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase().trim());
            return authResponseFactory.resolveAuthMethodInfo(email, userOpt, null, "Email no registrado");
        } catch (Exception e) {
            logger.error("Error obteniendo método de autenticación", e);
            return authResponseFactory.createAuthMethodInfoError(email, "Error al verificar método de autenticación");
        }
    }

    /**
     * Desvincula una cuenta OAuth (método temporal)
     */
    public MessageResponseDTO unlinkOAuthAccount(String provider, String authHeader, UnlinkOAuthRequestDTO unlinkRequest) {
        // Por ahora, método placeholder
        throw new UnsupportedOperationException("Funcionalidad de desvincular OAuth aún no implementada");
    }
}
